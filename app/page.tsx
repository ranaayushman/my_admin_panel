"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo-gdg.png";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (user?.role === "super_admin" || user?.role === "domain_lead")) {
        router.push("/admin/members");
      } else if (isAuthenticated) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050505] overflow-hidden px-4">
      
      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute inset-0">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-3xl text-center space-y-10">

        {/* HERO (UNCHANGED STRUCTURE, JUST POLISHED) */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <Image src={logo} alt="GDG Logo" width={600} height={600} priority className=" pl-2 h-auto w-[150px] max-w-[600px]" />
          </div>

          <p className="text-white text-2xl font-bold max-w-xl mx-auto leading-relaxed">
            GDG Admin Panel
          </p>
        </div>

        {/* 🚀 FEATURE CARDS */}
        <div className="grid sm:grid-cols-3 gap-6">

          {/* CARD */}
          {[
            {
              title: "Members",
              desc: "Manage community",
              color: "blue",
              icon: (
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2M7 20H2v-2a3 3 0 015.356-1.857" />
              ),
            },
            {
              title: "Events",
              desc: "Organize activities",
              color: "purple",
              icon: (
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14" />
              ),
            },
            {
              title: "Recruitment",
              desc: "Handle applications",
              color: "blue",
              icon: (
                <path d="M9 12h6m-6 4h6m2 5H7" />
              ),
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-[1.04] hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
            >
              {/* glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-blue-500/10 to-purple-500/10" />

              <div className="relative flex flex-col items-center space-y-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    {item.icon}
                  </svg>
                </div>

                <h3 className="text-white font-semibold text-sm">
                  {item.title}
                </h3>

                <p className="text-xs text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 CTA BUTTON */}
        <div className="pt-6 space-y-3">
          <Link
            href="/login"
            className="relative group inline-flex w-full items-center justify-center overflow-hidden rounded-xl p-[1px]"
          >
            {/* gradient border */}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:animate-gradient-x"></span>

            <span className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-white font-semibold transition-all duration-300 group-hover:bg-transparent">
              Access Admin Dashboard
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>

          <p className="text-xs text-zinc-500">
            Secure admin access • GDG Community Management
          </p>
        </div>
      </div>
    </div>
  );
}