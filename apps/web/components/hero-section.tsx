import { Upload, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      {/* Gradient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-[var(--color-accent)] opacity-[0.07] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
        {/* Tag */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-xs text-[var(--color-text-muted)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-status-success)] animate-pulse" />
          Production-ready pipeline
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
          Event-Driven{" "}
          <span className="bg-gradient-to-r from-[var(--color-accent)] to-purple-400 bg-clip-text text-transparent">
            Image Processing
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          Upload images directly to AWS S3. Background workers compress, perform
          OCR and process media asynchronously.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 min-w-[180px]">
            <Upload className="h-4 w-4" />
            Upload Image
          </Button>
          <Button variant="outline" size="lg" className="gap-2 min-w-[180px]">
            <BookOpen className="h-4 w-4" />
            Documentation
          </Button>
        </div>
      </div>
    </section>
  );
}
