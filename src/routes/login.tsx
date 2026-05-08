import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
      const target = role === "admin" ? "/admin" : role === "professional" ? "/profissional" : "/cliente";
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/70" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link to="/" className="self-start">
          <Logo />
        </Link>

        <div className="animate-fade-up mt-12 rounded-3xl border border-border/60 bg-card/90 p-10 shadow-luxe backdrop-blur-xl">
          <span className="text-xs uppercase tracking-[0.35em] text-gold">Acesso exclusivo</span>
          <h1 className="mt-3 font-serif text-4xl">Bem-vinda de volta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre para acessar seu clube.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background/80"
                placeholder="voce@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-background/80"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={submitting} className="h-12 w-full bg-gradient-gold text-white shadow-gold hover:opacity-95">
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
            <button type="button" className="hover:text-gold" onClick={() => toast.info("Em breve. Por enquanto entre em contato pelo WhatsApp.")}>
              Esqueci minha senha
            </button>
            <Link to="/signup" className="text-foreground hover:text-gold">
              Quero fazer parte →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
