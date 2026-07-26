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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PipelineStageStatus = "pending" | "active" | "success" | "failed";

export interface PipelineStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: PipelineStageStatus;
}

const defaultStages: PipelineStage[] = [
  { id: "upload", label: "Upload", icon: <Upload className="h-3.5 w-3.5" />, status: "pending" },
  { id: "s3", label: "AWS S3", icon: <CloudUpload className="h-3.5 w-3.5" />, status: "pending" },
  { id: "sqs", label: "AWS SQS", icon: <MessageSquare className="h-3.5 w-3.5" />, status: "pending" },
  { id: "worker", label: "Worker", icon: <Cpu className="h-3.5 w-3.5" />, status: "pending" },
  { id: "sharp", label: "Compression", icon: <Minimize2 className="h-3.5 w-3.5" />, status: "pending" },
  { id: "ocr", label: "OCR", icon: <ScanText className="h-3.5 w-3.5" />, status: "pending" },
  { id: "completed", label: "Completed", icon: <CheckCircle2 className="h-3.5 w-3.5" />, status: "pending" },
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
        <CardTitle className="text-[13px] font-medium text-[var(--color-fog)]">
          Processing Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col gap-0">
          {stages.map((stage, index) => {
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="relative flex items-start gap-3.5">
                {/* Connector line */}
                {!isLast && (
                  <div className="absolute left-[11px] top-[26px] h-[calc(100%-2px)] w-px">
                    <div
                      className={cn(
                        "h-full w-full",
                        stage.status === "success"
                          ? "bg-[var(--color-steel)]"
                          : "bg-[var(--color-graphite)]"
                      )}
                    />
                  </div>
                )}

                {/* Node */}
                <div
                  className={cn(
                    "relative z-10 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    stage.status === "success" &&
                      "border-[var(--color-steel)] text-[var(--color-bone)]",
                    stage.status === "active" &&
                      "border-[var(--color-copper)] text-[var(--color-copper)]",
                    stage.status === "failed" &&
                      "border-[var(--color-status-error)] text-[var(--color-status-error)]",
                    stage.status === "pending" &&
                      "border-[var(--color-ash)] text-[var(--color-ash)]"
                  )}
                  style={
                    stage.status === "active"
                      ? { animation: "pulse-subtle 2s infinite" }
                      : undefined
                  }
                >
                  {stage.icon}
                </div>

                {/* Label */}
                <div className="flex min-w-0 flex-1 items-center justify-between pb-5">
                  <span
                    className={cn(
                      "text-[13px]",
                      stage.status === "pending"
                        ? "text-[var(--color-steel)] opacity-80"
                        : stage.status === "active"
                          ? "text-[var(--color-bone)] font-medium"
                          : stage.status === "failed"
                            ? "text-[var(--color-status-error)]"
                            : "text-[var(--color-fog)]"
                    )}
                  >
                    {stage.label}
                  </span>

                  {stage.status !== "pending" && (
                    <span
                      className={cn(
                        "text-[11px]",
                        stage.status === "active" && "text-[var(--color-copper)]",
                        stage.status === "success" && "text-[var(--color-steel)]",
                        stage.status === "failed" && "text-[var(--color-status-error)]"
                      )}
                    >
                      {stage.status === "active"
                        ? "Active"
                        : stage.status === "success"
                          ? "Done"
                          : "Failed"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
