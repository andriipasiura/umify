export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex h-svh flex-col overflow-hidden">{children}</div>;
}
