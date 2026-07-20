import { NextResponse } from "next/server";

import { ApiError } from "./auth";

import { ZodError } from "zod";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ── Success responses ─────────────────────────────────────────
export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return ok(data, 201);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function paginated<T>(
  data: T[],
  meta: PaginationMeta,
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({ success: true, data, meta }, { status: 200 });
}

// ── Error responses ───────────────────────────────────────────
export function badRequest(message: string): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export function unauthorized(
  message = "Unauthorized",
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden"): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function notFound(resource = "Resource"): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error: `${resource} not found` },
    { status: 404 },
  );
}

export function conflict(message: string): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 409 });
}

export function internalError(
  message = "Internal server error",
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

// ── Error handler (use in every route) ───────────────────────
export function handleError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.issues.forEach((e) => {
      const key = e.path.join(".");
      if (!errors[key]) errors[key] = [];
      errors[key].push(e.message);
    });
    return NextResponse.json(
      { success: false, error: "Validation failed", errors },
      { status: 422 },
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    return conflict("A record with those unique values already exists.");
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  ) {
    return notFound();
  }

  console.error("[API Error]", error);
  return internalError();
}
