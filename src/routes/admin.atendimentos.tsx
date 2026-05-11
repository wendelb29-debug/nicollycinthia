import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/atendimentos")({
  head: () => ({ meta: [{ title: "Atendimentos — Admin" }] }),
  component: AtendimentosPage,
});

interface Conv {
  id: string;
  phone: string;
  status: string;
  last_message: string | null;
  last_message_at: string | null;
  client_id: string | null;
}
interface Msg {
  id: string;
  body: string;
  from_me: boolean;
  sent_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  open: "Em aberto",
  in_progress: "Em atendimento",
  waiting: "Aguardando",
  resolved: "Resolvido",
};

function AtendimentosPage() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<Conv | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  const loadConvs = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false, nullsFirst: false });
    setConvs(data ?? []);
  };

  useEffect(() => { loadConvs(); }, []);

  // realtime
  useEffect(() => {
    const ch = supabase
      .channel("admin-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, loadConvs)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (p: any) => {
        if (selected && p.new.conversation_id === selected.id) {
          setMsgs((prev) => [...prev, p.new as Msg]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected]);

  const openConv = async (c: Conv) => {
    setSelected(c);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", c.id)
      .order("sent_at");
    setMsgs(data ?? []);
  };

  const send = async () => {
    if (!text.trim() || !selected) return;
    const body = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: selected.id, body, from_me: true,
    });
    if (error) { toast.error(error.message); return; }
    await supabase.from("conversations").update({
      last_message: body, last_message_at: new Date().toISOString(),
    }).eq("id", selected.id);
    toast.info("Mensagem salva. O envio pelo WhatsApp será conectado na próxima etapa.");
  };

  const changeStatus = async (status: string) => {
    if (!selected) return;
    const { error } = await supabase.from("conversations").update({ status }).eq("id", selected.id);
    if (error) { toast.error(error.message); return; }
    setSelected({ ...selected, status });
  };

  return (
    <AdminShell eyebrow="WhatsApp" title="Central de atendimentos" description="Inbox de conversas vindas do WhatsApp.">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-border bg-card shadow-soft">
          <div className="border-b border-border px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Conversas</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {convs.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhuma conversa ainda. Conecte o WhatsApp em Configurações.</p>
            )}
            {convs.map((c) => (
              <button
                key={c.id}
                onClick={() => openConv(c)}
                className={`w-full border-b border-border/60 px-4 py-3 text-left transition hover:bg-accent/40 ${selected?.id === c.id ? "bg-accent/40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.phone}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{STATUS_LABEL[c.status] ?? c.status}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{c.last_message ?? "—"}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-[60vh] flex-col rounded-3xl border border-border bg-card shadow-soft">
          {!selected && (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 text-gold" />
              <p className="mt-3 text-sm">Selecione uma conversa para visualizar.</p>
            </div>
          )}
          {selected && (
            <>
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div>
                  <p className="font-medium">{selected.phone}</p>
                  <p className="text-xs text-muted-foreground">{selected.client_id ? "Cliente cadastrada" : "Contato novo"}</p>
                </div>
                <Select value={selected.status} onValueChange={changeStatus}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Em aberto</SelectItem>
                    <SelectItem value="in_progress">Em atendimento</SelectItem>
                    <SelectItem value="waiting">Aguardando</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-5">
                {msgs.length === 0 && <p className="text-center text-sm text-muted-foreground">Sem mensagens.</p>}
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.from_me ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.from_me ? "bg-gradient-gold text-white" : "bg-muted text-foreground"}`}>
                      <p>{m.body}</p>
                      <p className={`mt-1 text-[10px] ${m.from_me ? "text-white/70" : "text-muted-foreground"}`}>
                        {new Date(m.sent_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma resposta…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  />
                  <Button onClick={send} className="bg-gradient-gold text-white"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
