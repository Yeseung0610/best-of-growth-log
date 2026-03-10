"use server";

import {
  createParticipantRepository,
  createSubmissionRepository,
} from "@/infrastructure/firebase/repositories";
import type { LeaderboardEntry, Submission, Participant } from "@/domain/entities";

/**
 * 리더보드 조회
 *
 * @param limit - 조회할 참가자 수 (기본: 50)
 * @returns 리더보드 항목 목록
 */
export async function getLeaderboard(
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    const participantRepo = createParticipantRepository();
    return await participantRepo.findTopByScore(limit);
  } catch {
    // 컬렉션이 없거나 비어있는 경우
    return [];
  }
}

/**
 * 참가자 상세 정보 조회 (순위 포함)
 *
 * @param participantId - 참가자 ID
 * @returns 참가자 정보, 순위 및 제출 목록
 */
export async function getParticipantDetail(participantId: string): Promise<{
  participant: Participant | null;
  rank: number;
  submissions: Submission[];
}> {
  try {
    const participantRepo = createParticipantRepository();
    const submissionRepo = createSubmissionRepository();

    const [participant, leaderboard, submissions] = await Promise.all([
      participantRepo.findById(participantId),
      participantRepo.findTopByScore(1000), // 순위 계산을 위해 전체 조회
      submissionRepo.findByParticipantId(participantId),
    ]);

    if (!participant) {
      return { participant: null, rank: 0, submissions: [] };
    }

    // 순위 계산
    const rank = leaderboard.findIndex((e) => e.participantId === participantId) + 1;

    return { participant, rank, submissions };
  } catch (error) {
    console.error("Failed to get participant detail:", error);
    return { participant: null, rank: 0, submissions: [] };
  }
}

/**
 * 전체 통계 조회
 */
export async function getOverallStats(): Promise<{
  totalParticipants: number;
  totalSubmissions: number;
  topScore: number;
}> {
  try {
    const participantRepo = createParticipantRepository();
    const submissionRepo = createSubmissionRepository();

    const [participants, submissions] = await Promise.all([
      participantRepo.findAll().catch(() => []),
      submissionRepo.findAll().catch(() => []),
    ]);

    // 1등 점수 (가장 높은 점수)
    const topScore = participants.length > 0
      ? Math.max(...participants.map((p) => p.totalScore))
      : 0;

    return {
      totalParticipants: participants.length,
      totalSubmissions: submissions.length,
      topScore,
    };
  } catch {
    return {
      totalParticipants: 0,
      totalSubmissions: 0,
      topScore: 0,
    };
  }
}
