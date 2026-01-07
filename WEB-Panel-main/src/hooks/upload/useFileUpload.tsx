import { useState, useCallback } from 'react';
import { Accept } from 'react-dropzone';

export interface UseFileUploadOptions {
  accept?: Accept;
  multiple?: boolean;
  maxFiles?: number;
  onFilesChanged?: (files: File[]) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = useCallback(
    (droppedFiles: File[]) => {
      if (options.multiple === false) {
        setFiles(droppedFiles);
        options.onFilesChanged?.(droppedFiles);
        return;
      }
      setFiles((prevFiles) => {
        const newFiles = options.multiple ? [...prevFiles, ...droppedFiles] : droppedFiles;

        // Respect maxFiles limit
        const limitedFiles = options.maxFiles ? newFiles.slice(0, options.maxFiles) : newFiles;

        options.onFilesChanged?.(limitedFiles);
        return limitedFiles;
      });
    },
    [options],
  );

  const setFilesDirectly = useCallback(
    (newFiles: File[]) => {
      setFiles(newFiles);
      options.onFilesChanged?.(newFiles);
    },
    [options],
  );

  const clearFiles = useCallback(() => {
    setFiles([]);
    options.onFilesChanged?.([]);
  }, [options]);

  return {
    files,
    handleDrop,
    setFilesDirectly,
    clearFiles,
    // Props for FileUpload component
    accept: options.accept,
    multiple: options.multiple,
    maxFiles: options.maxFiles,
    onFilesChanged: handleDrop,
  };
};
