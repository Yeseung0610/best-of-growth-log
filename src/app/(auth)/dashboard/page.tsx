import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/shared/auth";
import { getMySubmissions, getAllRounds } from "@/actions";
import { createParticipantRepository } from "@/infrastructure/firebase/repositories";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/presentation/components/ui";
import { SubmissionForm } from "./submission-form";
import { SubmissionList } from "./submission-list";
import { CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 로그인 안됨 → 홈으로 리다이렉트 (자동 로그인 시키지 않음)
  if (!session?.user?.id) {
    redirect("/");
  }

  // 참가자 정보 조회
  const participantRepo = createParticipantRepository();
  const participant = await participantRepo.findByUserId(session.user.id);

  // 참가자가 아니면 /apply로 리다이렉트 (신청 상태 화면 표시)
  if (!participant) {
    redirect("/apply");
  }

  const [submissions, rounds] = await Promise.all([
    getMySubmissions(),
    getAllRounds(),
  ]);

  // 활성화된 차수 필터링
  const activeRounds = rounds.filter((r) => r.isActive);

  return (
    <div className="bg-gray-6 min-h-screen">
      <div className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* 페이지 타이틀 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">대시보드</h1>
            <p className="text-muted-foreground mt-1">
              {session.user.email}
            </p>
          </div>

          <div className="space-y-6">
            {/* 참가 정보 */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-gray-black" />
                  <div>
                    <p className="font-semibold">{participant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      총 점수: {participant.totalScore}점
                    </p>
                  </div>
                  <Badge variant="success" className="ml-auto">
                    참가 중
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 성장일지 차수 리스트 */}
            <Card>
              <CardHeader>
                <CardTitle>성장일지 제출</CardTitle>
                <CardDescription>
                  활성화된 차수에 성장일지를 제출하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeRounds.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    현재 활성화된 차수가 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeRounds.map((round) => {
                      const submission = submissions.find(
                        (s) => s.roundId === round.id
                      );
                      return (
                        <div
                          key={round.id}
                          className="p-4 border border-gray-4 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">
                                성장일지 {round.roundNumber}차
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(round.submissionStartDate).toLocaleDateString()} ~ {new Date(round.submissionEndDate).toLocaleDateString()}
                              </p>
                            </div>
                            {submission && (
                              <Badge variant="success">제출 완료</Badge>
                            )}
                          </div>
                          <SubmissionForm
                            roundId={round.id}
                            roundNumber={round.roundNumber}
                            existingSubmission={submission}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 제출 내역 */}
            {submissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>제출 내역</CardTitle>
                  <CardDescription>
                    총 {submissions.length}개 제출
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubmissionList submissions={submissions} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
