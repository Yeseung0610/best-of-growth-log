/**
 * 클럽 설정 엔티티
 * 클럽 운영에 필요한 전역 설정
 */
export interface ClubSettings {
  /** 설정 ID (singleton) */
  id: string;
  /** 클럽 이름 */
  clubName: string;
  /** 클럽 설명 */
  description: string;
  /** 참가 신청 시작일 */
  applicationStartDate: Date;
  /** 참가 신청 마감일 */
  applicationEndDate: Date;
  /** 활동 시작일 */
  activityStartDate: Date;
  /** 활동 종료일 */
  activityEndDate: Date;
  /** 참가비 (원) */
  participationFee: number;
  /** 좋아요당 점수 */
  likeScore: number;
  /** 고유 댓글 작성자당 점수 */
  uniqueCommenterScore: number;
  /** 참가 신청 가능 여부 */
  isApplicationOpen: boolean;
  /** 활동 진행 중 여부 */
  isActivityActive: boolean;
  /** 수정 일시 */
  updatedAt: Date;
}

/**
 * 클럽 설정 업데이트 시 필요한 데이터
 */
export interface UpdateClubSettingsData {
  clubName?: string;
  description?: string;
  applicationStartDate?: Date;
  applicationEndDate?: Date;
  activityStartDate?: Date;
  activityEndDate?: Date;
  participationFee?: number;
  likeScore?: number;
  uniqueCommenterScore?: number;
  isApplicationOpen?: boolean;
  isActivityActive?: boolean;
}
