"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoginCredentials } from "@/types";
import { authApi } from "@/services/api";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push("/admin/members");
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);

      if (response.data.success) {
        toast.success("Login successful!");
        login(response.data.accessToken, response.data.user);
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">

      {/* ===== Animated GDG Gradient Background ===== */}
      {/* <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#4285F4]/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-[#34A853]/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/2 h-96 w-96 rounded-full bg-[#EA4335]/20 blur-3xl animate-pulse delay-500" />
      </div> */}

      {/* ===== Card ===== */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo + Heading */}
        <div className="text-center mb-8">

          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 rounded-full blur-xl opacity-40" />
            <Image
              src="/logo-gdg.png"
              alt="GDG Logo"
              width={110}
              height={110}
              className="relative rounded-full shadow-2xl"
              priority
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-red-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>

          <p className="text-zinc-400 text-sm mt-2">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* ===== Glass Form ===== */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* ===== Email ===== */}
            <div className="relative">
              <input
                type="email"
                {...register("email")}
                placeholder=" "
                className={`peer w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 transition ${errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-700 focus:ring-blue-500"
                  }`}
              />
              <label className="absolute left-3 -top-2.5 bg-black px-2 text-xs text-zinc-400 
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm 
              peer-placeholder-shown:text-zinc-500 transition-all">
                Email Address
              </label>

              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* ===== Password ===== */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder=" "
                className={`peer w-full px-4 py-3 bg-black/40 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 transition ${errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-700 focus:ring-blue-500"
                  }`}
              />

              <label className="absolute left-3 -top-2.5 bg-black px-2 text-xs text-zinc-400 
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm 
              peer-placeholder-shown:text-zinc-500 transition-all">
                Password
              </label>

              {/* Show / Hide */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-white text-sm"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>

              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* ===== Button ===== */}
            <button
              type="submit"
              disabled={isLoading}
              className="
              group relative w-full flex justify-center items-center gap-2
              py-3 px-4 font-semibold rounded-xl text-white
            bg-blue-600
              hover:opacity-95 transition-all duration-300
              hover:shadow-lg hover:shadow-blue-500/40
              disabled:opacity-50
            "
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      opacity="0.3"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="white"
                      strokeWidth="4"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <span className="group-hover:translate-x-1 transition">
                    →
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          Secure Admin Access • GDG Panel
        </p>
      </div>
    </div>
  );
}