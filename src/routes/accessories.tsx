import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/accessories/page";

export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Accessories — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Accessories." },
      { property: "og:title", content: "Accessories — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Accessories." },
    ],
  }),
  component: Page,
});
