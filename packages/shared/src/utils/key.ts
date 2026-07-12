export function getProcessedKey(originalKey: string): string {
  return originalKey.replace(/^originals\//, "processed/");
}

export function getUploadIdFromKey(key: string): string | null {
  const match = key.match(/^originals\/([^/]+)/);
  return match && match[1] ? match[1] : null;
}
