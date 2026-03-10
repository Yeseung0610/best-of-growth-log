import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스를 조건부로 결합하는 유틸리티 함수
 * clsx로 조건부 클래스를 처리하고, tailwind-merge로 충돌하는 클래스를 병합
 *
 * @param inputs - 결합할 클래스 값들
 * @returns 병합된 클래스 문자열
 *
 * @example
 * cn("px-2 py-1", isActive && "bg-blue-500", "hover:bg-blue-600")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
