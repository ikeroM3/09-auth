import css from "@/components/Header/header.module.css";
import Link from "next/link";
import AuthNav from "@/components/AuthNavigation/AuthNavigation";
import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className={css.header}>
      <Link href="/" aria-label="Home" className={css.logo}>
        <span aria-hidden="true">
          <Sparkles size={18} />
        </span>
        NoteHub OS
      </Link>
      <nav aria-label="Main Navigation">
        <ul className={css.navigation}>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/notes/filter/all">Notes</Link>
          </li>
          <AuthNav />
        </ul>
      </nav>
    </header>
  );
}
