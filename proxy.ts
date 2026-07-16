import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/api/serverApi";

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === "/sign-in" || pathname === "/sign-up";
  const isPrivateRoute =
    pathname.startsWith("/profile") || pathname.startsWith("/notes");

  let isAuthorized = !!accessToken;

  if (!isAuthorized && refreshToken) {
    try {
      const user = await getSession();

      if (user) {
        isAuthorized = true;
      }
    } catch {
      isAuthorized = false;
    }
  }

  if (!isAuthorized && isPrivateRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthorized && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
