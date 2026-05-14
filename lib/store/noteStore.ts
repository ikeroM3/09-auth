import { create } from "zustand";
import { persist } from "zustand/middleware";

import { type NoteUpdate } from "@/types/note";

type User = {
  id: string;
  email: string;
  userName?: string;
  photoUrl?: string;
};

type NoteDraftStore = {
  user: User | null;
  setUser: (user: User | null) => void;

  draft: NoteUpdate;
  setDraft: (note: NoteUpdate) => void;

  clearDraft: () => void;
};

const initialDraft: NoteUpdate = {
  title: "",
  content: "",
  tag: "Todo",
};

export const useNoteDraftStore = create<NoteDraftStore>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      draft: initialDraft,

      setDraft: (note) =>
        set(() => ({
          draft: note,
        })),

      clearDraft: () =>
        set(() => ({
          draft: initialDraft,
        })),
    }),
    {
      name: "note-draft",

      partialize: (state) => ({
        draft: state.draft,
        user: state.user,
      }),
    },
  ),
);
