import { useTranslations } from 'next-intl';
import { useFileUpload, UseFileUploadOptions } from './useFileUpload';
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAudioUploadOptions
  extends Omit<UseFileUploadOptions, 'accept' | 'multiple' | 'maxFiles'> {
  maxFileSizeMB?: number;
  maxDurationSeconds?: number;
}

const useBaseAudioUpload = (
  multiple: boolean,
  maxFiles?: number,
  options: UseAudioUploadOptions = {},
) => {
  const { maxFileSizeMB = 10, maxDurationSeconds, ...restOptions } = options;
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [durations, setDurations] = useState<(number | null)[]>([]);
  const filesRef = useRef<File[]>([]);
  const previewUrlsRef = useRef<string[]>([]);
  const tError = useTranslations('Error');

  const validateFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSizeMB) {
          return `Audio file "${file.name}" exceeds ${maxFileSizeMB}MB limit (${fileSizeMB.toFixed(2)}MB)`;
        }

        // Check duration if maxDurationSeconds is set
        if (maxDurationSeconds) {
          try {
            const duration = await getAudioDuration(file);
            if (duration > maxDurationSeconds) {
              return tError('fileTooLarge', { size: maxFileSizeMB });
            }
          } catch {
            return tError('generic');
          }
        }
      }
      return null;
    },
    [maxFileSizeMB, maxDurationSeconds, tError],
  );

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio metadata'));
      });

      audio.src = url;
    });
  };

  const handleFilesChanged = useCallback(
    async (files: File[]) => {
      const validationError = await validateFiles(files);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      restOptions.onFilesChanged?.(files);
    },
    [validateFiles, restOptions],
  );

  const { files, handleDrop, setFilesDirectly, clearFiles, ...props } = useFileUpload({
    accept: {
      'audio/*': [],
    },
    multiple,
    maxFiles,
    onFilesChanged: handleFilesChanged,
    ...restOptions,
  });

  // Keep refs in sync
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = filesRef.current.filter((_, i) => i !== index);
      setFilesDirectly(newFiles);
    },
    [setFilesDirectly],
  );

  const removeFileByUrl = useCallback(
    (url: string) => {
      const index = previewUrlsRef.current.indexOf(url);
      if (index !== -1) {
        removeFile(index);
      }
    },
    [removeFile],
  );

  // Generate preview URLs and fetch durations when files change
  useEffect(() => {
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
    previewUrlsRef.current = newUrls;

    // Fetch durations for all audio files
    const fetchDurations = async () => {
      const durationPromises = files.map(async (file) => {
        try {
          return await getAudioDuration(file);
        } catch {
          return null;
        }
      });
      const results = await Promise.all(durationPromises);
      setDurations(results);
    };

    fetchDurations();

    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const formatDuration = useCallback((seconds: number | null) => {
    if (seconds === null) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...props,
    files,
    previewUrls,
    durations,
    error,
    clearError,
    formatDuration,
    handleDrop,
    clearFiles,
    removeFile,
    removeFileByUrl,
  };
};

// Single audio upload hook
export const useSingleAudioUpload = (options: UseAudioUploadOptions = {}) => {
  const baseUpload = useBaseAudioUpload(false, 1, options);

  const { previewUrls, files, durations, removeFile, removeFileByUrl, ...rest } = baseUpload;

  return {
    ...rest,
    previewUrl: previewUrls[0] || null,
    file: files[0] || null,
    duration: durations[0] || null,
    removeFile: () => removeFile(0),
    removeFileByUrl,
  };
};

// Multiple audio upload hook
export const useAudioUpload = (maxFiles: number = 3, options: UseAudioUploadOptions = {}) => {
  return useBaseAudioUpload(true, maxFiles, options);
};
