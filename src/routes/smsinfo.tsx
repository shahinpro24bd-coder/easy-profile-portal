import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/smsapi/page";

export const Route = createFileRoute("/smsinfo")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "SMS — Luckydental" },
      { name: "description", content: "Luckydental dental care system: SMS." },
      { property: "og:title", content: "SMS — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: SMS." },
    ],
  }),
  component: Page,
});
