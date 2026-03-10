# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 작업 프로세스 (Work Process)

### 1. 작업 시작 시 필수 사항

**모든 작업은 To-Do 리스트를 생성하여 진행한다:**
- `TaskCreate`를 사용하여 작업 항목을 생성
- 작업 시작 시 `TaskUpdate`로 상태를 `in_progress`로 변경
- 작업 완료 시 `TaskUpdate`로 상태를 `completed`로 변경
- 복잡한 작업은 세부 태스크로 분리하여 관리

**작업 일지 생성:**
- 모든 작업 세션에서 작업 일지를 작성한다
- 상세 지침 및 템플릿: **[SKILLS.md](./SKILLS.md)의 `worklog` 스킬 참조**

### 2. 불명확한 사항 처리

**직접 판단하지 않고 반드시 `AskUserQuestion`을 사용하여 확인:**
- 요구사항이 모호하거나 여러 해석이 가능한 경우
- 기술적 선택지가 여러 개 있는 경우
- 기존 코드의 의도를 파악하기 어려운 경우
- 비즈니스 로직에 대한 도메인 지식이 필요한 경우
- 성능 vs 가독성 등 트레이드오프 결정이 필요한 경우

---

## 코드 컨벤션 (Code Conventions)

### TypeScript 작성 규칙

**타입 파라미터 네이밍:**
```typescript
T   // 요소 타입 (element type)
K   // 키 타입 (key type)
V   // 값 타입 (value type)
E   // 에러 타입 (error type)
R   // 반환 타입 (return type)
```

**타입 안전성:**
```typescript
// 입력 배열은 readonly로 선언하여 의도치 않은 변경 방지
function chunk<T>(arr: readonly T[], size: number): T[][] {
  // ...
}

// Type Guard 패턴 - is 타입 서술어 사용
function isNotNil<T>(x: T | null | undefined): x is T {
  return x != null;
}

// 제네릭 제약조건으로 타입 안전성 확보
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  // ...
}
```

**명시적 에러 처리:**
```typescript
// 입력값 검증 시 명확한 에러 메시지 제공
function chunk<T>(arr: readonly T[], size: number): T[][] {
  if (size < 1) {
    throw new Error("size must be greater than 0");
  }
  // ...
}
```

### 아이콘 사용 규칙

**유니코드 이모지 사용 금지:**
- 코드에서 텍스트 유니코드 아이콘(이모지)을 절대 사용하지 않는다
- 모든 아이콘은 SVG 컴포넌트 또는 아이콘 라이브러리를 사용한다
- 로딩 상태, 섹션 제목 등에서도 이모지 대신 SVG 아이콘 사용

```tsx
// Bad: 유니코드 이모지 사용
<span>📄</span>
<h2>📋 AI 요약</h2>

// Good: SVG 아이콘 사용
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="..." stroke="currentColor" strokeWidth="2" />
</svg>

// Good: 아이콘 컴포넌트 사용
<FileIcon className="h-6 w-6" />
```

### 코드 스타일 원칙

**가독성 우선:**
```typescript
// Bad: reduce 체이닝으로 인한 가독성 저하
const result = arr.reduce((acc, item) => {
  return acc.concat(transform(item).filter(x => x > 0));
}, []);

// Good: for 루프로 명확한 의도 전달
const result: number[] = [];
for (const item of arr) {
  const transformed = transform(item);
  for (const x of transformed) {
    if (x > 0) {
      result.push(x);
    }
  }
}
```

**단순함 추구 (85% 규칙):**
- 가장 흔한 85%의 사용 사례에 대해 단순한 인터페이스 제공
- 엣지 케이스를 위해 핵심 API를 복잡하게 만들지 않음
- 복잡한 기능이 필요하면 별도 함수로 분리

**네이티브 API 우선:**
```typescript
// Bad: 이미 존재하는 기능 재구현
function isArray(value: unknown): value is unknown[] {
  return Object.prototype.toString.call(value) === "[object Array]";
}

// Good: 네이티브 API 사용
Array.isArray(value);
Math.min(...numbers);
Object.keys(obj);
```

### 함수 설계 원칙

