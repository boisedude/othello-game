/**
 * Disc Component
 * Displays a black or white disc with flip animation
 */

import { useId } from 'react'
import { cn } from '@/lib/utils'
import type { Player } from '@/types/othello.types'

interface DiscProps {
  player: Player
  isFlipping?: boolean
  className?: string
}

export function Disc({ player, isFlipping = false, className }: DiscProps) {
  const id = useId()

  return (
    <div
      className={cn(
        'relative h-full w-full rounded-full transition-transform duration-300',
        isFlipping && 'animate-disc-flip',
        player === 2 && 'rotate-y-180', // Flip container to show white side
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Black side */}
      <div
        className="absolute inset-0 rounded-full backface-hidden"
        style={{
          backfaceVisibility: 'hidden',
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <radialGradient id={`black-gradient-${id}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="50%" stopColor="#2d3748" />
              <stop offset="100%" stopColor="#1a202c" />
            </radialGradient>
            <filter id={`black-shadow-${id}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill={`url(#black-gradient-${id})`}
            filter={`url(#black-shadow-${id})`}
          />
          {/* Highlight */}
          <ellipse
            cx="40"
            cy="35"
            rx="15"
            ry="10"
            fill="white"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* White side */}
      <div
        className="absolute inset-0 rounded-full backface-hidden rotate-y-180"
        style={{
          backfaceVisibility: 'hidden',
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <radialGradient id={`white-gradient-${id}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f7fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>
            <filter id={`white-shadow-${id}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill={`url(#white-gradient-${id})`}
            filter={`url(#white-shadow-${id})`}
            stroke="#cbd5e0"
            strokeWidth="1"
          />
          {/* Highlight */}
          <ellipse
            cx="40"
            cy="35"
            rx="15"
            ry="10"
            fill="white"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  )
}
