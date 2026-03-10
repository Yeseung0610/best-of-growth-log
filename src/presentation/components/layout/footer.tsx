import Link from "next/link";

/**
 * 공통 푸터 컴포넌트
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-gray-6">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                </svg>
              </div>
              <span className="font-bold text-lg">Growth Log</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              성장일지를 작성하고, 서로의 성장을 응원하며,
              <br />
              함께 성장하는 커뮤니티
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#leaderboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  리더보드
                </Link>
              </li>
              <li>
                <Link
                  href="/#rules"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  참가 안내
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  대시보드
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">문의</h3>
            <p className="text-sm text-muted-foreground">
              한국방송통신대학교
              <br />
              성장일지 작성 경쟁 클럽
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Growth Log. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
