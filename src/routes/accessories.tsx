import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/accessories/page";

export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { title: "Accessories — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Accessories." },
      { property: "og:title", content: "Accessories — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Accessories." },
    ],
  }),
  component: Page,
});
