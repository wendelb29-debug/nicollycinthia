import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Crown, Heart, Star, Check } from "lucide-react";
import heroImage from "@/assets/hero-marble.jpg";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nicolly Cinthia Nail Club — Clube de Assinatura de Manicure Premium" },
      { name: "description", content: "Atendimento de manicure e pedicure em domicílio. Apenas 20 vagas. Uma experiência ultra premium para mulheres exigentes." },
      { property: "og:title", content: "Nicolly Cinthia Nail Club" },
      { property: "og:description", content: "Clube exclusivo de manicure e pedicure em domicílio." },
    ],
  }),
  component: HomePage,
});

interface Plan {
  id: string;
  name: string;
  price: number;
  weekly_limit: number;
  services: string[];
  description: string | null;
}

function HomePage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    supabase.from("plans").select("*").eq("active", true).order("price").then(({ data }) => {
      if (data) setPlans(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="absolute top-0 z-30 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
            <a href="#planos" className="transition-colors hover:text-gold">Planos</a>
            <a href="#experiencia" className="transition-colors hover:text-gold">Experiência</a>
            <a href="#depoimentos" className="transition-colors hover:text-gold">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex text-foreground hover:text-gold">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-gradient-gold text-white shadow-gold hover:opacity-95">
              <Link to="/signup">Quero fazer parte</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImage}
            alt="Mármore rosa e dourado com flores delicadas"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/70 to-background/40" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-40 pb-24 md:pt-48 md:pb-32">
          <div className="max-w-3xl">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/60 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-gold backdrop-blur">
              <Crown className="h-3.5 w-3.5" />
              Apenas 20 vagas
            </span>
            <h1 className="animate-fade-up-delay-1 mt-6 font-serif text-5xl leading-[1.05] text-foreground md:text-7xl lg:text-8xl">
              O clube mais
              <span className="block italic text-gradient-gold">exclusivo</span>
              de cuidado feminino.
            </h1>
            <p className="animate-fade-up-delay-2 mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Manicure e pedicure premium, no conforto da sua casa, com curadoria pessoal da{" "}
              <span className="font-serif italic text-foreground">Nicolly Cinthia</span>. Uma assinatura. Mãos impecáveis o ano inteiro.
            </p>
            <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-14 bg-gradient-gold px-8 text-base text-white shadow-gold hover:opacity-95">
                <Link to="/signup">Quero fazer parte</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-foreground/20 bg-white/70 px-8 text-base backdrop-blur hover:bg-white">
                <Link to="/login">Já sou assinante</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCIA */}
      <section id="experiencia" className="border-y border-border/60 bg-gradient-soft py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Atendimento em domicílio", text: "Sua casa vira um spa. Levamos toda a estrutura premium até você." },
            { icon: Heart, title: "Curadoria pessoal", text: "Esmaltes selecionados, adesivos exclusivos e técnicas refinadas." },
            { icon: Crown, title: "Vagas limitadas", text: "Apenas 20 assinantes ativas para garantir a melhor experiência." },
          ].map((item, i) => (
            <div key={i} className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-soft backdrop-blur">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-rose">
                <item.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mt-6 font-serif text-2xl">{item.title}</h3>
              <p className="mt-3 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.4em] text-gold">Planos</span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Escolha o seu ritual</h2>
            <p className="mt-4 text-muted-foreground">
              Dois atendimentos por semana. Sem fidelidade. Cancele quando quiser.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {plans.map((plan, idx) => {
              const featured = idx === 2;
              return (
                <div
                  key={plan.id}
                  className={`group relative flex flex-col rounded-3xl border p-8 transition-all hover:-translate-y-1 ${
                    featured
                      ? "border-gold/40 bg-gradient-luxe shadow-luxe"
                      : "border-border bg-card shadow-soft hover:shadow-luxe"
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-gold px-4 py-1 text-[10px] uppercase tracking-[0.3em] text-white shadow-gold">
                      Mais escolhido
                    </span>
                  )}
                  <h3 className="font-serif text-3xl">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-serif text-5xl">R${plan.price.toFixed(2).replace(".", ",")}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-gold" /> {plan.weekly_limit} atendimentos por semana
                    </li>
                    {plan.services.map((s) => (
                      <li key={s} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-gold" /> {s}
                      </li>
                    ))}
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-gold" /> Atendimento em domicílio
                    </li>
                  </ul>
                  <Button asChild className="mt-8 h-12 w-full bg-gradient-gold text-white shadow-gold hover:opacity-95">
                    <Link to="/signup">Assinar {plan.name}</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="bg-gradient-rose/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.4em] text-gold">Quem assina, ama</span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">A experiência das nossas clientes</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { name: "Marina C.", text: "É como ter um spa particular dentro de casa. Nicolly é uma joia rara — atenta, refinada, impecável." },
              { name: "Beatriz L.", text: "Mudou minha rotina. Hoje eu jamais saio com as unhas comuns. Vale cada centavo do plano." },
              { name: "Helena V.", text: "O atendimento é digno de hotel cinco estrelas. Detalhes, perfume, esmaltes lindíssimos. Apaixonada." },
            ].map((t) => (
              <div key={t.name} className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 font-serif text-lg italic leading-relaxed text-foreground">"{t.text}"</p>
                <p className="mt-6 text-sm uppercase tracking-[0.25em] text-muted-foreground">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <Logo />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            © {new Date().getFullYear()} Nicolly Cinthia Nail Club
          </p>
        </div>
      </footer>
    </div>
  );
}
