import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/dashboard/page";
import DashboardLayout from "@/portal/app/dashboard/layout";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Dashboard." },
      { property: "og:title", content: "Dashboard — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Dashboard." },
    ],
  }),
  // In the original Next.js app, app/dashboard/layout.tsx wrapped this page automatically.
  component: () => (
    <DashboardLayout>
      <Page />
    </DashboardLayout>
  ),
});
