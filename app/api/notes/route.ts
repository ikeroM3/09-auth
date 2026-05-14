import { NextRequest, NextResponse } from "next/server";
import { api } from "../api";
import { cookies } from "next/headers";
import { isAxiosError } from "axios";
import { logErrorResponse } from "../_utils/utils";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const perPage = 12;
    const search = searchParams.get("search") || "";
    const tag =
      searchParams.get("tag") === "All" ? "" : searchParams.get("tag") || "";

    const params: Record<string, string | number> = { page, perPage };
    if (search) params.search = search;
    if (tag) params.tag = tag;

    const res = await api.get("/notes", {
      headers: { Cookie: cookieStore.toString() },
      params,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.status },
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();

    const res = await api.post("/notes", body, {
      headers: {
        Cookie: cookieStore.toString(),
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.status },
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
