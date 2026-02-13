import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from './Button';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedBase64: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());
  const containerSize = 280; // Size of the view box

  useEffect(() => {
    imgRef.current.src = imageSrc;
    imgRef.current.onload = () => {
        // Calculate initial scale to "cover" the circular area 
        // We want the smaller dimension to match the container size
        const w = imgRef.current.width;
        const h = imgRef.current.height;
        
        const scaleW = containerSize / w;
        const scaleH = containerSize / h;
        
        // Use the larger scale factor to ensure it covers the area (simulating object-cover)
        // Or use smaller to contain. User asked for "whole picture is visible". 
        // "Contain" logic: Math.min(scaleW, scaleH).
        // However, for a circle crop, "contain" leaves whitespace.
        // I will use a value slightly smaller than cover to start, or exactly cover.
        
        const initialScale = Math.max(scaleW, scaleH);
        
        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
        draw();
    };
  }, [imageSrc]);

  useEffect(() => {
    draw();
  }, [scale, position]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image with transforms
    const img = imgRef.current;
    
    // We want to center the image in the canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.scale(scale, scale);
    // Draw centered relative to translation point
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    // Create a new canvas for the final output
    const outputSize = 400; // Final resolution
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext('2d');
    
    if (ctx) {
        // Fill white background just in case
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputSize, outputSize);

        const img = imgRef.current;
        const centerX = outputSize / 2;
        const centerY = outputSize / 2;
        
        const ratio = outputSize / containerSize;

        ctx.translate(centerX + (position.x * ratio), centerY + (position.y * ratio));
        ctx.scale(scale * ratio, scale * ratio);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        onCrop(outputCanvas.toDataURL('image/jpeg', 0.9));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Adjust Photo</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center gap-6">
          <div className="relative group">
            {/* Mask/Frame */}
            <div className="w-[280px] h-[280px] rounded-full border-4 border-indigo-500/20 overflow-hidden relative cursor-move shadow-inner bg-gray-100 ring-4 ring-indigo-50"
                 onMouseDown={handleMouseDown}
                 onMouseMove={handleMouseMove}
                 onMouseUp={handleMouseUp}
                 onMouseLeave={handleMouseUp}
            >
                <canvas 
                    ref={canvasRef}
                    width={280}
                    height={280}
                    className="w-full h-full"
                />
            </div>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Move size={32} />
            </div>
          </div>

          <div className="w-full space-y-2">
             <div className="flex justify-between text-xs text-gray-500">
                <ZoomOut size={16} />
                <span>Zoom</span>
                <ZoomIn size={16} />
             </div>
             <input 
                type="range" 
                min={0.1}
                max={3} 
                step="0.05" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
             />
          </div>

          <div className="flex w-full gap-3">
            <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} icon={<Check size={16} />}>Apply</Button>
          </div>
        </div>
      </div>
    </div>
  );
};