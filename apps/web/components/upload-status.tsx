"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUploadStatus, type UploadStatusResponse } from "@/lib/api";

const POLL_INTERVAL_MS = 2_000;

const STATUS_CONFIG = {
  UPLOADED: {
    message: "Image received. Queuing for processing…",
    progress: 20,
  },
  QUEUED: {
    message: "Waiting in the processing queue…",
    progress: 35,
  },
  PROCESSING: {
    message: "Compressing, generating thumbnail, extracting text…",
    progress: 65,
  },
  COMPLETED: {
    message: "All processing finished.",
    progress: 100,
  },
  FAILED: {
    message: "Processing failed. Please try again.",
    progress: 100,
  },
} as const;

interface UploadStatusProps {
  uploadId: string;
  onCompleted: (data: UploadStatusResponse) => void;
  onFailed: (error: string) => void;
}

export function UploadStatus({
  uploadId,
  onCompleted,
  onFailed,
}: UploadStatusProps) {
  const [status, setStatus] =
    useState<UploadStatusResponse["status"]>("UPLOADED");
  const [message, setMessage] = useState<string>(STATUS_CONFIG.UPLOADED.message);
  const [progress, setProgress] = useState<number>(STATUS_CONFIG.UPLOADED.progress);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function poll() {
      if (cancelledRef.current) return;

      try {
        const data = await getUploadStatus(uploadId);
        if (cancelledRef.current) return;

        const config = STATUS_CONFIG[data.status];
        setStatus(data.status);
        setMessage(config.message);
        setProgress(config.progress);

        if (data.status === "COMPLETED") {
          onCompleted(data);
          return;
        }
        if (data.status === "FAILED") {
          onFailed("Processing failed. Please try again.");
          return;
        }

        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        poll();
      } catch {
        if (cancelledRef.current) return;
        onFailed("Network error while checking status.");
      }
    }

    poll();
    return () => {
      cancelledRef.current = true;
    };
  }, [uploadId, onCompleted, onFailed]);

  return (
    <Card className="animate-[fade-in_0.25s_ease-out]">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 pt-0.5">
            {status === "COMPLETED" ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--color-status-success)]" />
            ) : status === "FAILED" ? (
              <XCircle className="h-5 w-5 text-[var(--color-status-error)]" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-[var(--color-copper)]" />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--color-bone)]">
                Processing
              </p>
              <span className="text-[11px] text-[var(--color-copper)]">
                {status.toLowerCase()}
              </span>
            </div>

            <Progress value={progress} />

            <p className="text-xs text-[var(--color-steel)]">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
