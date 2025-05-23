
import React, { useState } from 'react';
import { OrderPhoto } from '@/types/order';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatDate } from '@/utils/formatters';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoGalleryProps {
  photos: OrderPhoto[];
}

const PhotoGallery = ({ photos }: PhotoGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div 
            key={index} 
            className="cursor-pointer rounded-md overflow-hidden" 
            onClick={() => openLightbox(index)}
          >
            <img 
              src={photo.url} 
              alt={photo.description || `Foto ${index + 1}`}
              className="w-full h-40 object-cover hover:opacity-90 transition-opacity"
            />
            {photo.description && (
              <div className="bg-gray-100 p-2 text-xs truncate">
                {photo.description}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-3xl p-0 bg-black text-white">
          {selectedIndex !== null && selectedIndex < photos.length && (
            <div className="relative">
              <div className="flex justify-center items-center h-[70vh]">
                <img 
                  src={photos[selectedIndex].url} 
                  alt={photos[selectedIndex].description || `Foto ${selectedIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              <div className="absolute top-2 right-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeLightbox}
                  className="text-white hover:bg-black/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPrevious}
                  className="text-white hover:bg-black/20"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              </div>
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToNext}
                  className="text-white hover:bg-black/20"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-4">
                <div className="flex flex-col space-y-1">
                  {photos[selectedIndex].description && (
                    <p className="text-sm">{photos[selectedIndex].description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Adicionada em: {formatDate(new Date(photos[selectedIndex].created_at))}
                  </p>
                </div>
                <div className="mt-2 flex justify-center">
                  {photos.map((_, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`mx-1 w-2 h-2 rounded-full cursor-pointer ${
                        idx === selectedIndex ? 'bg-white' : 'bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoGallery;
