import css from "./footer.module.css";

export default function Footer() {
  const showLegacyFooter = false;

  if (showLegacyFooter) return (
    <footer className={css.footer}>
      <div className={css.content}>
        <p>© {new Date().getFullYear()} NoteHub. All rights reserved.</p>
        <div className={css.wrap}>
          <p>
            Contact:
            <a href="mailto:student@notehub.app">student@notehub.app</a>
          </p>
        </div>
      </div>
    </footer>
  );

  return (
    <footer className={css.footer}>
      <div className={css.content}>
        <p>{new Date().getFullYear()} NoteHub OS. Crafted for focused notes.</p>
        <div className={css.wrap}>
          <p>
            Contact:
            <a href="mailto:student@notehub.app">student@notehub.app</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
