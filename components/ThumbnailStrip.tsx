import React from 'react';

interface ThumbnailStripProps {
  images: string[];
  selectedImage: string | null;
  onSelectImage: (imageData: string) => void;
}

export const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({ images, selectedImage, onSelectImage }) => {
  if (images.length <= 1) {
    return null;
  }

  return (
    <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-sm p-2 rounded-xl flex items-center justify-center animate-fade-in">
      <div className="flex space-x-2">
        {images.map((img, index) => {
          const isSelected = img === selectedImage;
          return (
            <button key={index} onClick={() => onSelectImage(img)} className="rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface">
              <img
                src={img}
                alt={`Generated thumbnail ${index + 1}`}
                className={`w-16 h-16 object-cover rounded-md border-2 transition-all duration-200 ${isSelected ? 'border-primary scale-110' : 'border-transparent hover:border-surface-light'}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
