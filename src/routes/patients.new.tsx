import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/patients/new/page";

export const Route = createFileRoute("/patients/new")({
  head: () => ({
    meta: [
      { title: "New Patient — Luckydental" },
      { name: "description", content: "Luckydental dental care system: New Patient." },
      { property: "og:title", content: "New Patient — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: New Patient." },
    ],
  }),
  component: Page,
});
