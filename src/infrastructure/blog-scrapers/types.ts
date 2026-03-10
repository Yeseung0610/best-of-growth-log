import type { BlogPostData, BlogPlatform } from "@/domain/entities";

/**
 * 블로그 스크래퍼 인터페이스
 */
export interface BlogScraper {
  /** 지원하는 플랫폼 */
  platform: BlogPlatform;

  /**
   * 게시글 데이터 수집
   * @param postUrl - 게시글 URL
   * @returns 게시글 데이터
   */
  fetchPostData(postUrl: string): Promise<BlogPostData>;

  /**
   * 게시글 소유권 검증
   * @param postUrl - 게시글 URL
   * @param blogAccountUrl - 블로그 계정 URL
   * @returns 소유권 일치 여부
   */
  verifyOwnership(postUrl: string, blogAccountUrl: string): Promise<boolean>;

  /**
   * 블로그 계정 존재 여부 확인
   * @param blogAccountUrl - 블로그 계정 URL
   * @returns 계정 존재 여부
   */
  verifyAccount(blogAccountUrl: string): Promise<boolean>;
}

/**
 * 스크래퍼 에러
 */
export class ScraperError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "FETCH_ERROR"
      | "PARSE_ERROR"
      | "NOT_FOUND"
      | "UNAUTHORIZED"
      | "RATE_LIMIT"
  ) {
    super(message);
    this.name = "ScraperError";
  }
}
