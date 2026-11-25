'use client';

import { useEffect, useState } from 'react';

const OVALS = [
  { cx: 160, cy: 46 },
  { cx: 240, cy: 46 },
  { cx: 160, cy: 114 },
  { cx: 240, cy: 114 },
];

const ACTORS = [
  { x: 38, y: 40, links: [0, 2] },
  { x: 38, y: 100, links: [2, 3] },
];

const STAGGER_MS = 220;

const formatElapsed = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const useElapsedSeconds = () => {
  const [startedAt] = useState(() => Date.now());
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return seconds;
};

const Actor = ({ x, y }: { x: number; y: number }) => (
  <g className="stroke-muted-foreground/50" strokeWidth={2} strokeLinecap="round" fill="none">
    <circle cx={x} cy={y} r={7} />
    <path d={`M${x} ${y + 7}v18M${x - 11} ${y + 14}h22M${x} ${y + 25}l-9 13M${x} ${y + 25}l9 13`} />
  </g>
);

type GenerationGhostProps = {
  description: string;
};

export const GenerationGhost = ({ description }: GenerationGhostProps) => {
  const elapsed = useElapsedSeconds();

  return (
    <div className="bg-muted/30 ai-ghost-shimmer relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border px-4 py-3">
      <svg viewBox="0 0 300 160" className="h-auto w-full max-w-72" aria-hidden>
        {ACTORS.flatMap((actor) =>
          actor.links.map((index) => (
            <line
              key={`${actor.y}-${index}`}
              x1={actor.x + 14}
              y1={actor.y + 16}
              x2={OVALS[index].cx - 32}
              y2={OVALS[index].cy}
              className="stroke-muted-foreground/25"
              strokeWidth={1.5}
            />
          )),
        )}
        <rect
          x={112}
          y={10}
          width={176}
          height={140}
          rx={10}
          fill="none"
          strokeDasharray="6 5"
          className="stroke-muted-foreground/40"
          strokeWidth={1.5}
        />
        {OVALS.map((oval, index) => (
          <ellipse
            key={`${oval.cx}-${oval.cy}`}
            cx={oval.cx}
            cy={oval.cy}
            rx={34}
            ry={17}
            strokeWidth={1.5}
            className="fill-primary/10 stroke-primary/40 motion-safe:animate-pulse"
            style={{ animationDelay: `${index * STAGGER_MS}ms` }}
          />
        ))}
        {ACTORS.map((actor) => (
          <Actor key={actor.y} x={actor.x} y={actor.y} />
        ))}
      </svg>
      <div className="flex w-full flex-col items-center gap-0.5 text-center">
        <p className="text-foreground text-sm font-medium">
          Generating your diagram
          <span className="text-muted-foreground tabular-nums" aria-hidden>
            {' '}
            · {formatElapsed(elapsed)}
          </span>
        </p>
        <p className="text-muted-foreground line-clamp-1 max-w-full text-xs">{description}</p>
      </div>
    </div>
  );
};
