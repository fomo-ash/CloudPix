export function getProcessedKey(originalKey: string): string {
  return originalKey.replace(/^originals\//, "processed/");
}
