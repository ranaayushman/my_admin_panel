"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { recruitmentApi } from "@/services/api";
import { Loader2, Filter, X } from "lucide-react";
import ParticipantDetailsModal from "@/components/admin/recruitment/ParticipantDetailsModal";

const BRANCHES = [
    "CSE", "CSE-DS", "CSE-CS", "CSE-AIML",
    "ECE", "EE", "CHE", "AEIE", "ME",
    "IT", "BT", "AE", "FT", "Other",
];

const bgColors = [
    "#E0F2FE",
    "#ECFEFF",
    "#ECFDF5",
    "#F0FDF4",
    "#FFF7ED",
    "#FFFBEB",
    "#FDF2F8",
    "#FAF5FF",
    "#F5F5F5",
    "#F1F5F9",
];

const StatsCard = ({ label, count }: { label: string; count: number }) => {
    const colorIndex = label.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgColors.length;

    return (
        <div
            className="flex-shrink-0 w-full sm:w-auto sm:min-w-[120px] rounded-xl shadow-md p-4 border border-gray-100 transition hover:shadow-md"
            style={{ backgroundColor: bgColors[colorIndex] }}
        >
            <p className="text-[10px] font-semibold text-[#334155] uppercase tracking-wide truncate" title={label}>
                {label}
            </p>
            <p className="mt-2 text-xl font-bold text-[#1F2937]">{count}</p>
        </div>
    );
};

type Application = {
    _id: string;
    createdAt: string;
    status?: string;
    user?: string;
    formId?: string;
    generalInfo?: {
        fullName?: string;
        rollNumber?: string;
        phoneNumber?: string;
        email?: string;
        branch?: string;
        branchYear?: string | number;
        positions?: string[];
    };
    finalInfo?: {
        linkedIn?: string;
        previousClubs?: string;
    };
    roleSpecific?: {
        [key: string]: {
            [key: string]: string;
        };
    };
    whatsappGroupLinks?: {
        [key: string]: string;
    };
    updatedAt?: string;
};

