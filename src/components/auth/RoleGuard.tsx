import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/lib/auth-context";

interface RoleGuardProps {
  allow: AppRole;
  children: ReactNode;
}

/**
 * Client-side route guard. Redirects to /login when the user is not
 * authenticated, or to their own area when their role doesn't match.
 */
export function RoleGuard({ allow, children }: RoleGuardProps) {
  const navigate = useNavigate();
  const { session, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (role && role !== allow) {
      const target =
        role === "admin" ? "/admin/dashboard"
        : role === "professional" ? "/profissional/agenda"
        : "/cliente/dashboard";
      navigate({ to: target });
    }
  }, [session, role, loading, allow, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-shimmer rounded-full bg-gradient-gold" />
      </div>
    );
  }
  if (!session) return null;
  if (role && role !== allow) return null;
  return <>{children}</>;
}
