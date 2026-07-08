"use client";

import Link from "next/link";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const navLinks = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Uploads", href: "/uploads", active: false },
  { label: "Docs", href: "/docs", active: false },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
              CloudPix
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-[var(--radius-sm)] px-3 py-1.5 text-sm transition-colors duration-200",
                  link.active
                    ? "text-[var(--color-text-primary)] bg-[var(--color-surface)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] transition-colors duration-200 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
            aria-label="GitHub"
          >
            <GitHubIcon className="h-4 w-4" />
          </a>

          {/* User avatar */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-500 text-xs font-medium text-white transition-transform duration-200 hover:scale-105 cursor-pointer"
            aria-label="User menu"
          >
            A
          </button>
        </div>
      </div>
    </header>
  );
}
