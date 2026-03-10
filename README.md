# Best of Growth Log

성장일지 작성 경쟁 클럽 운영 웹 서비스

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router + Server Actions) |
| Database | Firebase Firestore |
| Auth | Firebase Auth + NextAuth.js (Google OAuth) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Data Collection | Velog GraphQL API, Tistory RSS+스크래핑, Medium 스크래핑 |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (Google Cloud Console에서 발급)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (서비스 계정)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cron Job Secret (Vercel)
CRON_SECRET=your-cron-secret
```

### 3. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Firestore Database 활성화
3. Authentication에서 Google 로그인 활성화
4. 서비스 계정 키 생성 (프로젝트 설정 > 서비스 계정)
5. `firestore.rules` 파일을 Firebase에 배포

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # 홈 (리더보드)
│   ├── (auth)/dashboard/         # 참가자 대시보드
│   ├── (admin)/admin/            # 관리자 페이지
│   └── api/                      # API 라우트
│
├── domain/                       # 핵심 비즈니스 로직
│   ├── entities/                 # 엔티티 타입 정의
│   ├── repositories/             # 리포지토리 인터페이스
│   └── services/                 # 도메인 서비스
│
├── infrastructure/               # 외부 시스템 연동
│   ├── firebase/                 # Firestore 리포지토리 구현
│   └── blog-scrapers/            # 블로그 스크래퍼
│
├── presentation/                 # UI 레이어
│   ├── components/               # React 컴포넌트
│   ├── hooks/                    # 커스텀 훅
│   └── contexts/                 # Context Provider
│
├── actions/                      # Server Actions
└── shared/                       # 공통 유틸리티
```

## 주요 기능

### 참가자

- Google 계정으로 로그인
- 참가 신청 (학교 이메일 + 블로그 계정 검증)
- 성장일지 제출 (블로그 게시글 URL)
- 리더보드에서 순위 확인

### 관리자

- 참가 신청 승인/거절
- 차수 생성 및 관리
- 리더보드 데이터 조회

### 점수 시스템

```
점수 = (좋아요 × 1) + (고유 댓글 작성자 수 × 5)
```

- 동일 인물의 여러 댓글은 1회만 카운트

## 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에 GitHub 리포지토리 연결
2. 환경 변수 설정
3. 배포

### Cron Job

Vercel Cron을 통해 하루 2회 (00:00, 12:00 UTC) 리더보드를 갱신합니다.

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/update-leaderboard",
      "schedule": "0 0,12 * * *"
    }
  ]
}
```

## 라이선스

MIT License
