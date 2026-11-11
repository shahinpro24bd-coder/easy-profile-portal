import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/patient/[patientNumber]/page";

export const Route = createFileRoute("/patient/$patientNumber")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Patient — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Patient." },
      { property: "og:title", content: "Patient — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Patient." },
    ],
  }),
  component: Page,
});
