"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@/presentation/components/ui";
import type { Submission } from "@/domain/entities";
import { ExternalLink } from "lucide-react";

interface SubmissionListProps {
  submissions: Submission[];
}

/**
 * 제출 내역 목록 컴포넌트
 */
export function SubmissionList({ submissions }: SubmissionListProps) {
  const getStatusBadge = (status: Submission["status"]) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="success">검증됨</Badge>;
      case "PENDING":
        return <Badge variant="warning">검증 중</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">거절됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (submissions.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        아직 제출한 성장일지가 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>차수</TableHead>
          <TableHead>제목</TableHead>
          <TableHead className="text-center">좋아요</TableHead>
          <TableHead className="text-center">댓글</TableHead>
          <TableHead className="text-center">점수</TableHead>
          <TableHead className="text-center">상태</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell>{submission.roundNumber}차</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {submission.postTitle}
            </TableCell>
            <TableCell className="text-center">{submission.likesCount}</TableCell>
            <TableCell className="text-center">
              {submission.commentsCount}
            </TableCell>
            <TableCell className="text-center font-bold text-primary">
              {submission.score}
            </TableCell>
            <TableCell className="text-center">
              {getStatusBadge(submission.status)}
            </TableCell>
            <TableCell>
              <a
                href={submission.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
