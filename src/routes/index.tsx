import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luckydental — Dental Management System" },
      { name: "description", content: "Patient management, appointments, packages and receipts for Luckydental." },
      { property: "og:title", content: "Luckydental — Dental Management System" },
      { property: "og:description", content: "Patient management, appointments, packages and receipts for Luckydental." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
