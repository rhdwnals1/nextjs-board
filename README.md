## next-board

Next.js(App Router) + Prisma(SQLite)로 만든 **간단한 게시판 CRUD 프로젝트**입니다.

### 주요 기능

- **게시글 목록**: `/posts`
- **게시글 상세**: `/posts/[id]`
- **게시글 작성**: `/posts/new`
- **게시글 수정**: `/posts/[id]/edit`
- **게시글 삭제**: 상세 화면에서 삭제 버튼

### 기술 스택

- **Next.js (App Router)**
- **React**
- **Prisma + SQLite** (`dev.db`)
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

### DB / Prisma

이 프로젝트는 기본적으로 SQLite 파일 DB(`dev.db`)를 사용합니다.

- **Schema**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/*`
- **Prisma Client/Adapter 설정**: `lib/prisma.ts`

#### DATABASE_URL

기본값은 `file:./dev.db`이며(`lib/prisma.ts`), 필요하면 `.env`에서 다음처럼 바꿀 수 있습니다.

```bash
DATABASE_URL="file:./dev.db"
```

> `dev.db`는 로컬 데이터라서 `.gitignore`에 포함되어 커밋되지 않습니다.

---

### 라우트(페이지)

- **홈**: `app/page.tsx`
- **목록**: `app/posts/page.tsx`
- **작성**: `app/posts/new/page.tsx`
- **상세**: `app/posts/[id]/page.tsx`
- **수정**: `app/posts/[id]/edit/page.tsx`

---

### 라우트(API)

#### `/api/posts`

- `GET /api/posts`: 게시글 전체 조회(최신순)
- `POST /api/posts`: 게시글 생성

#### `/api/posts/[id]`

- `GET /api/posts/:id`: 게시글 단건 조회
- `PUT /api/posts/:id`: 게시글 수정 (`{ title, content }`)
- `DELETE /api/posts/:id`: 게시글 삭제

---

### 프로젝트 구조(요약)

```text
app/
  api/posts/
    route.ts
    [id]/route.ts
  posts/
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
  prisma.ts
  utils.ts
prisma/
  schema.prisma
  migrations/
```
