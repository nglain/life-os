export function Logo({ size = 48 }: { size?: number }) {
  // Уникальные ID для градиентов чтобы не конфликтовали
  const id = 'logo';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`${id}-nG`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#00f5ff' }} />
          <stop offset="100%" style={{ stopColor: '#bf00ff' }} />
        </linearGradient>
        <linearGradient id={`${id}-nC`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0a0a10' }} />
          <stop offset="100%" style={{ stopColor: '#12121a' }} />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="3" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={`${id}-back`}>
          <rect x="0" y="0" width="50" height="100" />
        </clipPath>
        <clipPath id={`${id}-front`}>
          <rect x="50" y="0" width="50" height="100" />
        </clipPath>
        <mask id={`${id}-mask`}>
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <circle cx="50" cy="32" r="6" fill="black" />
          <circle cx="50" cy="68" r="6" fill="black" />
        </mask>
        <path id={`${id}-path`} d="M 4,50 A 46,18 0 1,1 96,50 A 46,18 0 1,1 4,50" fill="none" />
      </defs>

      {/* Задний слой (за ядром) - тусклый */}
      <g transform="rotate(-20 50 50)" clipPath={`url(#${id}-back)`}>
        <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke={`url(#${id}-nG)`} strokeWidth="1.5" opacity="0.3" />
        <circle r="6" fill="#00f5ff" filter={`url(#${id}-glow)`} opacity="0.5">
          <animateMotion dur="4s" repeatCount="indefinite">
            <mpath href={`#${id}-path`} />
          </animateMotion>
        </circle>
      </g>
      <g transform="rotate(20 50 50)" clipPath={`url(#${id}-back)`}>
        <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke={`url(#${id}-nG)`} strokeWidth="1.5" opacity="0.3" />
        <circle r="6" fill="#bf00ff" filter={`url(#${id}-glow)`} opacity="0.5">
          <animateMotion dur="4s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
            <mpath href={`#${id}-path`} />
          </animateMotion>
        </circle>
      </g>

      {/* Ядро инь-янь с дырками */}
      <g mask={`url(#${id}-mask)`}>
        <circle cx="50" cy="50" r="35" fill={`url(#${id}-nC)`} />
        <path d="M50 15 A35 35 0 0 1 50 85 A17.5 17.5 0 0 1 50 50 A17.5 17.5 0 0 0 50 15" fill={`url(#${id}-nG)`} filter={`url(#${id}-glow)`} />
      </g>
      <circle cx="50" cy="32" r="6" fill="none" stroke={`url(#${id}-nG)`} strokeWidth="0.5" opacity="0.4" />
      <circle cx="50" cy="68" r="6" fill="none" stroke={`url(#${id}-nG)`} strokeWidth="0.5" opacity="0.4" />

      {/* Передний слой (перед ядром) - яркий */}
      <g transform="rotate(-20 50 50)" clipPath={`url(#${id}-front)`}>
        <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke={`url(#${id}-nG)`} strokeWidth="2" opacity="0.6" />
        <circle r="6" fill="#00f5ff" filter={`url(#${id}-glow)`}>
          <animateMotion dur="4s" repeatCount="indefinite">
            <mpath href={`#${id}-path`} />
          </animateMotion>
        </circle>
      </g>
      <g transform="rotate(20 50 50)" clipPath={`url(#${id}-front)`}>
        <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke={`url(#${id}-nG)`} strokeWidth="2" opacity="0.6" />
        <circle r="6" fill="#bf00ff" filter={`url(#${id}-glow)`}>
          <animateMotion dur="4s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
            <mpath href={`#${id}-path`} />
          </animateMotion>
        </circle>
      </g>
    </svg>
  );
}
