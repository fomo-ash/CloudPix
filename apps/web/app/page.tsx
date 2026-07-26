"use client";

import { useCallback, useState } from "react";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { UploadCard, type SelectedFile } from "@/components/upload-card";
import { UploadStatus } from "@/components/upload-status";
import { ImagePreview } from "@/components/image-preview";
import { OCRCard } from "@/components/ocr-card";
import {
  PipelineVisualization,
  type PipelineStage,
} from "@/components/pipeline-visualization";
import { RecentUploadsTable } from "@/components/recent-uploads-table";
import { Footer } from "@/components/footer";
import { extractUploadId } from "@/lib/utils";
import type { UploadStatusResponse } from "@/lib/api";

import {
  Upload,
  CloudUpload,
  MessageSquare,
  Cpu,
  Minimize2,
  ScanText,
  CheckCircle2,
} from "lucide-react";

/* ─── Flow State ─── */

type UploadFlowState =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

/* ─── Pipeline stage derivation ─── */

function getPipelineStages(flowState: UploadFlowState): PipelineStage[] {
  const stageOf = (
    _id: string,
    ...activeStates: UploadFlowState[]
  ): PipelineStage["status"] => {
    if (flowState === "failed") {
      const order: UploadFlowState[] = ["idle", "uploading", "processing", "completed"];
      const currentIdx = order.indexOf("processing");
      const stageIdx = activeStates.reduce(
        (max, s) => Math.max(max, order.indexOf(s)),
        -1
      );
      if (stageIdx < currentIdx) return "success";
      if (_id === "completed") return "failed";
      return "pending";
    }

    const order: UploadFlowState[] = ["idle", "uploading", "processing", "completed"];
    const currentIdx = order.indexOf(flowState);
    const stageIdx = activeStates.reduce(
      (max, s) => Math.max(max, order.indexOf(s)),
      -1
    );

    if (stageIdx < currentIdx) return "success";
    if (stageIdx === currentIdx) return "active";
    return "pending";
  };

  return [
    { id: "upload", label: "Upload", icon: <Upload className="h-3.5 w-3.5" />, status: stageOf("upload", "uploading") },
    { id: "s3", label: "AWS S3", icon: <CloudUpload className="h-3.5 w-3.5" />, status: stageOf("s3", "uploading") },
    { id: "sqs", label: "AWS SQS", icon: <MessageSquare className="h-3.5 w-3.5" />, status: stageOf("sqs", "processing") },
    { id: "worker", label: "Worker", icon: <Cpu className="h-3.5 w-3.5" />, status: stageOf("worker", "processing") },
    { id: "sharp", label: "Compression", icon: <Minimize2 className="h-3.5 w-3.5" />, status: stageOf("sharp", "processing") },
    { id: "ocr", label: "OCR", icon: <ScanText className="h-3.5 w-3.5" />, status: stageOf("ocr", "processing") },
    { id: "completed", label: "Completed", icon: <CheckCircle2 className="h-3.5 w-3.5" />, status: stageOf("completed", "completed") },
  ];
}

/* ─── Page ─── */

