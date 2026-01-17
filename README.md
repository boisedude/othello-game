# Othello - Play Coop!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)

A classic Othello (Reversi) strategy game featuring AI opponents with personality-driven difficulty levels. Challenge Coop and his alter-egos in this beautifully animated browser-based board game.

![Screenshot](screenshot.png)

## Features

- **Classic Othello gameplay** - Authentic board game rules with disc-flipping mechanics
- **AI opponents with personality** - Three difficulty levels featuring the creator's dogs:
  - **😴 Sleepy Coop** (Easy): Random move selection - perfect for learning
  - **🤓 Caffeinated Coop** (Medium): Greedy strategy prioritizing corners and edges
  - **🐺 Bentley - The Mastermind** (Hard): Minimax algorithm with alpha-beta pruning (depth 6)
- **Smooth disc-flipping animations** - Beautiful 3D rotation effects
- **Leaderboard system** - Track wins, losses, win streaks, largest margins, and perfect games
- **Sound effects** - Web Audio API for disc placement, flipping, and victory sounds
- **Victory dialogs** - Rotating personality messages based on difficulty and outcome
- **Local persistence** - Stats and game state saved in browser localStorage
- **Keyboard controls** - Full keyboard support (N = New Game, L = Leaderboard, M = Mute)
- **Responsive design** - Beautiful emerald green board optimized for desktop and tablet

## Technology Stack

- **[React 19](https://reactjs.org/)** - Latest React with TypeScript
- **[Vite 5](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[React Router 7](https://reactrouter.com/)** - Client-side routing
- **Web Audio API** - Dynamic sound generation

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/othello.git
cd othello

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The development server will start at `http://localhost:3002` (or the next available port).

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript compiler
```

## How to Play

**Objective**: Capture more discs than your opponent by flanking their discs.

**Gameplay**:
1. Players take turns placing discs on the 8x8 board
2. You must place a disc that flanks (traps) at least one opponent disc between your new disc and an existing disc
3. All flanked opponent discs flip to your color
4. If you have no valid moves, your turn is skipped
5. Game ends when neither player can move
6. Player with the most discs wins!

**Strategic Tips**:
- **Corners are king** - Corner positions can never be flipped
- **Avoid X-squares** - Positions diagonally adjacent to corners (unless the corner is already taken)
- **Edges are valuable** - Edge positions are harder to flip than center positions
- **Mobility matters** - Keep your options open and limit your opponent's moves

## AI Difficulty Levels

### Easy: 😴 Sleepy Coop
Random move selection with no strategic thinking. Perfect for learning the game rules and basic strategy.

### Medium: 🤓 Caffeinated Coop
Greedy algorithm that:
- Prioritizes corner positions (highest value)
- Avoids X-squares near empty corners
- Prefers edges over center positions
- Maximizes the number of discs flipped per move

### Hard: 🐺 Bentley - The Mastermind
Advanced minimax algorithm with alpha-beta pruning:
- Search depth: 6 levels
- Sophisticated evaluation function considering:
  - Corner control (+100 points each)
  - X-square penalties (-25 if adjacent corner is empty)
  - C-square penalties (-20 if adjacent corner is empty)
  - Edge position bonuses (+5 each)
  - Mobility (number of valid moves available)
  - Disc count differential
- Move ordering optimization for efficient pruning

## Project Structure

```
othello/
├── src/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── Board.tsx                # 8x8 game board
│   │   ├── Cell.tsx                 # Individual cell component
│   │   ├── Disc.tsx                 # Animated disc with flip effect
│   │   ├── GameControls.tsx         # Difficulty selector and controls
│   │   ├── VictoryDialog.tsx        # End game dialog with personality
│   │   └── LeaderboardDialog.tsx    # Stats and leaderboard
│   ├── hooks/
│   │   ├── useOthelloGame.ts        # Game state management
│   │   ├── useLeaderboard.ts        # Stats and leaderboard logic
│   │   └── useGameAudio.ts          # Web Audio API sounds
│   ├── lib/
│   │   ├── othelloRules.ts          # Game rules engine
│   │   ├── aiStrategies.ts          # AI algorithms (easy, medium, hard)
│   │   └── utils.ts                 # Utility functions
│   ├── pages/
│   │   └── OthelloGame.tsx          # Main game page
│   ├── types/
│   │   └── othello.types.ts         # TypeScript type definitions
│   ├── App.tsx                      # Main app with routing
│   └── main.tsx                     # Entry point
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Deployment

The application is a static single-page app that can be deployed to any static hosting service:

```bash
# Build for production
npm run build
```

The `dist/` folder contains all static assets ready to deploy to:
- Netlify
- Vercel
- GitHub Pages
- Any static web server

The application uses HashRouter for client-side routing and requires no backend server.

## Stats Tracked

The leaderboard system tracks comprehensive statistics:

- **Total Games**: Wins + Losses + Draws
- **Win Rate**: Percentage of games won
- **Current Win Streak**: Consecutive wins
- **Longest Win Streak**: Best streak ever achieved
- **Largest Victory Margin**: Biggest disc count difference in a win
- **Perfect Games**: Games where opponent ended with 0 discs
- **Total Discs Flipped**: Cumulative across all games

All stats are persisted in browser localStorage.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Maintain TypeScript strict mode compliance
- Follow existing code style (ESLint + Prettier)
- Ensure all type checks pass (`npm run type-check`)
- Test across different difficulty levels
- Update documentation for new features

## License

MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 M. Cooper

## Credits

Created by M. Cooper for [www.mcooper.com](https://www.mcooper.com)

**AI Personalities**: Named after the creator's dogs, Coop and Bentley

---

**Play Coop • Can you beat Coop?**
