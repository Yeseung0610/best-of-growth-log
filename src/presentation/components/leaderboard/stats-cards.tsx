import { Card, CardContent } from "@/presentation/components/ui";
import { Users, FileText, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalParticipants: number;
  totalSubmissions: number;
  totalScore: number;
}

/**
 * 전체 통계 카드 컴포넌트
 */
export function StatsCards({
  totalParticipants,
  totalSubmissions,
  totalScore,
}: StatsCardsProps) {
  const stats = [
    {
      title: "참가자",
      value: totalParticipants,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "성장일지",
      value: totalSubmissions,
      icon: FileText,
      color: "bg-green-9/50 text-green-1",
    },
    {
      title: "총 점수",
      value: totalScore,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
