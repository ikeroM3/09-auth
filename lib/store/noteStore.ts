import { create } from "zustand";
import { type NoteUpdate } from "@/types/note";
import { persist } from "zustand/middleware";

type NoteDraftStore = {
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
      draft: initialDraft,
      setDraft: (note) => set(() => ({ draft: note })),
      clearDraft: () => set(() => ({ draft: initialDraft })),
    }),
    {
      name: "note-draft",

      partialize: (state) => ({ draft: state.draft }),
    },
  ),
);
