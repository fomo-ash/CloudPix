"use client";

import { useCallback, useState, useRef, type DragEvent } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getPresignedUploadUrl, uploadFileToS3 } from "@/lib/api";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export interface SelectedFile {
  file: File;
  preview: string;
}

interface UploadCardProps {
  onFileSelected?: (file: SelectedFile | null) => void;
  onUploadComplete?: (s3Key: string) => void;
}

export function UploadCard({
  onFileSelected,
  onUploadComplete,
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Unsupported file type. Use JPEG, PNG, WebP, or GIF.";
    }
    if (file.size > MAX_SIZE) {
      return "File too large. Maximum size is 10 MB.";
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const preview = URL.createObjectURL(file);
      const selected = { file, preview };
      setSelectedFile(selected);
      onFileSelected?.(selected);
    },
    [onFileSelected]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleBrowse = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRemove = useCallback(() => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    setUploadProgress(null);
    setError(null);
    onFileSelected?.(null);
  }, [selectedFile, onFileSelected]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setError(null);
      setUploadProgress(0);

      // Step 1: Get presigned URL from Express backend
      const { uploadUrl, s3Key } = await getPresignedUploadUrl({
        fileName: selectedFile.file.name,
        fileType: selectedFile.file.type,
      });

      // Step 2: Upload directly to S3 with progress
      await uploadFileToS3(uploadUrl, selectedFile.file, (percent) => {
        setUploadProgress(percent);
      });

      setUploadProgress(100);
      onUploadComplete?.(s3Key);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
      setUploadProgress(null);
    }
  }, [selectedFile, onUploadComplete]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
            Upload Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowse}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed px-6 py-12 transition-all duration-300",
              isDragging
                ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                : "border-[var(--color-border-hover)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-surface-raised)]/50"
            )}
          >
            <div
              className={cn(
                "mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] transition-colors duration-300",
                isDragging
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]"
              )}
            >
              <Upload className="h-5 w-5" />
            </div>

            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {isDragging
                ? "Drop your image here"
                : "Drag & drop your images here"}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              JPEG, PNG, WebP, GIF — up to 10 MB
            </p>

            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                handleBrowse();
              }}
            >
              Browse Files
            </Button>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-[var(--radius-sm)] bg-[var(--color-status-error-muted)] px-3 py-2 text-xs text-[var(--color-status-error)]">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected file card */}
      {selectedFile && (
        <Card className="animate-[fade-in_0.3s_ease-out]">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedFile.preview}
                  alt={selectedFile.file.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {selectedFile.file.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatSize(selectedFile.file.size)}
                </p>

                {/* Progress bar */}
                {uploadProgress !== null && (
                  <div className="mt-2 space-y-1">
                    <Progress value={uploadProgress} />
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {uploadProgress < 100
                        ? `Uploading… ${uploadProgress}%`
                        : "Upload complete"}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {uploadProgress === null && (
                  <Button size="sm" onClick={handleUpload}>
                    Upload
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-status-error)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
