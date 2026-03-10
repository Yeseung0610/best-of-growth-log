import { notFound } from "next/navigation";
import { getParticipantDetail } from "@/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/presentation/components/ui";
import {
  Trophy,
  Heart,
  MessageCircle,
  Star,
  FileText,
  ExternalLink,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ParticipantPageProps {
  params: Promise<{ id: string }>;
}

export default async function ParticipantPage({ params }: ParticipantPageProps) {
  const { id } = await params;
  const { participant, rank, submissions } = await getParticipantDetail(id);

  if (!participant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-6">
      <div className="container-custom py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* Profile Image */}
                  <div className="w-24 h-24 rounded-full bg-gray-5 flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-gray-3" />
                  </div>

                  {/* Name */}
                  <h1 className="text-xl font-bold">{participant.name}</h1>

                  {/* Blog Link */}
                  <a
                    href={participant.blogAccountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Badge variant="outline" className="mr-1">
                      {participant.blogPlatform.toLowerCase()}
                    </Badge>
                    블로그 방문
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">활동 통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span>순위</span>
                  </div>
                  <span className="font-semibold">{rank}위</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span>포인트</span>
                  </div>
                  <span className="font-semibold">{participant.totalScore.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>총 좋아요</span>
                  </div>
                  <span className="font-semibold">{participant.totalLikes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>총 댓글</span>
                  </div>
                  <span className="font-semibold">{participant.totalComments.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>제출 수</span>
                  </div>
                  <span className="font-semibold">{participant.submissionCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Submissions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  성장일지 목록
                  <Badge variant="secondary" className="ml-auto">
                    {submissions.length}개
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">
                    아직 제출한 성장일지가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission) => (
                      <a
                        key={submission.id}
                        href={submission.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl border border-gray-5 hover:border-gray-4 hover:bg-gray-7 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {submission.roundNumber}차
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(submission.postPublishedAt).toLocaleDateString("ko-KR")}
                              </span>
                            </div>
                            <h3 className="font-medium truncate group-hover:text-gray-1">
                              {submission.postTitle || "제목 없음"}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{submission.likesCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{submission.commentsCount}</span>
                            </div>
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          점수: <span className="font-medium text-foreground">{submission.score}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
