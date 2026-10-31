import { createFileRoute, redirect } from "@tanstack/react-router";

// Daily Patients tab removed: adding a patient from Home now covers it.
export const Route = createFileRoute("/all-patients")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
