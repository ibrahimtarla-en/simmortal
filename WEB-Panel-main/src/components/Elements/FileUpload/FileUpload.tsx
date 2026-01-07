'use client';
import { useTranslations } from 'next-intl';
import React from 'react';
import Button from '../Button/Button';
import { cn } from '@/utils/cn';
import Dropzone from 'react-dropzone';
import { useFileUpload, useSingleImageUpload, useSingleMediaUpload } from '@/hooks';
import { exists } from '@/utils/exists';
import { useAudioUpload } from '@/hooks/upload/useAudioUpload';
import { EventParams, trackEvent } from '@/utils/analytics';

interface FileUploadProps {
  upload:
    | ReturnType<typeof useFileUpload>
    | ReturnType<typeof useSingleImageUpload>
    | ReturnType<typeof useSingleMediaUpload>
    | ReturnType<typeof useAudioUpload>;
  className?: string;
  fieldLabel?: string;
  buttonLabel?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  wrapperClassName?: string;
  error?: boolean;
  errorMessage?: string;
  analytics?: {
    eventName: string;
    params?: EventParams;
  };
}

const FileUpload = ({
  upload,
  fieldLabel,
  buttonLabel,
  className,
  children,
  disabled,
  wrapperClassName,
  error,
  errorMessage,
  analytics,
}: FileUploadProps) => {
  const t = useTranslations('Elements.FileUpload');
  const tCommon = useTranslations('Common');

  return (
    <Dropzone onDrop={upload.onFilesChanged} accept={upload.accept} maxFiles={upload.maxFiles}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <>
          <input
            type="file"
            multiple={upload.multiple}
            className="absolute hidden"
            {...getInputProps()}
            disabled={disabled || exists(children)}
          />
          <section {...getRootProps()} className={wrapperClassName}>
            {children ? (
              children
            ) : (
              <div
                className={cn(
                  'border-file-upload flex border-spacing-20 flex-col items-center justify-center gap-4 rounded-lg bg-zinc-900 p-9',
                  isDragActive && 'bg-zinc-800',
                  error && 'border-file-upload-error',
                  className,
                )}>
                {errorMessage && <div className="h-4.5" />}
                <div className="font-medium capitalize">{fieldLabel ?? t('dragAndDrop')}</div>
                <div className={cn('flex w-48 items-center justify-center gap-2.5 text-xs')}>
                  <hr className="grow border-zinc-500" />
                  {tCommon('or')}
                  <hr className="grow border-zinc-500" />
                </div>
                <Button
                  disabled={disabled}
                  type="button"
                  onClick={() => {
                    if (analytics) {
                      trackEvent(analytics.eventName, analytics.params);
                    }
                  }}>
                  {buttonLabel ?? t('browseYourComputer')}
                </Button>
                {errorMessage && (
                  <div className="text-mauveine-300 h-4.5 text-center text-sm">{errorMessage}</div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </Dropzone>
  );
};

export default FileUpload;
