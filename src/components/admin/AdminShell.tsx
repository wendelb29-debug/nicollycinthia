import { type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Sparkles,
  MessageCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { to: "/admin/assinantes", label: "Assinantes", icon: Users },
  { to: "/admin/agenda", label: "Agenda", icon: Calendar },
  { to: "/admin/planos", label: "Planos", icon: Sparkles },
  { to: "/admin/atendimentos", label: "Atendimentos", icon: MessageCircle },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AdminShell({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate({ to: "/" });
  };

  return (
    <RoleGuard allow="admin">
      <div className="min-h-screen bg-gradient-soft md:flex">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card/80 backdrop-blur md:flex md:flex-col">
          <div className="border-b border-border px-6 py-5">
            <Link to="/"><Logo size={44} /></Link>
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-gold">Painel admin</p>
          </div>
          <nav className="flex-1 px-3 py-4">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-gradient-rose/40 text-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border px-3 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </aside>

        <div className="flex-1">
          {/* mobile top bar */}
          <header className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:hidden">
            <Link to="/"><Logo size={36} /></Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </header>
          {/* mobile nav */}
          <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card/60 px-3 py-2 md:hidden">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs",
                    active ? "bg-gradient-rose/50 text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <main className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:py-12">
            <div className="animate-fade-up">
              {eyebrow && (
                <span className="text-xs uppercase tracking-[0.35em] text-gold">{eyebrow}</span>
              )}
              <h1 className="mt-2 font-serif text-3xl md:text-4xl">{title}</h1>
              {description && (
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="mt-8">{children}</div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
