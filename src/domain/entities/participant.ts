import type { BlogPlatform } from "./application";

/**
 * 승인된 참가자 엔티티
 * 참가 신청이 승인된 클럽 참가자 정보
 */
export interface Participant {
  /** 참가자 ID (= userId) */
  id: string;
  /** Firebase Auth UID */
  userId: string;
  /** 참가자 이름 */
  name: string;
  /** 학교 이메일 */
  schoolEmail: string;
  /** 블로그 플랫폼 */
  blogPlatform: BlogPlatform;
  /** 블로그 계정 URL */
  blogAccountUrl: string;
  /** 총 점수 */
  totalScore: number;
  /** 총 좋아요 수 */
  totalLikes: number;
  /** 총 댓글 수 */
  totalComments: number;
  /** 총 제출 횟수 */
  submissionCount: number;
  /** 참가 승인 일시 */
  createdAt: Date;
  /** 점수 갱신 일시 */
  updatedAt: Date;
}

/**
 * 리더보드 항목
 * 순위 정보가 포함된 참가자 요약 정보
 */
export interface LeaderboardEntry {
  /** 순위 */
  rank: number;
  /** 참가자 ID */
  participantId: string;
  /** 참가자 이름 */
  name: string;
  /** 블로그 플랫폼 */
  blogPlatform: BlogPlatform;
  /** 총 점수 */
  totalScore: number;
  /** 총 좋아요 수 */
  totalLikes: number;
  /** 총 댓글 수 */
  totalComments: number;
  /** 제출 횟수 */
  submissionCount: number;
}
