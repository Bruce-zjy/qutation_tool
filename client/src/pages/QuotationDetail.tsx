import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function QuotationDetail() {
  const { user } = useAuth();
  const params = useParams();
  const quotationId = parseInt(params.id || "0");

  const quotationQuery = trpc.quotations.get.useQuery({ id: quotationId });
  const exportExcelMutation = trpc.quotations.exportExcel.useMutation({
    onSuccess: (data) => {
      // Create a download link for the Excel file
      const link = document.createElement('a');
      link.href = `data:${data.mimeType};base64,${data.data}`;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Excel file downloaded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to export Excel: ${error.message}`);
    }
  });

  const exportPdfMutation = trpc.quotations.exportPdf.useMutation({
    onSuccess: (data) => {
      // Create a download link for the PDF file
      const link = document.createElement('a');
      link.href = `data:${data.mimeType};base64,${data.data}`;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("PDF file downloaded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to export PDF: ${error.message}`);
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (quotationQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading quotation...</div>
        </div>
      </div>
    );
  }

  if (quotationQuery.error || !quotationQuery.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600">
            {quotationQuery.error?.message || "Quotation not found"}
          </div>
          <Link href="/quotations">
            <Button className="mt-4">Back to Quotations</Button>
          </Link>
        </div>
      </div>
    );
  }

  const quotation = quotationQuery.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/quotations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{quotation.quotationNumber}</h2>
            <p className="text-gray-600">Created on {formatDate(quotation.createdAt.toString())}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => exportExcelMutation.mutate({ id: quotationId })}
              disabled={exportExcelMutation.isPending}
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exportExcelMutation.isPending ? "Exporting..." : "Export Excel"}
            </Button>
            <Button
              onClick={() => exportPdfMutation.mutate({ id: quotationId })}
              disabled={exportPdfMutation.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              {exportPdfMutation.isPending ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Quotation Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Customer Name</div>
                  <div className="font-medium">{quotation.customerName || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Exchange Rate</div>
                  <div className="font-medium">{quotation.exchangeRate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tax Rate</div>
                  <div className="font-medium">{quotation.taxRate}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>{quotation.items.length} product(s) in this quotation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Specimen</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Pack</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-center">Markup</TableHead>
                      <TableHead className="text-right">Finished USD</TableHead>
                      <TableHead className="text-right">Finished RMB</TableHead>
                      <TableHead className="text-right">Bulk USD</TableHead>
                      <TableHead className="text-right">Bulk RMB</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.items.map((item: any, index: number) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell>{item.specimen || '-'}</TableCell>
                        <TableCell>{item.format || '-'}</TableCell>
                        <TableCell>{item.pack || '-'}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-center">
                          {(parseFloat(item.markupPercentage) * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right">
                          ${parseFloat(item.finalUsdFinished).toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right">
                          ¥{parseFloat(item.finalRmbFinished).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.finalUsdBulk ? `$${parseFloat(item.finalUsdBulk).toFixed(4)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.finalRmbBulk ? `¥${parseFloat(item.finalRmbBulk).toFixed(2)}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Finished Products Total</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">USD:</span>
                      <span className="font-medium">
                        ${quotation.items.reduce((sum: number, item: any) => 
                          sum + (parseFloat(item.finalUsdFinished) * item.quantity), 0
                        ).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RMB:</span>
                      <span className="font-medium">
                        ¥{quotation.items.reduce((sum: number, item: any) => 
                          sum + (parseFloat(item.finalRmbFinished) * item.quantity), 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Bulk Products Total</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">USD:</span>
                      <span className="font-medium">
                        ${quotation.items.reduce((sum: number, item: any) => 
                          sum + (item.finalUsdBulk ? parseFloat(item.finalUsdBulk) * item.quantity : 0), 0
                        ).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RMB:</span>
                      <span className="font-medium">
                        ¥{quotation.items.reduce((sum: number, item: any) => 
                          sum + (item.finalRmbBulk ? parseFloat(item.finalRmbBulk) * item.quantity : 0), 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