export default function Home() {
  const [flowState, setFlowState] = useState<UploadFlowState>("idle");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [result, setResult] = useState<UploadStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback((file: SelectedFile | null) => {
    setSelectedFile(file);
    if (!file) {
      setFlowState("idle");
      setUploadId(null);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleUploadComplete = useCallback((s3Key: string) => {
    const id = extractUploadId(s3Key);
    setUploadId(id);
    setFlowState("processing");
    setError(null);
  }, []);

  const handleUploadError = useCallback((msg: string) => {
    setFlowState("failed");
    setError(msg);
  }, []);

  const handleProcessingComplete = useCallback(
    (data: UploadStatusResponse) => {
      setResult(data);
      setFlowState("completed");
      setTimeout(() => {
        const el = document.getElementById("results-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    },
    []
  );

  const handleProcessingFailed = useCallback((msg: string) => {
    setFlowState("failed");
    setError(msg);
  }, []);

  const handleReset = useCallback(() => {
    if (selectedFile) URL.revokeObjectURL(selectedFile.preview);
    setFlowState("idle");
    setSelectedFile(null);
    setUploadId(null);
    setResult(null);
    setError(null);
  }, [selectedFile]);

  const [showDemoPreview, setShowDemoPreview] = useState(false);

  const isUploadDisabled =
    flowState === "processing" || flowState === "uploading";

  const scrollToResults = () => {
    const el = document.getElementById("results-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-20 lg:py-24 flex flex-col gap-[96px]">
        {/* Upload + Pipeline — equal 2-column layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left — Upload */}
          <div className="space-y-6">
            <UploadCard
              onFileSelected={handleFileSelected}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              disabled={isUploadDisabled}
            />

            {/* Demo toggle when idle */}
            {flowState === "idle" && (
              <div className="flex items-center justify-between rounded-[12px] border border-[var(--color-graphite)] bg-[var(--color-ink)] px-4 py-3">
                <span className="text-xs text-[var(--color-steel)]">
                  Want to inspect the processing card & size increase notice?
                </span>
                <button
                  onClick={() => setShowDemoPreview(!showDemoPreview)}
                  className="text-xs font-medium text-[var(--color-copper)] transition-colors hover:text-[var(--color-copper)]/80 cursor-pointer underline underline-offset-4"
                >
                  {showDemoPreview ? "Hide Sample Preview" : "Show Sample Preview"}
                </button>
              </div>
            )}

            {/* Processing status */}
            {flowState === "processing" && uploadId && (
              <UploadStatus
                uploadId={uploadId}
                onCompleted={handleProcessingComplete}
                onFailed={handleProcessingFailed}
              />
            )}

            {/* Completed state callout */}
            {flowState === "completed" && (
              <div className="animate-[fade-in_0.25s_ease-out] rounded-[14px] border border-[var(--color-status-success)]/30 bg-[var(--color-status-success)]/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-status-success)]" />
                  <span className="text-xs font-medium text-[var(--color-bone)]">
                    Processing Finished! Results available below.
                  </span>
                </div>
                <button
                  onClick={scrollToResults}
                  className="text-xs font-semibold text-[var(--color-status-success)] hover:underline cursor-pointer"
                >
                  View Results ↓
                </button>
              </div>
            )}

            {/* Error state */}
            {flowState === "failed" && error && (
              <div className="animate-[fade-in_0.25s_ease-out] rounded-[16px] border border-[#ff6363]/20 p-5 bg-[var(--color-ink)]">
                <p className="text-sm font-medium text-[#ff6363]">
                  Something went wrong
                </p>
                <p className="mt-1 text-xs text-[var(--color-ash)]">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 text-xs font-medium text-[#ff6363] transition-colors hover:text-[#ff6363]/80 cursor-pointer"
                >
                  Try again →
                </button>
              </div>
            )}
          </div>

          {/* Right — Pipeline */}
          <div>
            <PipelineVisualization stages={getPipelineStages(flowState)} />
          </div>
        </div>

        {/* Demo Preview Card when toggled */}
        {flowState === "idle" && showDemoPreview && (
          <div id="demo-results-section" className="space-y-12 animate-[fade-in_0.3s_ease-out]">
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-copper)]/30 bg-[var(--color-copper)]/10 px-4 py-2 text-xs text-[var(--color-copper)] font-mono">
              <span>DEMO MODE: Displaying sample results with +20.8% processed size increase notice</span>
              <button onClick={() => setShowDemoPreview(false)} className="hover:underline cursor-pointer">Close</button>
            </div>
            <ImagePreview
              originalPreviewUrl="/test-cloudpix.png"
              processedUrl="/test-cloudpix.png"
              thumbnailUrl="/test-cloudpix.png"
              originalSize={122880}
              processedSize={148480}
            />
            <OCRCard ocrText="CLOUDPIX DEMO PIPELINE OK - OCR TEXT DETECTED: FORMAT AWARE COMPRESSION SUCCESSFUL" />
          </div>
        )}

        {/* Completed Results — full width below */}
        {flowState === "completed" && result && (
          <div id="results-section" className="space-y-12 scroll-mt-24 animate-[fade-in_0.35s_ease-out]">
            <ImagePreview
              originalPreviewUrl={selectedFile?.preview ?? result.originalUrl ?? ""}
              processedKey={result.processedKey}
              thumbnailKey={result.thumbnailKey}
              processedUrl={result.processedUrl}
              thumbnailUrl={result.thumbnailUrl}
              originalSize={selectedFile?.file?.size}
            />
            <OCRCard ocrText={result.ocrText} />
            <button
              onClick={handleReset}
              className="text-sm font-medium text-[#ff6363] transition-colors hover:text-[#ff6363]/80 cursor-pointer"
            >
              ← Upload another image
            </button>
          </div>
        )}

        {/* Recent Uploads — full width */}
        <div>
          <RecentUploadsTable />
        </div>
      </main>

      <Footer />
    </div>
  );
}
