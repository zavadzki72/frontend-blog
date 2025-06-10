import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ImageCropper } from "./ImageCropper";

interface ImageUploadProps {
  onImageUploaded: (imageKey: string) => void;
  onFileSelected?: (file: File) => void;
  currentImage?: string;
  type: "user" | "post";
  postId?: string;
  className?: string;
}

export function ImageUpload({ 
  onImageUploaded, 
  onFileSelected,
  currentImage, 
  type, 
  postId, 
  className = "" 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load current image URL when currentImage changes
  useEffect(() => {
    const loadImageUrl = async () => {
      if (currentImage && currentImage !== "temp-preview") {
        try {
          const url = await api.getImageUrl(currentImage);
          setCurrentImageUrl(url);
        } catch (error) {
          console.error("Failed to load image URL:", error);
          setCurrentImageUrl(null);
        }
      } else {
        setCurrentImageUrl(null);
      }
    };

    loadImageUrl();
  }, [currentImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    // For user images, show cropper
    if (type === "user") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImageSrc(e.target?.result as string);
        setOriginalFile(file);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      return;
    }

    // For post images, proceed as before
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // For post images during creation, just store the file
    if (type === "post" && !postId) {
      onFileSelected?.(file);
      onImageUploaded("temp-preview"); // Temporary key for preview
      return;
    }

    // For existing post updates, upload immediately
    setIsUploading(true);

    try {
      if (!postId) {
        throw new Error("Post ID is required for post image upload");
      }
      const imageKey = await api.uploadPostImage(file, postId);
      onImageUploaded(imageKey);
      
      toast({
        title: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCropComplete = async (croppedFile: File) => {
    setIsUploading(true);

    try {
      // Create preview from cropped file
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(croppedFile);

      // Upload the cropped image
      const imageKey = await api.uploadUserImage(croppedFile);
      onImageUploaded(imageKey);
      
      toast({
        title: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={handleClick}>
        <CardContent className="flex aspect-square items-center justify-center p-6">
          {preview || currentImageUrl ? (
            <div className="relative h-full w-full">
              <img
                src={preview || currentImageUrl || ""}
                alt="Preview"
                className="h-full w-full rounded-lg object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  setCurrentImageUrl(null);
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                  <div className="text-white">
                    <i className="fas fa-spinner fa-spin text-2xl"></i>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <i className="fas fa-cloud-upload-alt text-4xl text-muted-foreground mb-4"></i>
              <p className="text-sm text-muted-foreground">
                Clique para enviar uma imagem
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG até 5MB
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {(preview || currentImage) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isUploading}
          className="mt-2 w-full"
        >
          {isUploading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Enviando...
            </>
          ) : (
            <>
              <i className="fas fa-edit mr-2"></i>
              Alterar Imagem
            </>
          )}
        </Button>
      )}

      <ImageCropper
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        imageSrc={selectedImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
      />
    </div>
  );
}
