import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/patients/page";

export const Route = createFileRoute("/patients/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Patients — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Patients." },
      { property: "og:title", content: "Patients — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Patients." },
    ],
  }),
  component: Page,
});
