import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { 
  createQuotation, 
  getQuotationsByUserId, 
  getQuotationById,
  getQuotationByNumber,
  createQuotationItem,
  getQuotationItemsByQuotationId,
  deleteQuotation
} from "./db";

const execAsync = promisify(exec);

// Helper function to call Python quotation service
async function callPythonService(command: string, args: string[] = []): Promise<any> {
  const scriptPath = path.join(__dirname, 'quotation_service.py');
  // 在Windows上使用python命令而不是python3.11
  const fullCommand = `python ${scriptPath} ${command} ${args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ')}`;
  
  try {
    console.log(`执行Python命令: ${fullCommand}`);
    const { stdout, stderr } = await execAsync(fullCommand);
    if (stderr) {
      console.error('Python service stderr:', stderr);
    }
    const result = JSON.parse(stdout);
    if (!result.success) {
      throw new Error(result.error || 'Python service failed');
    }
    return result.data || result;
  } catch (error: any) {
    console.error('Error calling Python service:', error);
    throw new Error(`Python service error: ${error.message}`);
  }
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    search: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).optional().default(10)
      }))
      .query(async ({ input }) => {
        const results = await callPythonService('search', [input.query, input.limit.toString()]);
        return results;
      }),
  }),

  quotations: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const quotations = await getQuotationsByUserId(ctx.user.id);
        return quotations;
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const quotation = await getQuotationById(input.id);
        if (!quotation) {
          throw new Error('Quotation not found');
        }
        if (quotation.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        const items = await getQuotationItemsByQuotationId(input.id);
        return { ...quotation, items };
      }),

    create: protectedProcedure
      .input(z.object({
        customerName: z.string().optional(),
        exchangeRate: z.string().default("7.1"),
        taxRate: z.string().default("0.13"),
        items: z.array(z.object({
          product: z.string(),
          description: z.string().optional(),
          specimen: z.string().optional(),
          format: z.string().optional(),
          pack: z.string().optional(),
          quantity: z.number().default(1),
          baseUsdFinished: z.string(),
          baseRmbFinished: z.string(),
          baseUsdBulk: z.string().optional(),
          baseRmbBulk: z.string().optional(),
          markupPercentage: z.string().default("0.10"),
          finalUsdFinished: z.string(),
          finalRmbFinished: z.string(),
          finalUsdBulk: z.string().optional(),
          finalRmbBulk: z.string().optional(),
        }))
      }))
      .mutation(async ({ input, ctx }) => {
        // Generate quotation number
        const timestamp = Date.now();
        const quotationNumber = `QT-${timestamp}`;

        // Create quotation
        await createQuotation({
          userId: ctx.user.id,
          customerName: input.customerName,
          quotationNumber,
          exchangeRate: input.exchangeRate,
          taxRate: input.taxRate,
        });

        // Get the created quotation to retrieve its ID
        const createdQuotation = await getQuotationByNumber(quotationNumber);
        if (!createdQuotation) {
          throw new Error('Failed to create quotation');
        }

        // Create quotation items
        for (const item of input.items) {
          await createQuotationItem({
            quotationId: createdQuotation.id,
            ...item,
          });
        }

        return { id: createdQuotation.id, quotationNumber };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const quotation = await getQuotationById(input.id);
        if (!quotation) {
          throw new Error('Quotation not found');
        }
        if (quotation.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        await deleteQuotation(input.id);
        return { success: true };
      }),

    exportExcel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const quotation = await getQuotationById(input.id);
        if (!quotation) {
          throw new Error('Quotation not found');
        }
        if (quotation.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }

        const items = await getQuotationItemsByQuotationId(input.id);
        
        const quotationData = {
          quotationNumber: quotation.quotationNumber,
          customerName: quotation.customerName || '',
          items: items.map(item => ({
            product: item.product,
            specimen: item.specimen || '',
            format: item.format || '',
            pack: item.pack || '',
            quantity: item.quantity,
            finalUsdFinished: parseFloat(item.finalUsdFinished),
            finalRmbFinished: parseFloat(item.finalRmbFinished),
            finalUsdBulk: item.finalUsdBulk ? parseFloat(item.finalUsdBulk) : null,
            finalRmbBulk: item.finalRmbBulk ? parseFloat(item.finalRmbBulk) : null,
          }))
        };

        const outputDir = path.join(__dirname, '../temp');
        await fs.mkdir(outputDir, { recursive: true });
        const outputPath = path.join(outputDir, `${quotation.quotationNumber}.xlsx`);

        await callPythonService('export_excel', [JSON.stringify(quotationData), outputPath]);

        // Read the file and return as base64
        const fileBuffer = await fs.readFile(outputPath);
        const base64 = fileBuffer.toString('base64');

        // Clean up temp file
        await fs.unlink(outputPath);

        return {
          filename: `${quotation.quotationNumber}.xlsx`,
          data: base64,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
      }),

    exportPdf: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const quotation = await getQuotationById(input.id);
        if (!quotation) {
          throw new Error('Quotation not found');
        }
        if (quotation.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }

        const items = await getQuotationItemsByQuotationId(input.id);
        
        const quotationData = {
          quotationNumber: quotation.quotationNumber,
          customerName: quotation.customerName || '',
          items: items.map(item => ({
            product: item.product,
            specimen: item.specimen || '',
            format: item.format || '',
            pack: item.pack || '',
            quantity: item.quantity,
            finalUsdFinished: parseFloat(item.finalUsdFinished),
            finalRmbFinished: parseFloat(item.finalRmbFinished),
            finalUsdBulk: item.finalUsdBulk ? parseFloat(item.finalUsdBulk) : null,
            finalRmbBulk: item.finalRmbBulk ? parseFloat(item.finalRmbBulk) : null,
          }))
        };

        const outputDir = path.join(__dirname, '../temp');
        await fs.mkdir(outputDir, { recursive: true });
        const outputPath = path.join(outputDir, `${quotation.quotationNumber}.pdf`);

        await callPythonService('export_pdf', [JSON.stringify(quotationData), outputPath]);

        // Read the file and return as base64
        const fileBuffer = await fs.readFile(outputPath);
        const base64 = fileBuffer.toString('base64');

        // Clean up temp file
        await fs.unlink(outputPath);

        return {
          filename: `${quotation.quotationNumber}.pdf`,
          data: base64,
          mimeType: 'application/pdf'
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

