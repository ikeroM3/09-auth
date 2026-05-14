import { NextResponse } from "next/server";
import { nextServer, ApiError, createErrorResponse } from "../../api";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  try {
    const { data } = await nextServer.get("/auth/me", {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    return createErrorResponse(error as ApiError);
  }
}
