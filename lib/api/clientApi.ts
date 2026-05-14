import { nextServer } from "./api";
import { type Note, type NoteUpdate } from "@/types/note";

interface ParamsGetProps {
  searchText?: string;
  tag?: string;
  page?: number;
  perPage?: number;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

// NOTES

export const fetchNotes = async ({
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
  });

  return res.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const res = await nextServer.get<Note>(`/notes/${id}`);

  return res.data;
};

export const createNote = async (data: NoteUpdate): Promise<Note> => {
  const res = await nextServer.post<Note>("/notes", data);

  return res.data;
};

export const deleteNote = async (id: string) => {
  const res = await nextServer.delete<Note>(`/notes/${id}`);

  return res.data;
};

// AUTH

export interface RegisterRequest {
  email: string;
  password: string;
  userName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const register = async (data: RegisterRequest) => {
  const res = await nextServer.post("/auth/register", data);

  return res.data;
};

export const login = async (data: LoginRequest) => {
  const res = await nextServer.post("/auth/login", data);

  return res.data;
};

export const logout = async (): Promise<void> => {
  await nextServer.post("/auth/logout");
};

export const checkSession = async () => {
  const res = await nextServer.get("/auth/session");

  return res.data;
};

export const getMe = async () => {
  const res = await nextServer.get("/auth/me");

  return res.data;
};

export const updateMe = async (data: FormData) => {
  const res = await nextServer.patch("/auth/me", data);

  return res.data;
};
