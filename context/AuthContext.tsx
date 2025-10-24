"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { User } from "@/types";
import { authApi } from "@/services/api";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on component mount
    const token = Cookies.get("access_token"); // Changed from 'accessToken' to 'access_token'
    const storedUser = Cookies.get("user");
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        Cookies.remove("access_token"); // Changed from 'accessToken' to 'access_token'
        Cookies.remove("user");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    // Set cookies
    Cookies.set("access_token", token, { expires: 1 }); // Changed from 'accessToken' to 'access_token'
    Cookies.set("user", JSON.stringify(userData), { expires: 1 });
    
    setUser(userData);
    router.push("/admin/members");
  };

  const logout = async () => {
    try {
      // Call the logout API endpoint
      await authApi.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clean up local state and cookies
      Cookies.remove("access_token"); // Changed from 'accessToken' to 'access_token'
      Cookies.remove("user");
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
