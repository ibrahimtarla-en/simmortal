// utils/cropImage.ts
export interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: CroppedArea,
  fileName: string = 'cropped-image.jpg',
  maxSize?: number, // Maximum dimension - won't enlarge if smaller
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Determine output size - use smaller of maxSize or actual crop size
  let outputWidth = pixelCrop.width;
  if (maxSize && pixelCrop.width > maxSize) {
    outputWidth = maxSize;
  }
  const outputHeight = pixelCrop.height * (outputWidth / pixelCrop.width);

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Draw the cropped and potentially resized image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  // Convert canvas to blob then to File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(file);
      },
      'image/jpeg',
      0.95,
    );
  });
};
