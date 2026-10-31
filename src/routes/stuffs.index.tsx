import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/stuffs/page";

export const Route = createFileRoute("/stuffs/")({
  head: () => ({
    meta: [
      { title: "Staff & Payroll — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Staff & Payroll." },
      { property: "og:title", content: "Staff & Payroll — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Staff & Payroll." },
    ],
  }),
  component: Page,
});
