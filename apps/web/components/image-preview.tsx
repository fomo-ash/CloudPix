"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssetUrl, downloadAsset, formatFileSize, cn } from "@/lib/utils";
import { Download, ChevronDown, ShieldCheck, Sparkles, Layers, TrendingUp, HelpCircle } from "lucide-react";

interface ImagePreviewProps {
  originalPreviewUrl: string;
  processedKey?: string | null | undefined;
  thumbnailKey?: string | null | undefined;
  processedUrl?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  originalSize?: number | null | undefined;
  processedSize?: number | null | undefined;
}

function PreviewTile({
  label,
  src,
  filename,
  size,
  badgeText,
  badgeVariant = "neutral",
}: {
  label: string;
  src: string;
  filename?: string | undefined;
  size?: number | null | undefined;
  badgeText?: string | undefined;
  badgeVariant?: "neutral" | "warning" | "success" | undefined;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-steel)]">
            {label}
          </p>
          {size != null && size > 0 && (
            <span className="font-mono text-[11px] text-[var(--color-ash)]">
              ({formatFileSize(size)})
            </span>
          )}
          {badgeText && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold tracking-tight",
                badgeVariant === "warning" && "bg-[var(--color-copper)]/15 text-[var(--color-copper)] border border-[var(--color-copper)]/40 shadow-[0_0_12px_rgba(215,201,175,0.15)]",
                badgeVariant === "success" && "bg-[var(--color-status-success)]/15 text-[var(--color-status-success)] border border-[var(--color-status-success)]/30",
                badgeVariant === "neutral" && "bg-[var(--color-graphite)] text-[var(--color-ash)]"
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
        {src && (
          <button
            onClick={() => downloadAsset(src, filename || `${label.toLowerCase()}-image.jpg`)}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-ash)] transition-colors hover:text-[var(--color-pure-white)] cursor-pointer"
            title="Download image"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        )}
      </div>
      <div className="relative group overflow-hidden rounded-[10px] border border-[var(--color-graphite)] bg-[var(--color-carbon)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          className="h-auto w-full object-contain max-h-[300px]"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function SizeExplanationBanner({
  originalSize,
  processedSize,
}: {
  originalSize?: number | null | undefined;
  processedSize?: number | null | undefined;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const hasBoth = originalSize != null && processedSize != null && originalSize > 0 && processedSize > 0;
  const diffBytes = hasBoth ? processedSize - originalSize : 0;
  const percentIncrease = hasBoth && originalSize > 0 ? ((diffBytes / originalSize) * 100).toFixed(1) : null;

  return (
    <div className="mt-6 rounded-[14px] border border-[var(--color-copper)]/40 bg-gradient-to-r from-[var(--color-obsidian)] via-[#18191c] to-[var(--color-obsidian)] p-5 shadow-[0_4px_24px_rgba(215,201,175,0.08)] animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-copper)]/50 bg-[var(--color-copper)]/15 text-[var(--color-copper)] mt-0.5 shadow-[0_0_15px_rgba(215,201,175,0.2)]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold tracking-wide text-[var(--color-bone)]">
                {percentIncrease != null && diffBytes > 0
                  ? `Notice: Processed image size increased by +${percentIncrease}% (+${formatFileSize(diffBytes)})`
                  : "Notice: Processed file size exceeds original"}
              </span>
              <span className="rounded-full border border-[var(--color-copper)]/40 bg-[var(--color-copper)]/20 px-2.5 py-0.5 text-[10px] font-mono font-medium text-[var(--color-copper)]">
                Quality Standardized
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[var(--color-steel)] leading-relaxed max-w-[720px]">
              <strong className="text-[var(--color-bone)]">Why did this happen?</strong> Your input image was heavily pre-compressed or saved with reduced color bit-depth. CloudPix re-encoded it into high-fidelity 80% JPEG/WebP or 32-bit PNG to ensure color profile consistency and sharpness across high-density displays.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-copper)]/30 px-3 py-1.5 text-xs font-medium text-[var(--color-copper)] bg-[var(--color-copper)]/10 hover:bg-[var(--color-copper)]/20 transition-all cursor-pointer shadow-sm"
        >
          {isOpen ? "Hide details" : "Why did this happen?"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 border-t border-[var(--color-graphite)] pt-4.5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 animate-[fade-in_0.2s_ease-out]">
          <div className="rounded-[10px] border border-[var(--color-graphite)] bg-[var(--color-ink)] p-4 hover:border-[var(--color-copper)]/30 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-bone)]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-copper)] flex-shrink-0" />
              High-Fidelity Re-encoding
            </div>
            <p className="mt-2 text-[11.5px] text-[var(--color-steel)] leading-relaxed">
              Replaces aggressive compression artifacts with standardized high-bitrate macroblocks, preventing blurriness on Retina screens.
            </p>
          </div>

          <div className="rounded-[10px] border border-[var(--color-graphite)] bg-[var(--color-ink)] p-4 hover:border-[var(--color-copper)]/30 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-bone)]">
              <Sparkles className="h-4 w-4 text-[var(--color-copper)] flex-shrink-0" />
              sRGB Color Profile & EXIF
            </div>
            <p className="mt-2 text-[11.5px] text-[var(--color-steel)] leading-relaxed">
              Injects standard sRGB color profile headers and optimized metadata markers so colors match accurately across all devices.
            </p>
          </div>

          <div className="rounded-[10px] border border-[var(--color-graphite)] bg-[var(--color-ink)] p-4 hover:border-[var(--color-copper)]/30 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-bone)]">
              <Layers className="h-4 w-4 text-[var(--color-copper)] flex-shrink-0" />
              RGB Channel Expansion
            </div>
            <p className="mt-2 text-[11.5px] text-[var(--color-steel)] leading-relaxed">
              Converts indexed palette or low-color channels to full 32-bit RGBA pixel buffers, ensuring lossy-free pipeline processing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ImagePreview({
  originalPreviewUrl,
  processedKey,
  thumbnailKey,
  processedUrl,
  thumbnailUrl,
  originalSize: initialOriginalSize,
  processedSize: initialProcessedSize,
}: ImagePreviewProps) {
  const processedSrc = processedUrl || (processedKey ? getAssetUrl(processedKey) : "");
  const thumbnailSrc = thumbnailUrl || (thumbnailKey ? getAssetUrl(thumbnailKey) : "");

  const [origSize, setOrigSize] = useState<number | null>(initialOriginalSize ?? null);
  const [procSize, setProcSize] = useState<number | null>(initialProcessedSize ?? null);
  const [showManualExplanation, setShowManualExplanation] = useState(false);

  // Fetch original size if not passed directly
  useEffect(() => {
    if (initialOriginalSize != null && initialOriginalSize > 0) {
      setOrigSize(initialOriginalSize);
    } else if (originalPreviewUrl) {
      if (originalPreviewUrl.startsWith("blob:")) {
        fetch(originalPreviewUrl)
          .then((res) => res.blob())
          .then((blob) => {
            if (blob.size > 0) setOrigSize(blob.size);
          })
          .catch(() => {});
      } else {
        fetch(`/api/size-check?url=${encodeURIComponent(originalPreviewUrl)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.size) setOrigSize(data.size);
          })
          .catch(() => {});
      }
    }
  }, [initialOriginalSize, originalPreviewUrl]);

  // Fetch processed size via server-side API proxy to bypass S3 CORS restrictions
  useEffect(() => {
    if (initialProcessedSize != null && initialProcessedSize > 0) {
      setProcSize(initialProcessedSize);
    } else if (processedSrc) {
      fetch(`/api/size-check?url=${encodeURIComponent(processedSrc)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.size) setProcSize(data.size);
        })
        .catch(() => {});
    }
  }, [initialProcessedSize, processedSrc]);

  const isLarger = origSize != null && procSize != null && procSize > origSize;
  const isSmaller = origSize != null && procSize != null && procSize < origSize;
  const diffPercent = origSize && procSize ? Math.abs(((procSize - origSize) / origSize) * 100).toFixed(1) : null;

  return (
    <Card className="animate-[fade-in_0.25s_ease-out]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[13px] font-medium text-[var(--color-fog)]">
            Results & Processing Insights
          </CardTitle>
          <button
            onClick={() => setShowManualExplanation(!showManualExplanation)}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-copper)] transition-colors hover:text-[var(--color-copper)]/80 cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {showManualExplanation ? "Hide Explanation" : "Why can processed size increase?"}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PreviewTile
            label="Original"
            src={originalPreviewUrl}
            size={origSize}
          />

          {processedSrc && (
            <PreviewTile
              label="Processed"
              src={processedSrc}
              size={procSize}
              badgeText={
                isLarger
                  ? `+${diffPercent}% size`
                  : isSmaller
                  ? `-${diffPercent}% size`
                  : undefined
              }
              badgeVariant={isLarger ? "warning" : isSmaller ? "success" : "neutral"}
            />
          )}

          {thumbnailSrc && (
            <PreviewTile
              label="Thumbnail"
              src={thumbnailSrc}
            />
          )}
        </div>

        {/* Banner displays automatically if processed image size > original size, or if clicked manually */}
        {(isLarger || showManualExplanation) && (
          <SizeExplanationBanner originalSize={origSize} processedSize={procSize} />
        )}
      </CardContent>
    </Card>
  );
}
