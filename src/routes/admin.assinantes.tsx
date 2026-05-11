import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/assinantes")({
  head: () => ({ meta: [{ title: "Assinantes — Admin" }] }),
  component: AssinantesPage,
});

interface Row {
  id: string;
  status: string;
  created_at: string;
  profile: { name: string; email: string; phone: string | null } | null;
  plan: { name: string; price: number } | null;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "Em dia", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  pending: { label: "Pendente", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  delayed: { label: "Atrasada", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  cancelled: { label: "Cancelada", cls: "bg-red-100 text-red-800 border-red-200" },
};

function AssinantesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [plans, setPlans] = useState<{ id: string; name: string }[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: clients }, { data: profiles }, { data: pl }] = await Promise.all([
        supabase
          .from("clients")
          .select("id, status, created_at, user_id, plan:plans(id, name, price)")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, name, email, phone"),
        supabase.from("plans").select("id, name").order("name"),
      ]);
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      setRows(
        (clients ?? []).map((c: any) => ({
          id: c.id,
          status: c.status,
          created_at: c.created_at,
          profile: profileMap.get(c.user_id) ?? null,
          plan: c.plan ?? null,
        })),
      );
      setPlans(pl ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterPlan !== "all" && r.plan?.name !== filterPlan) return false;
      if (q.trim()) {
        const t = q.toLowerCase();
        const blob = `${r.profile?.name ?? ""} ${r.profile?.email ?? ""} ${r.profile?.phone ?? ""}`.toLowerCase();
        if (!blob.includes(t)) return false;
      }
      return true;
    });
  }, [rows, filterStatus, filterPlan, q]);

  return (
    <AdminShell
      eyebrow="Base de clientes"
      title="Assinantes"
      description="Acompanhe todas as clientes do clube, status e plano contratado."
    >
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou telefone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="active">Em dia</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="delayed">Atrasada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="Plano" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            {plans.map((p) => (
              <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Contato</th>
                <th className="px-5 py-3 font-medium">Plano</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Desde</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Carregando…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Nenhuma cliente encontrada.</td></tr>
              )}
              {filtered.map((r) => {
                const s = STATUS[r.status] ?? STATUS.pending;
                return (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-accent/30">
                    <td className="px-5 py-3 font-medium">{r.profile?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <div>{r.profile?.email ?? "—"}</div>
                      <div className="text-xs">{r.profile?.phone ?? ""}</div>
                    </td>
                    <td className="px-5 py-3">
                      {r.plan ? (
                        <>
                          <div>{r.plan.name}</div>
                          <div className="text-xs text-muted-foreground">R$ {r.plan.price.toFixed(2).replace(".", ",")}</div>
                        </>
                      ) : <span className="text-muted-foreground">Sem plano</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
