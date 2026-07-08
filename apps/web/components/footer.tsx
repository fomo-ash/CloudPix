import { Cloud } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Cloud className="h-3.5 w-3.5" />
          <span>CloudPix</span>
          <span className="text-[var(--color-border-hover)]">·</span>
          <span>Event-Driven Image Processing</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[var(--color-text-muted)]">
          <a
            href="#"
            className="transition-colors duration-200 hover:text-[var(--color-text-secondary)]"
          >
            Documentation
          </a>
          <a
            href="#"
            className="transition-colors duration-200 hover:text-[var(--color-text-secondary)]"
          >
            GitHub
          </a>
          <a
            href="#"
            className="transition-colors duration-200 hover:text-[var(--color-text-secondary)]"
          >
            API Reference
          </a>
        </div>
      </div>
    </footer>
  );
}
