'use client';

import React, { useRef, useEffect, useState } from 'react';
import { QrCode, X } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onQRDetected: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  isOpen,
  onClose,
  onQRDetected
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start QR detection loop
      detectQR();
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Не удалось получить доступ к камере');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const detectQR = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Simple QR detection using canvas data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrData = detectQRCode(imageData);
        
        if (qrData) {
          onQRDetected(qrData);
          stopScanning();
          onClose();
        }
      }

      if (isScanning) {
        requestAnimationFrame(scanFrame);
      }
    };

    scanFrame();
  };

  // Simple QR code detection simulation
  const detectQRCode = (imageData: ImageData): string | null => {
    // For demo purposes, simulate QR detection
    // In real implementation, use a proper QR library
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            Сканирование QR-кода
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>
            </div>
          </div>

          {/* Scanning Line Animation */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-0 right-0 h-0.5 bg-blue-500 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-white">
          <p className="text-sm opacity-75">
            Наведите камеру на QR-код для подключения к игре
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Manual Input */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Или введите код вручную"
            className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  onQRDetected(value);
                  onClose();
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
