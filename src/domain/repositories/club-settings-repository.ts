import type { ClubSettings, UpdateClubSettingsData } from "../entities";

/**
 * 클럽 설정 리포지토리 인터페이스
 */
export interface ClubSettingsRepository {
  /**
   * 클럽 설정 조회 (singleton)
   */
  get(): Promise<ClubSettings | null>;

  /**
   * 클럽 설정 초기화 (최초 1회)
   */
  initialize(data: Omit<ClubSettings, "id" | "updatedAt">): Promise<ClubSettings>;

  /**
   * 클럽 설정 업데이트
   */
  update(data: UpdateClubSettingsData): Promise<ClubSettings>;
}
