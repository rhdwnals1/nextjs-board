import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "@drizzle/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL이 설정되어 있지 않습니다. 예) postgres://USER:PASSWORD@HOST:5432/DB"
  );
}

const globalForDb = globalThis as unknown as {
  sql?: postgres.Sql;
  drizzleDb?: ReturnType<typeof drizzle<typeof schema>>;
};

// postgres-js 클라이언트는 dev 환경에서 hot-reload 시 중복 연결이 생길 수 있어 global 캐시 사용
const sql =
  globalForDb.sql ??
  postgres(databaseUrl, {
    // 로컬 dev에선 connection 수를 작게 유지하는 게 편함
    max: 1,
  });

export const db = globalForDb.drizzleDb ?? drizzle(sql, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
  globalForDb.drizzleDb = db;
}
