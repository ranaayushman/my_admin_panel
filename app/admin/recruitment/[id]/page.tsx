"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { recruitmentApi } from "@/services/api";
import { Loader2, Filter, X } from "lucide-react";

// Branches consistent with recruitment form data
const BRANCHES = [
    "CSE", "CSE-DS", "CSE-CS", "CSE-AIML",
    "ECE", "EE", "CHE", "AEIE", "ME",
    "IT", "BT", "AE", "FT", "Other"
];

const bgColors = [
    "#E0F2FE", // light sky blue
    "#ECFEFF", // light cyan
    "#ECFDF5", // light mint green
    "#F0FDF4", // light green
    "#FFF7ED", // light orange
    "#FFFBEB", // light amber
    "#FDF2F8", // light pink
    "#FAF5FF", // light purple
    "#F5F5F5", // light gray
    "#F1F5F9", // light slate
];

const StatsCard = ({ label, count }: { label: string, count: number }) => {
    // Generate a stable color index based on the label string
    const colorIndex = label.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgColors.length;

    return (
        <div
            className="flex-shrink-0 w-full sm:w-auto sm:min-w-[120px] rounded-xl shadow-md p-4 border border-gray-100 transition hover:shadow-md"
            style={{ backgroundColor: bgColors[colorIndex] }}
        >
            <p className="text-[10px] font-semibold text-[#334155] uppercase tracking-wide truncate" title={label}>
                {label}
            </p>
            <p className="mt-2 text-xl font-bold text-[#1F2937]">
                {count}
            </p>
        </div>
    )
}

export default function RecruitmentDetails() {
    const { id } = useParams();

    const [title, setTitle] = useState("Loading...");
    const [roleOptions, setRoleOptions] = useState<string[]>([]);
    const [stats, setStats] = useState<any>(null); // For total filtered count
    const [positionStats, setPositionStats] = useState<any[]>([]); // For role breakdown
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [branch, setBranch] = useState("");
    const [position, setPosition] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Fetch Form Details (Title & Roles) & Stats only once when ID changes
    useEffect(() => {
        if (id) {
            const fetchFormDetails = async () => {
                try {
                    const formsRes = await recruitmentApi.getAllForms();
                    const currentForm = formsRes.data.forms.find((f: any) => f._id === id);
                    if (currentForm) {
                        setTitle(currentForm.title);
                        if (currentForm.roles && Array.isArray(currentForm.roles)) {
                            setRoleOptions(currentForm.roles.map((r: any) => r.roleName));
                        }
                    }
                } catch (error) {
                    console.error("Error fetching form details:", error);
                }
            };

            const fetchStats = async () => {
                try {
                    // Fetch stats using the includeStats flag
                    const res = await recruitmentApi.getRecruitmentData({
                        formId: id,
                        includeStats: 'true',
                        limit: 1 // Minimal data fetch
                    });
                    if (res.data.success && res.data.data.positionStats) {
                        // Sort by count descending
                        const sortedStats = res.data.data.positionStats.sort((a: any, b: any) => b.count - a.count);
                        setPositionStats(sortedStats);
                    }
                } catch (error) {
                    console.error("Error fetching stats:", error);
                }
            };

            fetchFormDetails();
            fetchStats();
        }
    }, [id]);

    // Fetch Applications when filters or page change
    useEffect(() => {
        if (id) fetchApplications();
    }, [id, page, branch, position]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const appsRes = await recruitmentApi.getRecruitmentData({
                formId: id,
                page,
                limit: 20,
                branch: branch || undefined,
                position: position || undefined
            });

            if (appsRes.data.success && appsRes.data.data) {
                setApplications(appsRes.data.data.recruitmentData);
                const pagination = appsRes.data.data.pagination;
                setHasMore(pagination.hasNextPage);
                setStats({ total: pagination.totalDocuments });
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBranch(e.target.value);
        setPage(1);
    };

    const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPosition(e.target.value);
        setPage(1);
    };

    const clearFilters = () => {
        setBranch("");
        setPosition("");
        setPage(1);
    };

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">Form ID: {id}</p>
                </div>

                <Link
                    href={`/admin/recruitment/edit/${id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
                >
                    Edit Form
                </Link>
            </div>

            {/* Stats Cards Row */}
            <div className="flex flex-wrap gap-2 pb-2">
                {/* Total Card (Updates with Filters) */}
                <StatsCard label={`Total ${branch || position ? '(Filtered)' : ''}`} count={stats?.total || 0} />

                {/* Dynamic Role Cards (Form Overview) */}
                {positionStats.map((stat: any) => (
                    <StatsCard key={stat._id} label={stat._id} count={stat.count} />
                ))}
            </div>

            {/* Filters & Table Layout */}
            <div className="space-y-4">

                {/* Filters Area */}
                <div className="w-full bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Filter size={18} />
                        <span>Filter Applications</span>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="relative">
                            <select
                                value={branch}
                                onChange={handleBranchChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 min-w-[150px]"
                            >
                                <option value="">All Branches</option>
                                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <select
                                value={position}
                                onChange={handlePositionChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 min-w-[150px]"
                            >
                                <option value="">All Positions</option>
                                {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        {(branch || position) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                            >
                                <X size={16} /> Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl bg-white shadow overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b bg-gray-50/50">
                        <h3 className="text-lg font-medium text-gray-900">
                            Registrations List
                        </h3>
                    </div>

                    {loading && applications.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Full Name</th>
                                        <th className="px-6 py-3">Roll No</th>
                                        <th className="px-6 py-3">Phone</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Branch / Year</th>
                                        <th className="px-6 py-3">Positions</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Applied At</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {applications.length > 0 ? (
                                        applications.map((app: any) => (
                                            <tr
                                                key={app._id}
                                                className="hover:bg-indigo-50/30 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {app.generalInfo?.fullName || "N/A"}
                                                </td>

                                                <td className="px-6 py-4 font-mono text-gray-700">
                                                    {app.generalInfo?.rollNumber || "—"}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {app.generalInfo?.phoneNumber || "N/A"}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {app.generalInfo?.email || "N/A"}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-800">
                                                            {app.generalInfo?.branch || "N/A"}
                                                        </span>
                                                        <span className="text-xs text-gray-500 border border-gray-200 px-1.5 rounded">
                                                            {app.generalInfo?.branchYear || "-"} Yr
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {app.generalInfo?.positions?.map((p: string) => (
                                                            <span
                                                                key={p}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                                            >
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full capitalize border
                              ${app.status === "accepted"
                                                                ? "bg-green-100 text-green-800 border-green-200"
                                                                : app.status === "rejected"
                                                                    ? "bg-red-100 text-red-800 border-red-200"
                                                                    : "bg-yellow-50 text-yellow-800 border-yellow-200"
                                                            }`}
                                                    >
                                                        {app.status || "pending"}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <p className="text-lg font-medium mb-1">No registrations found</p>
                                                    <p className="text-sm">Try adjusting your filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>

                        <span className="text-gray-600 text-sm font-medium">Page {page}</span>

                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasMore}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
