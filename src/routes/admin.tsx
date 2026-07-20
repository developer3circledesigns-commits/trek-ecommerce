import { createFileRoute } from "@tanstack/react-router";
import { trekPages } from "@/lib/trek-pages";
import "@/styles/trek.css";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Trek Tamil Nadu" },
      { name: "description", content: "Sales, orders, inventory and analytics for Trek Tamil Nadu." },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" },
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
    scripts: [{ src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js", defer: true }],
  }),
  component: () => <div dangerouslySetInnerHTML={{ __html: trekPages.admin }} />,
});
