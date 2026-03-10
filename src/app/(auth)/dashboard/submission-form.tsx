"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { submitGrowthLog } from "@/actions";
import { Button, Input } from "@/presentation/components/ui";
import type { Submission } from "@/domain/entities";

interface SubmissionFormProps {
  roundId: string;
  roundNumber: number;
  existingSubmission?: Submission;
}

/**
 * 성장일지 제출 폼 컴포넌트
 */
export function SubmissionForm({
  roundId,
  roundNumber,
  existingSubmission,
}: SubmissionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [postUrl, setPostUrl] = useState(existingSubmission?.postUrl || "");

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);

    // roundId를 formData에 추가
    formData.set("roundId", roundId);

    startTransition(async () => {
      const result = await submitGrowthLog(formData);

      if (result.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  // 이미 제출된 경우 링크만 표시
  if (existingSubmission && !success) {
    return (
      <div className="space-y-3">
        <div className="text-sm">
          <a
            href={existingSubmission.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {existingSubmission.postUrl}
          </a>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>좋아요: {existingSubmission.likesCount}</span>
          <span>댓글: {existingSubmission.commentsCount}</span>
          <span>점수: {existingSubmission.score}</span>
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <Input
        name="postUrl"
        type="url"
        placeholder="게시글 URL 입력"
        value={postUrl}
        onChange={(e) => setPostUrl(e.target.value)}
        required
        disabled={isPending}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600">제출 완료!</p>
      )}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "제출 중..." : "제출"}
      </Button>
    </form>
  );
}
