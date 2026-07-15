import { compressImage, CompressionResult, createThumbnail, Thumbnail } from "./image.service";
import { extractText } from "./ocr.service";

export interface ProcessedMedia{
    compressImage: CompressionResult,
    thumbnail: Thumbnail,
    ocrText:string
}

export class MediaProcessingService{
    async process(buffer: Buffer): Promise<ProcessedMedia> {
        const compressed=await compressImage(buffer);
        const thumbnail=await createThumbnail(buffer)
        const ocrText= await extractText(buffer)

        return {
      compressImage: compressed,
      thumbnail: thumbnail,
      ocrText:ocrText,
    };
    }
}


export const mediaProcessingService = new MediaProcessingService();
