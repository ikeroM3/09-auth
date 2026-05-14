import { cookies } from "next/headers";
import { nextServer } from "./api";
import { type Note } from "@/types/note";

import { type FetchNotesResponse } from "./clientApi";

interface ParamsGetProps {
  searchText?: string;
  tag?: string;
  page?: number;
  perPage?: number;
}

const getCookieHeader = async () => {
  const cookieStore = await cookies();

  return cookieStore.toString();
};

// NOTES

export const fetchServerNotes = async ({
  searchText,
  tag,
  page = 1,
}: ParamsGetProps) => {
  const params: Record<string, string | number> = {
    page,
    perPage: 12,
  };

  if (searchText) {
    params.search = searchText;
  }

  if (tag) {
    params.tag = tag;
  }

  const res = await nextServer.get<FetchNotesResponse>("/notes", {
    params,
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return res.data;
};

export const fetchServerNoteById = async (id: string): Promise<Note> => {
  const res = await nextServer.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return res.data;
};

// AUTH

export const checkServerSession = async () => {
  const res = await nextServer.get("/auth/session", {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return res.data;
};

export const getServerMe = async () => {
  const res = await nextServer.get("/auth/me", {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return res.data;
};
