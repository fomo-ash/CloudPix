import { Router } from "express";

import { getPresignedUrl } from "../controllers/upload.controller";

const router = Router();

router.post(
    "/presigned-url",
    getPresignedUrl
);

export default router;