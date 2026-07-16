"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateNoteDialog from "@/components/PremiumNotes/CreateNoteDialog";

export default function CreateNoteClient() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) router.push("/notes/filter/all");
  };

  return (
    <CreateNoteDialog
      open={open}
      onOpenChange={handleOpenChange}
      onCreated={() => undefined}
    />
  );
}
