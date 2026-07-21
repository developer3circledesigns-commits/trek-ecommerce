import { createFileRoute } from "@tanstack/react-router";
import { trekPages } from "@/lib/trek-pages";
import "@/styles/trek.css";

const headExtra = {
  links: [
    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" },
    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
  ],
  scripts: [
    { src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js", defer: true },
  ],
};

export const Route = createFileRoute()({
  head: () => ({
    meta: [
      { title: "Trek Tamil Nadu — Premium Trekking Gear" },
      { name: "description", content: "Shop premium trekking gear, backpacks, footwear and accessories curated for Tamil Nadu trails." },
      { property: "og:title", content: "Trek Tamil Nadu — Premium Trekking Gear" },
      { property: "og:description", content: "Gear up for your next adventure with Trek Tamil Nadu." },
    ],
    ...headExtra,
  }),
  component: HomePage,
});

function HomePage() {
  return <div dangerouslySetInnerHTML={{ __html: trekPages.index }} />;
}
