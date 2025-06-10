
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: File) => void;
  aspectRatio?: number;
}

export function ImageCropper({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete,
  aspectRatio = 1 
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState([1]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerSize = 300;
    canvas.width = containerSize;
    canvas.height = containerSize;

    // Clear canvas
    ctx.clearRect(0, 0, containerSize, containerSize);

    // Calculate image display size
    const scale = Math.min(containerSize / image.naturalWidth, containerSize / image.naturalHeight);
    const displayWidth = image.naturalWidth * scale * zoom[0];
    const displayHeight = image.naturalHeight * scale * zoom[0];

    // Draw image
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      displayWidth,
      displayHeight
    );

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, containerSize, containerSize);

    // Clear crop area
    const cropSize = Math.min(containerSize, containerSize);
    const cropX = (containerSize - cropSize) / 2;
    const cropY = (containerSize - cropSize) / 2;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropX, cropY, cropSize, cropSize);
    ctx.globalCompositeOperation = 'source-over';

    // Draw crop border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);
  }, [crop, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setCrop({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    const cropSize = 300;
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;

    // Calculate crop parameters
    const containerSize = 300;
    const scale = Math.min(containerSize / image.naturalWidth, containerSize / image.naturalHeight);
    const displayWidth = image.naturalWidth * scale * zoom[0];
    const displayHeight = image.naturalHeight * scale * zoom[0];

    // Calculate source crop area in original image coordinates
    const cropAreaSize = cropSize;
    const cropX = (containerSize - cropAreaSize) / 2;
    const cropY = (containerSize - cropAreaSize) / 2;

    const sourceX = (cropX - crop.x) / (scale * zoom[0]);
    const sourceY = (cropY - crop.y) / (scale * zoom[0]);
    const sourceSize = cropAreaSize / (scale * zoom[0]);

    // Draw cropped image
    cropCtx.drawImage(
      image,
      Math.max(0, sourceX),
      Math.max(0, sourceY),
      Math.min(sourceSize, image.naturalWidth),
      Math.min(sourceSize, image.naturalHeight),
      0,
      0,
      cropSize,
      cropSize
    );

    // Convert to blob and then to file
    cropCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        onCropComplete(file);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recortar Imagem</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            className="relative mx-auto border border-border rounded-lg overflow-hidden"
            style={{ width: 300, height: 300 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              className="hidden"
              onLoad={drawCanvas}
            />
            <canvas
              ref={canvasRef}
              className="cursor-move"
              style={{ width: 300, height: 300 }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <Slider
              value={zoom}
              onValueChange={(value) => {
                setZoom(value);
                setTimeout(drawCanvas, 0);
              }}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleCrop}>
              Recortar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
