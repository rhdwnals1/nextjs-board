import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unauthorizedError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return unauthorizedError("로그인되지 않았습니다.");
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
  });
}
