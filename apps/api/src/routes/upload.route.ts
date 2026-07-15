import { Router } from "express";

import { getPresignedUrl, getUploadStatus } from "../controllers/upload.controller";

const router = Router();

router.post(
    "/presigned-url",
    getPresignedUrl
);

router.get("/:uploadId/status",
    getUploadStatus
)

export default router;