import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ToastProvider, useToast } from './components/common';

// eslint-disable-next-line react-refresh/only-export-components
function AppWithToast() {
  const { addToast } = useToast();

  useEffect(() => {
    const handleToast = (
      event: CustomEvent<{ message: string; type: 'success' | 'error' | 'warning' | 'info' }>
    ) => {
      addToast(event.detail.message, event.detail.type);
    };

    window.addEventListener('toast', handleToast as EventListener);
    return () => window.removeEventListener('toast', handleToast as EventListener);
  }, [addToast]);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AppWithToast />
    </ToastProvider>
  </StrictMode>
);
