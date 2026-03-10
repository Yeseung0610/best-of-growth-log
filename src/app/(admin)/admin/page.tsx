import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/shared/auth";
import {
  getPendingApplications,
  getAllRounds,
  getClubSettings,
} from "@/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/presentation/components/ui";
import { ApplicationManagement } from "./application-management";
import { RoundManagement } from "./round-management";
import { ClubSettingsManagement } from "./club-settings-management";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [pendingApplications, rounds, clubSettings] = await Promise.all([
    getPendingApplications(),
    getAllRounds(),
    getClubSettings(),
  ]);

  return (
    <div className="bg-gray-6 min-h-screen">
      <div className="container-custom py-8 md:py-12 space-y-6">
        {/* 클럽 활동 설정 */}
        <ClubSettingsManagement settings={clubSettings} />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 참가 신청 관리 */}
          <Card>
            <CardHeader>
              <CardTitle>참가 신청 관리</CardTitle>
              <CardDescription>
                {pendingApplications.length}건 대기 중
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationManagement applications={pendingApplications} />
            </CardContent>
          </Card>

          {/* 차수 관리 */}
          <RoundManagement rounds={rounds} />
        </div>
      </div>
    </div>
  );
}
