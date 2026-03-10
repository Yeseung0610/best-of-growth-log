"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createRound, activateRound, deactivateRound } from "@/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Input,
  Label,
  Card,
  CardContent,
} from "@/presentation/components/ui";
import type { Round } from "@/domain/entities";
import { Plus, Play, Pause } from "lucide-react";

interface RoundManagementProps {
  rounds: Round[];
}

/**
 * 차수 관리 컴포넌트
 */
export function RoundManagement({ rounds }: RoundManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateRound = async (formData: FormData) => {
    setFormError(null);

    const roundNumber = parseInt(formData.get("roundNumber") as string, 10);
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    startTransition(async () => {
      const result = await createRound({
        roundNumber,
        submissionStartDate: startDate,
        submissionEndDate: endDate,
      });

      if (result.success) {
        setShowCreateForm(false);
        router.refresh();
      } else {
        setFormError(result.error || "차수 생성에 실패했습니다.");
      }
    });
  };

  const handleActivate = (roundId: string) => {
    startTransition(async () => {
      await activateRound(roundId);
      router.refresh();
    });
  };

  const handleDeactivate = (roundId: string) => {
    startTransition(async () => {
      await deactivateRound(roundId);
      router.refresh();
    });
  };

  const nextRoundNumber = rounds.length > 0
    ? Math.max(...rounds.map((r) => r.roundNumber)) + 1
    : 1;

  return (
    <div className="space-y-4">
      {/* 차수 목록 */}
      {rounds.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>차수</TableHead>
              <TableHead>제출 기간</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rounds.map((round) => (
              <TableRow key={round.id}>
                <TableCell className="font-medium">
                  {round.roundNumber}차
                </TableCell>
                <TableCell>
                  {new Date(round.submissionStartDate).toLocaleDateString()} ~{" "}
                  {new Date(round.submissionEndDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {round.isActive ? (
                    <Badge variant="success">진행 중</Badge>
                  ) : (
                    <Badge variant="secondary">비활성</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {round.isActive ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeactivate(round.id)}
                      disabled={isPending}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      비활성화
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleActivate(round.id)}
                      disabled={isPending}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      활성화
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          등록된 차수가 없습니다. 새 차수를 생성해주세요.
        </p>
      )}

      {/* 새 차수 생성 */}
      {showCreateForm ? (
        <Card>
          <CardContent className="pt-6">
            <form action={handleCreateRound} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roundNumber">차수 번호</Label>
                <Input
                  id="roundNumber"
                  name="roundNumber"
                  type="number"
                  defaultValue={nextRoundNumber}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">제출 시작일</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">제출 마감일</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {formError}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "생성 중..." : "차수 생성"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isPending}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          새 차수 생성
        </Button>
      )}
    </div>
  );
}
