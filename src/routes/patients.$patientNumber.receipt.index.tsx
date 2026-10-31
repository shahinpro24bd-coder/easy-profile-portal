import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/patients/$patientNumber/receipt/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/patients/$patientNumber/receipt/new", params });
  },
});
