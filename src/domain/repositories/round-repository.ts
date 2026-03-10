import type { Round, CreateRoundData } from "../entities";

/**
 * 차수 리포지토리 인터페이스
 */
export interface RoundRepository {
  /**
   * ID로 차수 조회
   */
  findById(id: string): Promise<Round | null>;

  /**
   * 차수 번호로 조회
   */
  findByNumber(roundNumber: number): Promise<Round | null>;

  /**
   * 현재 활성 차수 조회
   */
  findActive(): Promise<Round | null>;

  /**
   * 모든 차수 조회
   */
  findAll(): Promise<Round[]>;

  /**
   * 새 차수 생성
   */
  create(data: CreateRoundData): Promise<Round>;

  /**
   * 차수 업데이트
   */
  update(id: string, data: Partial<Round>): Promise<Round>;

  /**
   * 차수 활성화/비활성화
   */
  setActive(id: string, isActive: boolean): Promise<void>;

  /**
   * 차수 삭제
   */
  delete(id: string): Promise<void>;
}
