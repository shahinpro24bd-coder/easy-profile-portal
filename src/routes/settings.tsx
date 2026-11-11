import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/settings/page";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Settings — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Settings." },
      { property: "og:title", content: "Settings — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Settings." },
    ],
  }),
  component: Page,
});
