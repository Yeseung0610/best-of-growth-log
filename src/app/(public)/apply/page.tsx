import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/shared/auth";
import { getMyApplication } from "@/actions";
import { createParticipantRepository } from "@/infrastructure/firebase/repositories";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/presentation/components/ui";
import { ApplicationFormWithAuth } from "./application-form-with-auth";
import { ApplicationStatusCard } from "./application-status-card";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const session = await getServerSession(authOptions);

  // 로그인된 경우: 이미 참가자인지 확인
  if (session?.user?.id) {
    const participantRepo = createParticipantRepository();
    const participant = await participantRepo.findByUserId(session.user.id);

    if (participant) {
      redirect("/dashboard");
    }

    // 이미 신청했는지 확인
    const application = await getMyApplication();

    // 신청 완료 상태
    if (application) {
      return (
        <div className="min-h-screen bg-gray-6">
          <div className="container-custom py-12 md:py-20">
            <div className="max-w-lg mx-auto">
              <ApplicationStatusCard
                status={application.status}
                adminNote={application.adminNote}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  // 참가 신청 폼 (로그인 여부와 관계없이 표시)
  // 로그인된 경우 Google 계정 정보를 폼에 전달
  const googleAccount = session?.user
    ? {
        email: session.user.email || "",
        name: session.user.name || "",
        image: session.user.image || "",
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-6">
      <div className="container-custom py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">참가 신청</CardTitle>
              <CardDescription>
                성장일지 클럽에 참가하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationFormWithAuth googleAccount={googleAccount} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
