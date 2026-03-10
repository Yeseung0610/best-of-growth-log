"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/auth";
import {
  createApplicationRepository,
  createParticipantRepository,
  createRoundRepository,
  createClubSettingsRepository,
  createUserRepository,
} from "@/infrastructure/firebase/repositories";
import type {
  Application,
  Round,
  ClubSettings,
  UpdateClubSettingsData,
} from "@/domain/entities";

/**
 * 관리자 권한 확인
 */
async function requireAdmin(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  if (session.user.role !== "ADMIN") {
    return null;
  }

  return session.user.id;
}

// ===== 참가 신청 관리 =====

/**
 * 모든 참가 신청 조회
 */
export async function getAllApplications(): Promise<Application[]> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return [];
  }

  const applicationRepo = createApplicationRepository();
  return applicationRepo.findAll();
}

/**
 * 대기 중인 참가 신청 조회
 */
export async function getPendingApplications(): Promise<Application[]> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return [];
  }

  const applicationRepo = createApplicationRepository();
  return applicationRepo.findByStatus("PENDING");
}

/**
 * 참가 신청 승인
 */
export async function approveApplication(
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "관리자 권한이 필요합니다" };
  }

  const applicationRepo = createApplicationRepository();
  const application = await applicationRepo.findById(applicationId);

  if (!application) {
    return { success: false, error: "신청을 찾을 수 없습니다" };
  }

  if (application.status !== "PENDING") {
    return { success: false, error: "대기 중인 신청만 승인할 수 있습니다" };
  }

  // 참가자로 등록
  const participantRepo = createParticipantRepository();
  await participantRepo.create({
    userId: application.userId,
    name: application.participantName,
    schoolEmail: application.schoolEmail,
    blogPlatform: application.blogPlatform,
    blogAccountUrl: application.blogAccountUrl,
  });

  // 신청 상태 업데이트
  await applicationRepo.updateStatus(applicationId, "APPROVED");

  return { success: true };
}

/**
 * 참가 신청 거절
 */
export async function rejectApplication(
  applicationId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "관리자 권한이 필요합니다" };
  }

  const applicationRepo = createApplicationRepository();
  const application = await applicationRepo.findById(applicationId);

  if (!application) {
    return { success: false, error: "신청을 찾을 수 없습니다" };
  }

  if (application.status !== "PENDING") {
    return { success: false, error: "대기 중인 신청만 거절할 수 있습니다" };
  }

  await applicationRepo.updateStatus(applicationId, "REJECTED", reason);

  return { success: true };
}

// ===== 차수 관리 =====

/**
 * 모든 차수 조회
 */
export async function getAllRounds(): Promise<Round[]> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return [];
  }

  const roundRepo = createRoundRepository();
  return roundRepo.findAll();
}

/**
 * 새 차수 생성
 */
export async function createRound(data: {
  roundNumber: number;
  submissionStartDate: Date;
  submissionEndDate: Date;
}): Promise<{ success: boolean; round?: Round; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "관리자 권한이 필요합니다" };
  }

  const roundRepo = createRoundRepository();

  // 중복 차수 번호 확인
  const existing = await roundRepo.findByNumber(data.roundNumber);
  if (existing) {
    return { success: false, error: "이미 존재하는 차수 번호입니다" };
  }

  const round = await roundRepo.create(data);
  return { success: true, round };
}

/**
 * 차수 활성화
 */
export async function activateRound(
  roundId: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "관리자 권한이 필요합니다" };
  }

  const roundRepo = createRoundRepository();
  await roundRepo.setActive(roundId, true);

  return { success: true };
}

/**
 * 차수 비활성화
 */
export async function deactivateRound(
  roundId: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "관리자 권한이 필요합니다" };
  }

  const roundRepo = createRoundRepository();
  await roundRepo.setActive(roundId, false);

  return { success: true };
}

/**
 * 차수 삭제
 */
export async function deleteRound(
  roundId: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "관리자 권한이 필요합니다" };
  }

  const roundRepo = createRoundRepository();
  const round = await roundRepo.findById(roundId);

  if (!round) {
    return { success: false, error: "차수를 찾을 수 없습니다" };
  }

  await roundRepo.delete(roundId);

  return { success: true };
}

// ===== 클럽 설정 =====

/**
 * 클럽 설정 조회
 */
export async function getClubSettings(): Promise<ClubSettings | null> {
  const settingsRepo = createClubSettingsRepository();
  return settingsRepo.get();
}

/**
 * 클럽 설정 업데이트
 */
export async function updateClubSettings(
  data: UpdateClubSettingsData
): Promise<{ success: boolean; settings?: ClubSettings; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "관리자 권한이 필요합니다" };
  }

  const settingsRepo = createClubSettingsRepository();
  const settings = await settingsRepo.update(data);

  return { success: true, settings };
}

// ===== 관리자 지정 =====

/**
 * 사용자를 관리자로 지정
 */
export async function setUserAsAdmin(
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await requireAdmin();
  if (!adminId) {
    return { success: false, error: "관리자 권한이 필요합니다" };
  }

  const userRepo = createUserRepository();
  const user = await userRepo.findByEmail(userEmail);

  if (!user) {
    return { success: false, error: "사용자를 찾을 수 없습니다" };
  }

  await userRepo.updateRole(user.uid, "ADMIN");

  return { success: true };
}
