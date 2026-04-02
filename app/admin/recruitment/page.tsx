"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { recruitmentApi } from "@/services/api";
import toast from "react-hot-toast";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { 
    Users, 
    Edit, 
    Trash2, 
    Calendar, 
    CheckCircle2, 
    XCircle,
    ArrowRight,
    Clock,
    Briefcase,
    FileText as FileTextIcon,
    ArrowUpRight
} from "lucide-react";

interface RecruitmentForm {
    _id: string;
    title: string;
    isActive: boolean;
    updatedAt?: string;
    createdAt: string;
    applicantCount?: number;
    roles?: { roleName: string }[];
    generalInstructions?: string;
}

export default function RecruitmentDashboard() {
    const router = useRouter();
    const [forms, setForms] = useState<RecruitmentForm[]>([]);
    const [globalStats, setGlobalStats] = useState({ totalApplications: 0, activeForms: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; formId: string | null; formTitle: string }>({ isOpen: false, formId: null, formTitle: "" });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [formsRes, statsRes] = await Promise.all([
                recruitmentApi.getAllForms(),
                recruitmentApi.getStats()
            ]);
            
            const formsData = formsRes.data.forms || [];
            setForms(formsData);

            if (statsRes.data?.success) {
                setGlobalStats({
                    totalApplications: statsRes.data.stats.totalApplications || 0,
                    activeForms: formsData.filter((f: RecruitmentForm) => f.isActive).length
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load recruitment data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData().then(() => {
            toast.success("Recruitment forms refreshed");
        });
    };

    const handleDelete = async (id: string, title: string) => {
        setDeleteDialog({ isOpen: true, formId: id, formTitle: title });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.formId) return;
        try {
            await recruitmentApi.deleteForm(deleteDialog.formId);
            setForms((prev) => prev.filter((f) => f._id !== deleteDialog.formId));
            toast.success("Form deleted successfully");
        } catch (error) {
            console.error("Error deleting form:", error);
            toast.error("Failed to delete form");
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        const nextStatus = !currentStatus;
        // Optimistic update
        setForms((prev) =>
            prev.map((f) => (f._id === id ? { ...f, isActive: nextStatus } : f))
        );
        try {
            await recruitmentApi.updateForm(id, { isActive: nextStatus });
            toast.success(`Form ${nextStatus ? "activated" : "deactivated"}`);
        } catch (error) {
            console.error("Error toggling form status:", error);
            // Rollback
            setForms((prev) =>
                prev.map((f) => (f._id === id ? { ...f, isActive: currentStatus } : f))
            );
            toast.error("Failed to toggle form status");
        }
    };

    // Filter forms based on search and status
    const filteredForms = forms.filter((form) => {
        const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === "active") {
            return matchesSearch && form.isActive;
        }
        if (statusFilter === "inactive") {
            return matchesSearch && !form.isActive;
        }
        return matchesSearch;
    });
 
    // Stats
    const totalForms = forms.length;
    const activeForms = forms.filter((f) => f.isActive).length;
    const inactiveForms = forms.filter((f) => !f.isActive).length;

    const stats = [
        { key: "forms", label: "Forms", value: forms.length },
        { key: "active", label: "Active Forms", value: forms.filter((f) => f.isActive).length },
        { key: "registrations", label: "Total Registrations", value: globalStats.totalApplications },
    ];

    const filters = [
        { key: "all", label: "All" },
        { key: "active", label: "Active" },
        { key: "inactive", label: "Inactive" },
    ];

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <PageHeader
                    title="Recruitment"
                    stats={stats}
                    addButtonLabel="Create Form"
                    addButtonHref="/admin/recruitment/create"
                    onRefresh={handleRefresh}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search forms..."
                    filters={filters}
                    activeFilter={statusFilter}
                    onFilterChange={(key) => setStatusFilter(key as "all" | "active" | "inactive")}
                />
                
                {/* WhatsApp Links Management Button */}
                <button
                    onClick={() => router.push("/admin/recruitment/whatsapp-links")}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                    title="Manage WhatsApp group links for recruitment roles"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.759.975-.929 1.175-.168.198-.339.223-.637.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-2.753 1.663-4.538 4.571-4.538 7.6 0 1.213.21 2.398.603 3.519l-1.32 4.82c-.36 1.211.902 2.3 1.996 1.972l4.687-1.522c1.062.472 2.219.742 3.4.742 5.517 0 10-4.483 10-10S17.32 2.75 11.802 2.75c-5.517 0-10 4.483-10 10"></path>
                    </svg>
                    WhatsApp Links
                </button>
            </div>

            {/* Forms List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="grid gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-lg bg-[#18181B] p-6 shadow-sm border border-zinc-900"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="h-5 w-48 rounded bg-zinc-800" />
                                        <div className="h-4 w-32 rounded bg-zinc-800" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-20 rounded bg-zinc-800" />
                                        <div className="h-8 w-20 rounded bg-zinc-800" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredForms.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-zinc-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-white">
                                No forms found
                            </h3>
                            <p className="mt-1 text-sm text-zinc-400">
                                {searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "Get started by creating a new recruitment form"}
                            </p>
                            <button
                                onClick={() => router.push("/admin/recruitment/create")}
                                className="mt-4 inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600"
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
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
                                Create Form
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {filteredForms.map((form) => (
                            <div
                                key={form._id}
                                onClick={() => router.push(`/admin/recruitment/${form._id}/participants`)}
                                className="group relative flex flex-col justify-between cursor-pointer rounded-[24px] bg-[#121214] p-6 shadow-2xl transition-all hover:shadow-indigo-500/20 border border-zinc-800/80 hover:border-indigo-500/60"
                            >
                                {/* Activity Background Gradient */}
                                <div className={`absolute -right-20 -top-20 h-48 w-48 rounded-full blur-[100px] transition-opacity duration-700 ${
                                    form.isActive ? "bg-green-500/10 opacity-70 group-hover:opacity-100" : "bg-zinc-500/5 opacity-30"
                                }`} />

                                <div className="relative space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2.5 w-2.5 rounded-full ${form.isActive ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-zinc-600"}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${form.isActive ? "text-green-400" : "text-zinc-500"}`}>
                                                    {form.isActive ? "Recruitment Live" : "Draft Mode"}
                                                </span>
                                            </div>
                                            <h3 className="mt-2 text-2xl font-black text-white leading-tight tracking-tight group-hover:text-indigo-400 transition-colors">
                                                {form.title}
                                            </h3>
                                        </div>
                                        <div className="flex -space-x-2">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-xl">
                                                <ArrowUpRight size={18} className="text-indigo-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800/50 group-hover:bg-zinc-800/50 transition-all flex flex-col items-center justify-center text-center">
                                            <Users size={20} className="text-indigo-500 mb-2" />
                                            <span className="text-xl font-black text-white">{form.applicantCount || 0}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Total Registrations</span>
                                        </div>
                                        <div className="rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800/50 group-hover:bg-zinc-800/50 transition-all flex flex-col items-center justify-center text-center">
                                            <Briefcase size={20} className="text-purple-500 mb-2" />
                                            <span className="text-xl font-black text-white">{Array.isArray(form.roles) ? form.roles.length : 0}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Available Domains</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 rounded-lg bg-zinc-900/80 px-3 py-1.5 text-[11px] font-medium text-zinc-400 border border-zinc-800/50">
                                            <Clock size={12} />
                                            Created {new Date(form.createdAt).toLocaleDateString()}
                                        </div>
                                        {form.generalInstructions && (
                                            <div className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/20">
                                                <FileTextIcon size={12} />
                                                Doc Set
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="relative mt-8 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/admin/recruitment/${form._id}`);
                                                }}
                                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
                                                title="Edit Controls"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-tighter">Edit</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1.5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleActive(form._id, form.isActive);
                                                }}
                                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all active:scale-95 border border-zinc-700/50"
                                                title={form.isActive ? "Pause Form" : "Resume Form"}
                                            >
                                                <CheckCircle2 size={18} className={form.isActive ? "text-green-500" : ""} />
                                            </button>
                                            <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-tighter">{form.isActive ? "Live" : "Pause"}</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1.5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(form._id, form.title);
                                                }}
                                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-zinc-700/50"
                                                title="Permanently Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-tighter">Delete</span>
                                        </div>
                                    </div>

                                    <div 
                                        className="hidden sm:flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest group-hover:gap-3 transition-all"
                                    >
                                        Open View
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, formId: null, formTitle: "" })}
                onConfirm={confirmDelete}
                message={`Are you sure you want to delete "${deleteDialog.formTitle}"? This action cannot be undone.`}
            />
        </div>
    );
}