**단일 책임:**
```typescript
// 각 함수는 하나의 명확한 작업만 수행
function debounce<F extends (...args: any[]) => void>(
  func: F,
  wait: number
): DebouncedFunction<F> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  return debounced as DebouncedFunction<F>;
}
```

**비파괴적 연산:**
```typescript
// 원본 데이터를 변경하지 않고 새 객체/배열 반환
function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}
```

### JSDoc 문서화

모든 export 함수에 JSDoc 작성 → **[SKILLS.md](./SKILLS.md)의 `jsdoc` 스킬 참조**

### 스타일링 규칙 (Tailwind CSS + shadcn/ui)

**Tailwind CSS 사용 원칙:**
- 인라인 스타일 대신 Tailwind 유틸리티 클래스 사용
- 커스텀 CSS는 최소화하고, Tailwind의 설정 확장으로 해결
- 반응형 디자인은 Tailwind의 breakpoint prefix 사용 (`sm:`, `md:`, `lg:`, `xl:`)

```tsx
// Bad: 인라인 스타일
<div style={{ display: 'flex', gap: '8px', padding: '16px' }}>

// Good: Tailwind 유틸리티 클래스
<div className="flex gap-2 p-4">
```

**shadcn/ui 컴포넌트 사용:**
- UI 컴포넌트는 shadcn/ui를 우선 사용
- 컴포넌트 설치: `npx shadcn@latest add [component-name]`
- shadcn/ui 컴포넌트는 `@/components/ui` 경로에 위치

```tsx
// Good: shadcn/ui 컴포넌트 활용
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

<Button variant="outline" size="sm">
  Click me
</Button>
```

**클래스 정렬 규칙:**
- Tailwind 클래스는 다음 순서로 정렬: 레이아웃 → 박스모델 → 타이포그래피 → 비주얼 → 기타
- `cn()` 유틸리티를 사용하여 조건부 클래스 결합

```tsx
import { cn } from "@/lib/utils";

// Good: cn() 유틸리티로 조건부 클래스 처리
<div className={cn(
  "flex items-center gap-2 rounded-lg p-4",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

**디자인 토큰 활용:**
- 색상은 CSS 변수 기반 테마 사용 (`bg-background`, `text-foreground`, `border-border`)
- 하드코딩된 색상값 사용 금지

```tsx
// Bad: 하드코딩된 색상
<div className="bg-[#ffffff] text-[#000000]">

// Good: 테마 기반 색상
<div className="bg-background text-foreground">
```

---

## 테스트 전략 (Testing Strategy)

테스트 작성 시 → **[SKILLS.md](./SKILLS.md)의 `test` 스킬 참조**

---

## 성능 고려사항 (Performance Considerations)

### 번들 사이즈 최적화

**Tree-shaking 지원:**
- 모든 함수를 named export로 제공
- side-effect 없는 순수 함수 작성
- package.json에 `"sideEffects": false` 명시

**의존성 최소화:**
```typescript
// Bad: 무거운 라이브러리 전체 import
import _ from "lodash";
_.chunk(arr, 2);

// Good: 필요한 함수만 import (es-toolkit 권장)
import { chunk } from "es-toolkit";
chunk(arr, 2);
```

### 런타임 성능

**불필요한 연산 회피:**
```typescript
// Bad: 매번 새 함수 생성
arr.map(item => item.id);

// Good: 재사용 가능한 함수 참조
const getId = (item: Item) => item.id;
arr.map(getId);
```

**조기 반환:**
```typescript
function find<T>(arr: T[], predicate: (item: T) => boolean): T | undefined {
  for (const item of arr) {
    if (predicate(item)) {
      return item; // 찾으면 즉시 반환
    }
  }
  return undefined;
}
```

---

## 아키텍처 원칙 (Architecture Principles)

### Clean Architecture 레이어 구조

```
src/
├── domain/           # 핵심 비즈니스 로직 (프레임워크 독립적)
│   ├── entities/     # 엔티티 - 핵심 비즈니스 객체
│   ├── usecases/     # 유스케이스 - 비즈니스 규칙
│   └── repositories/ # 리포지토리 인터페이스 (추상화)
│
├── application/      # 애플리케이션 서비스 레이어
│   ├── services/     # 유스케이스 조합 및 오케스트레이션
│   ├── dtos/         # 데이터 전송 객체
│   └── mappers/      # 엔티티 <-> DTO 변환
│
├── infrastructure/   # 외부 시스템 연동
│   ├── api/          # API 클라이언트 구현
│   ├── repositories/ # 리포지토리 구현체
│   ├── storage/      # 로컬 스토리지, 캐시
│   └── external/     # 외부 서비스 어댑터
│
├── presentation/     # UI 레이어
│   ├── components/   # UI 컴포넌트
│   ├── pages/        # 페이지/라우트
│   ├── hooks/        # 커스텀 훅
│   └── contexts/     # React Context
│
└── shared/           # 공유 유틸리티
    ├── types/        # 공통 타입 정의
    ├── utils/        # 유틸리티 함수
    └── constants/    # 상수 정의
