import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/settings/page";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Settings." },
      { property: "og:title", content: "Settings — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Settings." },
    ],
  }),
  component: Page,
});
