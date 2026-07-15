import { AssetRepository } from "@cloudpix/database";

const assetRepository = new AssetRepository();

export async function getUpload(uploadId: string) {
    return assetRepository.findByUploadId(uploadId);
}

export async function getAsset(id:string) {
    return assetRepository.findById(id);
}
