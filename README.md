## next-board

Next.js(App Router) + Drizzle(PostgreSQL)로 만든 **간단한 게시판 CRUD 프로젝트**입니다.

### 주요 기능

- **게시글 목록**: `/board`
- **게시글 상세**: `/board/[id]`
- **게시글 작성**: `/board/new`
- **게시글 수정**: `/board/[id]/edit`
- **게시글 삭제**: 상세 화면에서 삭제 버튼

### 기술 스택

- **Next.js (App Router)**
- **React**
- **Drizzle ORM + PostgreSQL**
- **Tailwind CSS**
- **shadcn 스타일 UI 컴포넌트**: `components/ui/*` (Button/Card/Input/Textarea)

---

### 실행 방법

#### 1) 설치

```bash
npm install
```

#### 2) 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

---

### DB / Drizzle

이 프로젝트는 **PostgreSQL**을 사용합니다.

- **Schema**: `drizzle/schema.ts`
- **DB 연결 설정**: `src/lib/db.ts`

#### DATABASE_URL

`.env`에 다음처럼 PostgreSQL 연결 문자열을 넣어주세요. (예시는 `env.example` 참고)

```bash
DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DB"
```

> 로컬 개발에서는 보통 `HOST=localhost`로 두고, DB는 별도로 생성해서 사용합니다.

#### 로컬 PostgreSQL 빠른 실행(docker-compose)

Docker를 쓴다면 아래처럼 바로 띄울 수 있습니다. (최초 실행 시 `posts` 테이블도 자동 생성)

```bash
docker compose up -d
```

그리고 `.env`를 만들고 다음 값을 넣어주세요:

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/next_board"
```

---

### 라우트(페이지)

- **홈**: `src/app/page.tsx`
- **목록**: `src/app/board/page.tsx`
- **작성**: `src/app/board/new/page.tsx`
- **상세**: `src/app/board/[id]/page.tsx`
- **수정**: `src/app/board/[id]/edit/page.tsx`

---

### 라우트(API)

#### `/api/board`

- `GET /api/board`: 게시글 전체 조회(최신순)
- `POST /api/board`: 게시글 생성

#### `/api/board/[id]`

- `GET /api/board/:id`: 게시글 단건 조회
- `PUT /api/board/:id`: 게시글 수정 (`{ title, content }`)
- `DELETE /api/board/:id`: 게시글 삭제

---

### 프로젝트 구조(요약)

```text
src/
  app/
    api/board/
      route.ts
      [id]/route.ts
    board/
      page.tsx
      new/page.tsx
      [id]/page.tsx
      [id]/edit/page.tsx
  components/
    ui/
      button.tsx
      card.tsx
      input.tsx
      textarea.tsx
  lib/
    db.ts
    utils.ts
    validators/
  services/
  types/
  queries/
  drizzle/
    schema.ts
```
