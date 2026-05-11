import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Admin" }] }),
  component: AgendaPage,
});

interface Appt {
  id: string;
  service: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  client_id: string;
  professional_id: string | null;
}

const STATUS_CLS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-sky-100 text-sky-800 border-sky-200",
  cancelled: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

function AgendaPage() {
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const [appts, setAppts] = useState<Appt[]>([]);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(anchor);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [anchor]);

  useEffect(() => {
    (async () => {
      const end = new Date(anchor);
      end.setDate(end.getDate() + 7);
      const { data } = await supabase
        .from("appointments")
        .select("id, service, scheduled_at, status, notes, client_id, professional_id")
        .gte("scheduled_at", anchor.toISOString())
        .lt("scheduled_at", end.toISOString())
        .order("scheduled_at");
      setAppts(data ?? []);

      const ids = Array.from(new Set((data ?? []).map((a) => a.client_id)));
      if (ids.length) {
        const { data: cs } = await supabase
          .from("clients")
          .select("id, user_id")
          .in("id", ids);
        const userIds = (cs ?? []).map((c) => c.user_id);
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);
        const profMap = new Map((profs ?? []).map((p) => [p.id, p.name]));
        const map: Record<string, string> = {};
        (cs ?? []).forEach((c) => { map[c.id] = profMap.get(c.user_id) ?? "Cliente"; });
        setClientNames(map);
      } else {
        setClientNames({});
      }
    })();
  }, [anchor]);

  const apptsByDay = useMemo(() => {
    const map: Record<string, Appt[]> = {};
    days.forEach((d) => (map[d.toDateString()] = []));
    appts.forEach((a) => {
      const k = new Date(a.scheduled_at).toDateString();
      if (map[k]) map[k].push(a);
    });
    return map;
  }, [appts, days]);

  const move = (delta: number) => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + delta * 7);
    setAnchor(d);
  };

  const rangeLabel = `${days[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – ${days[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`;

  return (
    <AdminShell eyebrow="Agenda" title="Semana de atendimentos" description="Visão consolidada de todos os profissionais.">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => move(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => move(1)}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setAnchor(startOfWeek(new Date()))}>Hoje</Button>
        </div>
        <p className="text-sm text-muted-foreground">{rangeLabel}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-7">
        {days.map((d) => {
          const list = apptsByDay[d.toDateString()] ?? [];
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <div
              key={d.toISOString()}
              className={`min-h-44 rounded-2xl border bg-card p-3 shadow-soft ${isToday ? "border-gold/60" : "border-border"}`}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                </p>
                <p className="font-serif text-xl">{d.getDate()}</p>
              </div>
              <div className="space-y-2">
                {list.length === 0 && <p className="text-xs text-muted-foreground/70">—</p>}
                {list.map((a) => (
                  <div key={a.id} className="rounded-xl border border-border bg-background/60 p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{new Date(a.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className={`rounded-full border px-1.5 py-0.5 text-[10px] ${STATUS_CLS[a.status] ?? STATUS_CLS.pending}`}>{a.status}</span>
                    </div>
                    <p className="mt-1 truncate font-medium">{clientNames[a.client_id] ?? "Cliente"}</p>
                    <p className="truncate text-muted-foreground">{a.service}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
