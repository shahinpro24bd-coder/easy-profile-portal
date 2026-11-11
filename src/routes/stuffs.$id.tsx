import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/stuffs/[id]/page";

export const Route = createFileRoute("/stuffs/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Staff Profile — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Staff Profile." },
      { property: "og:title", content: "Staff Profile — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Staff Profile." },
    ],
  }),
  component: Page,
});
