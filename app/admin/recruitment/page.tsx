"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { recruitmentApi } from "@/services/api";
import StatsOverview from "@/components/admin/recruitment/StatsOverview";
import FormsTable from "@/components/admin/recruitment/FormsTable";

interface RecruitmentStats {
    totalApplications?: number;
    activeForms?: number;
    inactiveForms?: number;
    lastUpdated?: string;
    [key: string]: unknown; // Allow other props
}

interface RecruitmentForm {
    _id: string;
    title: string;
    isActive: boolean;
    updatedAt?: string;
    createdAt: string;
    [key: string]: unknown;
}

export default function RecruitmentDashboard() {
    const [stats, setStats] = useState<RecruitmentStats | null>(null);
    const [forms, setForms] = useState<RecruitmentForm[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, formsRes] = await Promise.all([
                recruitmentApi.getStats(),
                recruitmentApi.getAllForms(),
            ]);
            setStats(statsRes.data.stats);
            setForms(formsRes.data.forms);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this form?")) return;
        await recruitmentApi.deleteForm(id);
        fetchData();
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        await recruitmentApi.updateForm(id, { isActive: !currentStatus });
        fetchData();
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading dashboard…</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* ---------- Header ---------- */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Recruitment Management
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage recruitment forms and track applications
                    </p>
                </div>

                <Link
                    href="/admin/recruitment/create"
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                >
                    + Create New Form
                </Link>
            </div>

            {/* ---------- Stats ---------- */}
            <StatsOverview stats={{
                ...stats,
                activeForms: forms.filter((f) => f.isActive).length,
                inactiveForms: forms.filter((f) => !f.isActive).length,
                lastUpdated: forms.length > 0
                    ? new Date(Math.max(...forms.map((f) => new Date(f.updatedAt || f.createdAt).getTime()))).toLocaleDateString()
                    : "—"
            }} />

            {/* ---------- Forms Table ---------- */}
            <FormsTable
                forms={forms}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
            />
        </div>
    );
}
