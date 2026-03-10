"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/shared/auth";
import { createApplicationRepository } from "@/infrastructure/firebase/repositories";
import { createParticipantRepository } from "@/infrastructure/firebase/repositories";
import {
  validateBlogUrl,
  validateSchoolEmail,
} from "@/domain/services";
import { verifyBlogAccount } from "@/infrastructure/blog-scrapers";
import type { Application, BlogPlatform } from "@/domain/entities";

/**
 * 참가 신청 입력 스키마
 */
const applicationSchema = z.object({
  participantName: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  schoolEmail: z
    .string()
    .email("올바른 이메일 형식이 아닙니다")
    .refine(
      (email) => validateSchoolEmail(email),
      "@knou.ac.kr 이메일만 사용할 수 있습니다"
    ),
  blogPlatform: z.enum(["VELOG", "TISTORY", "MEDIUM"]),
  blogAccountUrl: z.string().url("올바른 URL 형식이 아닙니다"),
});

/**
 * 참가 신청 결과 타입
 */
type ApplicationResult =
  | { success: true; application: Application }
  | { success: false; error: string };

/**
 * 참가 신청
 *
 * @param formData - 참가 신청 폼 데이터
 * @returns 신청 결과
 */
export async function submitApplication(
  formData: FormData
): Promise<ApplicationResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다" };
  }

  // 입력 유효성 검사
  const rawData = {
    participantName: formData.get("participantName"),
    schoolEmail: formData.get("schoolEmail"),
    blogPlatform: formData.get("blogPlatform"),
    blogAccountUrl: formData.get("blogAccountUrl"),
  };

  const validationResult = applicationSchema.safeParse(rawData);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return { success: false, error: firstError.message };
  }

  const data = validationResult.data;
  const blogPlatform = data.blogPlatform as BlogPlatform;

  // 블로그 URL 형식 검증
  const urlValidation = validateBlogUrl(data.blogAccountUrl, blogPlatform);
  if (!urlValidation.isValid) {
    return {
      success: false,
      error: urlValidation.error || "올바른 블로그 URL이 아닙니다",
    };
  }

  // 블로그 계정 존재 확인
  const accountExists = await verifyBlogAccount(
    blogPlatform,
    urlValidation.normalizedUrl!
  );
  if (!accountExists) {
    return {
      success: false,
      error: "블로그 계정을 찾을 수 없습니다. URL을 확인해주세요",
    };
  }

  const applicationRepo = createApplicationRepository();

  // 이미 신청한 사용자인지 확인
  const existingApplication = await applicationRepo.findByUserId(
    session.user.id
  );
  if (existingApplication) {
    return { success: false, error: "이미 참가 신청을 하셨습니다" };
  }

  // 이미 참가자인지 확인
  const participantRepo = createParticipantRepository();
  const existingParticipant = await participantRepo.findByUserId(
    session.user.id
  );
  if (existingParticipant) {
    return { success: false, error: "이미 참가 중입니다" };
  }

  // 신청 생성
  const application = await applicationRepo.create({
    userId: session.user.id,
    participantName: data.participantName,
    schoolEmail: data.schoolEmail,
    blogPlatform,
    blogAccountUrl: urlValidation.normalizedUrl!,
  });

  return { success: true, application };
}

/**
 * 내 참가 신청 조회
 */
export async function getMyApplication(): Promise<Application | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const applicationRepo = createApplicationRepository();
  return applicationRepo.findByUserId(session.user.id);
}

/**
 * 참가 신청 취소
 */
export async function cancelApplication(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다" };
  }

  const applicationRepo = createApplicationRepository();
  const application = await applicationRepo.findByUserId(session.user.id);

  if (!application) {
    return { success: false, error: "신청 내역이 없습니다" };
  }

  if (application.status !== "PENDING") {
    return { success: false, error: "대기 중인 신청만 취소할 수 있습니다" };
  }

  await applicationRepo.delete(application.id);
  return { success: true };
}
