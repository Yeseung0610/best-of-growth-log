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
import type { LeaderboardEntry } from "@/domain/entities";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  onRowClick?: (participantId: string) => void;
}

/**
 * 리더보드 테이블 컴포넌트
 */
export function LeaderboardTable({
  entries,
  onRowClick,
}: LeaderboardTableProps) {
  const getRankDisplay = (rank: number) => {
    if (rank <= 3) {
      return (
        <span className="font-semibold text-green-1">{rank}</span>
      );
    }
    return (
      <span className="text-muted-foreground">{rank}</span>
    );
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">아직 참가자가 없습니다</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-12">순위</TableHead>
          <TableHead>이름</TableHead>
          <TableHead className="hidden sm:table-cell">플랫폼</TableHead>
          <TableHead className="text-center hidden md:table-cell">제출</TableHead>
          <TableHead className="text-center hidden md:table-cell">좋아요</TableHead>
          <TableHead className="text-center hidden lg:table-cell">댓글</TableHead>
          <TableHead className="text-right">점수</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow
            key={entry.participantId}
            className={onRowClick ? "cursor-pointer" : ""}
            onClick={() => onRowClick?.(entry.participantId)}
          >
            <TableCell>{getRankDisplay(entry.rank)}</TableCell>
            <TableCell>
              <span className="font-medium">{entry.name}</span>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge variant="outline">
                {entry.blogPlatform.toLowerCase()}
              </Badge>
            </TableCell>
            <TableCell className="text-center hidden md:table-cell">
              {entry.submissionCount}
            </TableCell>
            <TableCell className="text-center hidden md:table-cell">
              {entry.totalLikes}
            </TableCell>
            <TableCell className="text-center hidden lg:table-cell">
              {entry.totalComments}
            </TableCell>
            <TableCell className="text-right">
              <span className="font-semibold">{entry.totalScore}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
