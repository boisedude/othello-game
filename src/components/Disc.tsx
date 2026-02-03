/**
 * Disc Component
 * Displays a glossy black or white disc with realistic 3D flip animation
 */

import { memo, useId } from 'react'
import { cn } from '@/lib/utils'
import type { Player } from '@/types/othello.types'

interface DiscProps {
  player: Player
  isFlipping?: boolean
  flipDelayClass?: string
  isNewlyPlaced?: boolean
  isWinning?: boolean
  className?: string
}

export const Disc = memo(function Disc({
  player,
  isFlipping = false,
  flipDelayClass = '',
  isNewlyPlaced = false,
  isWinning = false,
  className,
}: DiscProps) {
  const id = useId()

  return (
    <div
      className={cn(
        'relative h-full w-full rounded-full',
        'transition-transform duration-300',
        isFlipping && cn('animate-disc-flip', flipDelayClass),
        isFlipping && 'animate-capture-celebrate',
        isNewlyPlaced && 'animate-disc-place',
        isWinning && 'animate-winner-pulse',
        player === 2 && !isFlipping && 'rotate-y-180', // Show white side when not flipping
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Black side - glossy obsidian look */}
      <div
        className="absolute inset-0 rounded-full backface-hidden"
        style={{
          backfaceVisibility: 'hidden',
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-lg">
          <defs>
            {/* Main gradient - deep black with subtle blue undertone */}
            <radialGradient id={`black-gradient-${id}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="30%" stopColor="#2d3748" />
              <stop offset="70%" stopColor="#1a202c" />
              <stop offset="100%" stopColor="#0d1117" />
            </radialGradient>

            {/* Glossy highlight gradient */}
            <radialGradient id={`black-highlight-${id}`} cx="40%" cy="30%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.35" />
              <stop offset="50%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Edge lighting */}
            <linearGradient id={`black-edge-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#718096" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#1a202c" stopOpacity="0" />
              <stop offset="100%" stopColor="#0d1117" stopOpacity="0.8" />
            </linearGradient>

            {/* Drop shadow filter */}
            <filter id={`black-shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
            </filter>

            {/* Inner glow for depth */}
            <filter id={`black-inner-${id}`}>
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feOffset in="blur" dx="0" dy="1" result="offsetBlur" />
              <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
            </filter>
          </defs>

          {/* Base disc */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill={`url(#black-gradient-${id})`}
            filter={`url(#black-shadow-${id})`}
          />

          {/* Edge highlight ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={`url(#black-edge-${id})`}
            strokeWidth="2"
          />

          {/* Primary glossy highlight - top left */}
          <ellipse
            cx="38"
            cy="32"
            rx="18"
            ry="12"
            fill={`url(#black-highlight-${id})`}
          />

          {/* Secondary smaller highlight */}
          <ellipse
            cx="35"
            cy="28"
            rx="8"
            ry="5"
            fill="white"
            opacity="0.25"
          />

          {/* Subtle rim light on bottom right */}
          <path
            d="M 75 65 A 30 30 0 0 1 65 75"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.1"
          />
        </svg>
      </div>

      {/* White side - glossy pearl look */}
      <div
        className="absolute inset-0 rounded-full backface-hidden rotate-y-180"
        style={{
          backfaceVisibility: 'hidden',
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-lg">
          <defs>
            {/* Main gradient - pearl white with warm undertone */}
            <radialGradient id={`white-gradient-${id}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>

            {/* Glossy highlight gradient */}
            <radialGradient id={`white-highlight-${id}`} cx="40%" cy="30%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Edge shadow for depth */}
            <linearGradient id={`white-edge-${id}`} x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
            </linearGradient>

            {/* Drop shadow filter */}
            <filter id={`white-shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Base disc */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill={`url(#white-gradient-${id})`}
            filter={`url(#white-shadow-${id})`}
          />

          {/* Subtle outer ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#b8c4ce"
            strokeWidth="1"
          />

          {/* Edge depth gradient ring */}
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke={`url(#white-edge-${id})`}
            strokeWidth="3"
          />

          {/* Primary glossy highlight - top left */}
          <ellipse
            cx="38"
            cy="32"
            rx="18"
            ry="12"
            fill={`url(#white-highlight-${id})`}
          />

          {/* Secondary bright highlight */}
          <ellipse
            cx="35"
            cy="28"
            rx="10"
            ry="6"
            fill="white"
            opacity="0.7"
          />

          {/* Small specular highlight */}
          <circle
            cx="32"
            cy="26"
            r="3"
            fill="white"
            opacity="0.9"
          />

          {/* Subtle warm reflection on bottom */}
          <ellipse
            cx="60"
            cy="70"
            rx="12"
            ry="6"
            fill="#fef3c7"
            opacity="0.15"
          />
        </svg>
      </div>
    </div>
  )
})
