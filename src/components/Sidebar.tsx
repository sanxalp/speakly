import Link from "next/link";
import { LogOut, Home, PieChart, CheckSquare } from "lucide-react";
import { getSupabaseServer } from "@/lib/supabase-server";

export default async function Sidebar() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="w-64 bg-[#1a1a21] border-r border-[#3a3a47] flex flex-col h-screen fixed">
      <div className="p-6 border-b border-[#3a3a47]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <CheckSquare className="text-white w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-[#f5f5f7]">
            Speakly
          </h1>
        </div>
        <p className="text-xs text-[#6f7178] mt-3 truncate max-w-full" title={user?.email}>
           {user?.email}
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-6">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a8a8b0] hover:text-[#f5f5f7] hover:bg-[#262630] transition-all duration-200">
          <Home className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a8a8b0] hover:text-[#f5f5f7] hover:bg-[#262630] transition-all duration-200">
          <PieChart className="w-5 h-5" />
          <span className="font-medium">Analytics</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-[#3a3a47]">
        <form action="/auth/signout" method="post">
           <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-[#a8a8b0] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-200 font-medium">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
