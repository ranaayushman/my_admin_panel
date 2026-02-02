"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { recruitmentApi } from "@/services/api";
import toast from "react-hot-toast";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface RecruitmentForm {
    _id: string;
    title: string;
    isActive: boolean;
    updatedAt?: string;
    createdAt: string;
    [key: string]: unknown;
}

export default function RecruitmentDashboard() {
    const router = useRouter();
    const [forms, setForms] = useState<RecruitmentForm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; formId: string | null; formTitle: string }>({ isOpen: false, formId: null, formTitle: "" });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const formsRes = await recruitmentApi.getAllForms();
            setForms(formsRes.data.forms || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load recruitment forms");
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
        { key: "total", label: "Total", value: totalForms },
        { key: "active", label: "Active", value: activeForms },
        { key: "inactive", label: "Inactive", value: inactiveForms },
    ];

    const filters = [
        { key: "all", label: "All" },
        { key: "active", label: "Active" },
        { key: "inactive", label: "Inactive" },
    ];

    return (
        <div className="container mx-auto px-4 py-6">
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
                    <div className="grid gap-4">
                        {filteredForms.map((form) => (
                            <div
                                key={form._id}
                                onClick={() => router.push(`/admin/recruitment/${form._id}`)}
                                className="group cursor-pointer rounded-lg bg-[#18181B] p-6 shadow-sm transition-all hover:shadow-md border border-zinc-900 hover:border-zinc-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400">
                                                {form.title}
                                            </h3>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${form.isActive
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-zinc-700 text-zinc-300"
                                                    }`}
                                            >
                                                {form.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            Created:{" "}
                                            {new Date(form.createdAt).toLocaleDateString()}
                                            {form.updatedAt && (
                                                <span className="ml-2">
                                                    • Updated:{" "}
                                                    {new Date(form.updatedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {/* Toggle Switch */}
                                        <button
                                            onClick={() => handleToggleActive(form._id, form.isActive)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isActive
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-zinc-600 hover:bg-zinc-500"
                                                }`}
                                            title="Toggle Status"
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${form.isActive ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>

                                        {/* Edit */}
                                        <button
                                            onClick={() => router.push(`/admin/recruitment/${form._id}/edit`)}
                                            className="rounded-md bg-blue-500/20 px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-500/30"
                                        >
                                            Edit
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(form._id, form.title)}
                                            className="rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/30"
                                        >
                                            Delete
                                        </button>
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
