import { AssetType } from 'src/types/asset';

export function generateVersionedFilePath(originalPath: string): string {
  const timestamp = Date.now();

  const parts = originalPath.split('/');
  const filename = parts.pop(); // e.g. "cover.png"

  if (!filename || !filename.includes('.')) {
    throw new Error(`Invalid filename in path: ${originalPath}`);
  }

  const dotIndex = filename.lastIndexOf('.');
  const baseName = filename.slice(0, dotIndex); // "cover"
  const extension = filename.slice(dotIndex); // ".png"

  const versionedFilename = `${baseName}-${timestamp}${extension}`;
  return [...parts, versionedFilename].join('/');
}

export function generateAssetUrl(path: string): string {
  return `/assets/${path}`;
}

export function getAssetTypeFromMimeType(mimeType: string): AssetType | undefined {
  if (mimeType.startsWith('image/')) {
    return AssetType.IMAGE;
  } else if (mimeType.startsWith('video/')) {
    return AssetType.VIDEO;
  }
  return undefined;
}
