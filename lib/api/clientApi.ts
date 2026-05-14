import { api } from "./api";
import type { Note, NoteTag } from "@/types/note";
import type { User } from "@/types/user";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}
export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string;
}
export type RegisterRequest = {
  email: string;
  password: string;
  username?: string; // опціональне
};
export interface NewNote {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

// --- АУТЕНТИФІКАЦІЯ (AUTH) ---

export const register = async (data: RegisterRequest): Promise<User> => {
  const res = await api.post<User>("/auth/register", data);
  return res.data;
};
export const login = async (data: LoginData): Promise<User> => {
  const res = await api.post<User>("/auth/login", data);
  return res.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

/** Перевірка активної сесії */
export const checkSession = async (): Promise<User | null> => {
  const res = await api.get<User | null>("/auth/session");
  return res.data;
};

// --- КОРИСТУВАЧІ (USERS) ---

/** Отримання профілю поточного користувача */
export const getMe = async (): Promise<User> => {
  const res = await api.get<User>("/users/me");
  return res.data;
};
export type UpdateUserRequest = {
  username: string;
  avatar?: string;
};

export const updateMe = async (payload: UpdateUserRequest) => {
  const { data } = await api.patch("/users/me", payload);
  return data;
};
// --- НОТАТКИ (NOTES) ---

export const fetchNotes = async (
  params: FetchNotesParams,
): Promise<FetchNotesResponse> => {
  const res = await api.get<FetchNotesResponse>("/notes", { params });
  return res.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const res = await api.get<Note>(`/notes/${id}`);
  return res.data;
};

export const createNote = async (noteData: NewNote): Promise<Note> => {
  const res = await api.post<Note>("/notes", noteData);
  return res.data;
};

export const deleteNote = async (noteId: string): Promise<Note> => {
  const res = await api.delete<Note>(`/notes/${noteId}`);
  return res.data;
};
