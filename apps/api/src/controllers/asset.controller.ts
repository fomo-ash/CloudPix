import { Request, Response, NextFunction } from "express";
import * as assetService from "../services/asset.service";
import { AssetRepository } from "@cloudpix/database";
import { generatePresignedGetUrl } from "@cloudpix/aws";

const assetRepository = new AssetRepository();

export async function getAssetController(
    req: Request,
    res: Response
){
    try{
        const id = req.params.id as string;

        if(!id){
            return res.status(400).json({
                message:"Asset id is required"
            })
        }

        const asset = await assetService.getAsset(id);

        if(!asset){
            return res.status(404).json({
                message:'Asset not found'
            })
        }

        const processedUrl = asset.processedKey ? await generatePresignedGetUrl(asset.processedKey) : null;
        const thumbnailUrl = asset.thumbnailKey ? await generatePresignedGetUrl(asset.thumbnailKey) : null;
        const originalUrl = asset.objectKey ? await generatePresignedGetUrl(asset.objectKey) : null;

        return res.status(200).json({
          ...asset,
          s3Key: asset.objectKey,
          processedUrl,
          thumbnailUrl,
          originalUrl,
        })
    } catch (error) {
        console.error("Error fetching asset", error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

export async function getAllAssetsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assets = await assetRepository.findRecentUploads();
    const enriched = await Promise.all(
      assets.map(async (asset) => {
        const processedUrl = asset.processedKey ? await generatePresignedGetUrl(asset.processedKey) : null;
        const thumbnailUrl = asset.thumbnailKey ? await generatePresignedGetUrl(asset.thumbnailKey) : null;
        const originalUrl = asset.objectKey ? await generatePresignedGetUrl(asset.objectKey) : null;
        return {
          ...asset,
          s3Key: asset.objectKey,
          processedUrl,
          thumbnailUrl,
          originalUrl,
        };
      })
    );
    res.json(enriched);
  } catch (error) {
    next(error);
  }
}
