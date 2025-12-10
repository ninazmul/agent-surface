export default function NoShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {children}
    </section>
  );
}
