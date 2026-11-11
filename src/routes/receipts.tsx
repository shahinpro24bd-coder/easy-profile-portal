import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/receipts/page";

export const Route = createFileRoute("/receipts")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Receipts — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Receipts." },
      { property: "og:title", content: "Receipts — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Receipts." },
    ],
  }),
  component: Page,
});
