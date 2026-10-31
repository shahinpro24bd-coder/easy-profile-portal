import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/login/page";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Luckydental" },
      { name: "description", content: "Luckydental dental care system: Login." },
      { property: "og:title", content: "Login — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: Login." },
    ],
  }),
  component: Page,
});
