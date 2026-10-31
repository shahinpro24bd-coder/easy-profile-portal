import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/packages/page";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Packages — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Packages." },
      { property: "og:title", content: "Packages — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Packages." },
    ],
  }),
  component: Page,
});
