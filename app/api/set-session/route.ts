import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function POST(request: Request) {
  const { secret } = await request.json();

  const cookieStore = await cookies();
  cookieStore.set({
    name: "appwrite-session",
    value: secret,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return NextResponse.json({ success: true });
}
