import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/patient/new/page";

export const Route = createFileRoute("/patient/new")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Patient Registration — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Patient Registration." },
      { property: "og:title", content: "Patient Registration — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Patient Registration." },
    ],
  }),
  component: Page,
});
