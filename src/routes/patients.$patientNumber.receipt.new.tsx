import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/patients/[patientNumber]/receipt/new/page";

export const Route = createFileRoute("/patients/$patientNumber/receipt/new")({
  head: () => ({
    meta: [
      { title: "New Receipt — Luckydental" },
      { name: "description", content: "Luckydental dental care system: New Receipt." },
      { property: "og:title", content: "New Receipt — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: New Receipt." },
    ],
  }),
  component: Page,
});
