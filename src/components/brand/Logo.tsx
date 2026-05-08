import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold shadow-gold">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3h6v3l1.5 2v10a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3V8L9 6V3z" strokeLinejoin="round" />
          <path d="M10.5 3V1.5h3V3" strokeLinecap="round" />
          <path d="M8 12h8" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <div className="flex flex-col leading-tight">
          <span className="font-serif text-lg tracking-wide text-foreground">Nicolly Cinthia</span>
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold">Nail Club</span>
        </div>
      )}
    </div>
  );
}
