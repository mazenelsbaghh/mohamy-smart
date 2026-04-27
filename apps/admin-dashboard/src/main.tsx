import { createRoot } from'react-dom/client';
import'./index.css';
import'./bones/registry';
import { HeroUIProvider } from'@heroui/react';
import App from'./App.tsx';
import { Provider } from'react-redux';
import { store } from'./redux/store.ts';
import { Toaster } from'sileo';
import'sileo/styles.css';

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  sendDefaultPii: false,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0, 
});

createRoot(document.getElementById('root')!).render(
 <Provider store={store}>
 <HeroUIProvider>
 <App />
 <Toaster position="top-center" />
 </HeroUIProvider>
 </Provider>
);
