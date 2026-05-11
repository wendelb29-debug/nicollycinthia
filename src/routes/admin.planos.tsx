import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/planos")({
  head: () => ({ meta: [{ title: "Planos — Admin" }] }),
  component: PlanosPage,
});

interface Plan {
  id: string;
  name: string;
  price: number;
  weekly_limit: number;
  services: string[];
  description: string | null;
  active: boolean;
}

const empty = { name: "", price: 0, weekly_limit: 2, services: "", description: "", active: true };

function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);

  const load = async () => {
    const { data } = await supabase.from("plans").select("*").order("price");
    setPlans(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Plan) => {
    setEditing(p);
    setForm({
      name: p.name, price: p.price, weekly_limit: p.weekly_limit,
      services: p.services.join(", "), description: p.description ?? "", active: p.active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || form.price < 0) { toast.error("Preencha nome e preço."); return; }
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      weekly_limit: Number(form.weekly_limit),
      services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
      description: form.description.trim() || null,
      active: form.active,
    };
    const op = editing
      ? supabase.from("plans").update(payload).eq("id", editing.id)
      : supabase.from("plans").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Plano atualizado." : "Plano criado.");
    setOpen(false);
    load();
  };

  const remove = async (p: Plan) => {
    if (!confirm(`Desativar o plano "${p.name}"?`)) return;
    const { error } = await supabase.from("plans").update({ active: false }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Plano desativado.");
    load();
  };

  return (
    <AdminShell eyebrow="Catálogo" title="Planos do clube" description="Crie e edite os planos de assinatura.">
      <div className="mb-5 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-gradient-gold text-white shadow-gold">
              <Plus className="mr-2 h-4 w-4" /> Novo plano
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar plano" : "Novo plano"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                <div><Label>Atendimentos / semana</Label><Input type="number" value={form.weekly_limit} onChange={(e) => setForm({ ...form, weekly_limit: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Serviços inclusos (separados por vírgula)</Label><Input value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} placeholder="Mão, Pé, Spa…" /></div>
              <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label>Plano ativo</Label>
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} className="bg-gradient-gold text-white">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum plano cadastrado ainda.</p>
        )}
        {plans.map((p) => (
          <div key={p.id} className={`rounded-3xl border bg-card p-6 shadow-soft ${p.active ? "border-gold/40" : "border-border opacity-60"}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-2xl">{p.name}</h3>
                <p className="mt-1 text-2xl text-gold">R$ {p.price.toFixed(2).replace(".", ",")}<span className="text-xs text-muted-foreground">/mês</span></p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] ${p.active ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                {p.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{p.weekly_limit} atendimentos/semana</p>
            {p.services.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.services.map((s) => (
                  <span key={s} className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-xs">{s}</span>
                ))}
              </div>
            )}
            {p.description && <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(p)}>Editar</Button>
              {p.active && <Button variant="ghost" size="sm" onClick={() => remove(p)} className="text-destructive hover:text-destructive"><Trash2 className="mr-1 h-3 w-3" /> Desativar</Button>}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
