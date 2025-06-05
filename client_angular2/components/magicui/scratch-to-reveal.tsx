"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ScratchToRevealProps {
  width: number;
  height: number;
  minScratchPercentage?: number;
  className?: string;
  onComplete?: () => void;
  children: React.ReactNode;
  scratchColor?: string;
  brushSize?: number;
}

export const ScratchToReveal: React.FC<ScratchToRevealProps> = ({
  width,
  height,
  minScratchPercentage = 50,
  className,
  onComplete,
  children,
  scratchColor = "#C0C0C0",
  brushSize = 20,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scratchedPixels, setScratchedPixels] = useState(0);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Fill with scratch color
    ctx.fillStyle = scratchColor;
    ctx.fillRect(0, 0, width, height);

    // Add some texture/pattern
    ctx.fillStyle = "#A0A0A0";
    for (let i = 0; i < width; i += 4) {
      for (let j = 0; j < height; j += 4) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }

    // Add scratch instruction text
    ctx.fillStyle = "#666";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Scratch to reveal!", width / 2, height / 2);
  }, [width, height, scratchColor]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const getTouchPos = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: (touch?.clientX || 0) - rect.left,
      y: (touch?.clientY || 0) - rect.top,
    };
  }, []);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
    ctx.fill();
  }, [brushSize]);

  const calculateScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    return (transparentPixels / (width * height)) * 100;
  }, [width, height]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCompleted) return;
    setIsScratching(true);
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  }, [isCompleted, getMousePos, scratch]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching || isCompleted) return;
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);

    const percentage = calculateScratchPercentage();
    setScratchedPixels(percentage);

    if (percentage >= minScratchPercentage && !isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }
  }, [isScratching, isCompleted, getMousePos, scratch, calculateScratchPercentage, minScratchPercentage, onComplete]);

  const handleMouseUp = useCallback(() => {
    setIsScratching(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isCompleted) return;
    e.preventDefault();
    setIsScratching(true);
    const pos = getTouchPos(e);
    scratch(pos.x, pos.y);
  }, [isCompleted, getTouchPos, scratch]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching || isCompleted) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    scratch(pos.x, pos.y);

    const percentage = calculateScratchPercentage();
    setScratchedPixels(percentage);

    if (percentage >= minScratchPercentage && !isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }
  }, [isScratching, isCompleted, getTouchPos, scratch, calculateScratchPercentage, minScratchPercentage, onComplete]);

  const handleTouchEnd = useCallback(() => {
    setIsScratching(false);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} style={{ width, height }}>
      {/* Content to reveal */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>

      {/* Scratch canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          opacity: isCompleted ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
        }}
      />

      {/* Progress indicator */}
      {scratchedPixels > 0 && !isCompleted && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-black/50 rounded-full px-2 py-1">
            <div className="text-white text-xs text-center">
              {Math.round(scratchedPixels)}% scratched
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