```

### 레이어별 의존성 규칙

```
[Presentation] → [Application] → [Domain] ← [Infrastructure]
```

- **Domain**: 어떤 레이어에도 의존하지 않음. 순수 TypeScript로 작성
- **Application**: Domain에만 의존. 프레임워크 코드 금지
- **Infrastructure**: Domain 인터페이스를 구현. 외부 라이브러리 사용 가능
- **Presentation**: Application과 Domain 타입에 의존. UI 프레임워크 사용

---

## SOLID 원칙 적용

### S - Single Responsibility Principle (단일 책임 원칙)
- 하나의 클래스/함수/컴포넌트는 하나의 책임만 가진다
- 변경의 이유가 하나만 존재해야 한다

### O - Open/Closed Principle (개방-폐쇄 원칙)
- 확장에는 열려있고, 수정에는 닫혀있어야 한다

```typescript
// 전략 패턴을 활용한 확장 가능한 설계
interface PaymentStrategy {
  pay(amount: number): Promise<PaymentResult>;
}

class CardPayment implements PaymentStrategy { /* ... */ }
class BankTransfer implements PaymentStrategy { /* ... */ }
```

### L - Liskov Substitution Principle (리스코프 치환 원칙)
- 하위 타입은 상위 타입을 대체할 수 있어야 한다

### I - Interface Segregation Principle (인터페이스 분리 원칙)
- 클라이언트가 사용하지 않는 인터페이스에 의존하지 않도록 한다

```typescript
// Good: 분리된 인터페이스
interface Readable { read(): Data; }
interface Writable { write(data: Data): void; }
interface ReadWritable extends Readable, Writable {}
```

### D - Dependency Inversion Principle (의존성 역전 원칙)
- 구현이 아닌 인터페이스에 의존

---

## 신규 기술 스택/라이브러리 도입 프로세스

새로운 기술 도입 시 → **[SKILLS.md](./SKILLS.md)의 `tech-research` 스킬 참조**

---

## Git 컨벤션 (Git Conventions)

- 커밋 메시지 작성 시 → **[SKILLS.md](./SKILLS.md)의 `commit` 스킬 참조**
- PR 작성 시 → **[SKILLS.md](./SKILLS.md)의 `pr` 스킬 참조**

---

## 프로젝트별 설정

### 현재 프로젝트 정보

**Repository**: Frontend Fundamentals (FF)
- VitePress 문서 사이트 + React SPA 모노레포
- 사이트: https://frontend-fundamentals.com/

**Tech Stack:**
- Package Manager: Yarn 4.6.0 (PnP)
- Node: 22+
- Documentation: VitePress 1.4.1
- React App: Vite 5, React 18, TypeScript 5.6+
- Styling: Tailwind CSS 3.4+, shadcn/ui
- Testing: Jest 30
- Linting: Oxlint

### 개발 명령어

```bash
# 의존성 설치
yarn install

# 문서 사이트 개발
yarn docs:dev              # Code Quality docs
yarn docs:bundle:dev       # Bundling docs
yarn docs:a11y:dev         # Accessibility docs
yarn docs:debug:dev        # Debug docs
yarn docs:til:dev          # Today I Learned React app

# 전체 빌드
yarn build

# Today I Learned 워크스페이스
cd fundamentals/today-i-learned
yarn dev                   # 개발 서버
yarn test                  # Jest 테스트
yarn lint                  # Oxlint
yarn typecheck             # TypeScript 검사
```

