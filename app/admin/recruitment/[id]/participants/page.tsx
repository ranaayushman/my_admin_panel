"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { recruitmentApi } from "@/services/api";
import { Loader2, Filter, X, Download, ChevronDown, FileSpreadsheet, FileText, Users, Edit } from "lucide-react";
import ParticipantDetailsModal from "@/components/admin/recruitment/ParticipantDetailsModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { DomainStatus, RecruitmentApplication, RecruitmentStatus } from "@/types";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';

const BRANCHES = [
    "CSE", "CSE-DS", "CSE-CS", "CSE-AIML",
    "ECE", "EE", "CHE", "AEIE", "ME",
    "IT", "BT", "AE", "FT", "Other",
];

const RECRUITMENT_STATUSES: RecruitmentStatus[] = ["pending", "shortlisted", "accepted", "rejected"];

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

export default function RecruitmentParticipantsPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [title, setTitle] = useState("Loading...");
    const [roleOptions, setRoleOptions] = useState<string[]>([]);
    const [stats, setStats] = useState<{ total: number } | null>(null);
    const [positionStats, setPositionStats] = useState<{ _id: string; count: number }[]>([]);
    const [applications, setApplications] = useState<RecruitmentApplication[]>([]);
    const [loading, setLoading] = useState(true);

    const [branch, setBranch] = useState("");
    const [position, setPosition] = useState("");
    const [overallStatus, setOverallStatus] = useState("");
    const [domainStatusFilter, setDomainStatusFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const [selectedParticipant, setSelectedParticipant] = useState<RecruitmentApplication | null>(null);

    const normalizeDomainStatuses = useCallback((application: RecruitmentApplication): DomainStatus[] => {
        const selectedDomains = application.generalInfo?.positions || [];
        const existingStatuses = application.domainStatuses || [];
        const statusMap = new Map(existingStatuses.map((entry) => [entry.domain, entry]));

        return selectedDomains.map((domain) => {
            const existing = statusMap.get(domain);
            return {
                domain,
                status: existing?.status || "pending",
                updatedAt: existing?.updatedAt,
                updatedBy: existing?.updatedBy,
                remarks: existing?.remarks,
            };
        });
    }, []);

    const getStatusVariant = (status?: string): "pending" | "shortlisted" | "accepted" | "rejected" => {
        if (status === "shortlisted" || status === "accepted" || status === "rejected") return status;
        return "pending";
    };

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

        fetchFormDetails();
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
                status: overallStatus || undefined,
                domainStatus: (position && domainStatusFilter) ? domainStatusFilter : undefined,
                q: searchQuery || undefined,
                includeStats: "true",
            });

            if (appsRes.data?.success && appsRes.data?.data) {
                setApplications(Array.isArray(appsRes.data.data.recruitmentData) ? appsRes.data.data.recruitmentData : []);
                
                // Update position stats dynamically
                if (Array.isArray(appsRes.data.data.positionStats)) {
                    const sortedStats = [...appsRes.data.data.positionStats].sort(
                        (a, b) => b.count - a.count
                    );
                    setPositionStats(sortedStats);
                }

                const pagination = appsRes.data.data.pagination;
                setHasMore(Boolean(pagination?.hasNextPage));
                setStats({ total: Number(pagination?.totalDocuments || 0) });
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    }, [id, page, branch, position, overallStatus, domainStatusFilter, searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchApplications();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [fetchApplications]);

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBranch(e.target.value);
        setPage(1);
    };

    const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPosition(e.target.value);
        if (!e.target.value) {
            setDomainStatusFilter("");
        }
        setPage(1);
    };

    const handleOverallStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setOverallStatus(e.target.value);
        setPage(1);
    };

    const handleDomainStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDomainStatusFilter(e.target.value);
        setPage(1);
    };

    const handleStatusUpdate = (
        participantId: string,
        update: { domain: string; status: RecruitmentStatus; remarks?: string; updatedAt?: string }
    ) => {
        const patchApplication = (app: RecruitmentApplication): RecruitmentApplication => {
            if (app._id !== participantId) return app;

            const existingStatuses = app.domainStatuses || [];
            const otherStatuses = existingStatuses.filter((entry) => entry.domain !== update.domain);
            const nextDomainStatuses: DomainStatus[] = [
                ...otherStatuses,
                {
                    domain: update.domain,
                    status: update.status,
                    remarks: update.remarks,
                    updatedAt: update.updatedAt || new Date().toISOString(),
                },
            ];

            return {
                ...app,
                domainStatuses: nextDomainStatuses,
            };
        };

        if (selectedParticipant && selectedParticipant._id === participantId) {
            setSelectedParticipant((prev) => (prev ? patchApplication(prev) : prev));
        }

        setApplications((prevApps) => prevApps.map((app) => patchApplication(app)));
    };

    const clearFilters = () => {
        setBranch("");
        setPosition("");
        setOverallStatus("");
        setDomainStatusFilter("");
        setSearchQuery("");
        setPage(1);
    };

    const handleExport = async (format: "csv" | "xlsx") => {
        try {
            setLoading(true);
            const toastId = toast.loading(`Preparing ${format.toUpperCase()} export...`);
            
            // Fetch data with current filters but high limit to get all
            const res = await recruitmentApi.getRecruitmentData({
                formId: id,
                limit: 5000, 
                branch: branch || undefined,
                position: position || undefined,
                status: overallStatus || undefined,
                domainStatus: (position && domainStatusFilter) ? domainStatusFilter : undefined,
                q: searchQuery || undefined,
            });

            if (res.data?.success && res.data?.data?.recruitmentData) {
                const allData = res.data.data.recruitmentData;
                
                if (allData.length === 0) {
                    toast.error("No data found to export", { id: toastId });
                    return;
                }

                // Prepare data for XLSX
                const rows = allData.map((app: RecruitmentApplication) => ({
                    "Full Name": app.generalInfo?.fullName || "N/A",
                    "Email": app.generalInfo?.email || "N/A",
                    "Phone": app.generalInfo?.phoneNumber || "N/A",
                    "Roll Number": app.generalInfo?.rollNumber || "N/A",
                    "Branch": app.generalInfo?.branch || "N/A",
                    "Year": app.generalInfo?.branchYear || "N/A",
                    "Positions": (app.generalInfo?.positions || []).join(", "),
                    "Status": app.status || "pending",
                    "Applied Date": app.createdAt ? new Date(app.createdAt).toLocaleString() : "N/A",
                    "LinkedIn": app.finalInfo?.linkedIn || "N/A",
                    "Previous Clubs": app.finalInfo?.previousClubs || "N/A"
                }));

                const worksheet = XLSX.utils.json_to_sheet(rows);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
                
                const filename = `recruitment-${title.replace(/[\s/]+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}`;

                if (format === "csv") {
                    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.body.appendChild(document.createElement("a"));
                    link.href = url;
                    link.download = `${filename}.csv`;
                    link.click();
                    link.remove();
                } else {
                    XLSX.writeFile(workbook, `${filename}.xlsx`);
                }
                
                toast.success(`Exported ${allData.length} records as ${format.toUpperCase()}`, { id: toastId });
            } else {
                toast.error("Failed to fetch data for export", { id: toastId });
            }
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("An error occurred during export");
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter((application) => {
        if (overallStatus && (application.status || "pending") !== overallStatus) {
            return false;
        }

        if (position && !(application.generalInfo?.positions || []).includes(position)) {
            return false;
        }

        if (position && domainStatusFilter) {
            const normalized = normalizeDomainStatuses(application);
            const selectedDomainStatus = normalized.find((entry) => entry.domain === position)?.status || "pending";
            if (selectedDomainStatus !== domainStatusFilter) {
                return false;
            }
        }

        return true;
    });

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                        <Users size={14} />
                        Recruitment Data
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-100 tracking-tight">{title}</h1>
                    <p className="text-xs text-zinc-500 mt-1 font-mono uppercase">ID: {id}</p>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all gap-2 disabled:opacity-50 border border-emerald-400/20"
                            >
                                <Download size={18} />
                                Export Data
                                <ChevronDown size={14} className="opacity-60" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-[#18181B] border-zinc-800">
                            <DropdownMenuItem 
                                onClick={() => handleExport("csv")}
                                className="cursor-pointer gap-2 text-zinc-300 hover:bg-zinc-800"
                            >
                                <FileText size={16} />
                                Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleExport("xlsx")}
                                className="cursor-pointer gap-2 text-zinc-300 hover:bg-zinc-800"
                            >
                                <FileSpreadsheet size={16} />
                                Export as Excel
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link
                        href={`/admin/recruitment/${id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-700 border border-zinc-700 shadow-sm"
                    >
                        <Edit size={16} />
                        Edit Form
                    </Link>
                </div>
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
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, roll #..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            />
                        </div>

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

                        <div className="relative">
                            <select
                                value={overallStatus}
                                onChange={handleOverallStatusChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 min-w-[160px]"
                            >
                                <option value="">Overall Status</option>
                                {RECRUITMENT_STATUSES.map((statusOption) => (
                                    <option key={statusOption} value={statusOption}>{statusOption}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <select
                                value={domainStatusFilter}
                                onChange={handleDomainStatusFilterChange}
                                disabled={!position}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 min-w-[170px] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Domain Status</option>
                                {RECRUITMENT_STATUSES.map((statusOption) => (
                                    <option key={statusOption} value={statusOption}>{statusOption}</option>
                                ))}
                            </select>
                        </div>

                        {(branch || position || overallStatus || domainStatusFilter || searchQuery) && (
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
                        ) : filteredApplications.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredApplications.map((application) => (
                                    <div
                                        key={application._id}
                                        onClick={() => setSelectedParticipant(application)}
                                        className="p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-indigo-400 transition-all cursor-pointer group"
                                    >
                                        {/* Header with Name and Status */}
                                        <div className="flex items-start justify-between mb-3 gap-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                                                    {application.generalInfo?.fullName || "N/A"}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    {application.generalInfo?.rollNumber || "N/A"}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={getStatusVariant(application.status)}
                                                className="capitalize text-xs"
                                            >
                                                {application.status || "pending"}
                                            </Badge>
                                        </div>

                                        {/* Branch and Year */}
                                        <div className="mb-3 pb-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {application.generalInfo?.branch || "N/A"}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {application.generalInfo?.branchYear || "-"} Yr
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
                                            <div className="text-sm">
                                                <p className="text-gray-500 text-xs uppercase tracking-wide">Email</p>
                                                <p className="text-gray-700 truncate">{application.generalInfo?.email || "N/A"}</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-gray-500 text-xs uppercase tracking-wide">Phone</p>
                                                <p className="text-gray-700">{application.generalInfo?.phoneNumber || "N/A"}</p>
                                            </div>
                                        </div>

                                        {/* Positions */}
                                        {application.generalInfo?.positions && application.generalInfo.positions.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                                    Positions
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {application.generalInfo.positions.slice(0, 3).map((positionName) => (
                                                        <Badge key={positionName} variant="default" className="text-xs">
                                                            {positionName}
                                                        </Badge>
                                                    ))}
                                                    {application.generalInfo.positions.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{application.generalInfo.positions.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-3 border-t border-gray-100 pt-3">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                                Domain Statuses
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {normalizeDomainStatuses(application).length > 0 ? (
                                                    normalizeDomainStatuses(application).map((entry) => (
                                                        <Badge
                                                            key={`${application._id}-${entry.domain}`}
                                                            variant={getStatusVariant(entry.status)}
                                                            className="text-[10px]"
                                                            title={entry.updatedAt ? `Last updated: ${new Date(entry.updatedAt).toLocaleString()}` : "No updates yet"}
                                                        >
                                                            {entry.domain}: {entry.status}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <Badge variant="pending" className="text-[10px]">No domain selected</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Applied Date */}
                                        <div className="pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                                Applied: {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "-"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
