import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

document.documentElement.setAttribute('data-theme', 'stock');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
