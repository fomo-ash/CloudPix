"use client";

import { Navbar } from "@/components/navbar";
import { RecentUploadsTable } from "@/components/recent-uploads-table";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function UploadsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-void-black)] text-[var(--color-pure-white)] font-sans">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pt-32 pb-24 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-pure-white)]">
            Upload History
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ash)]">
            View and download all processed images, thumbnails, and OCR extraction history.
          </p>
        </div>

        <RecentUploadsTable />

        <div className="pt-4">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--color-electric-sky)] hover:underline"
          >
            ← Back to Dashboard & Upload
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
