import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Crown, LogOut, Sparkles, MapPin, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";

export const Route = createFileRoute("/cliente/dashboard")({
  head: () => ({
    meta: [{ title: "Meu Clube — Nicolly Cinthia Nail Club" }],
  }),
  component: () => (
    <RoleGuard allow="client">
      <ClientPortal />
    </RoleGuard>
  ),
});

interface ClientData {
  id: string;
  status: string;
  address: string | null;
  neighborhood: string | null;
  plan: { name: string; price: number; weekly_limit: number; services: string[] } | null;
  profile: { name: string; email: string; phone: string | null } | null;
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  active: { label: "Ativa", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  pending: { label: "Aguardando ativação", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  delayed: { label: "Atrasada", cls: "bg-red-100 text-red-800 border-red-200" },
  cancelled: { label: "Cancelada", cls: "bg-zinc-100 text-zinc-700 border-zinc-200" },
};

function ClientPortal() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      const [{ data: client }, { data: profile }] = await Promise.all([
        supabase
          .from("clients")
          .select("id, status, address, neighborhood, plan:plans(name, price, weekly_limit, services)")
          .eq("user_id", session.user.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("name, email, phone")
          .eq("id", session.user.id)
          .maybeSingle(),
      ]);
      setData({
        id: client?.id ?? "",
        status: client?.status ?? "pending",
        address: client?.address ?? null,
        neighborhood: client?.neighborhood ?? null,
        plan: (client?.plan as ClientData["plan"]) ?? null,
        profile: profile ?? null,
      });
      setLoading(false);
    })();
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-shimmer rounded-full bg-gradient-gold" />
      </div>
    );
  }

  const status = data?.status ?? "pending";
  const badge = statusLabel[status] ?? statusLabel.pending;

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
          <span className="text-xs uppercase tracking-[0.35em] text-gold">Seu clube</span>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">
            Olá, <span className="italic text-gradient-gold">{data?.profile?.name?.split(" ")[0] ?? "querida"}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Aqui está tudo sobre sua experiência no clube.</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="animate-fade-up-delay-1 rounded-3xl border border-gold/30 bg-gradient-luxe p-8 shadow-luxe lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.35em] text-gold">Plano ativo</span>
                <h2 className="mt-2 font-serif text-3xl">{data?.plan?.name ?? "Nenhum plano"}</h2>
                {data?.plan && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    R$ {data.plan.price.toFixed(2).replace(".", ",")} / mês · {data.plan.weekly_limit} atendimentos por semana
                  </p>
                )}
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
            </div>

            {data?.plan?.services && data.plan.services.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {data.plan.services.map((s) => (
                  <span key={s} className="rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-foreground">{s}</span>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                disabled={status !== "active"}
                onClick={() =>
                  status === "active"
                    ? toast.info("Agendamento em breve.")
                    : toast.error("Sua assinatura precisa estar ativa para realizar novos agendamentos.")
                }
                className="bg-gradient-gold text-white shadow-gold hover:opacity-95"
              >
                <Calendar className="mr-2 h-4 w-4" /> Agendar atendimento
              </Button>
              {!data?.plan && (
                <Button asChild variant="outline">
                  <Link to="/">Ver planos</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="animate-fade-up-delay-2 rounded-3xl border border-border bg-card p-8 shadow-soft">
            <Sparkles className="h-6 w-6 text-gold" />
            <h3 className="mt-4 font-serif text-2xl">Esta semana</h3>
            <p className="mt-2 text-sm text-muted-foreground">Agendamentos disponíveis</p>
            <p className="mt-6 font-serif text-5xl">
              <span className="text-foreground">{data?.plan?.weekly_limit ?? 0}</span>
              <span className="text-muted-foreground/60"> / {data?.plan?.weekly_limit ?? 0}</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Renovação toda segunda-feira</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-soft lg:col-span-2">
            <h3 className="font-serif text-2xl">Próximo atendimento</h3>
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-muted-foreground">
              <Heart className="h-5 w-5 text-gold" />
              <p className="text-sm">Você ainda não tem nenhum atendimento agendado. Quando estiver tudo pronto, sua assinatura será ativada.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
            <MapPin className="h-6 w-6 text-gold" />
            <h3 className="mt-4 font-serif text-2xl">Endereço</h3>
            <p className="mt-2 text-sm text-muted-foreground">{data?.address ?? "Endereço ainda não cadastrado."}</p>
            {data?.neighborhood && <p className="mt-1 text-xs text-muted-foreground">{data.neighborhood}</p>}
            <Button variant="ghost" size="sm" className="mt-4 px-0 text-gold hover:text-gold" onClick={() => toast.info("Edição de dados em breve.")}>
              Editar dados →
            </Button>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gradient-rose/40 p-5 text-sm text-foreground">
          <Crown className="h-5 w-5 text-gold" />
          <p>Você faz parte de um clube com apenas 20 vagas. Aproveite cada detalhe — você merece.</p>
        </div>
      </main>
    </div>
  );
}
