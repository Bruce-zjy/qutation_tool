import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// 临时移除认证要求，直接通过所有请求
const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  // 不再检查用户是否存在，直接通过
  return next({
    ctx: {
      ...ctx,
      // 如果用户不存在，提供一个模拟用户
      user: ctx.user || {
        id: 1,
        openId: "mock-user-id",
        name: "测试用户",
        email: "test@example.com",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

// 临时移除管理员认证要求
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // 不再检查用户是否为管理员，直接通过
    return next({
      ctx: {
        ...ctx,
        user: ctx.user || {
          id: 1,
          openId: "mock-admin-id",
          name: "测试管理员",
          email: "admin@example.com",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      },
    });
  }),
);
