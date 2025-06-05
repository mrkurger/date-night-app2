'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

export default function Particles({
  className = '',
  quantity = 30,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = '#ffffff',
  vx = 0,
  vy = 0,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const mouseMoved = useRef(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  const rgb = hexToRgb(color);

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): number => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      setCanvasSize({
        w: canvasContainerRef.current.offsetWidth,
        h: canvasContainerRef.current.offsetHeight,
      });
      canvasRef.current.width = canvasContainerRef.current.offsetWidth * dpr;
      canvasRef.current.height = canvasContainerRef.current.offsetHeight * dpr;
      canvasRef.current.style.width = `${canvasContainerRef.current.offsetWidth}px`;
      canvasRef.current.style.height = `${canvasContainerRef.current.offsetHeight}px`;
      context.current.scale(dpr, dpr);
    }
  }, [dpr]);

  const circleParams = useCallback((): Circle => {
    const x = Math.floor(Math.random() * canvasSize.w);
    const y = Math.floor(Math.random() * canvasSize.h);
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 2) + size;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  }, [canvasSize.w, canvasSize.h, size]);

  const clearContext = useCallback(() => {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.w, canvasSize.h);
    }
  }, [canvasSize.w, canvasSize.h]);

  const drawCircle = useCallback(
    (circle: Circle, update = false) => {
      if (context.current) {
        const { x, y, translateX, translateY, size, alpha } = circle;
        context.current.translate(translateX, translateY);
        context.current.beginPath();
        context.current.arc(x, y, size, 0, 2 * Math.PI);
        context.current.fillStyle = `rgba(${rgb.join(', ')}, ${alpha})`;
        context.current.fill();
        context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (!update) {
          circles.current.push(circle);
        }
      }
    },
    [rgb, dpr],
  );

  const drawParticles = useCallback(() => {
    clearContext();
    const particleCount = quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  }, [clearContext, quantity, circleParams, drawCircle]);

  const initCanvas = useCallback(() => {
    resizeCanvas();
    drawParticles();
  }, [resizeCanvas, drawParticles]);

  const animate = useCallback(() => {
    clearContext();
    circles.current.forEach((circle: Circle, i: number) => {
      // Handle the alpha value
      const edge = [
        circle.x + circle.translateX - circle.size, // distance from left edge
        canvasSize.w - circle.x - circle.translateX - circle.size, // distance from right edge
        circle.y + circle.translateY - circle.size, // distance from top edge
        canvasSize.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      circle.translateX +=
        (mousePosition.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
      circle.translateY +=
        (mousePosition.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;

      drawCircle(circle, true);

      // circle gets out of the canvas
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.h + circle.size
      ) {
        // remove the circle from the array
        circles.current.splice(i, 1);
        // create a new circle
        const newCircle = circleParams();
        drawCircle(newCircle);
        // update the circle position
      }
    });
    window.requestAnimationFrame(animate);
  }, [canvasSize.w, canvasSize.h, staticity, ease, clearContext, drawCircle, circleParams, vx, vy]);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext('2d');
    }
    initCanvas();
    animate();
    const resizeObserver = new ResizeObserver(initCanvas);
    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [color, quantity, staticity, ease, size, refresh, animate, initCanvas, canvasSize]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize;
      const x = e.clientX - rect.left - w / 2;
      const y = e.clientY - rect.top - h / 2;
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) {
        mousePosition.current = { x, y };
        mouseMoved.current = true;
      }
    }
  };

  return (
    <div
      className={cn('pointer-events-none', className)}
      ref={canvasContainerRef}
      onMouseMove={onMouseMove}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}

function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
    : [0, 0, 0];
}
