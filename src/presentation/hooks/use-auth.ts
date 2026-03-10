"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import type { UserRole } from "@/domain/entities";

/**
 * 인증 훅 반환 타입
 */
interface UseAuthReturn {
  /** 현재 로그인한 사용자 정보 */
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: UserRole;
  } | null;
  /** 인증 여부 */
  isAuthenticated: boolean;
  /** 관리자 여부 */
  isAdmin: boolean;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** Google 로그인 */
  login: () => Promise<void>;
  /** 로그아웃 */
  logout: () => Promise<void>;
}

/**
 * 인증 상태 관리 훅
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? null,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        role: session.user.role,
      }
    : null;

  const login = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return {
    user,
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === "ADMIN",
    isLoading: status === "loading",
    login,
    logout,
  };
}
