import type { ConfigurationSelection } from '../../types';

interface ProductImageProps {
  selections: ConfigurationSelection[];
  productName?: string;
}

const RIM_COLORS: Record<string, string> = {
  'red-rim': '#dc2626',
  'black-rim': '#1f2937',
  'blue-rim': '#2563eb',
};

const FRAME_COLORS: Record<string, { primary: string; secondary: string }> = {
  matte: { primary: '#374151', secondary: '#4b5563' },
  shiny: { primary: '#60a5fa', secondary: '#93c5fd' },
};

export function ProductImage({ selections, productName = 'Custom Bicycle' }: ProductImageProps) {
  const frameType =
    selections.find((s) => s.partTypeId === 'frame-type')?.partOptionId || 'diamond';
  const frameFinish =
    selections.find((s) => s.partTypeId === 'frame-finish')?.partOptionId || 'matte';
  const wheelType =
    selections.find((s) => s.partTypeId === 'wheels')?.partOptionId || 'road-wheels';
  const rimColor =
    selections.find((s) => s.partTypeId === 'rim-color')?.partOptionId || 'black-rim';

  const colors = FRAME_COLORS[frameFinish] || FRAME_COLORS.matte;
  const rimColorValue = RIM_COLORS[rimColor] || RIM_COLORS['black-rim'];

  const getWheelWidth = () => {
    switch (wheelType) {
      case 'fat-bike-wheels':
        return 12;
      case 'mountain-wheels':
        return 8;
      default:
        return 5;
    }
  };

  const wheelStrokeWidth = getWheelWidth();

  return (
    <div className="product-image">
      <svg
        viewBox="0 0 400 280"
        className="product-image__svg"
        role="img"
        aria-label={`${productName} configuration preview`}
      >
        <defs>
          <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
          <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
        </defs>

        {/* Rear Wheel */}
        <circle
          cx="100"
          cy="180"
          r="60"
          fill="none"
          stroke="url(#wheelGradient)"
          strokeWidth={wheelStrokeWidth}
          className="product-image__wheel"
        />
        <circle cx="100" cy="180" r="60" fill="none" stroke={rimColorValue} strokeWidth="3" />
        <circle cx="100" cy="180" r="8" fill="#6b7280" />
        {/* Wheel Spokes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={`rear-${angle}`}
            x1="100"
            y1="180"
            x2={100 + 52 * Math.cos((angle * Math.PI) / 180)}
            y2={180 + 52 * Math.sin((angle * Math.PI) / 180)}
            stroke="#9ca3af"
            strokeWidth="1"
          />
        ))}

        {/* Front Wheel */}
        <circle
          cx="300"
          cy="180"
          r="60"
          fill="none"
          stroke="url(#wheelGradient)"
          strokeWidth={wheelStrokeWidth}
          className="product-image__wheel"
        />
        <circle cx="300" cy="180" r="60" fill="none" stroke={rimColorValue} strokeWidth="3" />
        <circle cx="300" cy="180" r="8" fill="#6b7280" />
        {/* Wheel Spokes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={`front-${angle}`}
            x1="300"
            y1="180"
            x2={300 + 52 * Math.cos((angle * Math.PI) / 180)}
            y2={180 + 52 * Math.sin((angle * Math.PI) / 180)}
            stroke="#9ca3af"
            strokeWidth="1"
          />
        ))}

        {/* Frame - Different styles based on frame type */}
        {frameType === 'full-suspension' && (
          <g className="product-image__frame product-image__frame--full-suspension">
            {/* Rear suspension linkage */}
            <path
              d="M100 180 L130 140 L160 160 L100 180"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            {/* Shock absorber */}
            <rect x="115" y="145" width="8" height="25" rx="2" fill="#f59e0b" />
            {/* Main frame */}
            <path
              d="M160 160 L200 80 L300 180"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            {/* Top tube */}
            <path
              d="M200 80 L280 85"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Down tube */}
            <path
              d="M200 80 L160 160"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Seat tube */}
            <path
              d="M200 80 L200 50"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Front fork with suspension */}
            <path d="M280 85 L295 120" fill="none" stroke="url(#frameGradient)" strokeWidth="6" />
            <rect x="291" y="115" width="8" height="30" rx="2" fill="#f59e0b" />
            <path d="M295 145 L300 180" fill="none" stroke="url(#frameGradient)" strokeWidth="5" />
          </g>
        )}

        {frameType === 'diamond' && (
          <g className="product-image__frame product-image__frame--diamond">
            {/* Classic diamond frame */}
            {/* Seat stays */}
            <path
              d="M100 180 L200 90"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Chain stays */}
            <path
              d="M100 180 L200 160"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Seat tube */}
            <path
              d="M200 160 L200 90"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Seat post */}
            <path
              d="M200 90 L200 55"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Top tube */}
            <path
              d="M200 90 L280 95"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Down tube */}
            <path
              d="M200 160 L280 95"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Head tube */}
            <path
              d="M280 95 L285 115"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Fork */}
            <path
              d="M285 115 L300 180"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        )}

        {frameType === 'step-through' && (
          <g className="product-image__frame product-image__frame--step-through">
            {/* Step-through frame - lower top tube */}
            {/* Seat stays */}
            <path
              d="M100 180 L190 100"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Chain stays */}
            <path
              d="M100 180 L190 155"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Seat tube */}
            <path
              d="M190 155 L190 100"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Seat post */}
            <path
              d="M190 100 L190 60"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Low curved top tube (step-through design) */}
            <path
              d="M190 145 Q 235 130, 275 110"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Down tube */}
            <path
              d="M190 155 L275 110"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Head tube */}
            <path
              d="M275 110 L280 125"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Fork */}
            <path
              d="M280 125 L300 180"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Saddle */}
        <ellipse
          cx={frameType === 'step-through' ? 190 : 200}
          cy={frameType === 'step-through' ? 52 : frameType === 'full-suspension' ? 42 : 47}
          rx="20"
          ry="6"
          fill="#1f2937"
        />

        {/* Handlebar */}
        <path
          d="M270 75 L290 75 L295 85 L305 85"
          fill="none"
          stroke="#1f2937"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Handlebar grips */}
        <circle cx="270" cy="75" r="5" fill="#4b5563" />
        <circle cx="305" cy="85" r="5" fill="#4b5563" />

        {/* Pedals and Crank */}
        <circle cx={frameType === 'step-through' ? 190 : 200} cy="160" r="12" fill="#4b5563" />
        <line
          x1={frameType === 'step-through' ? 190 : 200}
          y1="160"
          x2={frameType === 'step-through' ? 175 : 185}
          y2="175"
          stroke="#374151"
          strokeWidth="4"
        />
        <rect
          x={frameType === 'step-through' ? 168 : 178}
          y="172"
          width="15"
          height="6"
          rx="2"
          fill="#1f2937"
        />
        <line
          x1={frameType === 'step-through' ? 190 : 200}
          y1="160"
          x2={frameType === 'step-through' ? 205 : 215}
          y2="145"
          stroke="#374151"
          strokeWidth="4"
        />
        <rect
          x={frameType === 'step-through' ? 202 : 212}
          y="142"
          width="15"
          height="6"
          rx="2"
          fill="#1f2937"
        />

        {/* Chain */}
        <ellipse
          cx={frameType === 'step-through' ? 145 : 150}
          cy="175"
          rx="45"
          ry="10"
          fill="none"
          stroke="#6b7280"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      </svg>

      <div className="product-image__label">
        <span className="product-image__name">{productName}</span>
        <span className="product-image__hint">Configuration updates in real-time</span>
      </div>
    </div>
  );
}
