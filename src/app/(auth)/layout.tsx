export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_45%,black_30%,transparent_100%)] [background-size:16px_16px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45rem_28rem_at_50%_32%,color-mix(in_oklab,var(--primary)_6%,transparent),transparent)]"
      />
      {children}
      <p className="text-muted-foreground/70 absolute bottom-6 text-xs">
        UmiFy — UML use-case diagrams, simplified
      </p>
    </main>
  );
}
