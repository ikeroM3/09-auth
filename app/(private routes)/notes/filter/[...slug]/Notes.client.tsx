"use client";

import PremiumNotesWorkspace from "@/components/PremiumNotes/PremiumNotesWorkspace";

interface NotesClientProps {
  tag: string;
}

export default function NotesClient({ tag }: NotesClientProps) {
  return <PremiumNotesWorkspace tag={tag} />;
}
