'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import { cn } from '@/lib/utils';

interface ConfettiProps {
  className?: string;
  manualstart?: boolean;
  globalstart?: boolean;
}

interface ConfettiPiece {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  mp: number;
  xv: number;
  yv: number;
  r: number;
  rv: number;
}

export default function Confetti({
  className,
  manualstart = false,
  globalstart = false,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(!manualstart);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationId = useRef<number>();

  const colors = useMemo(
    () => [
      '#f43f5e',
      '#10b981',
      '#3b82f6',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
      '#f97316',
      '#6366f1',
    ],
    [],
  );

  const confetti = useRef<ConfettiPiece[]>([]);

  const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const initConfetti = useCallback(() => {
    for (let i = 0; i < 50; i++) {
      confetti.current.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height - dimensions.height,
        w: randomRange(10, 30),
        h: randomRange(5, 15),
        color: colors[Math.floor(Math.random() * colors.length)] || '#000000',
        mp: randomRange(0.5, 1),
        xv: randomRange(-3, 3),
        yv: randomRange(1, 3),
        r: randomRange(0, 360),
        rv: randomRange(-5, 5),
      });
    }
  }, [dimensions.width, dimensions.height, colors]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    confetti.current.forEach((c, i) => {
      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
      ctx.rotate((c.r * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();

      c.x += c.xv * c.mp;
      c.y += c.yv * c.mp;
      c.r += c.rv;

      if (c.y > dimensions.height) {
        confetti.current.splice(i, 1);
      }
    });

    if (confetti.current.length > 0) {
      animationId.current = requestAnimationFrame(render);
    } else {
      setIsVisible(false);
    }
  }, [dimensions.width, dimensions.height]);

  const startConfetti = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true);
      confetti.current = [];
      initConfetti();
      render();
    }
  }, [isVisible, initConfetti, render]);

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { offsetWidth, offsetHeight } = canvasRef.current.parentElement!;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = dimensions.width;
      canvasRef.current.height = dimensions.height;
    }
  }, [dimensions]);

  useEffect(() => {
    if (globalstart && !manualstart) {
      startConfetti();
    }
  }, [globalstart, manualstart, startConfetti]);

  useEffect(() => {
    if (isVisible && confetti.current.length === 0) {
      initConfetti();
      render();
    }
  }, [isVisible, initConfetti, render]);

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="size-full"
        style={{ display: isVisible ? 'block' : 'none' }}
      />
    </div>
  );
}
