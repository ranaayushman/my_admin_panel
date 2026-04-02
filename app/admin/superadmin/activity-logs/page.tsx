"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { isSuperAdmin } from "@/utils/roleCheck";
import { superAdminApi } from "@/services/api";
import { ActivityLog } from "@/types";
import PageHeader from "@/components/admin/PageHeader";
import { toast } from "sonner";

import { 
    Activity, 
    ShieldCheck, 
    User, 
    Calendar, 
    Clock, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    ArrowRightCircle,
    Info,
    Mail,
    Globe
} from "lucide-react";

type ActionType = "add_admin" | "remove_admin" | "shortlist" | "reject" | "accept" | "update_status" | "";

export default function ActivityLogsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ActionType>("");
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 20;

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
        setTotalLogs(response.data.pagination?.total || response.data.totalLogs || 0);
      } else {
        toast.error(response.data.message || "Failed to fetch logs");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Error fetching logs");
    } finally {
      setLoading(false);
    }
  }, [selectedAction, page]);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin(user)) {
      router.push("/unauthorized");
      return;
    }
    if (user && isSuperAdmin(user)) {
      fetchLogs();
    }
  }, [user, authLoading, fetchLogs, router]);

  const getActionColor = (action: string) => {
    switch (action) {
      case "add_admin": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "remove_admin": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "shortlist": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "accept": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "reject": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "update_status": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getRoleLabel = (role: string) => {
    if (!role) return "N/A";
    switch (role.toLowerCase()) {
      case "super_admin": return "System Full Access";
      case "super_domain_admin": return "Full Access";
      case "domain_lead": return "Domain Lead";
      default: return role.replace(/_/g, " ").toUpperCase();
    }
  };

  const getRoleColor = (role: string) => {
    if (role === "super_admin") return "text-indigo-400 bg-indigo-400/5 border-indigo-400/20";
    if (role === "super_domain_admin") return "text-purple-400 bg-purple-400/5 border-purple-400/20";
    return "text-zinc-400 bg-zinc-400/5 border-zinc-400/20";
  };

  const totalPages = Math.ceil(totalLogs / limit);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 selection:bg-indigo-500/30">
      <div className="max-w-[1400px] mx-auto">
        <PageHeader 
          title="Admin Activity Vault" 
          subtitle="Real-time audit log of system operations and member management"
        />

        {/* Filters & Actions */}
        <div className="mt-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-[#18181b] border border-zinc-800 rounded-2xl p-1.5 w-full sm:w-auto">
            <div className="flex items-center px-3 text-zinc-500">
              <Filter size={18} />
            </div>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value as ActionType);
                setPage(1);
              }}
              className="bg-transparent border-none text-sm font-medium py-2 pr-8 focus:ring-0 focus:outline-none cursor-pointer hover:text-indigo-400 transition-colors"
            >
              <option value="">Full System Audit</option>
              <option value="add_admin">Grant Access</option>
              <option value="remove_admin">Revoke Access</option>
              <option value="shortlist">Status: Shortlist</option>
              <option value="accept">Status: Accept</option>
              <option value="reject">Status: Reject</option>
              <option value="update_status">Status: Update</option>
            </select>
          </div>

          <div className="text-xs font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
            <Activity size={14} className="text-indigo-500" />
            Live System Feed
          </div>
        </div>

        {/* Logs Table Container */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[28px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-[#121214] rounded-[24px] border border-zinc-800/80 shadow-2xl overflow-hidden">
            {loading && logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-4" />
                <p className="text-zinc-500 font-medium animate-pulse">Syncing Audit Logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
                  <ShieldCheck size={32} className="text-zinc-700" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Clear Horizon</h3>
                <p className="text-zinc-500 text-sm max-w-xs">No activity has been recorded for the selected filter criteria yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#18181b]/50 border-b border-zinc-800/50">
                      <th className="px-6 py-5 first:pl-8 last:pr-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">Operation</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">Administrator</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">Access Level</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">Description</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap text-right">Execution Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {logs.map((log) => (
                      <tr key={log._id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                        <td className="px-6 py-5 first:pl-8 last:pr-8 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                              <User size={16} className="text-indigo-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                                {typeof log.admin === "string" ? log.admin : log.admin?.name || "System Process"}
                              </span>
                              <div className="flex items-center gap-1.5 text-zinc-500">
                                <Mail size={10} />
                                <span className="text-[11px]">{typeof log.admin === 'object' ? log.admin?.email : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${getRoleColor(log.admin?.role)}`}>
                            {getRoleLabel(log.admin?.role)}
                          </span>
                        </td>
                        <td className="px-6 py-5 min-w-[300px]">
                          <div className="flex flex-col gap-1.5 max-w-sm">
                            <p className="text-[13px] text-zinc-400 leading-relaxed font-medium">
                              {log.description}
                            </p>
                            {log.domain && (
                              <div className="flex items-center gap-1.5">
                                <Globe size={10} className="text-zinc-600" />
                                <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                                  Domain: {log.domain}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right last:pr-8 whitespace-nowrap">
                          <div className="inline-flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                              <Calendar size={12} className="text-indigo-500" />
                              {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-600 uppercase tracking-tighter">
                              <Clock size={10} />
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest bg-[#18181b] px-4 py-2 rounded-xl border border-zinc-800">
              <span className="text-indigo-400">{(page - 1) * limit + 1}-{Math.min(page * limit, totalLogs)}</span>
              <span className="text-zinc-700">|</span>
              <span>Total {totalLogs} Events</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#18181b] hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-[#18181b] rounded-xl border border-zinc-800 transition-all active:scale-95 group"
              >
                <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-xs font-black uppercase tracking-tighter">Prev</span>
              </button>

              <div className="hidden md:flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                        p === page
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                          : "hover:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:hover:bg-zinc-900 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group"
              >
                <span className="text-xs font-black uppercase tracking-tighter">Next</span>
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
