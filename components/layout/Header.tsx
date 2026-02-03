"use client";

import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="hidden lg:block bg-[#141417] border-b border-zinc-900">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-xl font-semibold text-white truncate">
            Welcome, {user?.name || "Admin"}
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:block text-sm font-medium text-white truncate max-w-[150px] md:max-w-none">
            {user?.email}
          </div>
          <div className="relative">
            <span className="h-8 w-8 overflow-hidden rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold text-white">
              {user?.email ? user.email.charAt(0).toUpperCase() : "A"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
