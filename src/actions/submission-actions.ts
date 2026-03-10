"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/shared/auth";
import {
  createParticipantRepository,
  createRoundRepository,
  createSubmissionRepository,
  createClubSettingsRepository,
} from "@/infrastructure/firebase/repositories";
import { detectPlatformFromPostUrl } from "@/domain/services";
import { calculateScore } from "@/domain/services";
import {
  fetchBlogPostData,
  verifyPostOwnership,
} from "@/infrastructure/blog-scrapers";
import type { Submission } from "@/domain/entities";

/**
 * 성장일지 제출 입력 스키마
 */
const submissionSchema = z.object({
  postUrl: z.string().url("올바른 URL 형식이 아닙니다"),
});

/**
 * 성장일지 제출 결과 타입
 */
type SubmissionResult =
  | { success: true; submission: Submission }
  | { success: false; error: string };

/**
 * 성장일지 제출
 *
 * @param formData - 제출 폼 데이터
 * @returns 제출 결과
 */
export async function submitGrowthLog(
  formData: FormData
): Promise<SubmissionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다" };
  }

  // 입력 유효성 검사
  const rawData = {
    postUrl: formData.get("postUrl"),
  };

  const validationResult = submissionSchema.safeParse(rawData);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return { success: false, error: firstError.message };
  }

  const { postUrl } = validationResult.data;

  // 참가자 확인
  const participantRepo = createParticipantRepository();
  const participant = await participantRepo.findByUserId(session.user.id);

  if (!participant) {
    return { success: false, error: "참가자로 등록되어 있지 않습니다" };
  }

  // URL에서 플랫폼 감지
  const detectedPlatform = detectPlatformFromPostUrl(postUrl);
  if (!detectedPlatform) {
    return {
      success: false,
      error: "지원하지 않는 블로그 플랫폼입니다 (Velog, Tistory, Medium 지원)",
    };
  }

  // 등록된 블로그 플랫폼과 일치하는지 확인
  if (detectedPlatform !== participant.blogPlatform) {
    return {
      success: false,
      error: `등록된 블로그 플랫폼(${participant.blogPlatform})과 다릅니다`,
    };
  }

  // 게시글 소유권 검증
  const isOwner = await verifyPostOwnership(
    participant.blogPlatform,
    postUrl,
    participant.blogAccountUrl
  );

  if (!isOwner) {
    return {
      success: false,
      error: "등록된 블로그 계정의 게시글이 아닙니다",
    };
  }

  // 현재 활성 차수 확인
  const roundRepo = createRoundRepository();
  const activeRound = await roundRepo.findActive();

  if (!activeRound) {
    return { success: false, error: "현재 진행 중인 차수가 없습니다" };
  }

  // 제출 기간 확인
  const now = new Date();
  if (
    now < activeRound.submissionStartDate ||
    now > activeRound.submissionEndDate
  ) {
    return { success: false, error: "제출 기간이 아닙니다" };
  }

  const submissionRepo = createSubmissionRepository();

  // 중복 URL 제출 확인
  const existingByUrl = await submissionRepo.findByPostUrl(postUrl);
  if (existingByUrl) {
    return { success: false, error: "이미 제출된 게시글입니다" };
  }

  // 해당 차수에 이미 제출했는지 확인
  const existingSubmission = await submissionRepo.findByParticipantAndRound(
    participant.id,
    activeRound.id
  );
  if (existingSubmission) {
    return {
      success: false,
      error: `${activeRound.roundNumber}차 성장일지를 이미 제출하셨습니다`,
    };
  }

  // 블로그 데이터 수집
  let blogData;
  try {
    blogData = await fetchBlogPostData(participant.blogPlatform, postUrl);
  } catch (error) {
    return {
      success: false,
      error: "게시글 정보를 가져올 수 없습니다. URL을 확인해주세요",
    };
  }

  // 게시글 작성일 검증 (제출 기간 내에 작성된 글인지)
  if (
    blogData.publishedAt < activeRound.submissionStartDate ||
    blogData.publishedAt > activeRound.submissionEndDate
  ) {
    return {
      success: false,
      error: "제출 기간 내에 작성된 게시글만 제출할 수 있습니다",
    };
  }

  // 점수 계산
  const settingsRepo = createClubSettingsRepository();
  const settings = await settingsRepo.get();
  const scoreResult = calculateScore(blogData, {
    likeScore: settings?.likeScore || 1,
    uniqueCommenterScore: settings?.uniqueCommenterScore || 5,
  });

  // 제출 생성
  const submission = await submissionRepo.create({
    participantId: participant.id,
    roundId: activeRound.id,
    roundNumber: activeRound.roundNumber,
    postUrl,
    postTitle: blogData.title,
    postPublishedAt: blogData.publishedAt,
  });

  // 블로그 데이터 업데이트
  await submissionRepo.updateBlogData(submission.id, {
    likesCount: blogData.likesCount,
    commentsCount: blogData.commentsCount,
    uniqueCommenters: blogData.uniqueCommenters,
    score: scoreResult.score,
  });

  // 참가자 점수 업데이트
  const allSubmissions = await submissionRepo.findByParticipantId(
    participant.id
  );
  const totalScore = allSubmissions.reduce((sum, s) => sum + s.score, 0);
  const totalLikes = allSubmissions.reduce((sum, s) => sum + s.likesCount, 0);
  const totalComments = allSubmissions.reduce(
    (sum, s) => sum + s.commentsCount,
    0
  );

  await participantRepo.updateScore(participant.id, {
    totalScore,
    totalLikes,
    totalComments,
    submissionCount: allSubmissions.length,
  });

  return {
    success: true,
    submission: {
      ...submission,
      likesCount: blogData.likesCount,
      commentsCount: blogData.commentsCount,
      uniqueCommenters: blogData.uniqueCommenters,
      score: scoreResult.score,
      status: "VERIFIED",
    },
  };
}

/**
 * 내 제출 목록 조회
 */
export async function getMySubmissions(): Promise<Submission[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  const participantRepo = createParticipantRepository();
  const participant = await participantRepo.findByUserId(session.user.id);

  if (!participant) {
    return [];
  }

  const submissionRepo = createSubmissionRepository();
  return submissionRepo.findByParticipantId(participant.id);
}

/**
 * 현재 활성 차수 조회
 */
export async function getActiveRound() {
  const roundRepo = createRoundRepository();
  return roundRepo.findActive();
}
