import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import SOSButton from "@/components/shared/sos-button";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
      <SOSButton />
    </div>
  );
}
