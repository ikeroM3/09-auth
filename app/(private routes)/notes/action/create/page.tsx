import css from "./CreateNote.module.css";

import CreateNoteClient from "./CreateNoteClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create note",
  description: "Create a new note",
  openGraph: {
    title: "Create note",
    description: "Create a new note",
    url: "https://notehub-public.goit.study/notes/action/create",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};
export default function CreateNote() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>

        <CreateNoteClient />
      </div>
    </main>
  );
}
