import type { BlogPlatform, BlogPostData } from "@/domain/entities";
import type { BlogScraper } from "./types";
import { ScraperError } from "./types";
import { velogScraper } from "./velog-scraper";
import { tistoryScraper } from "./tistory-scraper";
import { mediumScraper } from "./medium-scraper";

export type { BlogScraper } from "./types";
export { ScraperError } from "./types";

/**
 * 플랫폼별 스크래퍼 맵
 */
const scrapers: Record<BlogPlatform, BlogScraper> = {
  VELOG: velogScraper,
  TISTORY: tistoryScraper,
  MEDIUM: mediumScraper,
};

/**
 * 플랫폼에 맞는 스크래퍼 가져오기
 *
 * @param platform - 블로그 플랫폼
 * @returns 블로그 스크래퍼
 */
export function getScraper(platform: BlogPlatform): BlogScraper {
  return scrapers[platform];
}

/**
 * 게시글 데이터 수집
 *
 * @param platform - 블로그 플랫폼
 * @param postUrl - 게시글 URL
 * @returns 게시글 데이터
 */
export async function fetchBlogPostData(
  platform: BlogPlatform,
  postUrl: string
): Promise<BlogPostData> {
  const scraper = getScraper(platform);
  return scraper.fetchPostData(postUrl);
}

/**
 * 게시글 소유권 검증
 *
 * @param platform - 블로그 플랫폼
 * @param postUrl - 게시글 URL
 * @param blogAccountUrl - 블로그 계정 URL
 * @returns 소유권 일치 여부
 */
export async function verifyPostOwnership(
  platform: BlogPlatform,
  postUrl: string,
  blogAccountUrl: string
): Promise<boolean> {
  const scraper = getScraper(platform);
  return scraper.verifyOwnership(postUrl, blogAccountUrl);
}

/**
 * 블로그 계정 존재 확인
 *
 * @param platform - 블로그 플랫폼
 * @param blogAccountUrl - 블로그 계정 URL
 * @returns 계정 존재 여부
 */
export async function verifyBlogAccount(
  platform: BlogPlatform,
  blogAccountUrl: string
): Promise<boolean> {
  const scraper = getScraper(platform);
  return scraper.verifyAccount(blogAccountUrl);
}
