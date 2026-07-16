"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent,
} from "react";
import {
  AnimatePresence,
  Reorder,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import {
  Archive,
  Bell,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  Circle,
  FileText,
  Folder,
  GripVertical,
  Heart,
  Home,
  Lightbulb,
  Loader2,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  User,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { createNote, deleteNote, fetchNotes } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { Note } from "@/types/note";
import css from "./PremiumNotesWorkspace.module.css";

const CreateNoteDialog = dynamic(() => import("./CreateNoteDialog"), {
  ssr: false,
  loading: () => <div className={css.dialogPreloader} aria-hidden="true" />,
});

type ThemeMode = "dark" | "light" | "system";

type PremiumNotesWorkspaceProps = {
  tag: string;
};

type ToastState = {
  id: number;
  message: string;
  action?: string;
};

type ContextMenuState = {
  note: Note;
  x: number;
  y: number;
};

type TagItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
};

const sidebarTags: TagItem[] = [
  { label: "All notes", value: "all", icon: Home, tone: "violet" },
  { label: "Todo", value: "Todo", icon: Check, tone: "blue" },
  { label: "Work", value: "Work", icon: Briefcase, tone: "indigo" },
  { label: "Personal", value: "Personal", icon: User, tone: "rose" },
  { label: "Meeting", value: "Meeting", icon: Calendar, tone: "emerald" },
  { label: "Shopping", value: "Shopping", icon: ShoppingBag, tone: "amber" },
];

const particles = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 11) % 100}%`,
  top: `${(index * 53 + 17) % 100}%`,
  delay: `${(index % 8) * 0.42}s`,
  duration: `${11 + (index % 6)}s`,
  scale: 0.55 + (index % 5) * 0.18,
}));

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function resolveTheme(theme: ThemeMode) {
  if (theme !== "system") return theme;

  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function PremiumNotesWorkspace({ tag }: PremiumNotesWorkspaceProps) {
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  const smoothX = useSpring(parallaxX, { stiffness: 55, damping: 22, mass: 0.6 });
  const smoothY = useSpring(parallaxY, { stiffness: 55, damping: 22, mass: 0.6 });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastDeleted, setLastDeleted] = useState<Note | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [orderedNotes, setOrderedNotes] = useState<Note[]>([]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 280);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["notes", page, search, tag],
    queryFn: () =>
      fetchNotes({
        page,
        search,
        perPage: 12,
        tag,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60000,
  });

  useEffect(() => {
    if (data?.notes) {
      setOrderedNotes(data.notes);
    }
  }, [data?.notes]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("notehub-theme") as ThemeMode | null;
    if (storedTheme === "dark" || storedTheme === "light" || storedTheme === "system") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const resolved = resolveTheme(theme);
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    };

    applyTheme();
    window.localStorage.setItem("notehub-theme", theme);

    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", applyTheme);

    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (!isTyping && event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!contextMenu) return;

    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", closeMenu);
    };
  }, [contextMenu]);

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"], exact: false });
    },
  });

  const undoMutation = useMutation({
    mutationFn: (note: Note) =>
      createNote({
        title: note.title,
        content: note.content,
        tag: note.tag,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"], exact: false });
      setToast({ id: Date.now(), message: "Note restored" });
    },
  });

  const activeTag = useMemo(
    () => sidebarTags.find((item) => item.value.toLowerCase() === tag.toLowerCase()) ?? sidebarTags[0],
    [tag],
  );

  const suggestions = useMemo(() => {
    const source = orderedNotes.length ? orderedNotes : data?.notes ?? [];
    const normalizedSearch = searchInput.trim().toLowerCase();
    const fromNotes = source
      .flatMap((note) => [note.title, note.tag])
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index)
      .filter((value) =>
        normalizedSearch ? value.toLowerCase().includes(normalizedSearch) : true,
      )
      .slice(0, 4);

    return fromNotes.length ? fromNotes : ["Roadmap", "Meeting", "Ideas", "Personal"];
  }, [data?.notes, orderedNotes, searchInput]);

  const totalPages = data?.totalPages ?? 0;
  const favoriteCount = favorites.size;
  const totalNotes = orderedNotes.length;
  const activeCount = totalNotes || data?.notes?.length || 0;

  const showToast = useCallback((message: string, action?: string) => {
    setToast({ id: Date.now(), message, action });
  }, []);

  const handleWorkspacePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    event.currentTarget.style.setProperty("--mouse-x", `${x}%`);
    event.currentTarget.style.setProperty("--mouse-y", `${y}%`);

    if (!prefersReducedMotion) {
      parallaxX.set((x - 50) * 0.24);
      parallaxY.set((y - 50) * 0.2);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const applySuggestion = (value: string) => {
    setSearchInput(value);
    setSearch(value);
    setPage(1);
    setSearchFocused(false);
  };

  const toggleFavorite = useCallback(
    (noteId: string) => {
      setFavorites((current) => {
        const next = new Set(current);
        if (next.has(noteId)) {
          next.delete(noteId);
          showToast("Removed from favorites");
        } else {
          next.add(noteId);
          showToast("Added to favorites");
        }
        return next;
      });
    },
    [showToast],
  );

  const handleDelete = useCallback(
    (note: Note) => {
      setLastDeleted(note);
      setOrderedNotes((current) => current.filter((item) => item._id !== note._id));
      setContextMenu(null);
      showToast("Note deleted", "Undo");
      deleteMutation.mutate(note._id, {
        onError: () => {
          setOrderedNotes((current) => [note, ...current]);
          showToast("Delete failed");
        },
      });
    },
    [deleteMutation, showToast],
  );

  const handleUndo = () => {
    if (!lastDeleted) return;
    undoMutation.mutate(lastDeleted);
    setLastDeleted(null);
  };

  return (
    <section
      className={css.workspace}
      aria-label="Premium notes workspace"
      onPointerMove={handleWorkspacePointerMove}
    >
      <AmbientBackground x={smoothX} y={smoothY} reduced={Boolean(prefersReducedMotion)} />

      <motion.aside
        className={css.sidebar}
        aria-label="Notes navigation"
        animate={{ width: sidebarOpen ? 288 : 92 }}
        transition={{ type: "spring", stiffness: 240, damping: 28 }}
      >
        <div className={css.sidebarTop}>
          <Link className={css.workspaceSwitcher} href="/notes/filter/all" aria-label="Go to notes">
            <span className={css.logoMark}>
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <AnimatePresence initial={false}>
              {sidebarOpen && (
                <motion.span
                  className={css.workspaceCopy}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                >
                  <strong>NoteHub OS</strong>
                  <small>Design workspace</small>
                </motion.span>
              )}
            </AnimatePresence>
            {sidebarOpen && <ChevronDown size={16} aria-hidden="true" />}
          </Link>

          <button
            className={css.iconButton}
            type="button"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            data-tooltip={sidebarOpen ? "Collapse" : "Expand"}
            onClick={() => setSidebarOpen((value) => !value)}
          >
            {sidebarOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>

        <nav className={css.sideNav} aria-label="Note filters">
          {sidebarTags.map((item) => {
            const Icon = item.icon;
            const active = item.value.toLowerCase() === tag.toLowerCase();

            return (
              <Link
                key={item.value}
                className={`${css.sideNavItem} ${active ? css.activeSideNavItem : ""}`}
                href={`/notes/filter/${item.value}`}
                aria-current={active ? "page" : undefined}
                data-tone={item.tone}
              >
                {active && (
                  <motion.span
                    className={css.activeIndicator}
                    layoutId="active-note-filter"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <Icon size={18} aria-hidden="true" />
                <AnimatePresence initial={false}>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className={css.sidebarFooter}>
          <div className={css.focusToggle}>
            <label>
              <input type="checkbox" aria-label="Enable focus mode" />
              <span>
                <Check size={13} aria-hidden="true" />
              </span>
            </label>
            {sidebarOpen && (
              <div>
                <strong>Focus mode</strong>
                <small>Quiet notifications</small>
              </div>
            )}
          </div>

          <div className={css.profileMini}>
            <span className={css.avatar} aria-hidden="true">
              {(user?.username || user?.email || "N").slice(0, 1).toUpperCase()}
            </span>
            {sidebarOpen && (
              <div>
                <strong>{user?.username || "Notebook owner"}</strong>
                <small>{user?.email || "local workspace"}</small>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      <motion.div
        className={css.contentShell}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
      >
        <header className={css.commandHeader}>
          <div className={css.searchWrap}>
            <Search size={19} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
              aria-label="Search notes"
              placeholder=" "
            />
            <AnimatePresence mode="wait">
              {!searchInput && (
                <motion.span
                  key={searchFocused ? "focused" : "idle"}
                  className={css.animatedPlaceholder}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {searchFocused ? "Search tags, titles, or fragments" : "Search your thinking"}
                </motion.span>
              )}
            </AnimatePresence>
            <kbd>Ctrl K</kbd>

            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  className={css.searchSuggestions}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <span>Suggestions</span>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <Search size={14} aria-hidden="true" />
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={css.headerActions}>
            <ThemeSwitch value={theme} onChange={setTheme} />
            <button
              className={css.iconButton}
              type="button"
              aria-label="Notifications"
              data-tooltip="Notifications"
            >
              <Bell size={18} aria-hidden="true" />
              <span className={css.notificationPulse} aria-hidden="true" />
            </button>

            <div className={css.profileMenuWrap}>
              <button
                className={css.profileButton}
                type="button"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((value) => !value)}
              >
                <span className={css.avatar} aria-hidden="true">
                  {(user?.username || user?.email || "N").slice(0, 1).toUpperCase()}
                </span>
                <span>Profile</span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className={css.profileDropdown}
                    role="menu"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <Link href="/profile" role="menuitem">
                      <User size={15} aria-hidden="true" />
                      Account
                    </Link>
                    <Link href="/profile/edit" role="menuitem">
                      <Settings size={15} aria-hidden="true" />
                      Preferences
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <section className={css.heroBand} aria-labelledby="workspace-title">
          <motion.div
            className={css.heroCopy}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 190, damping: 24 }}
          >
            <span className={css.kicker}>
              <Sparkles size={15} aria-hidden="true" />
              {activeTag.label}
            </span>
            <h1 id="workspace-title">A calmer command center for every note.</h1>
            <p>
              Search, sort, favorite, reorder, and capture ideas in a glassy
              workspace tuned for focus.
            </p>
          </motion.div>

          <div className={css.metricsRow} aria-label="Workspace metrics">
            <MetricCard label="Visible notes" value={activeCount} icon={FileText} delay={0.08} />
            <MetricCard label="Favorites" value={favoriteCount} icon={Star} delay={0.14} />
            <MetricCard
              label="Flow score"
              value={isFetching ? "Sync" : "98"}
              suffix={isFetching ? "" : "%"}
              icon={Zap}
              delay={0.2}
            />
          </div>
        </section>

        <section className={css.boardArea}>
          <div className={css.boardHeader}>
            <div>
              <span className={css.sectionEyebrow}>Live board</span>
              <h2>Notes that feel tactile</h2>
            </div>
            <div className={css.boardTools}>
              {isFetching && !isLoading && (
                <span className={css.syncing} role="status">
                  <Loader2 className={css.spinIcon} size={15} aria-hidden="true" />
                  Syncing
                </span>
              )}
              <RippleButton className={css.primaryButton} type="button" onClick={() => setCreateOpen(true)}>
                <Plus size={18} aria-hidden="true" />
                New note
              </RippleButton>
            </div>
          </div>

          <button
            className={css.accordionButton}
            type="button"
            aria-expanded={insightsOpen}
            onClick={() => setInsightsOpen((value) => !value)}
          >
            <span>
              <Lightbulb size={17} aria-hidden="true" />
              Workspace insight
            </span>
            <ChevronDown size={17} aria-hidden="true" />
          </button>
          <AnimatePresence initial={false}>
            {insightsOpen && (
              <motion.div
                className={css.insightPanel}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              >
                <p>
                  Drag cards to tune priority, favorite the sparks worth
                  revisiting, and use search shortcuts to jump without breaking
                  flow.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <SkeletonGrid />
          ) : isError ? (
            <EmptyState
              title="The notebook could not sync"
              copy="Check your connection or session, then try again."
              actionLabel="Retry"
              onAction={() => queryClient.invalidateQueries({ queryKey: ["notes"], exact: false })}
            />
          ) : orderedNotes.length ? (
            <Reorder.Group
              as="ul"
              axis="y"
              values={orderedNotes}
              onReorder={setOrderedNotes}
              className={css.noteGrid}
            >
              <AnimatePresence mode="popLayout">
                {orderedNotes.map((note, index) => (
                  <MemoNoteCard
                    key={note._id}
                    note={note}
                    index={index}
                    expanded={expandedNote === note._id}
                    favorite={favorites.has(note._id)}
                    onExpand={() =>
                      setExpandedNote((current) => (current === note._id ? null : note._id))
                    }
                    onFavorite={() => toggleFavorite(note._id)}
                    onDelete={() => handleDelete(note)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setContextMenu({ note, x: event.clientX, y: event.clientY });
                    }}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          ) : (
            <EmptyState
              title="A beautiful blank page"
              copy="Start with one note and the workspace will shape around your thinking."
              actionLabel="Create first note"
              onAction={() => setCreateOpen(true)}
            />
          )}

          {totalPages > 1 && (
            <nav className={css.pagination} aria-label="Notes pages">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(value - 1, 1))}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item === page ? css.currentPage : ""}
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </motion.div>

      <RippleButton
        className={css.fab}
        type="button"
        aria-label="Create note"
        data-tooltip="Create note"
        onClick={() => setCreateOpen(true)}
      >
        <Plus size={24} aria-hidden="true" />
      </RippleButton>

      <CreateNoteDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => showToast("Note created")}
      />

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            className={css.contextMenu}
            role="menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            initial={{ opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 320, damping: 25 }}
          >
            <button type="button" role="menuitem" onClick={() => toggleFavorite(contextMenu.note._id)}>
              <Heart size={15} aria-hidden="true" />
              Favorite
            </button>
            <Link role="menuitem" href={`/notes/${contextMenu.note._id}`}>
              <Archive size={15} aria-hidden="true" />
              Open details
            </Link>
            <button type="button" role="menuitem" onClick={() => handleDelete(contextMenu.note)}>
              <Trash2 size={15} aria-hidden="true" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={css.toast}
            role="status"
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
          >
            <Circle size={10} aria-hidden="true" />
            <span>{toast.message}</span>
            {toast.action && (
              <button type="button" onClick={handleUndo} disabled={undoMutation.isPending}>
                {undoMutation.isPending ? "Restoring..." : toast.action}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function AmbientBackground({
  x,
  y,
  reduced,
}: {
  x: ReturnType<typeof useSpring>;
  y: ReturnType<typeof useSpring>;
  reduced: boolean;
}) {
  return (
    <div className={css.ambient} aria-hidden="true">
      <motion.div
        className={css.aurora}
        style={reduced ? undefined : { x, y }}
      />
      <div className={css.noise} />
      <div className={css.particles}>
        {particles.map((particle) => (
          <span
            key={particle.id}
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              transform: `scale(${particle.scale})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeSwitch({
  value,
  onChange,
}: {
  value: ThemeMode;
  onChange: (value: ThemeMode) => void;
}) {
  const options: Array<{ value: ThemeMode; label: string; icon: LucideIcon }> = [
    { value: "dark", label: "Dark theme", icon: Moon },
    { value: "light", label: "Light theme", icon: Sun },
    { value: "system", label: "System theme", icon: Circle },
  ];

  return (
    <div className={css.themeSwitch} role="group" aria-label="Theme">
      {options.map((option) => {
        const Icon = option.icon;
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {active && <motion.span layoutId="theme-pill" className={css.themePill} />}
            <Icon size={15} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix = "",
  icon: Icon,
  delay,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  delay: number;
}) {
  return (
    <motion.div
      className={css.metricCard}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 23 }}
    >
      <span>
        <Icon size={17} aria-hidden="true" />
      </span>
      <strong>
        {value}
        {suffix}
      </strong>
      <small>{label}</small>
    </motion.div>
  );
}

function RippleButton({
  className,
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 160, damping: 16 });
  const springY = useSpring(y, { stiffness: 160, damping: 16 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      {...props}
      className={className}
      style={prefersReducedMotion ? undefined : { x: springX, y: springY }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      onPointerMove={(event) => {
        if (prefersReducedMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.12);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.12);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.3;
        const id = Date.now();

        setRipples((current) => [
          ...current,
          {
            id,
            x: event.clientX - rect.left - size / 2,
            y: event.clientY - rect.top - size / 2,
            size,
          },
        ]);

        window.setTimeout(() => {
          setRipples((current) => current.filter((ripple) => ripple.id !== id));
        }, 620);

        onClick?.(event);
      }}
    >
      {children}
      <span className={css.rippleLayer} aria-hidden="true">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
      </span>
    </motion.button>
  );
}

function NoteCard({
  note,
  index,
  expanded,
  favorite,
  onExpand,
  onFavorite,
  onDelete,
  onContextMenu,
}: {
  note: Note;
  index: number;
  expanded: boolean;
  favorite: boolean;
  onExpand: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 180, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 18 });

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(y * -7);
    rotateY.set(x * 7);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <Reorder.Item
      value={note}
      as="li"
      className={css.noteCard}
      onClick={onExpand}
      onContextMenu={onContextMenu}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.94 }}
      whileHover={prefersReducedMotion ? undefined : { y: -7, scale: 1.012 }}
      whileDrag={{ scale: 1.035, zIndex: 12 }}
      transition={{
        delay: Math.min(index * 0.035, 0.28),
        type: "spring",
        stiffness: 190,
        damping: 22,
      }}
      style={prefersReducedMotion ? undefined : { rotateX, rotateY }}
      tabIndex={0}
      role="button"
      aria-expanded={expanded}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onExpand();
        }
      }}
    >
      <div className={css.noteCardGlow} />
      <div className={css.cardTopline}>
        <span className={css.noteTag}>
          <Tag size={13} aria-hidden="true" />
          {note.tag}
        </span>
        <span className={css.noteDate}>{formatDate(note.createdAt)}</span>
      </div>

      <div className={css.cardTitleRow}>
        <h3>{note.title}</h3>
        <div className={css.cardActions}>
          <button
            className={`${css.iconButton} ${favorite ? css.favoriteActive : ""}`}
            type="button"
            aria-label={favorite ? "Remove note from favorites" : "Favorite note"}
            aria-pressed={favorite}
            data-tooltip="Favorite"
            onClick={(event) => {
              event.stopPropagation();
              onFavorite();
            }}
          >
            <motion.span
              animate={favorite ? { scale: [1, 1.35, 1], rotate: [0, -8, 0] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <Heart size={17} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
            </motion.span>
          </button>
          <button
            className={css.iconButton}
            type="button"
            aria-label="More note actions"
            data-tooltip="Actions"
            onClick={(event) => {
              event.stopPropagation();
              const syntheticEvent = {
                ...event,
                preventDefault: () => event.preventDefault(),
                clientX: event.clientX,
                clientY: event.clientY,
              } as React.MouseEvent;
              onContextMenu(syntheticEvent);
            }}
          >
            <MoreHorizontal size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className={css.notePreview}>{note.content || "No preview yet. Open the note and give it a voice."}</p>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className={css.expandedNote}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <p>{note.content || "This note is ready for detail."}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={css.cardFooter}>
        <span>
          <GripVertical size={15} aria-hidden="true" />
          Drag to reorder
        </span>
        <div>
          <Link
            href={`/notes/${note._id}`}
            onClick={(event) => event.stopPropagation()}
          >
            Details
          </Link>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

const MemoNoteCard = memo(NoteCard);

function SkeletonGrid() {
  return (
    <ul className={css.skeletonGrid} aria-label="Loading notes">
      {Array.from({ length: 6 }, (_, index) => (
        <motion.li
          key={index}
          className={css.skeletonCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <span />
          <strong />
          <p />
          <p />
          <small />
        </motion.li>
      ))}
    </ul>
  );
}

function EmptyState({
  title,
  copy,
  actionLabel,
  onAction,
}: {
  title: string;
  copy: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <motion.div
      className={css.emptyState}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 190, damping: 24 }}
    >
      <motion.div
        className={css.emptyIllustration}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
        <Sparkles size={28} />
      </motion.div>
      <h3>{title}</h3>
      <p>{copy}</p>
      <RippleButton className={css.primaryButton} type="button" onClick={onAction}>
        <Plus size={18} aria-hidden="true" />
        {actionLabel}
      </RippleButton>
    </motion.div>
  );
}
