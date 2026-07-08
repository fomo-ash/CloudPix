"use client";

import {
  Upload,
  CloudUpload,
  MessageSquare,
  Cpu,
  Minimize2,
  ScanText,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PipelineStageStatus = "pending" | "active" | "success" | "failed";

export interface PipelineStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: PipelineStageStatus;
}

const statusConfig: Record<
  PipelineStageStatus,
  { badge: "outline" | "info" | "success" | "error"; label: string }
> = {
  pending: { badge: "outline", label: "Pending" },
  active: { badge: "info", label: "Active" },
  success: { badge: "success", label: "Success" },
  failed: { badge: "error", label: "Failed" },
};

const defaultStages: PipelineStage[] = [
  {
    id: "upload",
    label: "Upload",
    icon: <Upload className="h-4 w-4" />,
    status: "success",
  },
  {
    id: "s3",
    label: "AWS S3",
    icon: <CloudUpload className="h-4 w-4" />,
    status: "success",
  },
  {
    id: "sqs",
    label: "AWS SQS",
    icon: <MessageSquare className="h-4 w-4" />,
    status: "success",
  },
  {
    id: "worker",
    label: "Worker",
    icon: <Cpu className="h-4 w-4" />,
    status: "active",
  },
  {
    id: "sharp",
    label: "Sharp Compression",
    icon: <Minimize2 className="h-4 w-4" />,
    status: "pending",
  },
  {
    id: "ocr",
    label: "OCR",
    icon: <ScanText className="h-4 w-4" />,
    status: "pending",
  },
  {
    id: "completed",
    label: "Completed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    status: "pending",
  },
];

interface PipelineVisualizationProps {
  stages?: PipelineStage[];
}

export function PipelineVisualization({
  stages = defaultStages,
}: PipelineVisualizationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Cpu className="h-4 w-4 text-[var(--color-text-muted)]" />
          Processing Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col gap-0">
          {stages.map((stage, index) => {
            const config = statusConfig[stage.status];
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="relative flex items-start gap-4">
                {/* Connector line */}
                {!isLast && (
                  <div className="absolute left-[17px] top-[36px] h-[calc(100%-2px)] w-px">
                    <div
                      className={cn(
                        "h-full w-full",
                        stage.status === "success"
                          ? "bg-[var(--color-status-success)]/40"
                          : "bg-[var(--color-border)]"
                      )}
                    />
                  </div>
                )}

                {/* Node */}
                <div
                  className={cn(
                    "relative z-10 flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500",
                    stage.status === "success" &&
                      "border-[var(--color-status-success)] bg-[var(--color-status-success-muted)] text-[var(--color-status-success)]",
                    stage.status === "active" &&
                      "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]",
                    stage.status === "failed" &&
                      "border-[var(--color-status-error)] bg-[var(--color-status-error-muted)] text-[var(--color-status-error)]",
                    stage.status === "pending" &&
                      "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]"
                  )}
                  style={
                    stage.status === "active"
                      ? { animation: "pulse-glow 2s infinite" }
                      : undefined
                  }
                >
                  {stage.icon}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 items-center justify-between pb-6">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      stage.status === "pending"
                        ? "text-[var(--color-text-muted)]"
                        : "text-[var(--color-text-primary)]"
                    )}
                  >
                    {stage.label}
                  </span>
                  <Badge variant={config.badge}>{config.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
