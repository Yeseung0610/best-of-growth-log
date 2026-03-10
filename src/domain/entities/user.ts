/**
 * 사용자 역할
 */
export type UserRole = "USER" | "ADMIN";

/**
 * 사용자 엔티티
 * Firebase Auth를 통해 인증된 사용자 정보
 */
export interface User {
  /** Firebase Auth UID */
  uid: string;
  /** 이메일 주소 */
  email: string;
  /** 표시 이름 */
  displayName: string | null;
  /** 프로필 이미지 URL */
  photoURL: string | null;
  /** 사용자 역할 */
  role: UserRole;
  /** 생성 일시 */
  createdAt: Date;
  /** 수정 일시 */
  updatedAt: Date;
}

/**
 * 새 사용자 생성 시 필요한 데이터
 */
export interface CreateUserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}
