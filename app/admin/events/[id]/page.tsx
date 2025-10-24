"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { eventsApi } from "@/services/api";

// Define the participant type based on the API response
type Participant = {
  _id: string;
  user: string;
  event: string;
  name: string;
  classRollNo: string;
  department: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ParticipantsResponse = {
  success: boolean;
  totalParticipants: number;
  participants: Participant[];
};

export default function EventParticipantsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "department" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch participants data
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await eventsApi.getEventParticipants(eventId);
        if (response.data && response.data.success) {
          const data = response.data as ParticipantsResponse;
          setParticipants(data.participants);
          setTotalParticipants(data.totalParticipants);
        } else {
          setError("Failed to fetch participants data");
        }
      } catch (err: unknown) {
        console.error("Error fetching participants:", err);
        const errorMessage = err instanceof Error && 'response' in err 
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
          : "An error occurred while fetching participants";
        setError(errorMessage || "An error occurred while fetching participants");
        toast.error("Failed to load participants");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId]);

  // Filter and sort participants
  const filteredAndSortedParticipants = participants
    .filter((participant) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        participant.name.toLowerCase().includes(searchLower) ||
        participant.email.toLowerCase().includes(searchLower) ||
        participant.department.toLowerCase().includes(searchLower) ||
        participant.classRollNo.toLowerCase().includes(searchLower) ||
        participant.phoneNumber.includes(searchQuery)
      );
    })
    .sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "department":
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Calculate pagination
  const totalFilteredItems = filteredAndSortedParticipants.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedParticipants = filteredAndSortedParticipants.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);      
    setCurrentPage(1);
  };

  // Reset to first page when items per page changes
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to export participants as CSV
  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Department", "Roll No", "Registration Date"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedParticipants.map(participant =>
        [
          `"${participant.name}"`,
          `"${participant.email}"`,
          `"${participant.phoneNumber}"`,
          `"${participant.department}"`,
          `"${participant.classRollNo}"`,
          `"${formatDate(participant.createdAt)}"`
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `event-${eventId}-participants.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="content-card mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/admin/events")}
                className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 mr-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Events
              </button>
              <h1 className="text-2xl font-semibold text-gray-800">Event Participants</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Total: {totalParticipants} participants
              </span>
              <button
                onClick={exportToCSV}
                disabled={totalFilteredItems === 0}
                className="flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-end">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Participants
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by name, email, department, roll no, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="custom-select">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "department" | "createdAt")}
                  className="rounded-md border border-gray-300 px-3 py-2 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ zIndex: 1000, position: 'relative' }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="department">Sort by Department</option>
                  <option value="createdAt">Sort by Registration Date</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                </button>
              </div>
              <div className="custom-select">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items per page
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="rounded-md border border-gray-300 px-3 py-2 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ zIndex: 1000, position: 'relative' }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-2xl font-bold text-indigo-600">{totalParticipants}</div>
            <div className="text-sm text-gray-500">Total Participants</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-2xl font-bold text-green-600">{totalFilteredItems}</div>
            <div className="text-sm text-gray-500">Filtered Results</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(participants.map(p => p.department)).size}
            </div>
            <div className="text-sm text-gray-500">Departments</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">{totalPages}</div>
            <div className="text-sm text-gray-500">Total Pages</div>
          </div>
        </div>

        {/* Participants Table */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Participant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Academic Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Registration
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
                    <span className="ml-2">Loading participants...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-red-500">
                  {error}
                </td>
              </tr>
            ) : paginatedParticipants.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchQuery ? "No participants found matching your search" : "No participants found"}
                </td>
              </tr>
            ) : (
              paginatedParticipants.map((participant) => (
                <tr key={participant._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {participant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {participant._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{participant.email}</div>
                    <div className="text-sm text-gray-500">{participant.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{participant.department}</div>
                    <div className="text-sm text-gray-500">Roll: {participant.classRollNo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(participant.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.ceil((new Date().getTime() - new Date(participant.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, totalFilteredItems)} of {totalFilteredItems} participants
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        currentPage === pageNumber
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {!isLoading && !error && totalFilteredItems > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {paginatedParticipants.length} of {totalFilteredItems} filtered participants ({totalParticipants} total)
          </div>
          <div>
            {searchQuery && (
              <span>
                Filtered by: <span className="font-medium">&quot;{searchQuery}&quot;</span>
              </span>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
