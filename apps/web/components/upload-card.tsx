"use client";

import { useCallback, useState, useRef, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getPresignedUploadUrl, uploadFileToS3 } from "@/lib/api";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export interface SelectedFile {
  file: File;
  preview: string;
}

interface UploadCardProps {
  onFileSelected?: (file: SelectedFile | null) => void;
  onUploadComplete?: (s3Key: string) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

export function UploadCard({
  onFileSelected,
  onUploadComplete,
  onUploadError,
  disabled = false,
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Unsupported format. Use PNG, JPG, or WebP.";
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
    e.target.value = "";
  };

  const handleRemove = useCallback(() => {
    if (selectedFile) URL.revokeObjectURL(selectedFile.preview);
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
      const { uploadUrl, s3Key } = await getPresignedUploadUrl({
        fileName: selectedFile.file.name,
        fileType: selectedFile.file.type,
      });
      await uploadFileToS3(uploadUrl, selectedFile.file, (percent) => {
        setUploadProgress(percent);
      });
      setUploadProgress(100);
      onUploadComplete?.(s3Key);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(msg);
      setUploadProgress(null);
      onUploadError?.(msg);
    }
  }, [selectedFile, onUploadComplete, onUploadError]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isUploading = uploadProgress !== null && uploadProgress < 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={disabled ? undefined : handleBrowse}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-[10px] border border-dashed px-6 py-14 transition-all duration-300",
              disabled ? "pointer-events-none opacity-40" : "cursor-pointer",
              isDragging
                ? "border-[var(--color-copper)] bg-[var(--color-copper)]/5"
                : "border-[var(--color-slate)] hover:border-[var(--color-steel)]"
            )}
          >
            <div
              className={cn(
                "mb-4 flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300",
                isDragging
                  ? "border-[var(--color-copper)] text-[var(--color-copper)]"
                  : "border-[var(--color-slate)] text-[var(--color-steel)] group-hover:text-[var(--color-bone)]"
              )}
            >
              <Upload className="h-4 w-4" />
            </div>

            <p className="text-sm font-medium text-[var(--color-bone)]">
              {isDragging
                ? "Drop your image here"
                : "Drag & drop your image here"}
            </p>
            <p className="mt-1.5 text-xs text-[var(--color-steel)]">
              PNG, JPG, JPEG, WEBP — up to 10 MB
            </p>

            <button
              className="mt-4 text-sm font-medium text-[var(--color-copper)] transition-colors hover:text-[var(--color-copper)]/80 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleBrowse();
              }}
              disabled={disabled}
            >
              Browse files
            </button>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-[10px] border border-[var(--color-status-error)]/20 px-4 py-2.5 text-xs text-[var(--color-status-error)]">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected file */}
      {selectedFile && (
        <Card className="animate-[fade-in_0.25s_ease-out]">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[10px] border border-[var(--color-graphite)] bg-[var(--color-carbon)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedFile.preview}
                  alt={selectedFile.file.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-bone)]">
                  {selectedFile.file.name}
                </p>
                <p className="text-xs text-[var(--color-steel)]">
                  {formatSize(selectedFile.file.size)}
                </p>

                {uploadProgress !== null && (
                  <div className="mt-2.5 space-y-1.5">
                    <Progress value={uploadProgress} />
                    <p className="text-[11px] text-[var(--color-steel)]">
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
                  <Button size="sm" onClick={handleUpload} disabled={disabled}>
                    Upload
                  </Button>
                )}
                {!isUploading && (
                  <button
                    onClick={handleRemove}
                    disabled={disabled}
                    className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-steel)] transition-colors hover:text-[var(--color-status-error)] cursor-pointer disabled:opacity-40"
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
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
