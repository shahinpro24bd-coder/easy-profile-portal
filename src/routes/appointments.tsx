import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/appointments/page";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Appointments — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Appointments." },
      { property: "og:title", content: "Appointments — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Appointments." },
    ],
  }),
  component: Page,
});
