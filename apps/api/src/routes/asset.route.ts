import { Router }from 'express';
import { getAssetController } from '../controllers/asset.controller';

const router=Router();

router.get("/:id", getAssetController)

export default router;
