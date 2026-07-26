import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFileSize, formatDate, getAssetUrl, downloadAsset } from "@/lib/utils";
import { Eye, Download } from "lucide-react";
import { fetchRecentUploads, type AssetResponse } from "@/lib/api";

const statusVariantMap: Record<AssetResponse["status"], BadgeProps["variant"]> = {
  UPLOADED: "info",
  QUEUED: "outline",
  PROCESSING: "copper",
  COMPLETED: "success",
  FAILED: "error",
};

const statusLabelMap: Record<AssetResponse["status"], string> = {
  UPLOADED: "Uploaded",
  QUEUED: "Queued",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export function RecentUploadsTable() {
  const [uploads, setUploads] = useState<AssetResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRecentUploads();
        setUploads(data);
      } catch (err) {
        setError("Could not load recent uploads.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
    // In a real app we might poll or use websockets here
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[13px] font-medium text-[var(--color-ash)]">
            Recent Uploads
          </CardTitle>
          <span className="font-mono text-[12px] text-[var(--color-smoke)]">
            {isLoading ? "..." : `${uploads.length} files`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--color-graphite)]">
              <TableHead className="pl-6 text-[var(--color-smoke)]">File</TableHead>
              <TableHead className="text-[var(--color-smoke)]">Status</TableHead>
              <TableHead className="text-[var(--color-smoke)]">Size</TableHead>
              <TableHead className="text-[var(--color-smoke)]">Date</TableHead>
              <TableHead className="pr-6 text-right text-[var(--color-smoke)]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-[var(--color-smoke)]">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-[#ff6363]">
                  Waiting for backend endpoint implementation...
                </TableCell>
              </TableRow>
            ) : uploads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-[var(--color-smoke)]">
                  No uploads found.
                </TableCell>
              </TableRow>
            ) : (
              uploads.map((upload) => (
                <TableRow key={upload.id} className="border-[var(--color-graphite)]">
                  <TableCell className="pl-6">
                    <span className="text-sm font-medium text-[var(--color-pure-white)]">
                      {upload.originalFileName}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusVariantMap[upload.status]}>
                      {statusLabelMap[upload.status]}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-mono text-[12px] text-[var(--color-ash)]">
                    {formatFileSize(upload.size)}
                  </TableCell>

                  <TableCell className="font-mono text-[12px] text-[var(--color-ash)]">
                    {formatDate(upload.createdAt)}
                  </TableCell>

                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          const url = upload.processedUrl || upload.thumbnailUrl || upload.originalUrl || (upload.processedKey ? getAssetUrl(upload.processedKey) : getAssetUrl(upload.s3Key || ""));
                          window.open(url, "_blank");
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--color-smoke)] transition-colors hover:text-[var(--color-pure-white)] cursor-pointer"
                        aria-label="Preview"
                        title="Preview Image"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const url = upload.processedUrl || upload.thumbnailUrl || upload.originalUrl || (upload.processedKey ? getAssetUrl(upload.processedKey) : getAssetUrl(upload.s3Key || ""));
                          const filename = upload.originalFileName || "image.jpg";
                          downloadAsset(url, filename);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--color-smoke)] transition-colors hover:text-[var(--color-pure-white)] cursor-pointer"
                        aria-label="Download"
                        title="Download Asset"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
