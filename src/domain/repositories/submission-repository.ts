import type { Submission, CreateSubmissionData } from "../entities";

/**
 * 제출 리포지토리 인터페이스
 */
export interface SubmissionRepository {
  /**
   * ID로 제출 조회
   */
  findById(id: string): Promise<Submission | null>;

  /**
   * 참가자 ID로 모든 제출 조회
   */
  findByParticipantId(participantId: string): Promise<Submission[]>;

  /**
   * 차수 ID로 모든 제출 조회
   */
  findByRoundId(roundId: string): Promise<Submission[]>;

  /**
   * 참가자 + 차수로 제출 조회 (중복 제출 방지)
   */
  findByParticipantAndRound(
    participantId: string,
    roundId: string
  ): Promise<Submission | null>;

  /**
   * 게시글 URL로 제출 조회 (중복 URL 방지)
   */
  findByPostUrl(postUrl: string): Promise<Submission | null>;

  /**
   * 모든 제출 조회
   */
  findAll(): Promise<Submission[]>;

  /**
   * 새 제출 생성
   */
  create(data: CreateSubmissionData): Promise<Submission>;

  /**
   * 제출 점수/데이터 업데이트 (블로그 데이터 갱신 시)
   */
  updateBlogData(
    id: string,
    data: {
      likesCount: number;
      commentsCount: number;
      uniqueCommenters: string[];
      score: number;
    }
  ): Promise<void>;

  /**
   * 제출 상태 업데이트
   */
  updateStatus(id: string, status: Submission["status"]): Promise<void>;

  /**
   * 제출 삭제
   */
  delete(id: string): Promise<void>;
}
