import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/dist/react';
import App from './pages/App';
import './styles.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const client = convexUrl ? new ConvexReactClient(convexUrl) : undefined;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {client ? (
      <ConvexAuthProvider client={client}>

          <App />

      </ConvexAuthProvider>
    ) : (
      <div style={{padding:20}}>Missing VITE_CONVEX_URL. Set it in .env.local after deploying Convex.</div>
    )}
  </React.StrictMode>
);
