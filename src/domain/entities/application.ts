/**
 * 참가 신청 상태
 */
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * 블로그 플랫폼 종류
 */
export type BlogPlatform = "VELOG" | "TISTORY" | "MEDIUM";

/**
 * 참가 신청 엔티티
 * 클럽 참가를 신청한 정보
 */
export interface Application {
  /** 신청 ID */
  id: string;
  /** 신청자 UID (Firebase Auth) */
  userId: string;
  /** 참가자 이름 */
  participantName: string;
  /** 학교 이메일 (@knou.ac.kr) */
  schoolEmail: string;
  /** 블로그 플랫폼 */
  blogPlatform: BlogPlatform;
  /** 블로그 계정 URL */
  blogAccountUrl: string;
  /** 신청 상태 */
  status: ApplicationStatus;
  /** 관리자 메모 (거절 사유 등) */
  adminNote?: string;
  /** 신청 일시 */
  createdAt: Date;
  /** 상태 변경 일시 */
  updatedAt: Date;
}

/**
 * 참가 신청 생성 시 필요한 데이터
 */
export interface CreateApplicationData {
  userId: string;
  participantName: string;
  schoolEmail: string;
  blogPlatform: BlogPlatform;
  blogAccountUrl: string;
}
