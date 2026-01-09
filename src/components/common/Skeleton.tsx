interface SkeletonProps {
  variant?: 'text' | 'title' | 'circle' | 'button' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className = '' }: SkeletonProps) {
  const variantClass = `skeleton--${variant}`;

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`skeleton ${variantClass} ${className}`.trim()}
      style={Object.keys(style).length > 0 ? style : undefined}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <Skeleton variant="circle" width={60} height={60} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton variant="title" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPartOption() {
  return (
    <div
      style={{
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
        <Skeleton variant="circle" width={60} height={60} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Skeleton variant="title" width="50%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
      <Skeleton variant="circle" width={20} height={20} />
    </div>
  );
}
