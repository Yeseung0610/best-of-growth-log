import type { User, CreateUserData } from "../entities";

/**
 * 사용자 리포지토리 인터페이스
 */
export interface UserRepository {
  /**
   * ID로 사용자 조회
   */
  findById(uid: string): Promise<User | null>;

  /**
   * 이메일로 사용자 조회
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * 새 사용자 생성
   */
  create(data: CreateUserData): Promise<User>;

  /**
   * 사용자 정보 업데이트
   */
  update(uid: string, data: Partial<User>): Promise<User>;

  /**
   * 사용자 역할 업데이트
   */
  updateRole(uid: string, role: User["role"]): Promise<void>;
}
