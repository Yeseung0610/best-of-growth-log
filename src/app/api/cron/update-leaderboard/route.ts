import { NextRequest, NextResponse } from "next/server";
import {
  createParticipantRepository,
  createSubmissionRepository,
  createClubSettingsRepository,
} from "@/infrastructure/firebase/repositories";
import { fetchBlogPostData } from "@/infrastructure/blog-scrapers";
import { calculateScore } from "@/domain/services";

/**
 * Cron Job: 리더보드 갱신
 *
 * 모든 제출된 게시글의 최신 데이터를 수집하고
 * 점수를 재계산하여 참가자 총점을 업데이트합니다.
 *
 * Vercel Cron으로 하루 2회 (00:00, 12:00 UTC) 실행
 */
export async function GET(request: NextRequest) {
  // Cron Job 인증 확인
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Vercel Cron 또는 수동 호출 시 인증
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Vercel Cron은 자동으로 인증됨 (CRON_SECRET 설정 시)
    const isVercelCron = request.headers.get("x-vercel-cron") === "true";
    if (!isVercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const participantRepo = createParticipantRepository();
    const submissionRepo = createSubmissionRepository();
    const settingsRepo = createClubSettingsRepository();

    const settings = await settingsRepo.get();

    // 클럽 활동 기간 확인
    const now = new Date();
    if (settings?.activityStartDate && settings?.activityEndDate) {
      if (now < settings.activityStartDate || now > settings.activityEndDate) {
        return NextResponse.json({
          success: true,
          message: "Outside club activity period, skipping update",
          timestamp: new Date().toISOString(),
        });
      }
    }

    const likeScore = settings?.likeScore || 1;
    const uniqueCommenterScore = settings?.uniqueCommenterScore || 5;

    // 모든 참가자 조회
    const participants = await participantRepo.findAll();

    let updatedCount = 0;
    let errorCount = 0;

    for (const participant of participants) {
      try {
        // 참가자의 모든 제출 조회
        const submissions = await submissionRepo.findByParticipantId(
          participant.id
        );

        let totalScore = 0;
        let totalLikes = 0;
        let totalComments = 0;

        for (const submission of submissions) {
          try {
            // 최신 블로그 데이터 수집
            const blogData = await fetchBlogPostData(
              participant.blogPlatform,
              submission.postUrl
            );

            // 점수 계산
            const scoreResult = calculateScore(blogData, {
              likeScore,
              uniqueCommenterScore,
            });

            // 제출 데이터 업데이트
            await submissionRepo.updateBlogData(submission.id, {
              likesCount: blogData.likesCount,
              commentsCount: blogData.commentsCount,
              uniqueCommenters: blogData.uniqueCommenters,
              score: scoreResult.score,
            });

            totalScore += scoreResult.score;
            totalLikes += blogData.likesCount;
            totalComments += blogData.commentsCount;
          } catch (error) {
            // 개별 게시글 에러는 기존 데이터 유지
            console.error(
              `Failed to fetch post ${submission.postUrl}:`,
              error
            );
            totalScore += submission.score;
            totalLikes += submission.likesCount;
            totalComments += submission.commentsCount;
          }
        }

        // 참가자 총점 업데이트
        await participantRepo.updateScore(participant.id, {
          totalScore,
          totalLikes,
          totalComments,
          submissionCount: submissions.length,
        });

        updatedCount++;
      } catch (error) {
        console.error(
          `Failed to update participant ${participant.id}:`,
          error
        );
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Leaderboard updated",
      stats: {
        totalParticipants: participants.length,
        updatedCount,
        errorCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Leaderboard update failed",
      },
      { status: 500 }
    );
  }
}
