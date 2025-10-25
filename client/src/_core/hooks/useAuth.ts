import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// 模拟用户数据，用于绕过登录
const mockUser = {
  id: 1,
  openId: "mock-user-id",
  name: "测试用户",
  email: "test@example.com",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  // 使用服务器端的 me 查询，但总是返回模拟用户
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    // 使用真实数据或模拟数据
    const userData = meQuery.data || mockUser;
    
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(userData)
    );
    
    return {
      user: userData,
      loading: false, // 不再显示加载状态
      error: null, // 不再显示错误
      isAuthenticated: true, // 始终认为已认证
    };
  }, [
    meQuery.data,
  ]);

  // 移除重定向逻辑，不再需要重定向到登录页面
  // useEffect(() => {
  //   if (!redirectOnUnauthenticated) return;
  //   if (meQuery.isLoading || logoutMutation.isPending) return;
  //   if (state.user) return;
  //   if (typeof window === "undefined") return;
  //   if (window.location.pathname === redirectPath) return;
  //
  //   window.location.href = redirectPath
  // }, [
  //   redirectOnUnauthenticated,
  //   redirectPath,
  //   logoutMutation.isPending,
  //   meQuery.isLoading,
  //   state.user,
  // ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
