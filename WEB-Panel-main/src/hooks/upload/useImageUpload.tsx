import { useFileUpload, UseFileUploadOptions } from './useFileUpload';
import { useState, useEffect, useCallback } from 'react';
interface UseImageUploadOptions
  extends Omit<UseFileUploadOptions, 'accept' | 'multiple' | 'maxFiles'> {
  requireCrop?: boolean;
}

const useBaseImageUpload = (
  multiple: boolean,
  maxFiles?: number,
  options: UseImageUploadOptions = {},
) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [pendingCropUrl, setPendingCropUrl] = useState<string | null>(null);

  const { files, handleDrop, clearFiles, ...props } = useFileUpload({
    accept: { 'image/*': [] },
    multiple,
    maxFiles,
    onFilesChanged: (droppedFiles) => {
      if (options.requireCrop && droppedFiles.length > 0) {
        // Hold the file for cropping instead of immediately setting it
        const file = droppedFiles[0];
        const url = URL.createObjectURL(file);
        setPendingCropFile(file);
        setPendingCropUrl(url);
      } else {
        options.onFilesChanged?.(droppedFiles);
      }
    },
    ...options,
  });

  const handleCropComplete = useCallback(
    (croppedFile: File) => {
      handleDrop([croppedFile]);
      setPendingCropFile(null);
      if (pendingCropUrl) {
        URL.revokeObjectURL(pendingCropUrl);
        setPendingCropUrl(null);
      }
    },
    [handleDrop, pendingCropUrl],
  );

  const handleCropCancel = useCallback(() => {
    setPendingCropFile(null);
    if (pendingCropUrl) {
      URL.revokeObjectURL(pendingCropUrl);
      setPendingCropUrl(null);
    }
  }, [pendingCropUrl]);

  // Generate preview URLs when files change
  useEffect(() => {
    // Generate new URLs
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newUrls);

    // Cleanup on unmount
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  return {
    ...props,
    files,
    previewUrls,
    handleDrop,
    clearFiles,
    pendingCropFile,
    pendingCropUrl,
    handleCropComplete,
    handleCropCancel,
  };
};

// Single image upload hook
export const useSingleImageUpload = (options: UseImageUploadOptions = {}) => {
  const baseUpload = useBaseImageUpload(false, 1, options);

  // Destructure to exclude arrays and array-specific methods
  const { previewUrls, files, ...rest } = baseUpload;

  return {
    ...rest,
    // Single-specific convenience properties
    previewUrl: previewUrls[0] || null,
    file: files[0] || null,
  };
};

// Multiple image upload hook
export const useMultipleImageUpload = (maxFiles?: number, options: UseImageUploadOptions = {}) => {
  return useBaseImageUpload(true, maxFiles, options);
};
