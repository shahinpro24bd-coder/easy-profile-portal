import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/dashboard/page";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Dashboard." },
      { property: "og:title", content: "Dashboard — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Dashboard." },
    ],
  }),
  component: Page,
});
