import { NextResponse } from "next/server";
import { ZodError } from "zod";

// API 에러 응답 생성
export function errorResponse(
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

// Zod validation 에러 처리
export function validationError(
  error: ZodError,
  defaultMessage: string = "요청 값이 올바르지 않습니다."
): NextResponse {
  const message = error.issues[0]?.message ?? defaultMessage;
  return errorResponse(message, 400);
}

// 인증 필요 에러 (401)
export function unauthorizedError(
  message: string = "로그인이 필요합니다."
): NextResponse {
  return errorResponse(message, 401);
}

// 리소스 없음 에러 (404)
export function notFoundError(
  message: string = "리소스를 찾을 수 없습니다."
): NextResponse {
  return errorResponse(message, 404);
}

// 잘못된 요청 에러 (400) - 요청 형식 문제, validation 실패, 잘못된 파라미터
export function badRequestError(message: string): NextResponse {
  return errorResponse(message, 400);
}

// 충돌 에러 (409) - 리소스 중복, 이미 존재하는 리소스
export function conflictError(message: string): NextResponse {
  return errorResponse(message, 409);
}

// 권한 없음 에러 (403) - 인증은 되었지만 권한이 없음
export function forbiddenError(message: string = "권한이 없습니다."): NextResponse {
  return errorResponse(message, 403);
}

// 문자열 ID를 숫자로 변환 및 검증
export async function parseId(
  rawId: string | Promise<string>,
  fieldName: string = "id"
): Promise<{ id: number } | { error: NextResponse }> {
  const idStr = typeof rawId === "string" ? rawId : await rawId;
  const id = Number(idStr);

  if (!Number.isInteger(id) || id <= 0) {
    return {
      error: badRequestError(`${fieldName}는 양의 정수여야 합니다.`),
    };
  }

  return { id };
}
