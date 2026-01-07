'use client';

interface BlurProps {
  isActive: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

function BlurOverlay({ isActive, onClose, children }: BlurProps) {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-99999999 bg-black/500 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}>
      {children}
    </div>
  );
}

export default BlurOverlay;
