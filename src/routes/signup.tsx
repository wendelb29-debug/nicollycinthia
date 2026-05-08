import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/hero-marble.jpg";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Quero fazer parte — Nicolly Cinthia Nail Club" },
      { name: "description", content: "Cadastre-se no clube exclusivo. Vagas limitadas." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }
    setSubmitting(true);
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo, data: { name, phone } },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cadastro realizado. Bem-vinda ao clube!");
    navigate({ to: "/cliente" });
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
          <span className="text-xs uppercase tracking-[0.35em] text-gold">Reserve seu lugar</span>
          <h1 className="mt-3 font-serif text-4xl">Quero fazer parte</h1>
          <p className="mt-2 text-sm text-muted-foreground">Crie sua conta e finalize a assinatura em seguida.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-background/80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="h-12 bg-background/80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-background/80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-background/80" />
            </div>

            <Button type="submit" disabled={submitting} className="h-12 w-full bg-gradient-gold text-white shadow-gold hover:opacity-95">
              {submitting ? "Criando conta..." : "Criar minha conta"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-foreground hover:text-gold">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
