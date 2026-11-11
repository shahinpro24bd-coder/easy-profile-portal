import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/stuffs/page";

export const Route = createFileRoute("/stuffs/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Staff & Payroll — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Staff & Payroll." },
      { property: "og:title", content: "Staff & Payroll — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Staff & Payroll." },
    ],
  }),
  component: Page,
});
