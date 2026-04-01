"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { isSuperAdmin } from "@/utils/roleCheck";
import { superAdminApi } from "@/services/api";
import { Admin } from "@/types";
import PageHeader from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function AdminManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (!isLoading && !isSuperAdmin(user)) {
      router.push("/unauthorized");
    }
  }, [user, isLoading, router]);

  // Fetch admins
  useEffect(() => {
    if (isSuperAdmin(user)) {
      fetchAdmins();
    }
  }, [user]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getAllAdmins();
      if (response.data.success) {
        setAdmins(response.data.admins);
      } else {
        toast.error(response.data.message || "Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Error fetching admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
      };

      const response = await superAdminApi.addAdmin(payload);
      
      if (response.data.success) {
        toast.success("Admin added successfully");
        setGeneratedPassword(response.data.admin.password || null);
        setFormData({ name: "", email: "", password: "" });
        setShowAddModal(false);
        fetchAdmins();
        
        // Auto-hide password after 30 seconds
        if (generatedPassword) {
          setTimeout(() => setGeneratedPassword(null), 30000);
        }
      } else {
        toast.error(response.data.message || "Failed to add admin");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      const axiosError = error as AxiosError<{ message?: string }> | Error;
      if (axiosError instanceof AxiosError) {
        console.error("Response status:", axiosError.response?.status);
        console.error("Response data:", axiosError.response?.data);
        console.error("Request data:", axiosError.config?.data);
      }
      const errorMessage = axiosError instanceof AxiosError ? axiosError.response?.data?.message : undefined;
      toast.error(errorMessage || "Error adding admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      const response = await superAdminApi.removeAdmin(adminId);
      
      if (response.data.success) {
        toast.success("Admin deleted successfully");
        fetchAdmins();
      } else {
        toast.error(response.data.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      const axiosError = error as AxiosError<{ message?: string }> | Error;
      const errorMessage = axiosError instanceof AxiosError ? axiosError.response?.data?.message : undefined;
      toast.error(errorMessage || "Error deleting admin");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSuperAdmin(user)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]  text-white p-4 md:p-8">
      <PageHeader title="Admin Management" />

      {/* Add Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
        >
          + Add Admin
        </button>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#27272A] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Admin name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-[#27272A] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password (Optional)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-[#27272A] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Leave blank for auto-generation"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Leave blank to auto-generate a strong password
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Admin"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Password Display */}
      {generatedPassword && (
        <div className="mb-6 bg-green-900/20 border border-green-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Generated Password:</p>
              <p className="font-mono text-lg">{generatedPassword}</p>
              <p className="text-xs text-zinc-500 mt-2">
                This password will disappear in 30 seconds. Copy it now and share securely.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(generatedPassword)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-[#1a1a1a] rounded-lg border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            No admins found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#27272A] border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-[#27272A] transition">
                    <td className="px-6 py-4 font-medium">{admin.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteAdmin(admin._id)}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
