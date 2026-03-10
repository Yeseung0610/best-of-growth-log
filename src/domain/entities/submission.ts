/**
 * 성장일지 제출 상태
 */
export type SubmissionStatus = "PENDING" | "VERIFIED" | "REJECTED";

/**
 * 성장일지 제출 엔티티
 * 참가자가 제출한 성장일지 정보
 */
export interface Submission {
  /** 제출 ID */
  id: string;
  /** 참가자 ID */
  participantId: string;
  /** 차수 ID */
  roundId: string;
  /** 차수 번호 */
  roundNumber: number;
  /** 게시글 URL */
  postUrl: string;
  /** 게시글 제목 */
  postTitle: string;
  /** 좋아요 수 */
  likesCount: number;
  /** 댓글 수 */
  commentsCount: number;
  /** 고유 댓글 작성자 목록 (동일 인물 중복 방지) */
  uniqueCommenters: string[];
  /** 점수 (좋아요 x 1 + 고유 댓글 작성자 x 5) */
  score: number;
  /** 제출 상태 */
  status: SubmissionStatus;
  /** 게시글 작성일 */
  postPublishedAt: Date;
  /** 제출 일시 */
  createdAt: Date;
  /** 점수 갱신 일시 */
  updatedAt: Date;
}

/**
 * 성장일지 제출 생성 시 필요한 데이터
 */
export interface CreateSubmissionData {
  participantId: string;
  roundId: string;
  roundNumber: number;
  postUrl: string;
  postTitle: string;
  postPublishedAt: Date;
}

/**
 * 블로그에서 수집한 데이터
 */
export interface BlogPostData {
  title: string;
  likesCount: number;
  commentsCount: number;
  uniqueCommenters: string[];
  publishedAt: Date;
  authorId: string;
}
