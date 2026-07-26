"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OCRCardProps {
  ocrText: string | null;
}

export function OCRCard({ ocrText }: OCRCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!ocrText) return;
    try {
      await navigator.clipboard.writeText(ocrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard API may fail in insecure contexts */
    }
  };

  return (
    <Card className="animate-[fade-in_0.25s_ease-out]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[13px] font-medium text-[var(--color-fog)]">
            Extracted Text
          </CardTitle>

          {ocrText && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-[var(--color-steel)] transition-colors hover:text-[var(--color-bone)] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-[var(--color-status-success)]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {ocrText ? (
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-[10px] border border-[var(--color-graphite)] bg-[var(--color-carbon)] p-4 text-xs leading-relaxed text-[var(--color-mist)]">
            {ocrText}
          </pre>
        ) : (
          <div className="flex items-center justify-center rounded-[10px] border border-dashed border-[var(--color-slate)] py-8">
            <p className="text-xs text-[var(--color-steel)]">
              No text detected in this image.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
