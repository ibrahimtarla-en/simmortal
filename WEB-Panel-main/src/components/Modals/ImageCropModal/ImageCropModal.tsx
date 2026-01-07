'use client';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg, CroppedArea } from '@/utils/crop';
import Button from '@/components/Elements/Button/Button';
import Slider from '@/components/Elements/Slider/Slider';
import { cn } from '@/utils/cn';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import { logErrorToServer } from '@/services/logger';

interface ImageCropModalProps {
  imageUrl: string;
  onCropComplete: (croppedFile: File) => void;
  onClose: () => void;
  fileName?: string;
  onCropCancel?: () => void;
  aspectRatio?: number;
}

function ImageCropModal({
  imageUrl,
  onCropComplete,
  onClose,
  fileName,
  onCropCancel,
  aspectRatio = 1,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const tCommon = useTranslations('Common');
  const tError = useTranslations('Error');
  const { toast } = useToast();

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const handleCropComplete = useCallback(
    (_croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageUrl, croppedAreaPixels, fileName, 1024);
      onCropComplete(croppedFile);
      onClose();
    } catch (e) {
      logErrorToServer(
        e instanceof Error ? e.message : String(e),
        'ImageCropModal - handleSave',
        e instanceof Error ? e.stack : undefined,
      );
      toast({ message: tError('generic') });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 pt-20',
        'md:px-10',
      )}>
      <div className="relative flex h-full max-h-200 w-full max-w-4xl flex-col bg-zinc-900 p-6">
        {/* Cropper Area */}
        <div className="relative flex-1 bg-black">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="mt-4 space-y-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-zinc-400">{tCommon('zoom')}</label>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              disabled={isProcessing}
              className="flex-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                onCropCancel?.();
                onClose();
              }}
              disabled={isProcessing}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isProcessing}>
              {isProcessing ? tCommon('processing') : tCommon('continue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
