import Link from "next/link";
import Image from "next/image";
import { getLeaderboard, getOverallStats } from "@/actions";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/presentation/components/ui";
import { LeaderboardTable } from "@/presentation/components/leaderboard";
import { Trophy, LogIn, PenLine } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [leaderboard, stats] = await Promise.all([
    getLeaderboard(50),
    getOverallStats(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-5">
        <div className="container-custom py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Image
              src="/icons/tech_blogging_brand_logo.svg"
              alt="Tech Blogging"
              width={200}
              height={110}
              className="mx-auto mb-8"
              priority
            />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              1TH BEST OF GROWTH LOG
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              성장일지를 작성하고, 서로 응원하며 함께 성장하세요
            </p>

            {/* Stats */}
            <div className="mt-10 flex justify-center gap-12 md:gap-16">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stats.totalParticipants}</p>
                <p className="text-sm text-muted-foreground mt-1">참가자</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stats.totalSubmissions}</p>
                <p className="text-sm text-muted-foreground mt-1">성장일지</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stats.topScore.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">1등 기록</p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  <PenLine className="h-5 w-5" />
                  참가 신청하기
                </Button>
              </Link>
              <Link href="/api/auth/signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <LogIn className="h-5 w-5" />
                  로그인
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="bg-gray-6">
        <div className="container-custom py-12 md:py-16">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trophy className="h-5 w-5" />
                  리더보드
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {stats.totalParticipants}명 참가 중
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={leaderboard} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
