"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, Check, FileText, Search, Sparkles, Star } from "lucide-react";
import css from "./page.module.css";

const previewNotes = [
  {
    title: "Launch narrative",
    copy: "Shape the onboarding story around calm momentum and fast capture.",
    tag: "Work",
  },
  {
    title: "Weekend reset",
    copy: "Pack the day with fewer tabs, better light, and a long walk after lunch.",
    tag: "Personal",
  },
  {
    title: "Design sparks",
    copy: "Use soft depth, magnetic controls, and cards that feel lifted from glass.",
    tag: "Ideas",
  },
];

export default function Home() {
  const reducedMotion = useReducedMotion();

  return (
    <section className={css.home}>
      <div className={css.ambient} aria-hidden="true" />
      <motion.div
        className={css.hero}
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
      >
        <span className={css.kicker}>
          <Sparkles size={16} aria-hidden="true" />
          Premium notes workspace
        </span>
        <h1>NoteHub OS</h1>
        <p>
          A polished command center for notes, favorites, search, and focused
          capture with motion that stays smooth and intentional.
        </p>
        <div className={css.heroActions}>
          <Link href="/notes/filter/all" className={css.primaryCta}>
            Open workspace
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/sign-in" className={css.secondaryCta}>
            Sign in
          </Link>
        </div>
      </motion.div>

      <motion.div
        className={css.preview}
        initial={reducedMotion ? false : { opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.08, type: "spring", stiffness: 160, damping: 24 }}
        aria-label="NoteHub workspace preview"
      >
        <aside className={css.previewRail}>
          <span className={css.logoMark}>
            <Sparkles size={18} aria-hidden="true" />
          </span>
          {["All", "Work", "Ideas", "Archive"].map((item, index) => (
            <motion.span
              key={item}
              className={index === 0 ? css.activeRailItem : ""}
              initial={reducedMotion ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 + index * 0.04 }}
            >
              {item}
            </motion.span>
          ))}
        </aside>

        <div className={css.previewMain}>
          <div className={css.previewTopbar}>
            <div className={css.previewSearch}>
              <Search size={16} aria-hidden="true" />
              Search your thinking
            </div>
            <button type="button" aria-label="Preview notifications">
              <Bell size={16} aria-hidden="true" />
            </button>
          </div>

          <div className={css.previewMetrics}>
            <span>
              <FileText size={15} aria-hidden="true" />
              128 notes
            </span>
            <span>
              <Star size={15} aria-hidden="true" />
              24 favorites
            </span>
            <span>
              <Check size={15} aria-hidden="true" />
              98% flow
            </span>
          </div>

          <div className={css.previewGrid}>
            {previewNotes.map((note, index) => (
              <motion.article
                key={note.title}
                className={css.previewCard}
                initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={reducedMotion ? undefined : { y: -8, rotateX: 3, rotateY: -3 }}
                transition={{ delay: 0.22 + index * 0.05, type: "spring", stiffness: 180, damping: 20 }}
              >
                <span>{note.tag}</span>
                <h2>{note.title}</h2>
                <p>{note.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
