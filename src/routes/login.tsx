import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/hero-marble.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Nicolly Cinthia Nail Club" },
      { name: "description", content: "Acesse o portal exclusivo do clube." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && role) {
      const target =
        role === "admin" ? "/admin/dashboard"
        : role === "professional" ? "/profissional/agenda"
        : "/cliente/dashboard";
      navigate({ to: target });
    }
  }, [session, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email ou senha inválidos." : error.message);
      return;
    }
    toast.success("Bem-vinda de volta.");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="grid min-h-screen lg:grid-cols-5">
        {/* LEFT — luxury panel (desktop only) */}
        <aside className="relative hidden overflow-hidden lg:col-span-3 lg:block">
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#F2C4CE]/40 via-[#E8D5C4]/55 to-[#C9A96E]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-12 text-center">
            <Logo size={140} className="animate-fade-up" />
            <p className="animate-fade-up-delay-1 mt-10 max-w-md font-serif text-2xl italic leading-snug text-foreground/90">
              Um clube feito para mulheres que se cuidam com elegância.
            </p>
            <ul className="animate-fade-up-delay-2 mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.3em] text-foreground/70">
              <li>✦ Atendimento em domicílio</li>
              <li>✦ Apenas 20 vagas</li>
              <li>✦ Experiência 5 estrelas</li>
            </ul>
          </div>
        </aside>

        {/* RIGHT — form panel */}
        <section className="relative flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-10 sm:px-10 lg:col-span-2">
          {/* Back to site */}
          <Link
            to="/"
            className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm text-[#8B7355] transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>

          <div className="animate-fade-up w-full max-w-md" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
            <div className="rounded-3xl border border-[#EDE6DA] bg-white px-8 py-10 sm:px-10 sm:py-12">
              {/* Mobile logo */}
              <div className="mb-6 flex justify-center lg:hidden">
                <Logo size={64} />
              </div>
              {/* Desktop logo, smaller */}
              <div className="mb-6 hidden justify-center lg:flex">
                <Logo size={56} />
              </div>

              {/* Decorative divider */}
              <div className="gold-divider my-2">
                <span className="rotate-45 text-[10px] tracking-widest">◆</span>
              </div>

              <div className="mt-6 text-center">
                <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Acesso exclusivo</span>
                <h1 className="mt-3 font-serif text-4xl text-foreground">Bem-vinda de volta</h1>
                <p className="mt-2 text-sm text-muted-foreground">Entre para acessar seu clube exclusivo.</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-foreground/70">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-[#E5DCC9] bg-white focus-visible:border-gold focus-visible:ring-gold/30"
                    placeholder="voce@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-[0.2em] text-foreground/70">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-[#E5DCC9] bg-white focus-visible:border-gold focus-visible:ring-gold/30"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="btn-shimmer h-12 w-full text-white shadow-gold transition-transform hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #C9A96E, #B8935A)" }}
                >
                  {submitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="relative my-6 flex items-center">
                <span className="h-px flex-1 bg-[#EDE6DA]" />
                <span className="px-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">ou</span>
                <span className="h-px flex-1 bg-[#EDE6DA]" />
              </div>

              <Link to="/signup" className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full border-gold/60 text-gold hover:bg-gold/5 hover:text-gold"
                >
                  Inscrever-se no clube
                </Button>
              </Link>

              <div className="mt-6 flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-gold"
                  onClick={() => toast.info("Em breve. Por enquanto entre em contato pelo WhatsApp.")}
                >
                  Esqueci minha senha
                </button>
                <Link to="/signup" className="link-underline text-gold">
                  Quero fazer parte →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
