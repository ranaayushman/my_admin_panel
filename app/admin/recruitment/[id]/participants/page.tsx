"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { recruitmentApi } from "@/services/api";
import { Loader2, Filter, X } from "lucide-react";
import ParticipantDetailsModal from "@/components/admin/recruitment/ParticipantDetailsModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

                <Card className="border-gray-200">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Registrations List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && applications.length === 0 ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
                            </div>
                        ) : applications.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Roll No</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Branch / Year</TableHead>
                                        <TableHead>Positions</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Applied At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications.map((application) => (
                                        <TableRow
                                            key={application._id}
                                            onClick={() => setSelectedParticipant(application)}
                                            className="cursor-pointer"
                                        >
                                            <TableCell className="font-medium text-gray-900">
                                                {application.generalInfo?.fullName || "N/A"}
                                            </TableCell>

                                            <TableCell className="font-mono text-gray-200">
                                                {application.generalInfo?.rollNumber || "-"}
                                            </TableCell>

                                            <TableCell className="text-gray-600">
                                                {application.generalInfo?.phoneNumber || "N/A"}
                                            </TableCell>

                                            <TableCell className="text-gray-600">
                                                {application.generalInfo?.email || "N/A"}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-200">
                                                        {application.generalInfo?.branch || "N/A"}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {application.generalInfo?.branchYear || "-"} Yr
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {application.generalInfo?.positions?.map((positionName) => (
                                                        <Badge key={positionName} variant="default" className="text-xs">
                                                            {positionName}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant={application.status as "accepted" | "rejected" | "pending"}
                                                    className="capitalize"
                                                >
                                                    {application.status || "pending"}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-gray-500 whitespace-nowrap">
                                                {application.createdAt
                                                    ? new Date(application.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <p className="text-lg font-medium mb-1">No registrations found</p>
                                <p className="text-sm">Try adjusting your filters</p>
                            </div>
                        )}
                    </CardContent>
                    
                    {/* Pagination Footer */}
                    <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-between items-center">
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
                </Card>
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
