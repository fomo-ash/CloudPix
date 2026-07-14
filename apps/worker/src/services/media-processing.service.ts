import { compressImage, CompressionResult, createThumbnail, Thumbnail } from "./image.service";

export interface ProcessedMedia{
    compressImage: CompressionResult,
    thumbnail: Thumbnail
}

export class MediaProcessingService{
    async process(buffer: Buffer): Promise<ProcessedMedia> {
        const compressed=await compressImage(buffer);
        const thumbnail=await createThumbnail(buffer)

        return {
      compressImage: compressed,
      thumbnail: thumbnail
    };
    }
}


export const mediaProcessingService = new MediaProcessingService();
