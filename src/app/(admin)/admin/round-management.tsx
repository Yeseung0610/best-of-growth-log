"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRound, deleteRound } from "@/actions";
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
  CardHeader,
  CardTitle,
  CardDescription,
  DatePicker,
} from "@/presentation/components/ui";
import type { Round } from "@/domain/entities";
import { Plus, Trash2 } from "lucide-react";

interface RoundManagementProps {
  rounds: Round[];
  /** Card 없이 내용만 렌더링 (page.tsx에서 Card로 감쌀 경우) */
  withCard?: boolean;
}

/**
 * 차수의 현재 상태를 날짜 기반으로 판단
 */
function getRoundStatus(round: Round): "upcoming" | "active" | "ended" {
  const now = new Date();
  const start = new Date(round.submissionStartDate);
  const end = new Date(round.submissionEndDate);

  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

/**
 * 차수 관리 컴포넌트
 */
export function RoundManagement({ rounds, withCard = true }: RoundManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleCreateRound = () => {
    if (!startDate || !endDate) {
      toast.error("시작일과 마감일을 모두 선택해주세요.");
      return;
    }

    if (startDate >= endDate) {
      toast.error("시작일은 마감일보다 이전이어야 합니다.");
      return;
    }

    startTransition(async () => {
      const result = await createRound({
        roundNumber,
        submissionStartDate: startDate,
        submissionEndDate: endDate,
      });

      if (result.success) {
        toast.success(`${roundNumber}차가 생성되었습니다.`);
        setShowCreateForm(false);
        setStartDate(undefined);
        setEndDate(undefined);
        router.refresh();
      } else {
        toast.error(result.error || "차수 생성에 실패했습니다.");
      }
    });
  };

  const nextRoundNumber = rounds.length > 0
    ? Math.max(...rounds.map((r) => r.roundNumber)) + 1
    : 1;

  const handleDeleteRound = (id: string, roundNum: number) => {
    if (!confirm(`${roundNum}차를 삭제하시겠습니까?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteRound(id);
      if (result.success) {
        toast.success(`${roundNum}차가 삭제되었습니다.`);
        router.refresh();
      } else {
        toast.error(result.error || "차수 삭제에 실패했습니다.");
      }
    });
  };

  // 폼이 열릴 때 기본값 설정
  const handleOpenForm = () => {
    setRoundNumber(nextRoundNumber);
    setStartDate(undefined);
    setEndDate(undefined);
    setShowCreateForm(true);
  };

  const content = (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>성장일지 차수 관리</CardTitle>
            <CardDescription>제출 기간 설정</CardDescription>
          </div>
          {!showCreateForm && (
            <Button size="sm" onClick={handleOpenForm}>
              <Plus className="h-4 w-4 mr-1" />
              새 차수 생성
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 차수 목록 */}
        {rounds.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>차수</TableHead>
              <TableHead>제출 기간</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rounds.map((round) => {
              const status = getRoundStatus(round);
              return (
                <TableRow key={round.id}>
                  <TableCell className="font-medium">
                    {round.roundNumber}차
                  </TableCell>
                  <TableCell>
                    {new Date(round.submissionStartDate).toLocaleDateString()} ~{" "}
                    {new Date(round.submissionEndDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {status === "active" && (
                      <Badge>진행 중</Badge>
                    )}
                    {status === "upcoming" && (
                      <Badge variant="secondary">예정</Badge>
                    )}
                    {status === "ended" && (
                      <Badge variant="outline">종료</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDeleteRound(round.id, round.roundNumber)}
                      disabled={isPending}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          등록된 차수가 없습니다. 새 차수를 생성해주세요.
        </p>
      )}

        {/* 새 차수 생성 폼 */}
        {showCreateForm && (
          <div className="border border-gray-4 rounded-xl p-4 space-y-4">
            <div className="space-y-2">
              <Label>차수 번호</Label>
              <Input
                type="number"
                value={roundNumber}
                onChange={(e) => setRoundNumber(parseInt(e.target.value, 10))}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>제출 시작일</Label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="시작일 선택"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>제출 마감일</Label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="마감일 선택"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button type="button" onClick={handleCreateRound} disabled={isPending}>
                {isPending ? "생성 중..." : "차수 생성"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </>
  );

  if (withCard) {
    return <Card>{content}</Card>;
  }

  return content;
}
