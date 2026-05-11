import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Admin" }] }),
  component: ConfigPage,
});

interface ChatbotCfg { enabled: boolean; bot_name: string; system_prompt: string; business_hours: string; away_message: string; }
interface AsaasCfg { environment: "sandbox" | "production"; webhook_token: string | null; }
interface UazapiCfg { base_url: string | null; instance: string | null; }
interface BookingCfg { min_cancel_hours: number; }

async function loadSetting<T>(key: string): Promise<T | null> {
  const { data } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? null;
}
async function saveSetting(key: string, value: unknown) {
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (error) throw error;
}

function ConfigPage() {
  const [chatbot, setChatbot] = useState<ChatbotCfg>({ enabled: false, bot_name: "Nicolly", system_prompt: "", business_hours: "09:00-19:00", away_message: "" });
  const [asaas, setAsaas] = useState<AsaasCfg>({ environment: "sandbox", webhook_token: "" });
  const [uazapi, setUazapi] = useState<UazapiCfg>({ base_url: "", instance: "" });
  const [booking, setBooking] = useState<BookingCfg>({ min_cancel_hours: 24 });

  useEffect(() => {
    (async () => {
      const [c, a, u, b] = await Promise.all([
        loadSetting<ChatbotCfg>("chatbot"),
        loadSetting<AsaasCfg>("asaas"),
        loadSetting<UazapiCfg>("uazapi"),
        loadSetting<BookingCfg>("booking"),
      ]);
      if (c) setChatbot(c);
      if (a) setAsaas({ environment: a.environment ?? "sandbox", webhook_token: a.webhook_token ?? "" });
      if (u) setUazapi({ base_url: u.base_url ?? "", instance: u.instance ?? "" });
      if (b) setBooking(b);
    })();
  }, []);

  const save = async (key: string, value: unknown, label: string) => {
    try { await saveSetting(key, value); toast.success(`${label} salvo.`); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminShell eyebrow="Configurações" title="Integrações e automações" description="Conecte Asaas, WhatsApp e configure o chatbot do clube.">
      <div className="space-y-6">
        {/* Asaas */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-serif text-2xl">Asaas — Pagamentos recorrentes</h2>
          <p className="mt-1 text-sm text-muted-foreground">A chave da API é armazenada como secret. Aqui você define o ambiente e o token de validação do webhook.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Ambiente</Label>
              <Select value={asaas.environment} onValueChange={(v) => setAsaas({ ...asaas, environment: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (testes)</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Token do webhook</Label>
              <Input value={asaas.webhook_token ?? ""} onChange={(e) => setAsaas({ ...asaas, webhook_token: e.target.value })} placeholder="String compartilhada com Asaas" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => save("asaas", asaas, "Asaas")} className="bg-gradient-gold text-white">Salvar</Button>
            <Button variant="outline" disabled>Testar conexão (próxima fase)</Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">A chave <code>ASAAS_API_KEY</code> será solicitada quando a integração for ativada.</p>
        </section>

        {/* Uazapi */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-serif text-2xl">Uazapi — WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">URL da instância e identificador. A API key é armazenada como secret.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Base URL</Label>
              <Input value={uazapi.base_url ?? ""} onChange={(e) => setUazapi({ ...uazapi, base_url: e.target.value })} placeholder="https://seu-uazapi.com" />
            </div>
            <div>
              <Label>Instância</Label>
              <Input value={uazapi.instance ?? ""} onChange={(e) => setUazapi({ ...uazapi, instance: e.target.value })} placeholder="ex: nailclub" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => save("uazapi", uazapi, "Uazapi")} className="bg-gradient-gold text-white">Salvar</Button>
            <Button variant="outline" disabled>Conectar / QR Code (próxima fase)</Button>
          </div>
        </section>

        {/* Chatbot */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl">Chatbot do WhatsApp</h2>
              <p className="mt-1 text-sm text-muted-foreground">Atendimento automático com IA fora do horário ou como triagem.</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Ativo</Label>
              <Switch checked={chatbot.enabled} onCheckedChange={(v) => setChatbot({ ...chatbot, enabled: v })} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div><Label>Nome do bot</Label><Input value={chatbot.bot_name} onChange={(e) => setChatbot({ ...chatbot, bot_name: e.target.value })} /></div>
            <div><Label>Horário (HH:MM-HH:MM)</Label><Input value={chatbot.business_hours} onChange={(e) => setChatbot({ ...chatbot, business_hours: e.target.value })} /></div>
          </div>
          <div className="mt-4">
            <Label>Prompt de personalidade</Label>
            <Textarea rows={5} value={chatbot.system_prompt} onChange={(e) => setChatbot({ ...chatbot, system_prompt: e.target.value })} />
          </div>
          <div className="mt-4">
            <Label>Mensagem de ausência</Label>
            <Textarea rows={2} value={chatbot.away_message} onChange={(e) => setChatbot({ ...chatbot, away_message: e.target.value })} />
          </div>
          <div className="mt-4">
            <Button onClick={() => save("chatbot", chatbot, "Chatbot")} className="bg-gradient-gold text-white">Salvar</Button>
          </div>
        </section>

        {/* Agenda */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-serif text-2xl">Regras de agendamento</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Antecedência mínima para cancelar (horas)</Label>
              <Input type="number" value={booking.min_cancel_hours} onChange={(e) => setBooking({ min_cancel_hours: Number(e.target.value) })} />
            </div>
          </div>
          <div className="mt-4"><Button onClick={() => save("booking", booking, "Regras de agendamento")} className="bg-gradient-gold text-white">Salvar</Button></div>
        </section>
      </div>
    </AdminShell>
  );
}
