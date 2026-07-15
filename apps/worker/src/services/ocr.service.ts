import Tesseract from "tesseract.js";
import sharp from "sharp";

export async function extractText(buffer:Buffer): Promise<string> {
    try {
        // Tesseract.js works best with PNG/JPEG. It often fails silently or errors out on WEBP buffers.
        const pngBuffer = await sharp(buffer).png().toBuffer();

        const result = await Tesseract.recognize(
          pngBuffer,
          "eng"
        );

        return result.data.text.trim();
    } catch (error) {
        console.error("OCR Extraction error", error);
        return "";
    }
}