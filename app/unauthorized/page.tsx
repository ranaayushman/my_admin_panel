"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function UnauthorizedPage() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <h1 className="mb-4 text-center text-2xl font-bold text-red-500">
          Access Denied
        </h1>
        <p className="mb-6 text-center text-gray-600">
          You don't have permission to access this page. This area is restricted
          to administrators only.
        </p>
        <div className="flex justify-center space-x-4">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
