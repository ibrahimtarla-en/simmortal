'use client';
import { useFileUpload, UseFileUploadOptions } from './useFileUpload';
import { AssetType } from '@/types/asset';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';

interface UseMediaUploadOptions
  extends Omit<UseFileUploadOptions, 'accept' | 'multiple' | 'maxFiles'> {
  maxVideoSizeMB?: number;
  requireCrop?: boolean;
}

const useBaseMediaUpload = (
  multiple: boolean,
  maxFiles?: number,
  options: UseMediaUploadOptions = {},
) => {
  const { maxVideoSizeMB = 30, requireCrop = false, ...restOptions } = options;
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [pendingCropUrl, setPendingCropUrl] = useState<string | null>(null);
  const tError = useTranslations('Error');

  const validateFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        if (file.type.startsWith('video/')) {
          const fileSizeMB = file.size / (1024 * 1024);
          if (fileSizeMB > maxVideoSizeMB) {
            return tError('fileTooLarge', { size: maxVideoSizeMB });
          }
        }
      }
      return null;
    },
    [maxVideoSizeMB, tError],
  );

  const handleFilesChanged = useCallback(
    (files: File[]) => {
      const validationError = validateFiles(files);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);

      // Check if we should show crop modal
      if (requireCrop && files.length > 0) {
        const file = files[0];
        // Only trigger crop for images, not videos
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPendingCropFile(file);
          setPendingCropUrl(url);
          return; // Don't set files yet, wait for crop
        }
      }

      restOptions.onFilesChanged?.(files);
    },
    [validateFiles, requireCrop, restOptions],
  );

  const { files, handleDrop, clearFiles, ...props } = useFileUpload({
    accept: {
      'image/*': [],
      'video/*': [],
    },
    multiple,
    maxFiles,
    onFilesChanged: handleFilesChanged,
    ...restOptions,
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

  useEffect(() => {
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newUrls);

    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getFileType = useCallback((file?: File) => {
    if (file?.type.startsWith('image/')) return AssetType.IMAGE;
    if (file?.type.startsWith('video/')) return AssetType.VIDEO;
    return null;
  }, []);

  return {
    ...props,
    files,
    previewUrls,
    error,
    clearError,
    getFileType,
    handleDrop,
    clearFiles,
    pendingCropFile,
    pendingCropUrl,
    handleCropComplete,
    handleCropCancel,
  };
};

// Single media upload hook
export const useSingleMediaUpload = (options: UseMediaUploadOptions = {}) => {
  const baseUpload = useBaseMediaUpload(false, 1, options);

  const { previewUrls, files, getFileType, ...rest } = baseUpload;

  return {
    ...rest,
    previewUrl: previewUrls[0] || null,
    file: files[0] || null,
    type: getFileType(files[0]),
  };
};

// Multiple media upload hook
export const useMediaUpload = (maxFiles?: number, options: UseMediaUploadOptions = {}) => {
  return useBaseMediaUpload(true, maxFiles, options);
};
