import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/shared/auth";
import { getMyApplication, getMySubmissions, getAllRounds } from "@/actions";
import { createParticipantRepository } from "@/infrastructure/firebase/repositories";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/presentation/components/ui";
import { ApplicationForm } from "./application-form";
import { SubmissionForm } from "./submission-form";
import { SubmissionList } from "./submission-list";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const [application, rounds] = await Promise.all([
    getMyApplication(),
    getAllRounds(),
  ]);

  // 참가자 정보 조회
  const participantRepo = createParticipantRepository();
  const participant = await participantRepo.findByUserId(session.user.id);
  const submissions = participant ? await getMySubmissions() : [];

  // 상태 결정
  const isApproved = application?.status === "APPROVED" || !!participant;
  const isPending = application?.status === "PENDING";
  const isRejected = application?.status === "REJECTED";
  const canApply = !application && !participant;

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

          {/* 참가 신청 폼 */}
          {canApply && (
            <Card>
              <CardHeader>
                <CardTitle>참가 신청</CardTitle>
                <CardDescription>
                  성장일지 클럽에 참가하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationForm />
              </CardContent>
            </Card>
          )}

          {/* 승인 대기 중 */}
          {isPending && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">참가 신청 완료</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      관리자 승인 대기 중입니다.
                    </p>
                    <div className="mt-4 p-4 bg-gray-6 border border-gray-4">
                      <p className="text-sm font-medium">입금 계좌</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        토스뱅크 1000-0247-1215 (박예승)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        참가비: 15,000원
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 참가 거절됨 */}
          {isRejected && (
            <Card className="border-destructive/50">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-600">참가 거절됨</h3>
                    {application?.adminNote && (
                      <p className="text-sm text-muted-foreground mt-1">
                        사유: {application.adminNote}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 참가자: 성장일지 제출 */}
          {isApproved && participant && (
            <div className="space-y-6">
              {/* 참가 정보 */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-1" />
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
                            className="p-4 border border-gray-4"
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
          )}
        </div>
      </div>
    </div>
  );
}
