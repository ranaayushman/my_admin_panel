"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { membersApi } from "@/services/api";
import { Member } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MembersPage() {
  const router = useRouter();
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Fetch members data
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await membersApi.getAllMembers();
        if (response.data && response.data.success) {
          // Combine all members into a single array for easier management
          const membersData = response.data.members;
          const coreTeam = membersData.coreTeam || [];
          const prTeam = membersData.prTeam || [];

          // Extract members from techTeam
          const techTeam = membersData.techTeam || {};
          const webDevelopers = techTeam.webDeveloper || [];
          const appDevelopers = techTeam.appDeveloper || [];
          const mlDevelopers = techTeam.machineLearning || [];
          const techMembers = techTeam.techMember || [];

          // Extract members from mediaTeam
          const mediaTeam = membersData.mediaTeam || {};
          const videoEditors = mediaTeam.videoEditor || [];
          const graphicDesigners = mediaTeam.graphicDesigner || [];
          const contentWriters = mediaTeam.contentWriter || [];
          const photographers = mediaTeam.photographer || [];

          // Create a Map to deduplicate members by ID
          const uniqueMembersMap = new Map();

          // Helper function to add members to the Map with their category
          const addMembersToMap = (members: Member[], category: string) => {
            members.forEach((member) => {
              uniqueMembersMap.set(member._id, {
                ...member,
                // Keep the original designation but add a unique key for rendering
                uniqueKey: `${member._id}-${category}`,
              });
            });
          };

          // Add all member groups with their categories
          addMembersToMap(coreTeam, "core");
          addMembersToMap(webDevelopers, "web");
          addMembersToMap(appDevelopers, "app");
          addMembersToMap(mlDevelopers, "ml");
          addMembersToMap(techMembers, "tech");
          addMembersToMap(videoEditors, "video");
          addMembersToMap(graphicDesigners, "graphic");
          addMembersToMap(contentWriters, "content");
          addMembersToMap(photographers, "photo");
          addMembersToMap(prTeam, "pr");

          // Convert Map values to array
          const allMembersArray = Array.from(uniqueMembersMap.values());

          setAllMembers(allMembersArray);
        } else {
          setError("Failed to fetch members data");
        }
      } catch (err: unknown) {
        console.error("Error fetching members:", err);
        const errorMessage = err instanceof Error && 'response' in err 
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
          : "An error occurred while fetching members";
        setError(errorMessage || "An error occurred while fetching members");
        toast.error("Failed to load members");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members based on search query and active category
  const filteredMembers = allMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());

    // If active category is 'all', return all members that match the search
    if (activeCategory === "all") {
      return matchesSearch;
    }

    // Otherwise, filter by category too
    const matchesCategory = member.designation
      .toLowerCase()
      .includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    try {
      const response = await membersApi.deleteMember(id);
      if (response.data && response.data.success) {
        // Use the _id to filter out the deleted member
        setAllMembers(allMembers.filter((member) => member._id !== id));
        toast.success("Member deleted successfully");
      } else {
        toast.error("Failed to delete member");
      }
    } catch (err: unknown) {
      console.error("Error deleting member:", err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Failed to delete member";
      toast.error(errorMessage || "Failed to delete member");
    }
  };

  // Get unique member categories for filtering
  const categories = [
    "all",
    ...new Set(
      allMembers.map((member) =>
        member.designation.toLowerCase().includes("lead")
          ? "Lead"
          : member.designation
      )
    ),
  ];

  // Function to refresh members
  const refreshMembers = () => {
    setIsLoading(true);
    membersApi
      .getAllMembers()
      .then((response) => {
        if (response.data && response.data.success) {
          const membersData = response.data.members;

          // Create a Map to deduplicate members by ID
          const uniqueMembersMap = new Map();

          // Helper function to add members to the Map with their category
          const addMembersToMap = (
            members: Member[] = [],
            category: string
          ) => {
            members.forEach((member) => {
              uniqueMembersMap.set(member._id, {
                ...member,
                // Keep the original designation but add a unique key for rendering
                uniqueKey: `${member._id}-${category}`,
              });
            });
          };

          // Add all member groups with their categories
          addMembersToMap(membersData.coreTeam, "core");
          addMembersToMap(membersData.techTeam?.webDeveloper, "web");
          addMembersToMap(membersData.techTeam?.appDeveloper, "app");
          addMembersToMap(membersData.techTeam?.machineLearning, "ml");
          addMembersToMap(membersData.techTeam?.techMember, "tech");
          addMembersToMap(membersData.mediaTeam?.videoEditor, "video");
          addMembersToMap(membersData.mediaTeam?.graphicDesigner, "graphic");
          addMembersToMap(membersData.mediaTeam?.contentWriter, "content");
          addMembersToMap(membersData.mediaTeam?.photographer, "photo");
          addMembersToMap(membersData.prTeam, "pr");

          // Convert Map values to array
          const allMembersArray = Array.from(uniqueMembersMap.values());

          setAllMembers(allMembersArray);
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
            <span className="ml-4 text-sm text-gray-500">
              Total: {filteredMembers.length} members
            </span>
            <button
              onClick={() => router.push('/admin/members/add')}
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
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category.toLowerCase())}
              className={`rounded-full px-3 py-1 text-sm ${
                activeCategory === category.toLowerCase()
                  ? "bg-indigo-100 text-indigo-800 font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category === "all" ? "All Members" : category}
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-sm text-red-500"
                >
                  {error}
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
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
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
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
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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
