import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "./spark-replacement.css"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { ThemeProvider } from '@/components/ThemeProvider'

// Initialize Firebase
import './lib/firebase'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <App />
    </ThemeProvider>
   </ErrorBoundary>
)
