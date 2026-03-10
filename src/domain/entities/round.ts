/**
 * 성장일지 차수 엔티티
 * 성장일지 제출 기간을 정의
 */
export interface Round {
  /** 차수 ID */
  id: string;
  /** 차수 번호 (1, 2, 3, ...) */
  roundNumber: number;
  /** 제출 시작일 */
  submissionStartDate: Date;
  /** 제출 마감일 */
  submissionEndDate: Date;
  /** 활성화 여부 */
  isActive: boolean;
  /** 생성 일시 */
  createdAt: Date;
  /** 수정 일시 */
  updatedAt: Date;
}

/**
 * 차수 생성 시 필요한 데이터
 */
export interface CreateRoundData {
  roundNumber: number;
  submissionStartDate: Date;
  submissionEndDate: Date;
}
