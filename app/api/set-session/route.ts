import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function POST(request: Request) {
  console.log("Set-session API route called");
  const { secret } = await request.json();
  console.log("Received secret:", secret);

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

  console.log("Cookie set in API route");

  return NextResponse.json({ success: true });
}
