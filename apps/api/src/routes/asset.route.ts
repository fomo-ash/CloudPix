import { Router }from 'express';
import { getAssetController, getAllAssetsController } from '../controllers/asset.controller';

const router=Router();

router.get("/", getAllAssetsController);
router.get("/:id", getAssetController);

export default router;
