export default function Loading() {
  return (
    <section
      aria-label="Loading NoteHub OS"
      style={{
        display: "grid",
        minHeight: "calc(100vh - 76px)",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at 20% 15%, rgba(99, 102, 241, 0.18), transparent 28rem), var(--app-bg)",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 14,
          width: "min(520px, 100%)",
          padding: 24,
          border: "1px solid var(--glass-border)",
          borderRadius: 24,
          background: "var(--glass-bg)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            style={{
              width: `${94 - index * 12}%`,
              height: index === 0 ? 22 : 14,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.2), rgba(255,255,255,.06))",
              backgroundSize: "220% 100%",
              animation: "shimmer 1.35s linear infinite",
            }}
          />
        ))}
      </div>
    </section>
  );
}
