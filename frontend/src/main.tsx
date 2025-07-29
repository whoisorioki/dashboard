import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { fetchAndLogDataRange } from './lib/fetchDataRange';

// Expose for browser console debugging
// @ts-ignore
window.fetchAndLogDataRange = fetchAndLogDataRange;
// import * as Sentry from '@sentry/react';
// import { BrowserTracing } from '@sentry/tracing';
// Sentry.init({
//   dsn: 'YOUR_SENTRY_DSN',
//   integrations: [new BrowserTracing()],
//   tracesSampleRate: 1.0,
// });
// Sentry is disabled for development/testing

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}> */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* </Sentry.ErrorBoundary> */}
  </React.StrictMode>,
)
