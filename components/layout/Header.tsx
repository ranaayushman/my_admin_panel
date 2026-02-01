"use client";

import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-[#141417] border-b border-zinc-900">
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <h1 className="text-xl font-semibold text-white">
            Welcome, {user?.name || "Admin"}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-white">
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
