import { type ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { getSupabaseServer } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav email={user?.email} />
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 overflow-y-auto pt-20 md:pt-0">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
