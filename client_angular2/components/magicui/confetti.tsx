"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

interface ConfettiProps {
  active?: boolean;
  config?: {
    angle?: number;
    spread?: number;
    startVelocity?: number;
    elementCount?: number;
    dragFriction?: number;
    duration?: number;
    stagger?: number;
    width?: string;
    height?: string;
    perspective?: string;
    colors?: string[];
  };
}

const defaultColors = [
  "#f43f5e",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
];

export const Confetti: React.FC<ConfettiProps> = ({
  active = true,
  config = {},
}) => {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  const {
    angle = 90,
    spread = 45,
    startVelocity = 45,
    elementCount = 50,
    dragFriction = 0.12,
    duration = 3000,
    stagger = 3,
    width = "10px",
    height = "10px",
    perspective = "500px",
    colors = defaultColors,
  } = config;

  useEffect(() => {
    if (!active) return;

    const pieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < elementCount; i++) {
      const angleInRadians = (angle * Math.PI) / 180;
      const spreadInRadians = (spread * Math.PI) / 180;
      
      const velocity = startVelocity * (0.5 + Math.random() * 0.5);
      const angle1 = angleInRadians + (Math.random() - 0.5) * spreadInRadians;
      
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: 100,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)] || '#000000',
        size: Math.random() * 8 + 4,
        velocity: {
          x: Math.cos(angle1) * velocity,
          y: Math.sin(angle1) * velocity,
        },
      });
    }

    setConfettiPieces(pieces);

    const timer = setTimeout(() => {
      setConfettiPieces([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, angle, spread, startVelocity, elementCount, duration, colors]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {confettiPieces.map((piece, index) => (
          <motion.div
            key={piece.id}
            className="absolute"
            style={{
              backgroundColor: piece.color,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              left: `${piece.x}%`,
              top: `${piece.y}%`,
            }}
            initial={{
              x: 0,
              y: 0,
              rotate: piece.rotation,
              opacity: 1,
            }}
            animate={{
              x: piece.velocity.x * 10,
              y: -piece.velocity.y * 10 - 1000,
              rotate: piece.rotation + 720,
              opacity: 0,
            }}
            transition={{
              duration: duration / 1000,
              delay: index * (stagger / 1000),
              ease: "easeOut",
            }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
