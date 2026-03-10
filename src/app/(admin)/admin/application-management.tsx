"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveApplication, rejectApplication } from "@/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
} from "@/presentation/components/ui";
import type { Application } from "@/domain/entities";
import { Check, X, ExternalLink } from "lucide-react";

interface ApplicationManagementProps {
  applications: Application[];
}

/**
 * 참가 신청 관리 컴포넌트
 */
export function ApplicationManagement({
  applications,
}: ApplicationManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveApplication(id);
      router.refresh();
    });
  };

  const handleReject = (id: string) => {
    const reason = prompt("거절 사유를 입력해주세요 (선택사항):");
    startTransition(async () => {
      await rejectApplication(id, reason || undefined);
      router.refresh();
    });
  };

  if (applications.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        대기 중인 신청이 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>학교 이메일</TableHead>
          <TableHead>블로그</TableHead>
          <TableHead>신청일</TableHead>
          <TableHead className="text-right">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell className="font-medium">{app.participantName}</TableCell>
            <TableCell>{app.schoolEmail}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{app.blogPlatform}</Badge>
                <a
                  href={app.blogAccountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </TableCell>
            <TableCell>
              {new Date(app.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(app.id)}
                  disabled={isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  승인
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(app.id)}
                  disabled={isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  거절
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
