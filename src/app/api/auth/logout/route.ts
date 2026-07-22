import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib";

export async function POST() {
  return clearSessionCookie(
    NextResponse.json({
      success: true,
      message: "Logged out successfully",
    }),
  );
}
