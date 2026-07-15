import Tesseract from "tesseract.js";
import sharp from "sharp";
import { logger } from "@cloudpix/shared";

export async function extractText(buffer:Buffer): Promise<string> {
    try {
        logger.info("Extracting text from image using OCR...");
        // Tesseract.js works best with PNG/JPEG. It often fails silently or errors out on WEBP buffers.
        const pngBuffer = await sharp(buffer).png().toBuffer();

        const result = await Tesseract.recognize(
          pngBuffer,
          "eng"
        );

        logger.info("Text extraction successful!");
        return result.data.text.trim();
    } catch (error) {
        logger.error({ err: error }, "Error extracting text from image");
        return "";
    }
}