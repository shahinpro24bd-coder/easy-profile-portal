import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/public/patient/[token]/page";

export const Route = createFileRoute("/public/patient/$token")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Patient Record — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Patient Record." },
      { property: "og:title", content: "Patient Record — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Patient Record." },
    ],
  }),
  component: Page,
});
