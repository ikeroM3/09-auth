import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import QueryProvider from "@/components/TanStackProvider/TanStackProvider";

import AuthProvider from "@/components/AuthProvider/AuthProvider";

export const metadata: Metadata = {
  title: "NoteHub OS - Premium Notes Workspace",
  description:
    "A polished, animated notes workspace for capturing, searching, and organizing ideas.",
  openGraph: {
    title: "NoteHub OS",
    description:
      "A polished, animated notes workspace for capturing, searching, and organizing ideas.",
    url: "https://08-zustand-one-theta.vercel.app/",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthProvider>
            <Header />
            <main className="site-main">{children}</main>
            {modal}
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
