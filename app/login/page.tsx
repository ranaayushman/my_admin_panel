"use client";

import { useState, useEffect } from "react";
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
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Use useEffect for redirecting after render
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/members");
    }
  }, [isAuthenticated, router]);  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      // Make real API call to the login endpoint using our API service
      const response = await authApi.login(data);

      // Handle successful login
      if (response.data.success) {
        toast.success("Login successful!");
        login(response.data.accessToken, response.data.user);
      } else {
        // In case API returns success: false
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error: unknown) {
      console.error("Login failed:", error);
      // Handle different error scenarios
      if (error && typeof error === 'object' && 'response' in error) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorResponse = error as { response?: { data?: { message?: string } } };
        const errorMessage = errorResponse.response?.data?.message || "Invalid credentials";
        toast.error(errorMessage);
      } else if (error && typeof error === 'object' && 'request' in error) {
        // The request was made but no response was received
        toast.error("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Admin Login
          </h2>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={`relative block w-full appearance-none rounded-md border px-3 py-2.5 sm:py-2 text-base sm:text-sm text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-2 text-xs sm:text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className={`relative block w-full appearance-none rounded-md border px-3 py-2.5 sm:py-2 text-base sm:text-sm text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-2 text-xs sm:text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2.5 sm:py-2 px-4 text-base sm:text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75"
            >
              {isLoading ? "Logging in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
