"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { isSuperAdmin } from "@/utils/roleCheck";
import { superAdminApi } from "@/services/api";
import { ActivityLog } from "@/types";
import PageHeader from "@/components/admin/PageHeader";
import { toast } from "sonner";

type ActionType = "add_admin" | "remove_admin" | "shortlist" | "reject" | "accept" | "update_status" | "";

export default function ActivityLogsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ActionType>("");
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 20;

  // Check authorization
  useEffect(() => {
    if (!isLoading && !isSuperAdmin(user)) {
      router.push("/unauthorized");
    }
  }, [user, isLoading, router]);

  // Fetch activity logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        limit,
        page,
      };
      
      if (selectedAction) {
        params.action = selectedAction;
      }

      const response = await superAdminApi.getActivityLogs(params);
      
      if (response.data.success) {
        setLogs(response.data.logs);
        setTotalLogs(response.data.totalLogs);
      } else {
        toast.error(response.data.message || "Failed to fetch logs");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Error fetching logs");
    } finally {
      setLoading(false);
    }
  }, [selectedAction, page, limit]);

  useEffect(() => {
    if (isSuperAdmin(user)) {
      fetchLogs();
    }
  }, [user, fetchLogs]);

  const getActionColor = (action: string) => {
    switch (action) {
      case "add_admin":
        return "bg-green-600/20 text-green-400";
      case "remove_admin":
        return "bg-red-600/20 text-red-400";
      case "shortlist":
        return "bg-blue-600/20 text-blue-400";
      case "accept":
        return "bg-green-600/20 text-green-400";
      case "reject":
        return "bg-red-600/20 text-red-400";
      case "update_status":
        return "bg-yellow-600/20 text-yellow-400";
      default:
        return "bg-zinc-600/20 text-zinc-400";
    }
  };

  const getActionLabel = (action: string) => {
    return action.replace(/_/g, " ").toUpperCase();
  };

  const totalPages = Math.ceil(totalLogs / limit);

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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <PageHeader title="Activity Logs" />
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Filter by Action</label>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value as ActionType);
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-[#27272A] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="add_admin">Add Admin</option>
              <option value="remove_admin">Remove Admin</option>
              <option value="shortlist">Shortlist</option>
              <option value="accept">Accept</option>
              <option value="reject">Reject</option>
              <option value="update_status">Update Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#1a1a1a] rounded-lg border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            No activity logs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#27272A] border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Admin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#27272A] transition">
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium">
                          {typeof log.admin === "string"
                            ? log.admin
                            : log.admin?.name || "Unknown"}
                        </p>
                        <p className="text-zinc-500 text-xs">
                          {typeof log.admin === "string"
                            ? ""
                            : log.admin?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      <div>
                        {new Date(log.timestamp).toLocaleDateString()}
                        <br />
                        <span className="text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalLogs)} of {totalLogs} logs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#27272A] hover:bg-[#3a3a3a] rounded-lg font-medium transition disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-lg font-medium transition ${
                    p === page
                      ? "bg-blue-600 text-white"
                      : "bg-[#27272A] hover:bg-[#3a3a3a]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[#27272A] hover:bg-[#3a3a3a] rounded-lg font-medium transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
