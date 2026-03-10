import * as cheerio from "cheerio";
import type { BlogPostData } from "@/domain/entities";
import type { BlogScraper } from "./types";
import { ScraperError } from "./types";

/**
 * Medium 게시글 URL 파싱
 */
function parseMediumPostUrl(
  postUrl: string
): { username: string; slug: string } | null {
  // https://medium.com/@username/post-slug-abc123
  // 또는 https://medium.com/publication/@username/post-slug
  const match = postUrl.match(
    /^https?:\/\/medium\.com\/(?:@([a-zA-Z0-9._-]+)\/|[^/]+\/)?([^?#]+)/
  );
  if (!match) {
    return null;
  }

  // @username 형식에서 추출
  const usernameMatch = postUrl.match(/@([a-zA-Z0-9._-]+)/);
  const username = usernameMatch ? usernameMatch[1] : "";

  return {
    username,
    slug: match[2],
  };
}

/**
 * Medium 블로그 URL에서 username 추출
 */
function parseMediumAccountUrl(accountUrl: string): string | null {
  const match = accountUrl.match(
    /^https?:\/\/medium\.com\/@([a-zA-Z0-9._-]+)\/?$/
  );
  return match ? match[1] : null;
}

/**
 * Medium 블로그 스크래퍼
 * HTML 스크래핑 방식 사용 (공식 API는 제한적)
 */
export const mediumScraper: BlogScraper = {
  platform: "MEDIUM",

  async fetchPostData(postUrl: string): Promise<BlogPostData> {
    const parsed = parseMediumPostUrl(postUrl);
    if (!parsed) {
      throw new ScraperError("Invalid Medium post URL", "PARSE_ERROR");
    }

    try {
      const response = await fetch(postUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new ScraperError("Post not found", "NOT_FOUND");
        }
        throw new ScraperError(
          `Medium fetch error: ${response.status}`,
          "FETCH_ERROR"
        );
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 제목 추출
      const title =
        $('meta[property="og:title"]').attr("content") ||
        $("h1").first().text().trim() ||
        "Untitled";

      // claps (좋아요) 추출 - Medium은 clap 시스템 사용
      let likesCount = 0;
      const clapText = $('[data-testid="storyClaps"]').text() ||
        $('button[data-action="show-recommends"]').text();
      if (clapText) {
        // "1.2K claps" 형식 처리
        const numMatch = clapText.match(/([0-9.]+)([KMB]?)/i);
        if (numMatch) {
          let num = parseFloat(numMatch[1]);
          const suffix = numMatch[2].toUpperCase();
          if (suffix === "K") num *= 1000;
          else if (suffix === "M") num *= 1000000;
          else if (suffix === "B") num *= 1000000000;
          likesCount = Math.floor(num);
        }
      }

      // 응답(댓글) 수 추출
      let commentsCount = 0;
      const responseText = $('[data-testid="storyResponses"]').text() ||
        $('a[href$="/responses"]').text();
      if (responseText) {
        commentsCount =
          parseInt(responseText.replace(/[^0-9]/g, ""), 10) || 0;
      }

      // 작성자 ID 추출
      const authorId =
        parsed.username ||
        $('meta[property="article:author"]').attr("content")?.split("@").pop() ||
        "";

      // 작성일 추출
      let publishedAt = new Date();
      const dateText = $('meta[property="article:published_time"]').attr(
        "content"
      );
      if (dateText) {
        const parsedDate = new Date(dateText);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate;
        }
      }

      // Medium은 댓글 작성자 정보를 초기 페이지에서 제공하지 않음
      // 추후 responses API 호출로 확장 가능

      return {
        title,
        likesCount,
        commentsCount,
        uniqueCommenters: [], // Medium은 별도 API 호출 필요
        publishedAt,
        authorId,
      };
    } catch (error) {
      if (error instanceof ScraperError) {
        throw error;
      }
      throw new ScraperError(
        `Medium scraping failed: ${error}`,
        "FETCH_ERROR"
      );
    }
  },

  async verifyOwnership(
    postUrl: string,
    blogAccountUrl: string
  ): Promise<boolean> {
    const postParsed = parseMediumPostUrl(postUrl);
    const accountUsername = parseMediumAccountUrl(blogAccountUrl);

    if (!postParsed || !accountUsername || !postParsed.username) {
      // URL에서 username을 추출할 수 없는 경우, 페이지에서 확인 필요
      try {
        const response = await fetch(postUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        const authorUrl =
          $('meta[property="article:author"]').attr("content") || "";
        return authorUrl.includes(`@${accountUsername}`);
      } catch {
        return false;
      }
    }

    return (
      postParsed.username.toLowerCase() === accountUsername.toLowerCase()
    );
  },

  async verifyAccount(blogAccountUrl: string): Promise<boolean> {
    const username = parseMediumAccountUrl(blogAccountUrl);
    if (!username) {
      return false;
    }

    try {
      // Medium RSS 피드로 계정 존재 여부 확인
      // 프로필 페이지는 403이지만 RSS 피드는 접근 가능
      const rssUrl = `https://medium.com/feed/@${username}`;
      const response = await fetch(rssUrl, {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      // 200: 계정 존재, 404: 계정 없음
      return response.ok;
    } catch {
      return false;
    }
  },
};
