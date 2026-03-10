import type { Participant, LeaderboardEntry } from "../entities";

/**
 * 참가자 생성 시 필요한 데이터
 */
export interface CreateParticipantData {
  userId: string;
  name: string;
  schoolEmail: string;
  blogPlatform: Participant["blogPlatform"];
  blogAccountUrl: string;
}

/**
 * 참가자 리포지토리 인터페이스
 */
export interface ParticipantRepository {
  /**
   * ID로 참가자 조회
   */
  findById(id: string): Promise<Participant | null>;

  /**
   * 사용자 ID로 참가자 조회
   */
  findByUserId(userId: string): Promise<Participant | null>;

  /**
   * 모든 참가자 조회
   */
  findAll(): Promise<Participant[]>;

  /**
   * 점수 기준 상위 참가자 조회 (리더보드)
   * @param limit 조회할 참가자 수
   */
  findTopByScore(limit: number): Promise<LeaderboardEntry[]>;

  /**
   * 새 참가자 생성
   */
  create(data: CreateParticipantData): Promise<Participant>;

  /**
   * 참가자 점수 업데이트
   */
  updateScore(
    id: string,
    data: {
      totalScore: number;
      totalLikes: number;
      totalComments: number;
      submissionCount: number;
    }
  ): Promise<void>;

  /**
   * 참가자 삭제
   */
  delete(id: string): Promise<void>;
}
