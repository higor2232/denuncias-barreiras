import React, { useState } from 'react';

interface ImageModalProps {
  imageUrls: string[];
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrls, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? imageUrls.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === imageUrls.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose} // Close modal on backdrop click
    >
      <div 
        className="relative bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] flex flex-col items-center shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 leading-none text-2xl font-bold hover:bg-opacity-75 z-10"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          {imageUrls.length > 1 && (
            <button 
              onClick={goToPrevious} 
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 text-3xl font-bold hover:bg-opacity-75 z-10"
              aria-label="Previous Image"
            >
              &#10094;
            </button>
          )}

          <img 
            src={imageUrls[currentIndex]} 
            alt={`Denúncia ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-md"
          />

          {imageUrls.length > 1 && (
            <button 
              onClick={goToNext} 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 text-3xl font-bold hover:bg-opacity-75 z-10"
              aria-label="Next Image"
            >
              &#10095;
            </button>
          )}
        </div>

        {imageUrls.length > 1 && (
          <div className="text-center mt-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {imageUrls.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
