import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_common/app-sider";
import Header from "./_common/header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full flex-1">
        <Header />
        <div className="w-full mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}