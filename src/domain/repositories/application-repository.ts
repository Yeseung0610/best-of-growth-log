import type {
  Application,
  ApplicationStatus,
  CreateApplicationData,
} from "../entities";

/**
 * 참가 신청 리포지토리 인터페이스
 */
export interface ApplicationRepository {
  /**
   * ID로 신청 조회
   */
  findById(id: string): Promise<Application | null>;

  /**
   * 사용자 ID로 신청 조회
   */
  findByUserId(userId: string): Promise<Application | null>;

  /**
   * 상태별 신청 목록 조회
   */
  findByStatus(status: ApplicationStatus): Promise<Application[]>;

  /**
   * 모든 신청 목록 조회
   */
  findAll(): Promise<Application[]>;

  /**
   * 새 신청 생성
   */
  create(data: CreateApplicationData): Promise<Application>;

  /**
   * 신청 상태 업데이트
   */
  updateStatus(
    id: string,
    status: ApplicationStatus,
    adminNote?: string
  ): Promise<Application>;

  /**
   * 신청 삭제
   */
  delete(id: string): Promise<void>;
}
