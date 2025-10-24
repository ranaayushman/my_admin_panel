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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Members</h1>
            <button
              onClick={refreshMembers}
              className="ml-4 flex items-center rounded-md bg-white px-2 py-1 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
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
              Refresh
            </button>
            <div className="ml-4 flex items-center space-x-3 text-sm text-gray-600">
              <span>
                Total:{" "}
                <span className="font-medium text-gray-800">
                  {totalMembers}
                </span>
              </span>
              <span>
                Active:{" "}
                <span className="font-medium text-green-700">
                  {activeMembers}
                </span>
              </span>
              <span>
                Inactive:{" "}
                <span className="font-medium text-red-700">
                  {inactiveMembers}
                </span>
              </span>
            </div>
            <button
              onClick={() => router.push("/admin/members/add")}
              className="ml-4 flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-indigo-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
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
          <div className="w-64">
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
              className={`rounded-full px-3 py-1 text-sm ${
                statusFilter === opt.key
                  ? "bg-indigo-100 text-indigo-800 font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Profile
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Designation
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Department
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-red-500"
                >
                  {error}
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No members found
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.uniqueKey || member._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {member.profile_image?.url ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={member.profile_image.url}
                            alt={member.name}
                            width={40}
                            height={40}
                            unoptimized={true} // Use this for external images if needed
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {member.name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {member.email_id}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        member.designation.toLowerCase().includes("lead")
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {member.designation}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {member.department} ({member.batch})
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 text-xs font-semibold leading-5 ${
                          member.isActive !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {member.isActive !== false ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => handleToggleActive(member._id)}
                        disabled={togglingIds.has(member._id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          togglingIds.has(member._id)
                            ? "opacity-50"
                            : member.isActive !== false
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-pressed={member.isActive !== false}
                        aria-label="Toggle active status"
                        type="button"
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            member.isActive !== false
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <div className="flex space-x-2">
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          LinkedIn
                        </a>
                        {member.github_url && member.github_url !== "NA" && (
                          <a
                            href={member.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            GitHub
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/members/edit/${member._id}`)
                          }
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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
