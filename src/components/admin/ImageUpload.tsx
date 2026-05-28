'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Upload, X, ImagePlus, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface UploadedImage {
  id?: number;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  isNew?: boolean;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  onDelete?: (imageId: number) => void;
}

export default function ImageUpload({ images, onChange, onDelete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) { toast.error('Error al subir imagen'); return null; }
      return (await res.json()).url;
    } catch {
      toast.error('Error de conexión');
      return null;
    }
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validFiles = Array.from(files).filter((f) => {
      if (!validTypes.includes(f.type)) { toast.error(`${f.name}: tipo no soportado`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name}: máx 5MB`); return false; }
      return true;
    });
    if (validFiles.length === 0) return;
    setUploading(true);
    const newImages: UploadedImage[] = [];
    for (const file of validFiles) {
      const url = await uploadFile(file);
      if (url) newImages.push({ url, alt: file.name.replace(/\.[^.]+$/, ''), isPrimary: images.length === 0 && newImages.length === 0, isNew: true });
    }
    if (newImages.length > 0) { onChange([...images, ...newImages]); toast.success(`${newImages.length} imagen(es) subida(s)`); }
    setUploading(false);
  }, [images, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleRemove = (index: number) => {
    const image = images[index];
    if (image.id && onDelete) onDelete(image.id);
    const updated = images.filter((_, i) => i !== index);
    if (image.isPrimary && updated.length > 0) updated[0].isPrimary = true;
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging ? 'border-brown-medium bg-beige' : 'border-beige hover:border-brown-light hover:bg-beige/30'
        }`}
      >
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <svg className="animate-spin h-8 w-8 text-brown-medium" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-brown-medium">Subiendo imágenes...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-beige flex items-center justify-center">
                <ImagePlus size={22} className="text-brown-light" />
              </div>
              <div>
                <p className="text-sm font-medium text-brown-dark">
                  Arrastrá imágenes aquí o <span className="text-earth underline">hacé clic para seleccionar</span>
                </p>
                <p className="text-xs text-brown-medium/60 mt-1">JPG, PNG, WebP o GIF — máx. 5MB por imagen</p>
              </div>
            </>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <>
          <p className="text-xs text-brown-medium/60">
            Usá las flechas para cambiar el orden · La estrella marca la imagen principal (portada)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                  image.isPrimary ? 'border-brown-medium shadow-md' : 'border-beige'
                }`}
              >
                <div className="absolute top-1.5 right-1.5 z-10 bg-black/50 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                <div className="relative h-28">
                  <Image src={image.url} alt={image.alt || `Imagen ${index + 1}`} fill className="object-cover" />
                </div>

                {image.isPrimary && (
                  <div className="absolute top-1.5 left-1.5 z-10 bg-brown-dark/85 text-cream text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={9} fill="currentColor" />
                    Principal
                  </div>
                )}

                <div className="bg-white/95 border-t border-beige flex items-center justify-between px-1 py-1">
                  <button type="button" onClick={() => moveImage(index, 'left')} disabled={index === 0} className="p-1 rounded hover:bg-beige text-brown-medium disabled:opacity-20 transition-colors" title="Mover atrás">
                    <ChevronLeft size={15} />
                  </button>
                  <button type="button" onClick={() => handleSetPrimary(index)} className={`p-1 rounded transition-colors ${image.isPrimary ? 'text-brown-dark' : 'text-brown-light hover:text-brown-medium'}`} title="Marcar como principal">
                    <Star size={15} fill={image.isPrimary ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" onClick={() => handleRemove(index)} className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                    <X size={15} />
                  </button>
                  <button type="button" onClick={() => moveImage(index, 'right')} disabled={index === images.length - 1} className="p-1 rounded hover:bg-beige text-brown-medium disabled:opacity-20 transition-colors" title="Mover adelante">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
