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
  let apiCookies: string[] | undefined;

  if (!isAuthorized && refreshToken) {
    try {
      const apiRes = await getSession();
      if (apiRes && apiRes.data) {
        isAuthorized = true;

        apiCookies = apiRes.headers["set-cookie"];
      }
    } catch {
      isAuthorized = false;
    }
  }

  let response: NextResponse;

  if (!isAuthorized && isPrivateRoute) {
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isAuthorized && isPublicRoute) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else {
    response = NextResponse.next();
  }

  if (apiCookies) {
    apiCookies.forEach((cookie) => {
      response.headers.append("set-cookie", cookie);
    });
  }

  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
