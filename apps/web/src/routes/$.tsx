"use client";

import { createFileRoute } from "@tanstack/react-router";

import { NotFoundError } from "@/components/error-boundaries";

export const Route = createFileRoute("/$")({
  component: NotFoundComponent,
});

function NotFoundComponent() {
  return <NotFoundError />;
}
