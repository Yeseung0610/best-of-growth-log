import type { BlogPlatform } from "../entities";

/**
 * 블로그 URL 검증 결과
 */
export interface BlogUrlValidationResult {
  isValid: boolean;
  platform: BlogPlatform | null;
  username: string | null;
  normalizedUrl: string | null;
  error?: string;
}

/**
 * 블로그 플랫폼별 URL 패턴
 */
const BLOG_PATTERNS: Record<BlogPlatform, RegExp> = {
  VELOG: /^https?:\/\/velog\.io\/@([a-zA-Z0-9_-]+)\/?$/,
  TISTORY: /^https?:\/\/([a-zA-Z0-9_-]+)\.tistory\.com\/?$/,
  MEDIUM: /^https?:\/\/medium\.com\/@([a-zA-Z0-9._-]+)\/?$/,
};

/**
 * 블로그 URL 정규화 및 검증
 *
 * @param url - 검증할 블로그 URL
 * @param platform - 예상 플랫폼 (선택사항)
 * @returns 검증 결과
 */
export function validateBlogUrl(
  url: string,
  platform?: BlogPlatform
): BlogUrlValidationResult {
  const trimmedUrl = url.trim();

  // URL 형식 검증
  try {
    new URL(trimmedUrl);
  } catch {
    return {
      isValid: false,
      platform: null,
      username: null,
      normalizedUrl: null,
      error: "올바른 URL 형식이 아닙니다",
    };
  }

  // 특정 플랫폼 지정 시 해당 플랫폼만 검증
  if (platform) {
    const pattern = BLOG_PATTERNS[platform];
    const match = trimmedUrl.match(pattern);

    if (!match) {
      return {
        isValid: false,
        platform: null,
        username: null,
        normalizedUrl: null,
        error: `${platform} 블로그 URL 형식이 아닙니다`,
      };
    }

    return {
      isValid: true,
      platform,
      username: match[1],
      normalizedUrl: normalizeUrl(trimmedUrl, platform, match[1]),
    };
  }

  // 모든 플랫폼 패턴 검사
  for (const [platformKey, pattern] of Object.entries(BLOG_PATTERNS)) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      const detectedPlatform = platformKey as BlogPlatform;
      return {
        isValid: true,
        platform: detectedPlatform,
        username: match[1],
        normalizedUrl: normalizeUrl(trimmedUrl, detectedPlatform, match[1]),
      };
    }
  }

  return {
    isValid: false,
    platform: null,
    username: null,
    normalizedUrl: null,
    error: "지원하지 않는 블로그 플랫폼입니다 (Velog, Tistory, Medium 지원)",
  };
}

/**
 * URL 정규화 (후행 슬래시 제거, https 통일)
 */
function normalizeUrl(
  url: string,
  platform: BlogPlatform,
  username: string
): string {
  switch (platform) {
    case "VELOG":
      return `https://velog.io/@${username}`;
    case "TISTORY":
      return `https://${username}.tistory.com`;
    case "MEDIUM":
      return `https://medium.com/@${username}`;
    default:
      return url;
  }
}

/**
 * 학교 이메일 검증 (@knou.ac.kr 도메인)
 *
 * @param email - 검증할 이메일
 * @returns 유효한 학교 이메일인지 여부
 */
export function validateSchoolEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail.endsWith("@knou.ac.kr");
}

/**
 * 게시글 URL에서 블로그 플랫폼 감지
 */
export function detectPlatformFromPostUrl(
  postUrl: string
): BlogPlatform | null {
  const url = postUrl.trim();

  if (url.includes("velog.io")) {
    return "VELOG";
  }
  if (url.includes(".tistory.com")) {
    return "TISTORY";
  }
  if (url.includes("medium.com")) {
    return "MEDIUM";
  }

  return null;
}
