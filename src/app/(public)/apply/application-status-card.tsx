"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, Copy, Check, ArrowRight } from "lucide-react";
import { Card, CardContent, Button } from "@/presentation/components/ui";

interface ApplicationStatusCardProps {
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string | null;
}

const BANK_ACCOUNT = "1000-0247-1215";
const BANK_NAME = "토스뱅크";
const ACCOUNT_HOLDER = "박예승";
const PARTICIPATION_FEE = "15,000원";

/**
 * 참가 신청 상태 카드 컴포넌트
 * 모노크롬 기반 미니멀 디자인
 */
export function ApplicationStatusCard({ status, adminNote }: ApplicationStatusCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 복사 실패 시 무시
    }
  };

  // 승인 대기 중
  if (status === "PENDING") {
    return (
      <Card>
        {/* 상단 상태 헤더 */}
        <div className="border-b border-gray-5 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-6 flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-1" />
            </div>
            <div>
              <p className="font-semibold">승인 대기 중</p>
              <p className="text-sm text-muted-foreground">입금 확인 후 승인됩니다</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* 진행 단계 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-black text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <p className="text-xs mt-2 text-muted-foreground">신청 완료</p>
            </div>
            <div className="flex-1 h-px bg-gray-4 mx-3" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-black text-white flex items-center justify-center text-sm font-medium">
                2
              </div>
              <p className="text-xs mt-2 font-medium">입금 대기</p>
            </div>
            <div className="flex-1 h-px bg-gray-5 mx-3" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-5 text-gray-3 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <p className="text-xs mt-2 text-muted-foreground">승인 완료</p>
            </div>
          </div>

          {/* 입금 정보 카드 */}
          <div className="border border-gray-4 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">은행</span>
              <span className="font-medium">{BANK_NAME}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">계좌번호</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono">{BANK_ACCOUNT}</span>
                <button
                  onClick={handleCopyAccount}
                  className="p-1.5 hover:bg-gray-6 rounded-lg transition-colors"
                  title="계좌번호 복사"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-gray-black" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">예금주</span>
              <span className="font-medium">{ACCOUNT_HOLDER}</span>
            </div>
            <div className="border-t border-gray-5 pt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">참가비</span>
              <span className="text-lg font-bold">{PARTICIPATION_FEE}</span>
            </div>
          </div>

          {/* 안내 메시지 */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            입금이 완료되었다면 클럽장에게 슬랙으로 연락해주세요!
          </p>
        </CardContent>
      </Card>
    );
  }

  // 승인 완료
  if (status === "APPROVED") {
    return (
      <Card>
        {/* 상단 상태 헤더 */}
        <div className="border-b border-gray-5 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-black flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">참가 승인 완료</p>
              <p className="text-sm text-muted-foreground">성장일지 클럽에 오신 것을 환영합니다!</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 text-center">
          {/* 성공 아이콘 */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-6 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-gray-black" />
          </div>

          <h2 className="text-xl font-semibold mb-2">참가가 확정되었습니다</h2>
          <p className="text-muted-foreground mb-8">
            이제 대시보드에서 성장일지를 제출할 수 있습니다
          </p>

          <Link href="/dashboard">
            <Button size="lg" className="w-full">
              대시보드로 이동
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // 거절됨
  return (
    <Card>
      {/* 상단 상태 헤더 */}
      <div className="border-b border-gray-5 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-6 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-semibold">참가 신청 거절</p>
            <p className="text-sm text-muted-foreground">신청이 승인되지 않았습니다</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 text-center">
        {/* 거절 아이콘 */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-6 flex items-center justify-center">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>

        <h2 className="text-xl font-semibold mb-2">신청이 거절되었습니다</h2>

        {adminNote && (
          <div className="mt-4 p-4 bg-gray-6 rounded-xl text-left">
            <p className="text-sm text-muted-foreground">거절 사유</p>
            <p className="mt-1 text-sm">{adminNote}</p>
          </div>
        )}

        <p className="text-muted-foreground mt-6 text-sm">
          문의사항이 있으시면 관리자에게 연락해주세요
        </p>
      </CardContent>
    </Card>
  );
}
