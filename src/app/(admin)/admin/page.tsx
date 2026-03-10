import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/shared/auth";
import {
  getPendingApplications,
  getAllRounds,
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

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [pendingApplications, rounds] = await Promise.all([
    getPendingApplications(),
    getAllRounds(),
  ]);

  return (
    <div className="bg-gray-6 min-h-screen">
      <div className="container-custom py-8 md:py-12">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">관리자</h1>
          <p className="text-muted-foreground mt-1">
            클럽 운영 관리
          </p>
        </div>

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
          <Card>
            <CardHeader>
              <CardTitle>성장일지 차수 관리</CardTitle>
              <CardDescription>
                제출 기간 설정
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoundManagement rounds={rounds} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
