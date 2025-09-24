import { Toaster } from "react-hot-toast";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Toaster />
      <main className="flex-1 h-screen mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
