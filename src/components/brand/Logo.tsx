import { cn } from "@/lib/utils";
import logoSrc from "@/assets/logo-nc-transparent.png";

interface LogoProps {
  className?: string;
  /** Visual size in px (height of the logo image). Defaults to 56. */
  size?: number;
  /** When true, only renders the image without extra spacing. */
  imageOnly?: boolean;
}

export function Logo({ className, size = 56, imageOnly = false }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <img
        src={logoSrc}
        alt="Nicolly Cinthia Nail Club"
        style={{ height: size, width: "auto" }}
        className={cn(
          "select-none object-contain",
          imageOnly ? "" : "drop-shadow-[0_2px_6px_rgba(201,169,110,0.18)]"
        )}
        draggable={false}
      />
    </div>
  );
}
