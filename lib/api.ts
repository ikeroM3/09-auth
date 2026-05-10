import axios from "axios";
import { type Note, type NoteUpdate } from "../types/note";

axios.defaults.baseURL = "https://notehub-public.goit.study/api";
const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;
interface ParamsGetProps {
  searchText?: string;
  tag?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
}
export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}
export const fetchNotes = async ({
  searchText,
  tag,
  page = 1,
}: ParamsGetProps) => {
  const params: Record<string, string | number> = { page, perPage: 12 };

  if (searchText) {
    params.search = searchText;
  }

  if (tag) {
    params.tag = tag;
  }

  const response = await axios.get<FetchNotesResponse>("/notes", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};

export const createNote = async (data: NoteUpdate): Promise<Note> => {
  const response = await axios.post<Note>("/notes", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const deleteNote = async (id: string) => {
  const response = await axios.delete<Note>(`/notes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return response.data;
};
export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await axios.get<Note>(`/notes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return response.data;
};
