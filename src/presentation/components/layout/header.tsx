"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/presentation/hooks";
import { Button } from "@/presentation/components/ui";
import { LogIn, LogOut, LayoutDashboard, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * 공통 헤더 컴포넌트
 */
export function Header() {
  const { isAuthenticated, isAdmin, isLoading, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-5">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/icons/growth_log_logo.svg"
            alt="Growth Log"
            width={160}
            height={30}
            priority
          />
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="h-12 w-32 animate-pulse rounded-full bg-gray-5" />
          ) : isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  대시보드
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                    관리
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </>
          ) : (
            <Button onClick={login}>
              <LogIn className="h-4 w-4" />
              로그인
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-gray-6 transition-colors rounded-full"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-5 bg-white">
          <div className="container-custom py-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <LayoutDashboard className="h-4 w-4" />
                    대시보드
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4" />
                      관리
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <Button className="w-full" onClick={login}>
                <LogIn className="h-4 w-4" />
                로그인
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
