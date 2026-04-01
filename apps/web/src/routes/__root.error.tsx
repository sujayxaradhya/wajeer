"use client";

import { createFileRoute } from "@tanstack/react-router";

import { RouteError } from "@/components/error-boundaries";

export const Route = createFileRoute("/__root/error")({
  errorComponent: ErrorComponent,
});

function ErrorComponent({ error }: { error: Error }) {
  return <RouteError error={error} />;
}
