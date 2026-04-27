import { createRoot } from 'react-dom/client'
import './index.css'
import './bones/registry.ts'
import { HeroUIProvider } from '@heroui/react'
import { Toaster } from 'sileo'
import 'sileo/styles.css'
import AppRouter from './router/AppRouter.tsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.ts'
import { ErrorBoundary } from '@mohamy/shared-ui';
import { fetchCsrfToken } from './APIs/api';

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  sendDefaultPii: false,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0, 
});

// CSRF token bootstrap with exponential backoff (max 3 attempts: 0ms, 500ms, 1500ms)
const bootstrapCsrf = async () => {
  const delays = [0, 500, 1500];
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) await new Promise(r => setTimeout(r, delays[i]));
    try {
      await fetchCsrfToken();
      return;
    } catch {
      if (i === delays.length - 1) {
        return;
      }
    }
  }
};
bootstrapCsrf();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <HeroUIProvider>
      <Provider store={store}>

        <AppRouter />
        <Toaster position="top-center" offset={{ top: 24 }} />
      </Provider>
    </HeroUIProvider>
  </ErrorBoundary>
)
