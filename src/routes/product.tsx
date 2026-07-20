import { createFileRoute } from "@tanstack/react-router";
import { trekPages } from "@/lib/trek-pages";
import "@/styles/trek.css";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "15 Ltr Backpack with Glow Logo — Trek Tamil Nadu" },
      { name: "description", content: "Lightweight, durable 15 Ltr backpack with glow logo — perfect for short treks and daily use." },
      { property: "og:title", content: "15 Ltr Backpack with Glow Logo" },
      { property: "og:description", content: "Water-resistant, padded straps, glow-in-the-dark logo." },
    ],
    links: [
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" },
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
    scripts: [{ src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js", defer: true }],
  }),
  component: () => <div dangerouslySetInnerHTML={{ __html: trekPages.product }} />,
});
