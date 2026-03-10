"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { submitApplication } from "@/actions";
import { Button, Input, Label, Select } from "@/presentation/components/ui";

/**
 * 참가 신청 폼 컴포넌트
 */
export function ApplicationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      const result = await submitApplication(formData);

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="participantName">이름</Label>
        <Input
          id="participantName"
          name="participantName"
          placeholder="홍길동"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="schoolEmail">학교 이메일</Label>
        <Input
          id="schoolEmail"
          name="schoolEmail"
          type="email"
          placeholder="student@knou.ac.kr"
          required
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          @knou.ac.kr 도메인의 이메일만 사용 가능합니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blogPlatform">블로그 플랫폼</Label>
        <Select
          id="blogPlatform"
          name="blogPlatform"
          required
          disabled={isPending}
        >
          <option value="">선택하세요</option>
          <option value="VELOG">Velog</option>
          <option value="TISTORY">Tistory</option>
          <option value="MEDIUM">Medium</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blogAccountUrl">블로그 계정 URL</Label>
        <Input
          id="blogAccountUrl"
          name="blogAccountUrl"
          type="url"
          placeholder="https://velog.io/@username"
          required
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          블로그 메인 페이지 URL을 입력해주세요. (예: https://velog.io/@username)
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "신청 중..." : "참가 신청"}
      </Button>
    </form>
  );
}
