"use client";

import { useTransition, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { submitApplication } from "@/actions";
import { Button, Input, Label } from "@/presentation/components/ui";
import { CheckCircle } from "lucide-react";

const STORAGE_KEY = "pending_application";

/** 블로그 URL 파싱 결과 */
interface BlogUrlParseResult {
  isValid: boolean;
  platform?: "VELOG" | "TISTORY" | "MEDIUM";
  userId?: string;
  message?: string;
}

/**
 * 블로그 URL에서 플랫폼과 사용자 ID를 자동 추출
 */
function parseBlogUrl(url: string): BlogUrlParseResult {
  if (!url) {
    return { isValid: false };
  }

  const lowerUrl = url.toLowerCase();

  // Velog: https://velog.io/@username/posts
  const velogMatch = url.match(/^https?:\/\/(www\.)?velog\.io\/@([\w-]+)\/posts\/?$/);
  if (velogMatch) {
    return { isValid: true, platform: "VELOG", userId: velogMatch[2] };
  }

  // Velog URL이지만 형식이 맞지 않는 경우 힌트 제공
  if (lowerUrl.includes("velog")) {
    return {
      isValid: false,
      message: "Velog 주소를 입력하려 하셨나요? https://velog.io/@사용자ID/posts 형식으로 입력해주세요!",
    };
  }

  // Tistory: https://username.tistory.com
  const tistoryMatch = url.match(/^https?:\/\/([\w-]+)\.tistory\.com\/?$/);
  if (tistoryMatch) {
    return { isValid: true, platform: "TISTORY", userId: tistoryMatch[1] };
  }

  // Tistory URL이지만 형식이 맞지 않는 경우 힌트 제공
  if (lowerUrl.includes("tistory")) {
    return {
      isValid: false,
      message: "Tistory 주소를 입력하려 하셨나요? https://사용자ID.tistory.com 형식으로 입력해주세요!",
    };
  }

  // Medium: https://medium.com/@username
  const mediumMatch = url.match(/^https?:\/\/(www\.)?medium\.com\/@([\w-]+)\/?$/);
  if (mediumMatch) {
    return { isValid: true, platform: "MEDIUM", userId: mediumMatch[2] };
  }

  // Medium URL이지만 형식이 맞지 않는 경우 힌트 제공
  if (lowerUrl.includes("medium")) {
    return {
      isValid: false,
      message: "Medium 주소를 입력하려 하셨나요? https://medium.com/@사용자ID 형식으로 입력해주세요!",
    };
  }

  return {
    isValid: false,
    message: "지원하지 않는 블로그 URL입니다. Velog, Tistory, Medium URL을 입력해주세요.",
  };
}

interface PendingApplication {
  participantName: string;
  blogAccountUrl: string;
}

interface GoogleAccount {
  email: string;
  name: string;
  image: string;
}

interface ApplicationFormWithAuthProps {
  googleAccount: GoogleAccount | null;
}

/**
 * 참가 신청 폼 컴포넌트 (인증 통합)
 * - 학교 이메일은 Google 로그인을 통해 인증
 * - 주소 찾기 UI 패턴 적용
 */
export function ApplicationFormWithAuth({ googleAccount }: ApplicationFormWithAuthProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  const isLoggedIn = !!googleAccount;
  const schoolEmail = googleAccount?.email || "";
  const isValidSchoolEmail = schoolEmail.endsWith("@knou.ac.kr");

  // 폼 상태 - Google 이름으로 초기값 설정
  const [formData, setFormData] = useState<PendingApplication>({
    participantName: googleAccount?.name || "",
    blogAccountUrl: "",
  });

  // 블로그 URL 파싱 (플랫폼 자동 감지 + 사용자 ID 추출)
  const blogUrlParsed = useMemo(
    () => parseBlogUrl(formData.blogAccountUrl),
    [formData.blogAccountUrl]
  );

  // 로그인 후 저장된 데이터가 있으면 자동 제출
  useEffect(() => {
    if (isLoggedIn && isValidSchoolEmail) {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setIsAutoSubmitting(true);
        const data = JSON.parse(savedData) as PendingApplication;
        sessionStorage.removeItem(STORAGE_KEY);

        // URL에서 플랫폼 파싱
        const parsed = parseBlogUrl(data.blogAccountUrl);
        if (!parsed.isValid || !parsed.platform) {
          setError("올바른 블로그 URL이 아닙니다.");
          setIsAutoSubmitting(false);
          setFormData(data);
          return;
        }

        // 자동 제출
        const formDataObj = new FormData();
        formDataObj.append("participantName", data.participantName);
        formDataObj.append("schoolEmail", schoolEmail);
        formDataObj.append("blogPlatform", parsed.platform);
        formDataObj.append("blogAccountUrl", data.blogAccountUrl);

        startTransition(async () => {
          const result = await submitApplication(formDataObj);

          if (result.success) {
            router.refresh();
          } else {
            setError(result.error);
            setIsAutoSubmitting(false);
            // 에러 발생 시 폼 데이터 복원
            setFormData(data);
          }
        });
      }
    }
  }, [isLoggedIn, isValidSchoolEmail, schoolEmail, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = () => {
    // 현재 폼 데이터 저장 후 Google 로그인
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    signIn("google", { callbackUrl: "/apply" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 필수 필드 검증
    if (!formData.participantName || !formData.blogAccountUrl) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    // 학교 이메일 인증 검증
    if (!isLoggedIn) {
      setError("학교 이메일 인증이 필요합니다.");
      return;
    }

    if (!isValidSchoolEmail) {
      setError("@knou.ac.kr 도메인의 Google 계정으로 인증해주세요.");
      return;
    }

    // 블로그 URL 검증
    if (!blogUrlParsed.isValid || !blogUrlParsed.platform) {
      setError(blogUrlParsed.message || "올바른 블로그 URL을 입력해주세요.");
      return;
    }

    // 제출
    const formDataObj = new FormData();
    formDataObj.append("participantName", formData.participantName);
    formDataObj.append("schoolEmail", schoolEmail);
    formDataObj.append("blogPlatform", blogUrlParsed.platform);
    formDataObj.append("blogAccountUrl", formData.blogAccountUrl);

    startTransition(async () => {
      const result = await submitApplication(formDataObj);

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  // 자동 제출 중 로딩 화면
  if (isAutoSubmitting) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-3 border-t-gray-black rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">참가 신청을 처리하고 있습니다...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="participantName">이름</Label>
        <Input
          id="participantName"
          name="participantName"
          placeholder="이름을 입력해주세요"
          value={formData.participantName}
          onChange={handleInputChange}
          required
          disabled={isPending}
        />
      </div>

      {/* 학교 이메일 - 주소 찾기 스타일 */}
      <div className="space-y-2">
        <Label htmlFor="schoolEmail">학교 이메일</Label>
        <div className="flex gap-2">
          {isLoggedIn ? (
            // 로그인됨: 이메일 표시
            <div className={`flex-1 flex items-center gap-2 h-12 px-4 bg-gray-6 border rounded-lg ${isValidSchoolEmail ? "border-gray-5" : "border-red-300"}`}>
              {googleAccount.image && (
                <Image
                  src={googleAccount.image}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className={`flex-1 text-sm truncate ${!isValidSchoolEmail ? "text-red-600" : ""}`}>
                {schoolEmail}
              </span>
              {isValidSchoolEmail && (
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              )}
            </div>
          ) : (
            // 비로그인: placeholder 표시
            <div className="flex-1 flex items-center h-12 px-4 bg-gray-6 border border-gray-5 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Google로 학교 이메일을 인증해주세요
              </span>
            </div>
          )}
          {/* 비로그인이거나, 로그인됐지만 유효하지 않은 이메일인 경우 버튼 표시 */}
          {(!isLoggedIn || !isValidSchoolEmail) && (
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleGoogleLogin}
              disabled={isPending}
              className="h-12 px-4 flex-shrink-0"
            >
              <Image
                src="/icons/google.svg"
                alt="Google"
                width={18}
                height={18}
                className="mr-2"
              />
              {isLoggedIn ? "변경" : "인증"}
            </Button>
          )}
        </div>
        {isLoggedIn && !isValidSchoolEmail && (
          <p className="text-xs text-red-600">
            @knou.ac.kr 도메인의 계정이 아닙니다. 다른 계정으로 인증해주세요.
          </p>
        )}
        {!isLoggedIn && (
          <p className="text-xs text-muted-foreground">
            @knou.ac.kr 도메인의 Google 계정으로 인증해주세요.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="blogAccountUrl">블로그 URL</Label>
        <Input
          id="blogAccountUrl"
          name="blogAccountUrl"
          type="url"
          placeholder="블로그 URL을 입력해주세요"
          value={formData.blogAccountUrl}
          onChange={handleInputChange}
          required
          disabled={isPending}
          className={
            formData.blogAccountUrl && !blogUrlParsed.isValid
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
        />
        {formData.blogAccountUrl ? (
          blogUrlParsed.isValid ? (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>
                {blogUrlParsed.platform} · @{blogUrlParsed.userId}
              </span>
            </div>
          ) : (
            <p className="text-xs text-red-600">{blogUrlParsed.message}</p>
          )
        ) : (
          <p className="text-xs text-muted-foreground">
            Velog, Tistory, Medium 중 하나의 블로그 URL을 입력해주세요.
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={
          isPending ||
          !isLoggedIn ||
          !isValidSchoolEmail ||
          !blogUrlParsed.isValid
        }
      >
        {isPending ? "신청 중..." : "참가 신청"}
      </Button>
    </form>
  );
}
