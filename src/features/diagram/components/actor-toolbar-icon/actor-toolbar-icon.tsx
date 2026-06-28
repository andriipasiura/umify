export const ActorToolbarIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 20 28"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <circle cx="10" cy="5" r="4" />
    <line x1="10" y1="9" x2="10" y2="20" />
    <line x1="4" y1="14" x2="16" y2="14" />
    <line x1="10" y1="20" x2="4" y2="27" />
    <line x1="10" y1="20" x2="16" y2="27" />
  </svg>
);
