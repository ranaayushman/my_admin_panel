"use client";

import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.name || "Admin"}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-700">
            {user?.email}
          </div>
          <div className="relative">
            <span className="h-8 w-8 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
