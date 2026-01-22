import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: "로그인되지 않았습니다." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
  });
}
