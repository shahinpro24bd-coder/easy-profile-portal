import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/patient/[patientNumber]/page";

export const Route = createFileRoute("/patient/$patientNumber")({
  head: () => ({
    meta: [
      { title: "Patient — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Patient." },
      { property: "og:title", content: "Patient — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Patient." },
    ],
  }),
  component: Page,
});
