interface KSPEmblemProps {
  className?: string;
  size?: number;
}

export function KSPEmblem({ className, size = 48 }: KSPEmblemProps) {
  return (
    <svg
      aria-label="Karnataka State Police emblem"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 96 96"
      width={size}
    >
      <circle cx="48" cy="48" fill="rgba(240, 176, 0, 0.12)" r="46" stroke="rgba(240, 176, 0, 0.45)" strokeWidth="2" />
      <path
        d="M48 12 67 20v23c0 15.6-8.1 29.5-19 36-10.9-6.5-19-20.4-19-36V20l19-8Z"
        fill="#f0b000"
        stroke="#f7d46a"
        strokeWidth="2"
      />
      <path d="M48 28 52.7 40h12.8l-10.3 7.4 4 12.1L48 52.3l-11.2 7.2 4-12.1L30.5 40h12.8L48 28Z" fill="#111827" />
      <path d="M33 66c5.5-1.2 10.5-1.8 15-1.8 4.4 0 9.4 0.6 15 1.8" stroke="#111827" strokeLinecap="round" strokeWidth="3" />
      <path d="M38 22h20" stroke="#111827" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}
