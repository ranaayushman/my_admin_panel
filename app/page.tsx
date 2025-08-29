"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.role === "admin") {
        router.push("/admin/members");
      } else if (isAuthenticated) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image
            className="mb-4"
            src="/next.svg"
            alt="GDG Logo"
            width={180}
            height={38}
            priority
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            GDG Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/login"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}