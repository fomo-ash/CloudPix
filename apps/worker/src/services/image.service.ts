import sharp from "sharp";

export async function readMetadata(buffer: Buffer) {
    return sharp(buffer).metadata()
}

export async function compressImage(
  buffer: Buffer
): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({
      width: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
      mozjpeg: true,
    })
    .toBuffer();
}