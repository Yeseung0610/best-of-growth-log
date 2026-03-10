"use client";

import Link from "next/link";
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
}

/**
 * 리더보드 테이블 컴포넌트
 */
export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const getRankDisplay = (rank: number) => {
    if (rank <= 3) {
      return <span className="font-semibold">{rank}</span>;
    }
    return <span className="text-muted-foreground">{rank}</span>;
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
            className="cursor-pointer hover:bg-gray-6"
          >
            <TableCell>
              <Link href={`/participant/${entry.participantId}`} className="block">
                {getRankDisplay(entry.rank)}
              </Link>
            </TableCell>
            <TableCell>
              <Link href={`/participant/${entry.participantId}`} className="block">
                <span className="font-medium">{entry.name}</span>
              </Link>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Link href={`/participant/${entry.participantId}`} className="block">
                <Badge variant="outline">
                  {entry.blogPlatform.toLowerCase()}
                </Badge>
              </Link>
            </TableCell>
            <TableCell className="text-center hidden md:table-cell">
              <Link href={`/participant/${entry.participantId}`} className="block">
                {entry.submissionCount}
              </Link>
            </TableCell>
            <TableCell className="text-center hidden md:table-cell">
              <Link href={`/participant/${entry.participantId}`} className="block">
                {entry.totalLikes}
              </Link>
            </TableCell>
            <TableCell className="text-center hidden lg:table-cell">
              <Link href={`/participant/${entry.participantId}`} className="block">
                {entry.totalComments}
              </Link>
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/participant/${entry.participantId}`} className="block">
                <span className="font-semibold">{entry.totalScore}</span>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
