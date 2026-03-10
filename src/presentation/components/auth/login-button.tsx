"use client";

import { useAuth } from "@/presentation/hooks";
import { Button } from "@/presentation/components/ui";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  children?: React.ReactNode;
}

/**
 * 로그인 버튼 컴포넌트
 */
export function LoginButton({
  size = "lg",
  variant = "outline",
  className,
  children,
}: LoginButtonProps) {
  const { login } = useAuth();

  return (
    <Button size={size} variant={variant} className={className} onClick={login}>
      <LogIn className="h-5 w-5" />
      {children ?? "로그인"}
    </Button>
  );
}
