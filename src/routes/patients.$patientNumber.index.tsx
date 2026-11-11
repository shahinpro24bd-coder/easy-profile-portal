import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/patients/[patientNumber]/page";

export const Route = createFileRoute("/patients/$patientNumber/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Patient Profile — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Patient Profile." },
      { property: "og:title", content: "Patient Profile — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Patient Profile." },
    ],
  }),
  component: Page,
});
