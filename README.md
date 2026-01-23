# next-board

Next.js(App Router) + Drizzle(PostgreSQL)로 만든 **게시판 프로젝트**입니다.

## 주요 기능

- **인증 시스템**: 회원가입, 로그인, 로그아웃 (세션 기반)
- **게시글 관리**: 목록 조회, 작성, 수정, 삭제
- **댓글 기능**: 댓글 작성, 삭제
- **인증 필요**: 게시글/댓글 작성은 로그인 필요

## 기술 스택

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Drizzle ORM** + **PostgreSQL**
- **React Query** (TanStack Query)
- **Tailwind CSS**
- **Zod** (스키마 검증)
- **bcryptjs** (비밀번호 해싱)
- **shadcn/ui** 컴포넌트

## 프로젝트 구조

```
src/
  app/
    api/
      auth/          # 인증 API (login, signup, logout, me)
      board/         # 게시글 API
        [id]/
          comments/  # 댓글 API
    auth/            # 인증 페이지 (login, signup)
    board/           # 게시판 페이지
  components/        # UI 컴포넌트
  hooks/            # 커스텀 훅 (useAuth)
  lib/              # 유틸리티 (db, auth)
  queries/          # React Query 쿼리
  services/         # API 서비스
  types/            # TypeScript 타입
  utils/            # 공통 유틸리티 (api 에러 처리 등)
drizzle/
  schema.ts         # 데이터베이스 스키마
  migrations/       # 마이그레이션 파일
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 데이터베이스 설정

#### Docker Compose 사용 (권장)

```bash
docker compose up -d
```

#### 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/next_board"
```

`env.example` 파일을 참고할 수 있습니다.

### 3. 데이터베이스 마이그레이션

```bash
npm run db:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 데이터베이스

### 스키마

- **users**: 사용자 정보 (id, name, password)
- **sessions**: 세션 정보 (세션 기반 인증)
- **boards**: 게시글 (id, authorId, title, content)
- **comments**: 댓글 (id, boardId, authorId, content)

### 마이그레이션

스키마 변경 후 마이그레이션 생성:

```bash
npm run db:generate
npm run db:migrate
```

## API 엔드포인트

### 인증

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 게시글

- `GET /api/board` - 게시글 목록 조회
- `POST /api/board` - 게시글 생성 (인증 필요)
- `GET /api/board/[id]` - 게시글 상세 조회
- `PUT /api/board/[id]` - 게시글 수정 (인증 필요)
- `DELETE /api/board/[id]` - 게시글 삭제 (인증 필요)

### 댓글

- `GET /api/board/[id]/comments` - 댓글 목록 조회
- `POST /api/board/[id]/comments` - 댓글 작성 (인증 필요)
- `DELETE /api/board/comments/[commentId]` - 댓글 삭제 (인증 필요)

## HTTP 상태 코드

- **400 Bad Request**: 요청 형식 문제, validation 실패
- **401 Unauthorized**: 인증 필요
- **403 Forbidden**: 권한 없음
- **404 Not Found**: 리소스를 찾을 수 없음
- **409 Conflict**: 리소스 중복 (예: 중복 이름)
- **201 Created**: 리소스 생성 성공

## 인증 시스템

- **세션 기반 인증**: 쿠키에 세션 ID 저장
- **세션 만료**: 7일
- **비밀번호 해싱**: bcrypt (12 rounds)
- **보안**: httpOnly 쿠키, production 환경에서 secure 쿠키

## 주요 기능 설명

### 공통 API 유틸리티

`src/utils/api.ts`에서 공통 에러 응답 함수 제공:

- `validationError()` - Zod validation 에러 (400)
- `unauthorizedError()` - 인증 필요 (401)
- `forbiddenError()` - 권한 없음 (403)
- `notFoundError()` - 리소스 없음 (404)
- `badRequestError()` - 잘못된 요청 (400)
- `conflictError()` - 리소스 충돌 (409)
- `parseId()` - ID 검증 및 변환 헬퍼

### 페이지 라우트

- `/` - 홈 (게시판 보기/글 작성 링크)
- `/auth/login` - 로그인
- `/auth/signup` - 회원가입
- `/board` - 게시글 목록
- `/board/new` - 게시글 작성
- `/board/[id]` - 게시글 상세
- `/board/[id]/edit` - 게시글 수정

## 개발 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
npm run db:generate  # Drizzle 마이그레이션 생성
npm run db:migrate   # 마이그레이션 실행
```
