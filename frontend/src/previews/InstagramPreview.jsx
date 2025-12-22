import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const InstagramPreview = ({ content, assets }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = assets?.images || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Truncate caption to Instagram's preview length
  const truncatedCaption = content.length > 220 
    ? content.slice(0, 220) + '...' 
    : content;
  
  const hasMore = content.length > 220;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 rounded-full p-0.5">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">yourbrand</p>
            <p className="text-xs text-slate-600">Sponsored</p>
          </div>
        </div>
        <button className="p-1">
          <MoreHorizontal className="text-slate-900" size={20} />
        </button>
      </div>

      {/* Image/Carousel */}
      {images.length > 0 ? (
        <div className="relative bg-slate-100 aspect-square">
          <img 
            src={images[currentImageIndex]} 
            alt="Instagram post" 
            className="w-full h-full object-cover"
          />
          
          {/* Carousel Indicators */}
          {images.length > 1 && (
            <>
              {/* Dots */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-white w-2' 
                        : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              {currentImageIndex > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft className="text-slate-900" size={20} />
                </button>
              )}
              {currentImageIndex < images.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <ChevronRight className="text-slate-900" size={20} />
                </button>
              )}

              {/* Counter */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full font-medium">
                {currentImageIndex + 1}/{images.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-slate-200 aspect-square flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-300 rounded-lg mx-auto mb-2"></div>
            <p className="text-slate-500 text-sm">No image</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button className="hover:opacity-70 transition-opacity">
              <Heart className="text-slate-900" size={24} />
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <MessageCircle className="text-slate-900" size={24} />
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <Send className="text-slate-900" size={24} />
            </button>
          </div>
          <button className="hover:opacity-70 transition-opacity">
            <Bookmark className="text-slate-900" size={24} />
          </button>
        </div>

        {/* Likes */}
        <p className="font-semibold text-sm text-slate-900 mb-2">1,234 likes</p>

        {/* Caption */}
        <div className="text-sm text-slate-900">
          <p>
            <span className="font-semibold">yourbrand</span>{' '}
            {truncatedCaption}
            {hasMore && (
              <button className="text-slate-500 ml-1">more</button>
            )}
          </p>
        </div>

        {/* Comments Preview */}
        <button className="text-sm text-slate-500 mt-2 block">
          View all 42 comments
        </button>

        {/* Timestamp */}
        <p className="text-xs text-slate-400 mt-1">2 HOURS AGO</p>
      </div>

      {/* Comment Input */}
      <div className="border-t border-slate-200 p-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 text-sm text-slate-900 outline-none"
          readOnly
        />
        <button className="text-blue-500 font-semibold text-sm">Post</button>
      </div>
    </div>
  );
};

export default InstagramPreview;