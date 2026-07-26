"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  FileText,
  Zap,
  HardDrive,
  MessageSquare,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  Code,
  Globe,
  BookOpen,
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-void-black)] text-[var(--color-pure-white)] font-sans">
      <Navbar />

      <main className="mx-auto w-full max-w-[1000px] flex-1 px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-graphite)] bg-[var(--color-ink)] px-3 py-1 text-xs font-mono text-[var(--color-electric-sky)]">
            <BookOpen className="h-3.5 w-3.5" /> Documentation & System Design
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-pure-white)] sm:text-5xl">
            CloudPix System Design & Docs
          </h1>
          <p className="text-base text-[var(--color-ash)] max-w-[700px]">
            Comprehensive guide to CloudPix’s asynchronous, event-driven image processing architecture and user reference.
          </p>
        </div>

        {/* System Design Event-Driven Note */}
        <section className="mb-16 space-y-6 rounded-[20px] border border-[var(--color-graphite)] bg-[var(--color-ink)] p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6363]/10 text-[#ff6363]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-[var(--color-pure-white)]">
                System Design: Event-Driven Architecture
              </h2>
              <p className="text-xs text-[var(--color-smoke)]">
                Decoupled, non-blocking asynchronous pipeline for media processing at scale.
              </p>
            </div>
          </div>

          <div className="text-sm leading-relaxed text-[var(--color-mist)] space-y-4">
            <p>
              CloudPix is engineered as an <strong>Event-Driven Microservices System</strong>. Rather than performing heavy CPU tasks (image compression, thumbnail generation, OCR text extraction) synchronously during HTTP request handles, CloudPix delegates ingestion directly to object storage and processes work in background worker queues.
            </p>

            <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[var(--color-graphite)] bg-[var(--color-obsidian)] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--color-electric-sky)] font-mono">
                  <span>01. Ingestion</span>
                  <HardDrive className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-pure-white)]">Direct S3 Upload</h3>
                <p className="text-xs text-[var(--color-smoke)]">
                  Browser gets Pre-Signed URL from API and uploads file directly to AWS S3 bucket.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-graphite)] bg-[var(--color-obsidian)] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--color-info-blue)] font-mono">
                  <span>02. Messaging</span>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-pure-white)]">AWS SQS Event</h3>
                <p className="text-xs text-[var(--color-smoke)]">
                  S3 triggers an ObjectCreated event notification to AWS SQS queue for decoupling.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-graphite)] bg-[var(--color-obsidian)] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#ff6363] font-mono">
                  <span>03. Processing</span>
                  <Cpu className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-pure-white)]">Worker Fleet</h3>
                <p className="text-xs text-[var(--color-smoke)]">
                  Worker polls SQS, runs Sharp image compression, thumbnail generation, & Tesseract OCR.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-graphite)] bg-[var(--color-obsidian)] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--color-success-green)] font-mono">
                  <span>04. Persistence</span>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-pure-white)]">DB & Storage</h3>
                <p className="text-xs text-[var(--color-smoke)]">
                  Processed output assets are saved to S3 & metadata is stored in PostgreSQL database.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-slate)] bg-[var(--color-obsidian)] p-5 space-y-3">
              <h3 className="text-sm font-medium text-[var(--color-pure-white)] flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--color-electric-sky)]" /> Key Architectural Benefits
              </h3>
              <ul className="list-disc list-inside text-xs text-[var(--color-ash)] space-y-1.5 leading-normal">
                <li><strong className="text-[var(--color-pure-white)]">Zero API Bottlenecks:</strong> Large image uploads never block HTTP threads or exceed API gateway timeouts.</li>
                <li><strong className="text-[var(--color-pure-white)]">Elastic Scalability:</strong> Worker containers scale horizontally based on SQS Queue depth.</li>
                <li><strong className="text-[var(--color-pure-white)]">Fault Tolerance:</strong> If OCR or compression fails, SQS retries automatically via Dead Letter Queues (DLQ).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* User Reference Guide & Cloudflare R2 / CDN Note */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: User Reference Guide */}
          <section className="space-y-4 rounded-[20px] border border-[var(--color-graphite)] bg-[var(--color-ink)] p-6">
            <div className="flex items-center gap-2.5 text-[var(--color-pure-white)] font-semibold text-lg">
              <FileText className="h-5 w-5 text-[#ff6363]" /> User Quick Start Guide
            </div>
            <p className="text-xs text-[var(--color-smoke)]">
              How to upload, track, extract OCR text, and download processed assets in CloudPix.
            </p>

            <div className="space-y-3 text-xs text-[var(--color-ash)] pt-2">
              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-graphite)] text-[10px] font-mono text-[var(--color-pure-white)]">1</span>
                <div>
                  <p className="font-medium text-[var(--color-pure-white)]">Upload Image</p>
                  <p className="text-[var(--color-smoke)]">Drag & drop or select any image (PNG, JPG, WEBP up to 10MB) on the Dashboard.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-graphite)] text-[10px] font-mono text-[var(--color-pure-white)]">2</span>
                <div>
                  <p className="font-medium text-[var(--color-pure-white)]">Track Real-Time Pipeline</p>
                  <p className="text-[var(--color-smoke)]">Watch live progress indicators move through Upload → S3 → SQS → Worker → Sharp → OCR → Done.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-graphite)] text-[10px] font-mono text-[var(--color-pure-white)]">3</span>
                <div>
                  <p className="font-medium text-[var(--color-pure-white)]">View & Download Assets</p>
                  <p className="text-[var(--color-smoke)]">Copy extracted OCR text with one click and download processed compressed images and thumbnails.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Private S3 Security & Presigned GET URLs */}
          <section className="space-y-4 rounded-[20px] border border-[var(--color-graphite)] bg-[var(--color-ink)] p-6">
            <div className="flex items-center gap-2.5 text-[var(--color-pure-white)] font-semibold text-lg">
              <Globe className="h-5 w-5 text-[var(--color-electric-sky)]" /> Private S3 & Pre-Signed GET URLs
            </div>
            <p className="text-xs text-[var(--color-smoke)]">
              Zero public bucket exposure with AWS S3 pre-signed temporary URLs.
            </p>

            <div className="space-y-3 text-xs text-[var(--color-ash)] pt-2 leading-relaxed">
              <p>
                <strong className="text-[var(--color-pure-white)]">Security Architecture:</strong>
                <br />
                The S3 bucket remains completely private without open bucket policies or public ACLs. The API generates short-lived pre-signed GET URLs via <code className="text-[var(--color-electric-sky)] font-mono">generatePresignedGetUrl(key)</code> in <code className="text-[var(--color-electric-sky)] font-mono">@cloudpix/aws</code>.
              </p>
              <div className="rounded-lg bg-[var(--color-obsidian)] p-3 font-mono text-[11px] text-[var(--color-electric-sky)] border border-[var(--color-slate)]">
                // API Status Response<br />
                processedUrl: "https://s3.../processed/...?X-Amz-Signature=..."<br />
                thumbnailUrl: "https://s3.../thumbnails/...?X-Amz-Signature=..."
              </div>
              <p className="text-[var(--color-smoke)]">
                The frontend renders images and downloads assets using the securely returned pre-signed URLs directly, keeping keys (<code className="text-[var(--color-pure-white)]">processedKey</code>, <code className="text-[var(--color-pure-white)]">thumbnailKey</code>) available for debugging.
              </p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-electric-sky)] hover:underline"
          >
            ← Back to CloudPix Dashboard
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
