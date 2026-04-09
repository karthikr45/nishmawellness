import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import SOSButton from "@/components/shared/sos-button";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#fafaff] dark:bg-[#0f0e1a]">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
      <SOSButton />
    </div>
  );
}
