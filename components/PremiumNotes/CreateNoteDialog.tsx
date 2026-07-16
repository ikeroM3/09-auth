"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Check,
  FileText,
  Loader2,
  Sparkles,
  Tag,
  Type,
  X,
} from "lucide-react";
import { createNote } from "@/lib/api/clientApi";
import type { NoteTag } from "@/types/note";
import css from "./PremiumNotesWorkspace.module.css";

const noteTags = ["Todo", "Work", "Personal", "Meeting", "Shopping"] as const;

const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title needs at least 3 characters")
    .max(50, "Keep titles under 50 characters"),
  content: z.string().trim().max(500, "Notes can be up to 500 characters"),
  tag: z.enum(noteTags),
});

type NoteFormValues = z.infer<typeof noteSchema>;

type CreateNoteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export default function CreateNoteDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateNoteDialogProps) {
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      tag: "Todo",
    },
  });

  const watchedTitle = watch("title");
  const watchedContent = watch("content");

  const noteScore = useMemo(() => {
    const titleScore = Math.min((watchedTitle?.trim().length ?? 0) / 24, 1);
    const contentScore = Math.min((watchedContent?.trim().length ?? 0) / 180, 1);
    return Math.round((titleScore * 0.38 + contentScore * 0.62) * 100);
  }, [watchedTitle, watchedContent]);

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"], exact: false });
      setShowSuccess(true);
      onCreated();
      window.setTimeout(() => {
        reset();
        setShowSuccess(false);
        onOpenChange(false);
      }, prefersReducedMotion ? 50 : 760);
    },
  });

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  const onSubmit = (values: NoteFormValues) => {
    createMutation.mutate({
      title: values.title,
      content: values.content,
      tag: values.tag as NoteTag,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={css.modalBackdrop}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className={css.modalPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-note-title"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 34, scale: 0.94, filter: "blur(14px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 18, scale: 0.97, filter: "blur(8px)" }
            }
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <button
              className={`${css.iconButton} ${css.modalClose}`}
              type="button"
              aria-label="Close create note dialog"
              data-tooltip="Close"
              onClick={() => onOpenChange(false)}
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div className={css.modalHeader}>
              <span className={css.modalKicker}>
                <Sparkles size={15} aria-hidden="true" />
                New note
              </span>
              <h2 id="create-note-title">Capture the next clear thought.</h2>
              <p>
                A focused composer with live validation, a quality meter, and a
                little celebration when the note lands.
              </p>
            </div>

            <form className={css.composerForm} onSubmit={handleSubmit(onSubmit)}>
              <label className={css.floatingField}>
                <Type size={17} aria-hidden="true" />
                <input
                  {...register("title")}
                  className={errors.title ? css.invalidField : ""}
                  placeholder=" "
                  aria-invalid={Boolean(errors.title)}
                />
                <span>Title</span>
              </label>
              <AnimatePresence>
                {errors.title && (
                  <motion.p
                    className={css.fieldError}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                  >
                    {errors.title.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <label className={`${css.floatingField} ${css.textareaField}`}>
                <FileText size={17} aria-hidden="true" />
                <textarea
                  {...register("content")}
                  className={errors.content ? css.invalidField : ""}
                  placeholder=" "
                  rows={7}
                  aria-invalid={Boolean(errors.content)}
                />
                <span>Preview text</span>
              </label>
              <AnimatePresence>
                {errors.content && (
                  <motion.p
                    className={css.fieldError}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                  >
                    {errors.content.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <label className={css.selectField}>
                <Tag size={17} aria-hidden="true" />
                <span>Tag</span>
                <select {...register("tag")} aria-label="Choose note tag">
                  {noteTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>

              <div className={css.strengthPanel} aria-live="polite">
                <div>
                  <span>Note strength</span>
                  <strong>{noteScore}%</strong>
                </div>
                <div className={css.strengthTrack}>
                  <motion.span
                    initial={false}
                    animate={{ width: `${noteScore}%` }}
                    transition={{ type: "spring", stiffness: 180, damping: 24 }}
                  />
                </div>
              </div>

              <button
                className={css.primaryButton}
                type="submit"
                disabled={!isValid || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className={css.spinIcon} size={18} aria-hidden="true" />
                ) : (
                  <Sparkles size={18} aria-hidden="true" />
                )}
                {createMutation.isPending ? "Creating..." : "Create note"}
              </button>
            </form>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className={css.successBurst}
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                >
                  <motion.span
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.42, ease: "easeOut" }}
                  >
                    <Check size={34} aria-hidden="true" />
                  </motion.span>
                  Saved beautifully
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
