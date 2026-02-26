import Link from "next/link";
import { LogOut, Home, PieChart } from "lucide-react";
import { getSupabaseServer } from "@/lib/supabase-server";
import Image from "next/image";

export default async function Sidebar() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="w-64 bg-[#1a1a1a] border-r border-[#333333] flex flex-col h-screen fixed">
      <div className="p-8 border-b border-[#333333]">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/speakly-logo.jpg"
            alt="Speakly"
            width={32}
            height={32}
            className="rounded"
          />
          <h1 className="text-xl font-light text-[#f5f5f5]">
            Speakly
          </h1>
        </div>
        <p className="text-xs text-[#707070] truncate max-w-full font-light" title={user?.email}>
           {user?.email}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-8">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded text-[#a8a8a8] hover:text-[#f5f5f5] hover:bg-[#242424] transition-all duration-300 font-light group">
          <Home className="w-5 h-5 group-hover:text-[#d4af37]" />
          <span>Dashboard</span>
        </Link>
        <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded text-[#a8a8a8] hover:text-[#f5f5f5] hover:bg-[#242424] transition-all duration-300 font-light group">
          <PieChart className="w-5 h-5 group-hover:text-[#d4af37]" />
          <span>Analytics</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-[#333333]">
        <form action="/auth/signout" method="post">
           <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 rounded text-[#a8a8a8] hover:text-[#a8736b] hover:bg-[#a8736b]/10 transition-all duration-300 font-light">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
