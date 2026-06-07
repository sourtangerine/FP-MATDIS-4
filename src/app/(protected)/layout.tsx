import Sidebar from "@/components/Sidebar";
import SessionProvider from "@/components/SessionProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-[200px] flex-1 flex flex-col">{children}</main>
      </div>
    </SessionProvider>
  );
}
