interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClass = size !== 'md' ? `spinner--${size}` : '';

  return (
    <span
      className={`spinner ${sizeClass} ${className}`.trim()}
      role="status"
      aria-label="Loading"
    />
  );
}

interface LoadingOverlayProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingOverlay({ text = 'Loading...', size = 'lg' }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <Spinner size={size} />
      {text && <p className="loading-overlay__text">{text}</p>}
    </div>
  );
}
