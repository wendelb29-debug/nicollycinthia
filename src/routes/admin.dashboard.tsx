import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Users, Crown, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Painel Admin — Nicolly Cinthia Nail Club" }] }),
  component: () => (
    <RoleGuard allow="admin">
      <AdminDashboard />
    </RoleGuard>
  ),
});

function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [stats, setStats] = useState({ clients: 0, active: 0, plans: 0 });

  useEffect(() => {
    (async () => {
      const [c, a, p] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("plans").select("id", { count: "exact", head: true }).eq("active", true),
      ]);
      setStats({ clients: c.count ?? 0, active: a.count ?? 0, plans: p.count ?? 0 });
    })();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate({ to: "/" });
  };

  const cards = [
    { icon: Users, label: "Clientes cadastradas", value: stats.clients },
    { icon: Crown, label: "Assinaturas ativas", value: `${stats.active} / 20` },
    { icon: Sparkles, label: "Planos ativos", value: stats.plans },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/"><Logo size={48} /></Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="animate-fade-up">
          <span className="text-xs uppercase tracking-[0.35em] text-gold">Painel administrativo</span>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">
            Bem-vinda, <span className="italic text-gradient-gold">Nicolly</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Visão geral do seu clube.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <div
              key={c.label}
              className="animate-fade-up rounded-3xl border border-border bg-card p-8 shadow-soft"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <c.icon className="h-6 w-6 text-gold" />
              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">{c.label}</p>
              <p className="mt-2 font-serif text-4xl">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center">
          <CalendarIcon className="mx-auto h-8 w-8 text-gold" />
          <h2 className="mt-4 font-serif text-2xl">Mais módulos em breve</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestão de clientes, agenda completa, lista de espera e financeiro estão na próxima iteração.
          </p>
        </div>
      </main>
    </div>
  );
}
