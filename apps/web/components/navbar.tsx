import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, X, Zap, HardDrive, MessageSquare, Cpu, CheckCircle2, Layers, Download, Globe } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [showDocsModal, setShowDocsModal] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Uploads", href: "/uploads" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 pointer-events-none">
        <header className="pointer-events-auto flex h-12 w-full max-w-[800px] items-center justify-between px-4 rounded-[12px] border border-[var(--color-graphite)] bg-[rgba(17,18,20,0.7)] backdrop-blur-md shadow-lg transition-all">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-4 w-4 rotate-45 rounded-[2px] bg-[#ff6363] shadow-[0_0_12px_rgba(255,99,99,0.5)]" />
            <span className="text-[13px] font-medium tracking-tight text-[var(--color-pure-white)]">
              CloudPix
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-3 py-1 text-[13px] font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "bg-[var(--color-slate)] text-[var(--color-pure-white)] shadow-sm"
                      : "text-[var(--color-ash)] hover:text-[var(--color-pure-white)] hover:bg-[var(--color-obsidian)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={() => setShowDocsModal(true)}
              className="px-2.5 py-1 text-[12px] font-mono text-[var(--color-electric-sky)] bg-[var(--color-electric-sky)]/10 hover:bg-[var(--color-electric-sky)]/20 rounded-md border border-[var(--color-electric-sky)]/20 transition-all cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <BookOpen className="h-3 w-3" /> System Note
            </button>
          </nav>

          {/* Right side (Action) */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[28px] items-center justify-center rounded-[8px] bg-[var(--color-mist)] px-3 text-[13px] font-medium text-[var(--color-iron)] transition-colors hover:bg-[#d0d0d0]"
          >
            GitHub
          </a>
        </header>
      </div>

      {/* Docs System Design Quick Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-[800px] max-h-[85vh] overflow-y-auto rounded-[24px] border border-[var(--color-graphite)] bg-[var(--color-ink)] p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setShowDocsModal(false)}
              className="absolute top-5 right-5 text-[var(--color-smoke)] hover:text-[var(--color-pure-white)] transition-colors cursor-pointer p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6363]/10 text-[#ff6363]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-pure-white)]">
                  CloudPix System Design Note
                </h2>
                <p className="text-xs text-[var(--color-smoke)]">
                  Event-Driven Asynchronous Image Processing Architecture
                </p>
              </div>
            </div>

            <div className="text-xs sm:text-sm leading-relaxed text-[var(--color-mist)] space-y-4 border-t border-[var(--color-graphite)] pt-4">
              <p>
                CloudPix uses an <strong>Event-Driven Microservices Architecture</strong>. User browser uploads post directly to AWS S3 bucket via pre-signed S3 POST URLs. S3 emits an <code className="text-[var(--color-electric-sky)] font-mono">ObjectCreated</code> notification event to AWS SQS queue, which triggers background workers for Sharp compression and Tesseract OCR text extraction.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-[var(--color-graphite)] bg-[var(--color-obsidian)] p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--color-electric-sky)] font-mono">
                    <span>1. Ingestion</span> <HardDrive className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-medium text-[var(--color-pure-white)]">S3 Pre-Signed Upload</p>
                  <p className="text-[11px] text-[var(--color-smoke)]">Direct browser-to-bucket upload bypasses API memory limits.</p>
                </div>

                <div className="rounded-xl border border-[var(--color-graphite)] bg-[var(--color-obsidian)] p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--color-info-blue)] font-mono">
                    <span>2. Queue</span> <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-medium text-[var(--color-pure-white)]">AWS SQS Decoupling</p>
                  <p className="text-[11px] text-[var(--color-smoke)]">SQS queues events so upload ingestion is completely non-blocking.</p>
                </div>

                <div className="rounded-xl border border-[var(--color-graphite)] bg-[var(--color-obsidian)] p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#ff6363] font-mono">
                    <span>3. Worker</span> <Cpu className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-medium text-[var(--color-pure-white)]">Sharp & Tesseract OCR</p>
                  <p className="text-[11px] text-[var(--color-smoke)]">Worker pulls SQS, compresses images, and extracts text.</p>
                </div>

                <div className="rounded-xl border border-[var(--color-graphite)] bg-[var(--color-obsidian)] p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--color-success-green)] font-mono">
                    <span>4. DB & CDN</span> <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-medium text-[var(--color-pure-white)]">Postgres & Cloudflare R2</p>
                  <p className="text-[11px] text-[var(--color-smoke)]">Metadata saved in Postgres & assets served over Cloudflare CDN.</p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-graphite)] bg-[var(--color-obsidian)] p-4 space-y-2">
                <p className="text-xs font-medium text-[var(--color-pure-white)] flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[var(--color-electric-sky)]" /> Private S3 & Pre-Signed GET URLs Architecture
                </p>
                <p className="text-[11px] text-[var(--color-ash)] leading-normal">
                  The S3 bucket remains strictly private. The API backend uses <code className="text-[var(--color-electric-sky)]">generatePresignedGetUrl(key)</code> from <code className="text-[var(--color-electric-sky)]">@cloudpix/aws</code> to return secure <code className="text-[var(--color-pure-white)]">processedUrl</code> and <code className="text-[var(--color-pure-white)]">thumbnailUrl</code> links while keeping <code className="text-[var(--color-pure-white)]">processedKey</code> and <code className="text-[var(--color-pure-white)]">thumbnailKey</code> for debugging.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/docs"
                onClick={() => setShowDocsModal(false)}
                className="text-xs font-medium text-[var(--color-electric-sky)] hover:underline"
              >
                View Full Documentation Page →
              </Link>
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-1.5 text-xs font-medium bg-[var(--color-mist)] text-[var(--color-iron)] rounded-lg hover:bg-[#d0d0d0] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
