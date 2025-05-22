
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderPhoto } from '@/types/order';
import { Camera, X } from 'lucide-react';

interface PhotoUploadProps {
  photos: OrderPhoto[];
  onAddPhoto: (photo: OrderPhoto) => void;
  onRemovePhoto: (index: number) => void;
  readOnly?: boolean;
}

const PhotoUpload = ({ photos, onAddPhoto, onRemovePhoto, readOnly = false }: PhotoUploadProps) => {
  const [description, setDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      
      const photo: OrderPhoto = {
        id: Date.now().toString(),
        url: reader.result,
        description: description,
        added_at: new Date().toISOString()
      };
      
      onAddPhoto(photo);
      setDescription('');
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="border-2 border-dashed rounded-md p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="photo-description" className="text-sm font-medium">
              Descrição da foto (opcional)
            </label>
            <Input
              id="photo-description"
              type="text"
              placeholder="Ex: Dano no para-choque, Motor, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="flex justify-center">
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label 
              htmlFor="photo-upload" 
              className="cursor-pointer flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white rounded-md"
            >
              <Camera className="h-5 w-5" />
              <span>Selecionar Foto</span>
            </label>
          </div>
        </div>
      )}
      
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative rounded-md overflow-hidden group">
              <img 
                src={photo.url} 
                alt={photo.description || `Foto ${index + 1}`}
                className="w-full h-40 object-cover"
              />
              
              {photo.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-xs">
                  {photo.description}
                </div>
              )}
              
              {!readOnly && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemovePhoto(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
          Nenhuma foto adicionada
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
