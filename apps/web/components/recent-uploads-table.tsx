import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFileSize, formatDate } from "@/lib/utils";
import { Download, Eye, MoreHorizontal, Table2 } from "lucide-react";

export type UploadStatus =
  | "uploading"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface RecentUpload {
  id: string;
  filename: string;
  status: UploadStatus;
  size: number;
  uploadedAt: string;
  thumbnailUrl?: string;
}

const statusVariantMap: Record<UploadStatus, BadgeProps["variant"]> = {
  uploading: "info",
  queued: "warning",
  processing: "processing",
  completed: "success",
  failed: "error",
};

const statusLabelMap: Record<UploadStatus, string> = {
  uploading: "Uploading",
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

// Mock data — structured to match real API response shape
const mockUploads: RecentUpload[] = [
  {
    id: "1",
    filename: "hero-banner.png",
    status: "completed",
    size: 2_450_000,
    uploadedAt: "2025-07-05T09:15:00Z",
  },
  {
    id: "2",
    filename: "product-shot-01.jpg",
    status: "processing",
    size: 4_100_000,
    uploadedAt: "2025-07-05T09:12:00Z",
  },
  {
    id: "3",
    filename: "team-photo.webp",
    status: "queued",
    size: 1_800_000,
    uploadedAt: "2025-07-05T09:10:00Z",
  },
  {
    id: "4",
    filename: "receipt-scan.png",
    status: "completed",
    size: 890_000,
    uploadedAt: "2025-07-05T08:55:00Z",
  },
  {
    id: "5",
    filename: "dashboard-screenshot.png",
    status: "failed",
    size: 3_200_000,
    uploadedAt: "2025-07-05T08:40:00Z",
  },
];

interface RecentUploadsTableProps {
  uploads?: RecentUpload[];
}

export function RecentUploadsTable({
  uploads = mockUploads,
}: RecentUploadsTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Table2 className="h-4 w-4 text-[var(--color-text-muted)]" />
            Recent Uploads
          </CardTitle>
          <span className="text-xs text-[var(--color-text-muted)]">
            {uploads.length} files
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.map((upload) => (
              <TableRow key={upload.id}>
                {/* Thumbnail */}
                <TableCell>
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
                    {upload.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={upload.thumbnailUrl}
                        alt={upload.filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-[10px] font-medium uppercase text-[var(--color-text-muted)]">
                        {upload.filename.split(".").pop()}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Filename */}
                <TableCell>
                  <span className="font-mono text-xs text-[var(--color-text-primary)]">
                    {upload.filename}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant={statusVariantMap[upload.status]}>
                    {statusLabelMap[upload.status]}
                  </Badge>
                </TableCell>

                {/* Size */}
                <TableCell className="tabular-nums">
                  {formatFileSize(upload.size)}
                </TableCell>

                {/* Date */}
                <TableCell className="tabular-nums">
                  {formatDate(upload.uploadedAt)}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
