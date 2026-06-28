export const UmlMarkers = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
    <defs>
      <marker
        id="uml-generalization"
        viewBox="-10 -10 20 20"
        refX="0"
        refY="0"
        markerWidth="14"
        markerHeight="14"
        orient="auto"
      >
        <path
          d="M -9 -6 L 0 0 L -9 6 Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ fill: 'var(--background)', stroke: 'var(--foreground)', strokeWidth: 1 }}
        />
      </marker>
      <marker
        id="uml-generalization-selected"
        viewBox="-10 -10 20 20"
        refX="0"
        refY="0"
        markerWidth="14"
        markerHeight="14"
        orient="auto"
      >
        <path
          d="M -9 -6 L 0 0 L -9 6 Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ fill: 'var(--background)', stroke: 'var(--primary)', strokeWidth: 1 }}
        />
      </marker>
      <marker
        id="uml-arrow"
        viewBox="-10 -10 20 20"
        refX="0"
        refY="0"
        markerWidth="12.5"
        markerHeight="12.5"
        orient="auto"
      >
        <polyline
          points="-5,-4 0,0 -5,4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ fill: 'none', stroke: 'var(--foreground)', strokeWidth: 1 }}
        />
      </marker>
      <marker
        id="uml-arrow-selected"
        viewBox="-10 -10 20 20"
        refX="0"
        refY="0"
        markerWidth="12.5"
        markerHeight="12.5"
        orient="auto"
      >
        <polyline
          points="-5,-4 0,0 -5,4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ fill: 'none', stroke: 'var(--primary)', strokeWidth: 1 }}
        />
      </marker>
    </defs>
  </svg>
);
