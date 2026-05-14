import { api } from "@/app/api/api";
import { cookies } from "next/headers";
import type { AxiosResponse } from "axios"; // Додано для типізації
import type { Note } from "@/types/note";
import type { User } from "@/types/user";
import type { FetchNotesParams } from "./clientApi";

const getServerHeaders = async () => {
  const cookieStore = await cookies();
  return {
    headers: {
      Cookie: cookieStore.toString(),
    },
  };
};

export const fetchNotes = async (params: FetchNotesParams) => {
  const headers = await getServerHeaders();
  const res = await api.get("/notes", { ...headers, params });
  return res.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const headers = await getServerHeaders();
  const res = await api.get(`/notes/${id}`, headers);
  return res.data;
};

export const getMe = async (): Promise<User> => {
  const headers = await getServerHeaders();
  const res = await api.get("/users/me", headers);
  return res.data;
};

export const getSession = async (): Promise<AxiosResponse<User>> => {
  const headers = await getServerHeaders();
  // Повертаємо весь об'єкт res, а не res.data
  return await api.get("/auth/session", headers);
};
