import type { BlogPostData, ClubSettings } from "../entities";

/**
 * 점수 계산 결과
 */
export interface ScoreResult {
  /** 계산된 점수 */
  score: number;
  /** 좋아요 점수 */
  likesScore: number;
  /** 댓글 점수 */
  commentsScore: number;
}

/**
 * 성장일지 점수 계산 서비스
 *
 * 점수 계산 공식:
 * score = (좋아요 수 × likeScore) + (고유 댓글 작성자 수 × uniqueCommenterScore)
 *
 * @param blogData - 블로그에서 수집한 데이터
 * @param settings - 클럽 설정 (점수 배율)
 * @returns 계산된 점수
 */
export function calculateScore(
  blogData: Pick<BlogPostData, "likesCount" | "uniqueCommenters">,
  settings: Pick<ClubSettings, "likeScore" | "uniqueCommenterScore">
): ScoreResult {
  const likesScore = blogData.likesCount * settings.likeScore;
  const commentsScore =
    blogData.uniqueCommenters.length * settings.uniqueCommenterScore;

  return {
    score: likesScore + commentsScore,
    likesScore,
    commentsScore,
  };
}

/**
 * 기본 점수 설정으로 점수 계산
 * likeScore: 1, uniqueCommenterScore: 5
 */
export function calculateScoreWithDefaults(
  blogData: Pick<BlogPostData, "likesCount" | "uniqueCommenters">
): ScoreResult {
  return calculateScore(blogData, {
    likeScore: 1,
    uniqueCommenterScore: 5,
  });
}

/**
 * 참가자의 총 점수 계산
 *
 * @param submissions - 제출 목록
 * @returns 총 점수 데이터
 */
export function calculateTotalScore(
  submissions: Array<{
    likesCount: number;
    commentsCount: number;
    score: number;
  }>
): {
  totalScore: number;
  totalLikes: number;
  totalComments: number;
  submissionCount: number;
} {
  let totalScore = 0;
  let totalLikes = 0;
  let totalComments = 0;

  for (const submission of submissions) {
    totalScore += submission.score;
    totalLikes += submission.likesCount;
    totalComments += submission.commentsCount;
  }

  return {
    totalScore,
    totalLikes,
    totalComments,
    submissionCount: submissions.length,
  };
}
