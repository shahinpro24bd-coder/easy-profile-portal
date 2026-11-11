import { createFileRoute } from "@tanstack/react-router";
import Page from "@/portal/app/smsapi/page";

export const Route = createFileRoute("/smsapi")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "SMS API — Luckydental" },
      { name: "description", content: "Luckydental dental care system: SMS API." },
      { property: "og:title", content: "SMS API — Luckydental" },
      { property: "og:description", content: "Luckydental dental care system: SMS API." },
    ],
  }),
  component: Page,
});
