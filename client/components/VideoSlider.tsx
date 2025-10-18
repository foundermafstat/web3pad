'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface VideoSliderProps {
  videos: string[];
  onVideoEnd?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
}

const VideoSlider: React.FC<VideoSliderProps> = ({
  videos,
  onVideoEnd,
  autoPlay = true,
  showControls = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentVideo = videos[currentIndex];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setIsLoading(false);
      });

      videoRef.current.addEventListener('ended', () => {
        if (currentIndex < videos.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onVideoEnd?.();
        }
      });
    }
  }, [currentIndex, videos.length, onVideoEnd]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  const nextVideo = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      {/* Video Container */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={currentVideo}
          muted
          loop={false}
          playsInline
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-xl">Загрузка видео...</div>
          </div>
        )}

        {/* Video Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlayPause}
              className="bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>
          </div>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={prevVideo}
          disabled={currentIndex === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextVideo}
          disabled={currentIndex === videos.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Video Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
          {currentIndex + 1} / {videos.length}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoSlider;
