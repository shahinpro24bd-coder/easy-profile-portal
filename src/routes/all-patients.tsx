import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/all-patients/page";

export const Route = createFileRoute("/all-patients")({
  head: () => ({
    meta: [
      { title: "Daily Patients — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Daily Patients." },
      { property: "og:title", content: "Daily Patients — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Daily Patients." },
    ],
  }),
  component: Page,
});
