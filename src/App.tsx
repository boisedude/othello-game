/**
 * App Component
 * Main application with routing and error boundary
 * Uses HashRouter for easy deployment without server configuration
 */

import { HashRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { OthelloGame } from './pages/OthelloGame'

function ErrorFallback({ error }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md rounded-lg border border-destructive bg-card p-6 text-center shadow-lg">
        <h2 className="mb-2 text-2xl font-bold text-destructive">Something went wrong</h2>
        <p className="mb-4 text-muted-foreground">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<OthelloGame />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  )
}
