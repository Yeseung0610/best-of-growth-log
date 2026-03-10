"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateClubSettings } from "@/actions";
import {
  Button,
  Label,
  DatePicker,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/presentation/components/ui";
import type { ClubSettings } from "@/domain/entities";
import { Save } from "lucide-react";

interface ClubSettingsManagementProps {
  settings: ClubSettings | null;
}

/**
 * 클럽 활동 상태를 날짜 기반으로 판단
 */
function getClubActivityStatus(settings: ClubSettings | null) {
  if (!settings?.activityStartDate || !settings?.activityEndDate) {
    return { isActive: false, label: "미설정" };
  }
  const now = new Date();
  const start = new Date(settings.activityStartDate);
  const end = new Date(settings.activityEndDate);

  if (now < start) return { isActive: false, label: "예정" };
  if (now > end) return { isActive: false, label: "종료" };
  return { isActive: true, label: "활동 중" };
}

/**
 * 클럽 설정 관리 컴포넌트
 */
export function ClubSettingsManagement({ settings }: ClubSettingsManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [startDate, setStartDate] = useState<Date | undefined>(
    settings?.activityStartDate ? new Date(settings.activityStartDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    settings?.activityEndDate ? new Date(settings.activityEndDate) : undefined
  );

  const activityStatus = getClubActivityStatus(settings);

  const handleSaveSettings = () => {
    if (!startDate || !endDate) {
      toast.error("시작일과 마감일을 모두 선택해주세요.");
      return;
    }

    if (startDate >= endDate) {
      toast.error("시작일은 마감일보다 이전이어야 합니다.");
      return;
    }

    startTransition(async () => {
      const result = await updateClubSettings({
        activityStartDate: startDate,
        activityEndDate: endDate,
      });

      if (result.success) {
        toast.success("저장되었습니다.");
        router.refresh();
      } else {
        toast.error(result.error || "저장에 실패했습니다.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>클럽 활동 설정</CardTitle>
            <CardDescription>
              활동 기간 내에서만 성장일지 등록 및 채점이 진행됩니다
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={activityStatus.isActive ? "default" : "secondary"}>
              {activityStatus.label}
            </Badge>
            <Button type="button" size="sm" disabled={isPending} onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-1" />
              {isPending ? "저장 중..." : "기간 저장"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-2">
          <div className="space-y-2">
            <Label>활동 시작일</Label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="시작일 선택"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label>활동 마감일</Label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="마감일 선택"
              disabled={isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
