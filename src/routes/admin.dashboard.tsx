import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Crown, Sparkles, Calendar as CalendarIcon, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Painel Admin — Nicolly Cinthia Nail Club" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ clients: 0, active: 0, plans: 0, openConv: 0, weekAppts: 0 });

  useEffect(() => {
    (async () => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const [c, a, p, conv, ap] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("plans").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("conversations").select("id", { count: "exact", head: true }).neq("status", "resolved"),
        supabase.from("appointments").select("id", { count: "exact", head: true }).gte("scheduled_at", weekStart.toISOString()),
      ]);
      setStats({
        clients: c.count ?? 0,
        active: a.count ?? 0,
        plans: p.count ?? 0,
        openConv: conv.count ?? 0,
        weekAppts: ap.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { icon: Users, label: "Clientes cadastradas", value: stats.clients },
    { icon: Crown, label: "Assinaturas ativas", value: `${stats.active} / 20` },
    { icon: Sparkles, label: "Planos ativos", value: stats.plans },
    { icon: CalendarIcon, label: "Agendamentos da semana", value: stats.weekAppts },
    { icon: MessageCircle, label: "Conversas em aberto", value: stats.openConv },
  ];

  return (
    <AdminShell
      eyebrow="Painel administrativo"
      title="Bem-vinda, Nicolly"
      description="Visão geral do seu clube de assinatura."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="animate-fade-up rounded-3xl border border-border bg-card p-7 shadow-soft"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <c.icon className="h-5 w-5 text-gold" />
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-serif text-3xl">{c.value}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
