"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { membersApi } from "@/services/api";
import { Member, MembersAdminAllResponse } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

  const handleDelete = async (id: string) => {
    try {
      const response = await membersApi.deleteMember(id);
      if (response.data && response.data.success) {
        // Remove from list and update counters
        setAllMembers((prev) => prev.filter((m) => m._id !== id));
        const removed = allMembers.find((m) => m._id === id);
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
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-white">Members</h1>

            <div className="ml-4 flex items-center space-x-3 text-sm">
              {stats.map((stat) => {
                return (
                  <span key={stat.key} className="ml-4 text-sm shadow-md text-white border border-gray-700 p-1 px-2 rounded-full bg-zinc-800/90">
                    {stat.label}: {stat.value}
                  </span>
                )
              })}
            </div>

          </div>
          <div className="flex gap-2">
            <button
              aria-label="Refresh events"
              onClick={refreshMembers}
              className="ml-4 flex items-center justify-center rounded-full bg-blue-500 px-3 py-1 text-sm text-white shadow-sm hover:bg-blue-600 border border-zinc-900"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              className="flex items-center rounded-full bg-blue-500 px-8 py-2.5 text-[16px] text-white shadow-sm hover:bg-blue-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-6 w-6"
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
              Add Member
            </button>
          </div>

        </div>

        <div className="flex justify-between gap-2 border border-zinc-900 px-2 bg-[#18181B] py-2 rounded-full shadow-md">
          <div className="flex gap-2 " >
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
                className={`rounded-full text-white px-3 py-1 text-sm capitalize ${statusFilter === opt.key
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
            className="bg-[#141417] text-white rounded-full px-4 py-2 border border-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-900">
        <table className="min-w-full divide-y divide-zinc-900">
          <thead className="bg-[#141417]">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white"
              >
                Profile
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white"
              >
                Designation
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white"
              >
                Department
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 bg-[#18181B]">
            {/* ================= Loading ================= */}
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-sm text-white">Loading members</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              /* ================= Error ================= */
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              /* ================= Empty ================= */
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-white">
                  No members found
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr
                  key={member.uniqueKey || member._id}
                  className="transition-colors hover:bg-[#141417] cursor-pointer"
                  onClick={() => router.push(`/admin/members/edit/${member._id}`)}
                >
                  {/* Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {member.profile_image?.url ? (
                          <Image
                            src={member.profile_image.url}
                            alt={member.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="h-10 w-10 rounded-full object-cover border border-zinc-900"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {member.name}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4">
                    <div className="max-w-[220px] truncate text-sm text-white">
                      {member.email_id}
                    </div>
                  </td>

                  {/* Designation */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${member.designation.toLowerCase().includes("lead")
                        ? "bg-red-500/20 text-red-400"
                        : "bg-blue-500/20 text-blue-400"
                        }`}
                    >
                      {member.designation}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-sm text-white">
                    {member.department}
                    <span className="ml-1 text-xs text-zinc-400">
                      ({member.batch})
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${member.isActive !== false
                          ? "bg-green-500/20 text-green-400"
                          : "bg-zinc-700 text-zinc-300"
                          }`}
                      >
                        {member.isActive !== false ? "Active" : "Inactive"}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleToggleActive(member._id); }}
                        disabled={togglingIds.has(member._id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${togglingIds.has(member._id)
                          ? "opacity-50"
                          : member.isActive !== false
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-zinc-600 hover:bg-zinc-500"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${member.isActive !== false ? "translate-x-4" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-3">
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img src="/linkedin.svg" className="w-5 h-5" alt="" />
                        </a>
                        {member.github_url && member.github_url !== "NA" && (
                          <a
                            href={member.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img src="/github.svg" className="w-4 h-4 invert" alt="" />
                          </a>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/members/edit/${member._id}`);
                          }}
                          className="text-blue-400 hover:underline"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M216-216h51l375-375-51-51-375 375v51Zm-72 72v-153l498-498q11-11 23.84-16 12.83-5 27-5 14.16 0 27.16 5t24 16l51 51q11 11 16 24t5 26.54q0 14.45-5.02 27.54T795-642L297-144H144Zm600-549-51-51 51 51Zm-127.95 76.95L591-642l51 51-25.95-25.05Z" /></svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(member._id); }}
                          className="text-red-400 hover:underline"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z" /></svg>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
