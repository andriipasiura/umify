export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex min-h-svh items-center justify-center p-4">{children}</main>;
}
