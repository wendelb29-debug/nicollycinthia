import { createFileRoute, Navigate } from "@tanstack/react-router";

// Legacy route — keep stable URL by redirecting to /cliente/dashboard.
export const Route = createFileRoute("/cliente")({
  component: () => <Navigate to="/cliente/dashboard" replace />,
});
