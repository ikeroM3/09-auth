"use client";

import { useRouter } from "next/navigation";
import NoteForm from "@/components/NoteForm/NoteForm";

export default function CreateNoteClient() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/notes/filter/all");
  };

  return <NoteForm onClose={handleClose} />;
}