export default function RecruitmentParticipantsPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [title, setTitle] = useState("Loading...");
    const [roleOptions, setRoleOptions] = useState<string[]>([]);
    const [stats, setStats] = useState<{ total: number } | null>(null);
    const [positionStats, setPositionStats] = useState<{ _id: string; count: number }[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    const [branch, setBranch] = useState("");
    const [position, setPosition] = useState("");

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

    useEffect(() => {
        if (!id) return;

        const fetchFormDetails = async () => {
            try {
                const formsRes = await recruitmentApi.getAllForms();
                const forms = Array.isArray(formsRes.data?.forms) ? formsRes.data.forms : [];
                const currentForm = forms.find((form: { _id?: string; title?: string; roles?: Array<{ roleName?: string }> }) => form._id === id);

                if (currentForm) {
                    setTitle(currentForm.title ?? "Untitled Form");
                    if (Array.isArray(currentForm.roles)) {
                        setRoleOptions(
                            currentForm.roles
                                .map((role: { roleName?: string }) => role.roleName ?? "")
                                .filter(Boolean)
                        );
                    }
                }
            } catch (error) {
                console.error("Error fetching form details:", error);
            }
        };

        const fetchStats = async () => {
            try {
                const res = await recruitmentApi.getRecruitmentData({
                    formId: id,
                    includeStats: "true",
                    limit: 1,
                });

                if (res.data?.success && Array.isArray(res.data?.data?.positionStats)) {
                    const sortedStats = [...res.data.data.positionStats].sort(
                        (a: { count: number }, b: { count: number }) => b.count - a.count
                    );
                    setPositionStats(sortedStats);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchFormDetails();
        fetchStats();
    }, [id]);

    const fetchApplications = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const appsRes = await recruitmentApi.getRecruitmentData({
                formId: id,
                page,
                limit: 20,
                branch: branch || undefined,
                position: position || undefined,
            });

            if (appsRes.data?.success && appsRes.data?.data) {
                setApplications(Array.isArray(appsRes.data.data.recruitmentData) ? appsRes.data.data.recruitmentData : []);
                const pagination = appsRes.data.data.pagination;
                setHasMore(Boolean(pagination?.hasNextPage));
                setStats({ total: Number(pagination?.totalDocuments || 0) });
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    }, [id, page, branch, position]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBranch(e.target.value);
        setPage(1);
    };

    const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPosition(e.target.value);
        setPage(1);
    };

    const handleStatusUpdate = (participantId: string, newStatus: string) => {
        // Update the selected participant with new status
        if (selectedParticipant && selectedParticipant._id === participantId) {
            setSelectedParticipant({
                ...selectedParticipant,
                status: newStatus,
            });
        }

        // Update the participant in the applications list
        setApplications((prevApps) =>
            prevApps.map((app) =>
                app._id === participantId ? { ...app, status: newStatus } : app
            )
        );
    };

    const clearFilters = () => {
        setBranch("");
        setPosition("");
        setPage(1);
    };

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">Form ID: {id}</p>
                </div>

                <Link
                    href={`/admin/recruitment/${id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
                >
                    Back To Form
                </Link>
            </div>

            <div className="flex flex-wrap gap-2 pb-2">
                <StatsCard label={`Total ${branch || position ? "(Filtered)" : ""}`} count={stats?.total || 0} />

                {positionStats.map((stat) => (
                    <StatsCard key={stat._id} label={stat._id} count={stat.count} />
                ))}
            </div>

            <div className="space-y-4">
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
                                {BRANCHES.map((branchOption) => (
                                    <option key={branchOption} value={branchOption}>{branchOption}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <select
                                value={position}
                                onChange={handlePositionChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 min-w-[150px]"
                            >
                                <option value="">All Positions</option>
                                {roleOptions.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
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

                <div className="rounded-xl bg-white shadow overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b bg-gray-50/50">
                        <h3 className="text-lg font-medium text-gray-900">Registrations List</h3>
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
                                        applications.map((application) => (
                                            <tr
                                                key={application._id}
                                                onClick={() => setSelectedParticipant(application)}
                                                className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {application.generalInfo?.fullName || "N/A"}
                                                </td>

                                                <td className="px-6 py-4 font-mono text-gray-700">
                                                    {application.generalInfo?.rollNumber || "-"}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {application.generalInfo?.phoneNumber || "N/A"}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {application.generalInfo?.email || "N/A"}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-800">
                                                            {application.generalInfo?.branch || "N/A"}
                                                        </span>
                                                        <span className="text-xs text-gray-500 border border-gray-200 px-1.5 rounded">
                                                            {application.generalInfo?.branchYear || "-"} Yr
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {application.generalInfo?.positions?.map((positionName) => (
                                                            <span
                                                                key={positionName}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                                            >
                                                                {positionName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full capitalize border ${application.status === "accepted"
                                                            ? "bg-green-100 text-green-800 border-green-200"
                                                            : application.status === "rejected"
                                                                ? "bg-red-100 text-red-800 border-red-200"
                                                                : "bg-yellow-50 text-yellow-800 border-yellow-200"
                                                            }`}
                                                    >
                                                        {application.status || "pending"}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                    {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "-"}
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

                    <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                        <button
                            onClick={() => setPage((value) => Math.max(1, value - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>

                        <span className="text-gray-600 text-sm font-medium">Page {page}</span>

                        <button
                            onClick={() => setPage((value) => value + 1)}
                            disabled={!hasMore}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Participant Details Modal */}
            <ParticipantDetailsModal
                isOpen={selectedParticipant !== null}
                participant={selectedParticipant}
                onClose={() => setSelectedParticipant(null)}
                onStatusUpdate={handleStatusUpdate}
            />
        </div>
    );
}
