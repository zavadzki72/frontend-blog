
import { useState, useRef, useCallback, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState([1]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const CONTAINER_SIZE = 300;
  const CROP_SIZE = 250;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CONTAINER_SIZE;
    canvas.height = CONTAINER_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, CONTAINER_SIZE, CONTAINER_SIZE);

    // Calculate scaled dimensions
    const imageAspect = image.naturalWidth / image.naturalHeight;
    let displayWidth, displayHeight;

    if (imageAspect > 1) {
      displayWidth = CONTAINER_SIZE * zoom[0];
      displayHeight = (CONTAINER_SIZE / imageAspect) * zoom[0];
    } else {
      displayWidth = (CONTAINER_SIZE * imageAspect) * zoom[0];
      displayHeight = CONTAINER_SIZE * zoom[0];
    }

    // Center the image initially
    const centerX = (CONTAINER_SIZE - displayWidth) / 2;
    const centerY = (CONTAINER_SIZE - displayHeight) / 2;

    // Apply position offset
    const x = centerX + position.x;
    const y = centerY + position.y;

    // Draw image
    ctx.drawImage(image, x, y, displayWidth, displayHeight);

    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CONTAINER_SIZE, CONTAINER_SIZE);

    // Clear crop area (center square)
    const cropX = (CONTAINER_SIZE - CROP_SIZE) / 2;
    const cropY = (CONTAINER_SIZE - CROP_SIZE) / 2;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropX, cropY, CROP_SIZE, CROP_SIZE);
    ctx.globalCompositeOperation = 'source-over';

    // Draw crop border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, CROP_SIZE, CROP_SIZE);

    // Draw corner indicators
    const cornerSize = 15;
    ctx.fillStyle = '#ffffff';
    // Top-left
    ctx.fillRect(cropX - 1, cropY - 1, cornerSize, 3);
    ctx.fillRect(cropX - 1, cropY - 1, 3, cornerSize);
    // Top-right
    ctx.fillRect(cropX + CROP_SIZE - cornerSize + 1, cropY - 1, cornerSize, 3);
    ctx.fillRect(cropX + CROP_SIZE - 2, cropY - 1, 3, cornerSize);
    // Bottom-left
    ctx.fillRect(cropX - 1, cropY + CROP_SIZE - 2, cornerSize, 3);
    ctx.fillRect(cropX - 1, cropY + CROP_SIZE - cornerSize + 1, 3, cornerSize);
    // Bottom-right
    ctx.fillRect(cropX + CROP_SIZE - cornerSize + 1, cropY + CROP_SIZE - 2, cornerSize, 3);
    ctx.fillRect(cropX + CROP_SIZE - 2, cropY + CROP_SIZE - cornerSize + 1, 3, cornerSize);
  }, [position, zoom, imageLoaded]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setPosition({ x: 0, y: 0 });
    setZoom([1]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x: x - position.x, y: y - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPosition({
      x: x - dragStart.x,
      y: y - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) return;

    const outputSize = 400; // Higher resolution output
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;

    // Calculate image scaling and positioning
    const imageAspect = image.naturalWidth / image.naturalHeight;
    let displayWidth, displayHeight;

    if (imageAspect > 1) {
      displayWidth = CONTAINER_SIZE * zoom[0];
      displayHeight = (CONTAINER_SIZE / imageAspect) * zoom[0];
    } else {
      displayWidth = (CONTAINER_SIZE * imageAspect) * zoom[0];
      displayHeight = CONTAINER_SIZE * zoom[0];
    }

    const centerX = (CONTAINER_SIZE - displayWidth) / 2;
    const centerY = (CONTAINER_SIZE - displayHeight) / 2;
    const imageX = centerX + position.x;
    const imageY = centerY + position.y;

    // Calculate crop area in image coordinates
    const cropX = (CONTAINER_SIZE - CROP_SIZE) / 2;
    const cropY = (CONTAINER_SIZE - CROP_SIZE) / 2;

    // Convert crop area to source image coordinates
    const scaleX = image.naturalWidth / displayWidth;
    const scaleY = image.naturalHeight / displayHeight;

    const sourceX = (cropX - imageX) * scaleX;
    const sourceY = (cropY - imageY) * scaleY;
    const sourceWidth = CROP_SIZE * scaleX;
    const sourceHeight = CROP_SIZE * scaleY;

    // Draw cropped portion
    outputCtx.drawImage(
      image,
      Math.max(0, sourceX),
      Math.max(0, sourceY),
      Math.min(sourceWidth, image.naturalWidth - Math.max(0, sourceX)),
      Math.min(sourceHeight, image.naturalHeight - Math.max(0, sourceY)),
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert to file
    outputCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        onCropComplete(file);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleClose = () => {
    setImageLoaded(false);
    setPosition({ x: 0, y: 0 });
    setZoom([1]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" aria-describedby="crop-description">
        <DialogHeader>
          <DialogTitle>Recortar Imagem</DialogTitle>
        </DialogHeader>
        
        <div id="crop-description" className="sr-only">
          Use o controle de zoom e arraste a imagem para posicionar a área de recorte
        </div>
        
        <div className="space-y-4">
          <div 
            ref={containerRef}
            className="relative mx-auto border border-border rounded-lg overflow-hidden bg-gray-100"
            style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Imagem para recorte"
              className="hidden"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-sm text-muted-foreground">Carregando...</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <Slider
              value={zoom}
              onValueChange={(value) => {
                setZoom(value);
              }}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
              disabled={!imageLoaded}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleCrop} disabled={!imageLoaded}>
              Recortar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
