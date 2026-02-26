"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut, Home, PieChart } from "lucide-react";

interface MobileNavProps {
  email?: string;
}

export default function MobileNav({ email }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#1a1a1a] border-b border-[#333333] z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/speakly-logo.jpg"
            alt="Speakly"
            width={28}
            height={28}
            className="rounded"
          />
          <h1 className="text-lg font-light text-[#f5f5f5]">Speakly</h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[#a8a8a8] hover:text-[#f5f5f5] transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />
      )}

      <nav
        className={`md:hidden fixed top-0 left-0 bottom-0 w-64 bg-[#1a1a1a] border-r border-[#333333] z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } pt-20 px-4`}
      >
        <div className="space-y-1 mb-8">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded text-[#a8a8a8] hover:text-[#f5f5f5] hover:bg-[#242424] transition-all duration-300 font-light group"
          >
            <Home className="w-5 h-5 group-hover:text-[#d4af37]" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/analytics"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded text-[#a8a8a8] hover:text-[#f5f5f5] hover:bg-[#242424] transition-all duration-300 font-light group"
          >
            <PieChart className="w-5 h-5 group-hover:text-[#d4af37]" />
            <span>Analytics</span>
          </Link>
        </div>

        <div className="border-t border-[#333333] pt-4">
          {email && (
            <p className="text-xs text-[#707070] px-4 mb-3 font-light truncate">
              {email}
            </p>
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-3 rounded text-[#a8a8a8] hover:text-[#a8736b] hover:bg-[#a8736b]/10 transition-all duration-300 font-light"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </nav>
    </>
  );
}
