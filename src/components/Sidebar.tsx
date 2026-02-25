import Link from "next/link";
import { LogOut, Home, PieChart, CheckSquare } from "lucide-react";
import { getSupabaseServer } from "@/lib/supabase-server";

export default async function Sidebar() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen fixed">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white">
          <CheckSquare className="text-emerald-500" />
          Speakly
        </h1>
        <p className="text-xs text-neutral-500 mt-2 truncate max-w-full" title={user?.email}>
           {user?.email}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <Home className="w-5 h-5" />
          Dashboard
        </Link>
        <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <PieChart className="w-5 h-5" />
          Analytics
        </Link>
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <form action="/auth/signout" method="post">
           <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
