import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import NotesClient from "./Notes.client";
import { Metadata } from "next";

type Props = {
  params: { slug: string[] };
};

// Generate dynamic metadata for the note page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const currentTag = slug[0];
  return {
    title: `Category: ${currentTag === "all" ? "All Notes" : currentTag}`,
    description: `Notes in the ${currentTag === "all" ? "all categories" : currentTag} category`,
    openGraph: {
      title: `Category: ${currentTag === "all" ? "All Notes" : currentTag}`,
      description: `Notes in the ${currentTag === "all" ? "all categories" : currentTag} category`,
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

//
export default async function FilteredNotesPage({ params }: Props) {
  const { slug } = await params;
  const currentTag = slug[0];

  const tag = currentTag === "all" ? "" : currentTag;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", tag],
    queryFn: () => fetchNotes({ tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section>
        <h2 style={{ marginBottom: "20px" }}>
          Category: {currentTag === "all" ? "All Notes" : currentTag}
        </h2>

        <NotesClient tag={tag} />
      </section>
    </HydrationBoundary>
  );
}
