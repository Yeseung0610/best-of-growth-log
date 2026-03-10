import * as cheerio from "cheerio";
import type { BlogPostData } from "@/domain/entities";
import type { BlogScraper } from "./types";
import { ScraperError } from "./types";

/**
 * Tistory 게시글 URL 파싱
 */
function parseTistoryPostUrl(
  postUrl: string
): { blogName: string; postId: string } | null {
  // https://blogname.tistory.com/123
  const match = postUrl.match(
    /^https?:\/\/([a-zA-Z0-9_-]+)\.tistory\.com\/(\d+)/
  );
  if (!match) {
    return null;
  }
  return {
    blogName: match[1],
    postId: match[2],
  };
}

/**
 * Tistory 블로그 URL에서 blogName 추출
 */
function parseTistoryAccountUrl(accountUrl: string): string | null {
  const match = accountUrl.match(
    /^https?:\/\/([a-zA-Z0-9_-]+)\.tistory\.com\/?$/
  );
  return match ? match[1] : null;
}

/**
 * Tistory 블로그 스크래퍼
 * RSS + HTML 스크래핑 방식 사용
 */
export const tistoryScraper: BlogScraper = {
  platform: "TISTORY",

  async fetchPostData(postUrl: string): Promise<BlogPostData> {
    const parsed = parseTistoryPostUrl(postUrl);
    if (!parsed) {
      throw new ScraperError("Invalid Tistory post URL", "PARSE_ERROR");
    }

    try {
      const response = await fetch(postUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new ScraperError("Post not found", "NOT_FOUND");
        }
        throw new ScraperError(
          `Tistory fetch error: ${response.status}`,
          "FETCH_ERROR"
        );
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 제목 추출
      const title =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text().trim() ||
        "Untitled";

      // 좋아요 수 추출 (티스토리 구조에 따라 다를 수 있음)
      let likesCount = 0;
      const likeText =
        $(".like_count").text() ||
        $('[class*="like"] [class*="count"]').text() ||
        $(".tt_like_count").text();
      if (likeText) {
        likesCount = parseInt(likeText.replace(/[^0-9]/g, ""), 10) || 0;
      }

      // 댓글 수 추출
      let commentsCount = 0;
      const commentText =
        $(".rp_count").text() ||
        $('[class*="comment"] [class*="count"]').text() ||
        $(".tt_comment_count").text();
      if (commentText) {
        commentsCount = parseInt(commentText.replace(/[^0-9]/g, ""), 10) || 0;
      }

      // 댓글 작성자 추출 (스킨에 따라 다를 수 있음)
      const uniqueCommenters = new Set<string>();
      $(".comment_list .comment .name, .commentList .name, [class*='comment'] .author").each(
        (_, el) => {
          const commenterName = $(el).text().trim();
          if (commenterName) {
            uniqueCommenters.add(commenterName);
          }
        }
      );

      // 작성일 추출
      let publishedAt = new Date();
      const dateText =
        $('meta[property="article:published_time"]').attr("content") ||
        $(".date").text();
      if (dateText) {
        const parsedDate = new Date(dateText);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate;
        }
      }

      return {
        title,
        likesCount,
        commentsCount,
        uniqueCommenters: Array.from(uniqueCommenters),
        publishedAt,
        authorId: parsed.blogName,
      };
    } catch (error) {
      if (error instanceof ScraperError) {
        throw error;
      }
      throw new ScraperError(
        `Tistory scraping failed: ${error}`,
        "FETCH_ERROR"
      );
    }
  },

  async verifyOwnership(
    postUrl: string,
    blogAccountUrl: string
  ): Promise<boolean> {
    const postParsed = parseTistoryPostUrl(postUrl);
    const accountBlogName = parseTistoryAccountUrl(blogAccountUrl);

    if (!postParsed || !accountBlogName) {
      return false;
    }

    return (
      postParsed.blogName.toLowerCase() === accountBlogName.toLowerCase()
    );
  },

  async verifyAccount(blogAccountUrl: string): Promise<boolean> {
    const blogName = parseTistoryAccountUrl(blogAccountUrl);
    if (!blogName) {
      return false;
    }

    try {
      const response = await fetch(blogAccountUrl, {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
