"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { membersApi } from "@/services/api";
import { Member, MembersAdminAllResponse } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function MembersPage() {
  const router = useRouter();
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [activeMembers, setActiveMembers] = useState<number>(0);
  const [inactiveMembers, setInactiveMembers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; memberId: string | null; memberName: string }>({ isOpen: false, memberId: null, memberName: "" });

  // Fetch members data
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await membersApi.getAllMembers();
        if (response.data && response.data.success) {
          const data = response.data as MembersAdminAllResponse;
          setAllMembers(data.members || []);
          setTotalMembers(data.totalMembers || data.members?.length || 0);
          setActiveMembers(data.activeMembers || 0);
          setInactiveMembers(data.inactiveMembers || 0);
        } else {
          setError("Failed to fetch members data");
        }
      } catch (err: unknown) {
        console.error("Error fetching members:", err);
        const errorMessage =
          err instanceof Error && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
            : "An error occurred while fetching members";
        setError(errorMessage || "An error occurred while fetching members");
        toast.error("Failed to load members");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members based on search query and active/inactive status
  const filteredMembers = allMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    if (statusFilter === "active") {
      return matchesSearch && member.isActive !== false;
    }
    if (statusFilter === "inactive") {
      return matchesSearch && member.isActive === false;
    }
    return matchesSearch;
  });

  const handleDelete = async (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, memberId: id, memberName: name });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.memberId) return;
    try {
      const response = await membersApi.deleteMember(deleteDialog.memberId);
      if (response.data && response.data.success) {
        // Remove from list and update counters
        setAllMembers((prev) => prev.filter((m) => m._id !== deleteDialog.memberId));
        const removed = allMembers.find((m) => m._id === deleteDialog.memberId);
        setTotalMembers((t) => Math.max(0, t - 1));
        if (removed) {
          if (removed.isActive !== false) {
            setActiveMembers((a) => Math.max(0, a - 1));
          } else {
            setInactiveMembers((i) => Math.max(0, i - 1));
          }
        }
        toast.success("Member deleted successfully");
      } else {
        toast.error("Failed to delete member");
      }
    } catch (err: unknown) {
      console.error("Error deleting member:", err);
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
            ?.data?.message
          : "Failed to delete member";
      toast.error(errorMessage || "Failed to delete member");
    }
  };

  const handleToggleActive = async (memberId: string) => {
    const member = allMembers.find((m) => m._id === memberId);
    if (!member) return;
    const nextActive = member.isActive === false ? true : false;

    // Optimistic update
    setTogglingIds((prev) => new Set(prev).add(memberId));
    setAllMembers((prev) =>
      prev.map((m) => (m._id === memberId ? { ...m, isActive: nextActive } : m))
    );
    // Update counters
    if (nextActive) {
      setActiveMembers((a) => a + 1);
      setInactiveMembers((i) => Math.max(0, i - 1));
    } else {
      setInactiveMembers((i) => i + 1);
      setActiveMembers((a) => Math.max(0, a - 1));
    }

    try {
      const res = await membersApi.toggleActive(memberId, nextActive);
      if (!(res.data && res.data.success)) {
        throw new Error(res.data?.message || "Failed to toggle status");
      }
      toast.success(`Member ${nextActive ? "activated" : "deactivated"}`);
    } catch (err: unknown) {
      console.error("Toggle isActive failed:", err);
      // Rollback
      setAllMembers((prev) =>
        prev.map((m) =>
          m._id === memberId ? { ...m, isActive: !nextActive } : m
        )
      );
      if (nextActive) {
        setActiveMembers((a) => Math.max(0, a - 1));
        setInactiveMembers((i) => i + 1);
      } else {
        setInactiveMembers((i) => Math.max(0, i - 1));
        setActiveMembers((a) => a + 1);
      }
      const errorMessage =
        err instanceof Error && "message" in err
          ? err.message
          : "Failed to toggle status";
      toast.error(errorMessage);
    } finally {
      setTogglingIds((prev) => {
        const s = new Set(prev);
        s.delete(memberId);
        return s;
      });
    }
  };

  // Function to refresh members
  const refreshMembers = () => {
    setIsLoading(true);
    membersApi
      .getAllMembers()
      .then((response) => {
        if (response.data && response.data.success) {
          const data = response.data as MembersAdminAllResponse;
          setAllMembers(data.members || []);
          setTotalMembers(data.totalMembers || data.members?.length || 0);
          setActiveMembers(data.activeMembers || 0);
          setInactiveMembers(data.inactiveMembers || 0);
          toast.success("Members refreshed successfully");
        } else {
          toast.error("Failed to refresh members");
        }
      })
      .catch((err) => {
        console.error("Error refreshing members:", err);
        toast.error("Failed to refresh members");
      })
      .finally(() => setIsLoading(false));
  };

  const stats = [
    { key: "total", label: "Total", value: totalMembers },
    { key: "active", label: "Active", value: activeMembers },
    { key: "inactive", label: "Inactive", value: inactiveMembers }
  ]

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6 flex flex-col space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-white">Members</h1>

            <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
              {stats.map((stat) => {
                return (
                  <span key={stat.key} className="shadow-md text-white border border-gray-700 p-1 px-2 rounded-full bg-zinc-800/90">
                    {stat.label}: {stat.value}
                  </span>
                )
              })}
            </div>

          </div>
          <div className="flex gap-2">
            <button
              aria-label="Refresh members"
              onClick={refreshMembers}
              className="flex items-center justify-center rounded-full bg-blue-500 p-2 sm:px-3 sm:py-1 text-sm text-white shadow-sm hover:bg-blue-600 border border-zinc-900"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={() => router.push('/admin/members/add')}
              className="flex items-center rounded-full bg-blue-500 px-4 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base text-white shadow-sm hover:bg-blue-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 border border-zinc-900 px-2 bg-[#18181B] py-2 rounded-lg sm:rounded-full shadow-md">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide" >
            {(
              [
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "inactive", label: "Inactive" },
              ] as Array<{ key: "all" | "active" | "inactive"; label: string }>
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`rounded-full text-white px-3 py-1 text-xs sm:text-sm capitalize whitespace-nowrap ${statusFilter === opt.key
                  ? "bg-blue-500 text-white font-medium"
                  : "bg-[#141417] text-white hover:bg-zinc-800"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#141417] text-white rounded-full px-4 py-2 text-sm border border-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-white">Loading members</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-400">No members found</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div key={member._id} className="bg-[#18181B] border border-zinc-900 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                {member.profile_image?.url ? (
                  <Image
                    src={member.profile_image.url}
                    alt={member.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{member.name}</h3>
                  <p className="text-xs text-zinc-400 truncate">{member.email_id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.isActive !== false
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {member.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-zinc-400 mb-3">
                <p><span className="text-zinc-500">Designation:</span> {member.designation}</p>
                <p><span className="text-zinc-500">Department:</span> {member.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs text-zinc-400">Status:</span>
                  <button
                    onClick={() => handleToggleActive(member._id)}
                    disabled={togglingIds.has(member._id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                      member.isActive !== false
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-zinc-600 hover:bg-zinc-500"
                    } ${togglingIds.has(member._id) ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={member.isActive !== false ? "Deactivate" : "Activate"}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition ${
                        member.isActive !== false ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <button
                  onClick={() => router.push(`/admin/members/edit/${member._id}`)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member._id, member.name)}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Card View */}
      <div className="hidden md:block">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-white">Loading members</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-sm text-red-500">
            {error}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-20 text-center text-sm text-white">
            No members found
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredMembers.map((member) => (
              <div
                key={member.uniqueKey || member._id}
                className="group relative bg-[#18181B] border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
              >
                {/* Header with Profile */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    {member.profile_image?.url ? (
                      <Image
                        src={member.profile_image.url}
                        alt={member.name}
                        width={64}
                        height={64}
                        unoptimized
                        className="h-16 w-16 rounded-full object-cover border-2 border-zinc-800 group-hover:border-blue-500/50 transition-colors"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white border-2 border-zinc-800 group-hover:border-blue-500/50 transition-colors">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#18181B] ${
                      member.isActive !== false ? "bg-green-500" : "bg-zinc-600"
                    }`}></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-zinc-400 truncate">{member.email_id}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        member.designation.toLowerCase().includes("lead")
                          ? "bg-red-500/20 text-red-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {member.designation}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        member.isActive !== false
                          ? "bg-green-500/20 text-green-400"
                          : "bg-zinc-700 text-zinc-300"
                      }`}>
                        {member.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="space-y-2 mb-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-white">{member.department}</span>
                    <span className="text-xs text-zinc-500">({member.batch})</span>
                  </div>
                  {member.bio && (
                    <p className="text-xs text-zinc-400 line-clamp-2">{member.bio}</p>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 mb-4">
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image src="/linkedin.svg" width={16} height={16} className="w-4 h-4" alt="LinkedIn" />
                    <span>LinkedIn</span>
                  </a>
                  {member.github_url && member.github_url !== "NA" && (
                    <a
                      href={member.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-white hover:text-zinc-300 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Image src="/github.svg" width={16} height={16} className="w-4 h-4 invert" alt="GitHub" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-zinc-400">Status:</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(member._id); }}
                      disabled={togglingIds.has(member._id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                        togglingIds.has(member._id)
                          ? "opacity-50 cursor-not-allowed"
                          : member.isActive !== false
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-zinc-600 hover:bg-zinc-500"
                      }`}
                      title={member.isActive !== false ? "Deactivate" : "Activate"}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition ${
                          member.isActive !== false ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/members/edit/${member._id}`);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                      <path d="M216-216h51l375-375-51-51-375 375v51Zm-72 72v-153l498-498q11-11 23.84-16 12.83-5 27-5 14.16 0 27.16 5t24 16l51 51q11 11 16 24t5 26.54q0 14.45-5.02 27.54T795-642L297-144H144Zm600-549-51-51 51 51Zm-127.95 76.95L591-642l51 51-25.95-25.05Z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(member._id, member.name); }}
                    className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                      <path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, memberId: null, memberName: "" })}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete "${deleteDialog.memberName}"? This action cannot be undone.`}
      />
    </div>
  );
}
