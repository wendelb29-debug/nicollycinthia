import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";

export const Route = createFileRoute("/profissional/agenda")({
  head: () => ({ meta: [{ title: "Minha Agenda — Nicolly Cinthia Nail Club" }] }),
  component: () => (
    <RoleGuard allow="professional">
      <ProfessionalAgenda />
    </RoleGuard>
  ),
});

function ProfessionalAgenda() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate({ to: "/" });
  };

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
          <span className="text-xs uppercase tracking-[0.35em] text-gold">Profissional</span>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Sua agenda</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe os próximos atendimentos do clube.</p>
        </div>

        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center">
          <CalendarIcon className="mx-auto h-8 w-8 text-gold" />
          <h2 className="mt-4 font-serif text-2xl">Agenda em construção</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Os atendimentos do dia, semana e mapa de rotas aparecerão aqui.
          </p>
        </div>
      </main>
    </div>
  );
}
