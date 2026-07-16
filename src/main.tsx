import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoadingProvider } from './hooks/LoadingContext'
import { Provider } from 'react-redux'
import {store} from "@/store"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — reduces refetching
      gcTime: 1000 * 60 * 30,   // keep cache for 30 min
      retry: 1,                  // only retry once
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LoadingProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
