type ToastType = 'success' | 'error' | 'warning' | 'info';

export const toast = {
  success: (message: string) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'success' as ToastType },
    });
    window.dispatchEvent(event);
  },
  error: (message: string) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'error' as ToastType },
    });
    window.dispatchEvent(event);
  },
  warning: (message: string) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'warning' as ToastType },
    });
    window.dispatchEvent(event);
  },
  info: (message: string) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'info' as ToastType },
    });
    window.dispatchEvent(event);
  },
};
