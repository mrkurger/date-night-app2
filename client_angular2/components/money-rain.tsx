"use client"

import { useEffect, useState } from "react"

interface MoneyRainProps {
  isActive: boolean
  intensity?: number
  duration?: number
}

export default function MoneyRain({ isActive, intensity = 50, duration = 3000 }: MoneyRainProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: intensity }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
      }, duration)

      return () => clearTimeout(timer)
    }
    return undefined;
  }, [isActive, intensity, duration])

  if (!isActive || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-green-400 text-2xl animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: "2s",
            animationIterationCount: "infinite",
          }}
        >
          💸
        </div>
      ))}
    </div>
  )
}
