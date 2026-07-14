import sharp from "sharp";

export interface CompressionResult {
  buffer: Buffer;
  format: "jpeg" | "png" | "webp";
  mimeType: string;
}

export async function readMetadata(buffer: Buffer) {
    return sharp(buffer).metadata()
}

export async function compressImage(
  buffer: Buffer
): Promise<CompressionResult> {
  const metadata = await readMetadata(buffer);

  let format: "jpeg" | "png" | "webp" = "jpeg";
  if (metadata.format === "png") {
    format = "png";
  } else if (metadata.format === "webp") {
    format = "webp";
  } else if (metadata.format === "jpeg") {
    format = "jpeg";
  }

  let pipeline = sharp(buffer)
    .rotate()
    .resize({
      width: 1920,
      fit: "inside",
      withoutEnlargement: true,
    });

  if (format === "png") {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else if (format === "webp") {
    pipeline = pipeline.webp({ quality: 80 });
  } else {
    pipeline = pipeline.jpeg({
      quality: 80,
      mozjpeg: true,
    });
  }

  const compressedBuffer = await pipeline.toBuffer();
  const mimeType = `image/${format}`;

  return {
    buffer: compressedBuffer,
    format,
    mimeType,
  };
}

export interface Thumbnail{
    buffer: Buffer,
    mimeType: string,
    format: "jpeg" | "png" | "webp",
}

export async function createThumbnail(buffer: Buffer): Promise<Thumbnail> {
  try {
    const thumbnailBuffer = await sharp(buffer)
      .resize(150, 150, {
        fit: 'cover', 
        position: 'center'
      })
      .jpeg({ quality: 75 }) 
      .toBuffer();
    
    console.log('Thumbnail created successfully!');
    return {
      buffer: thumbnailBuffer,
      mimeType: 'image/jpeg',
      format: 'jpeg'
    };
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
}
