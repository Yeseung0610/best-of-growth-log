import type { BlogPostData } from "@/domain/entities";
import type { BlogScraper } from "./types";
import { ScraperError } from "./types";

const VELOG_GRAPHQL_ENDPOINT = "https://v2.velog.io/graphql";

/**
 * Velog GraphQL 쿼리
 */
const QUERIES = {
  POST: `
    query ReadPost($username: String!, $url_slug: String!) {
      post(username: $username, url_slug: $url_slug) {
        id
        title
        likes
        user {
          id
          username
        }
        released_at
        comments_count
        comments {
          id
          user {
            id
            username
          }
        }
      }
    }
  `,
  USER: `
    query User($username: String!) {
      user(username: $username) {
        id
        username
      }
    }
  `,
};

/**
 * Velog 게시글 URL에서 username과 url_slug 추출
 */
function parseVelogPostUrl(
  postUrl: string
): { username: string; urlSlug: string } | null {
  // https://velog.io/@username/post-slug
  const match = postUrl.match(
    /^https?:\/\/velog\.io\/@([a-zA-Z0-9_-]+)\/([^?#]+)/
  );
  if (!match) {
    return null;
  }
  return {
    username: match[1],
    urlSlug: decodeURIComponent(match[2]),
  };
}

/**
 * Velog 블로그 URL에서 username 추출
 */
function parseVelogAccountUrl(accountUrl: string): string | null {
  const match = accountUrl.match(/^https?:\/\/velog\.io\/@([a-zA-Z0-9_-]+)\/?$/);
  return match ? match[1] : null;
}

/**
 * Velog GraphQL API 호출
 */
async function queryVelog<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(VELOG_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new ScraperError("Rate limit exceeded", "RATE_LIMIT");
    }
    throw new ScraperError(
      `Velog API error: ${response.status}`,
      "FETCH_ERROR"
    );
  }

  const result = await response.json();

  if (result.errors) {
    throw new ScraperError(
      `GraphQL error: ${result.errors[0]?.message}`,
      "PARSE_ERROR"
    );
  }

  return result.data;
}

/**
 * Velog 블로그 스크래퍼
 */
export const velogScraper: BlogScraper = {
  platform: "VELOG",

  async fetchPostData(postUrl: string): Promise<BlogPostData> {
    const parsed = parseVelogPostUrl(postUrl);
    if (!parsed) {
      throw new ScraperError("Invalid Velog post URL", "PARSE_ERROR");
    }

    const data = await queryVelog<{
      post: {
        id: string;
        title: string;
        likes: number;
        user: { id: string; username: string };
        released_at: string;
        comments_count: number;
        comments: Array<{ id: string; user: { id: string; username: string } }>;
      } | null;
    }>(QUERIES.POST, {
      username: parsed.username,
      url_slug: parsed.urlSlug,
    });

    if (!data.post) {
      throw new ScraperError("Post not found", "NOT_FOUND");
    }

    // 고유 댓글 작성자 추출 (게시글 작성자 제외)
    const uniqueCommenters = new Set<string>();
    for (const comment of data.post.comments) {
      if (comment.user.id !== data.post.user.id) {
        uniqueCommenters.add(comment.user.id);
      }
    }

    return {
      title: data.post.title,
      likesCount: data.post.likes,
      commentsCount: data.post.comments_count,
      uniqueCommenters: Array.from(uniqueCommenters),
      publishedAt: new Date(data.post.released_at),
      authorId: data.post.user.id,
    };
  },

  async verifyOwnership(
    postUrl: string,
    blogAccountUrl: string
  ): Promise<boolean> {
    const postParsed = parseVelogPostUrl(postUrl);
    const accountUsername = parseVelogAccountUrl(blogAccountUrl);

    if (!postParsed || !accountUsername) {
      return false;
    }

    return (
      postParsed.username.toLowerCase() === accountUsername.toLowerCase()
    );
  },

  async verifyAccount(blogAccountUrl: string): Promise<boolean> {
    const username = parseVelogAccountUrl(blogAccountUrl);
    if (!username) {
      return false;
    }

    try {
      const data = await queryVelog<{ user: { id: string } | null }>(
        QUERIES.USER,
        { username }
      );
      return !!data.user;
    } catch {
      return false;
    }
  },
};
