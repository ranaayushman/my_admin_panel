"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface Form {
    _id: string;
    title: string;
    isActive: boolean;
    createdAt: string;
}

interface FormsTableProps {
    forms: Form[];
    onToggleActive: (id: string, currentStatus: boolean) => void;
    onDelete: (id: string) => void;
}

export default function FormsTable({ forms, onToggleActive, onDelete }: FormsTableProps) {
    const router = useRouter();

    const handleRowClick = (id: string) => {
        router.push(`/admin/recruitment/${id}`);
    };

    return (
        <div className="rounded-xl bg-white shadow">
            <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">
                    Recruitment Forms
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Created</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {forms.map((form) => (
                            <tr
                                key={form._id}
                                className="transition hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleRowClick(form._id)}
                            >
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <span className="hover:text-indigo-600 hover:underline">
                                        {form.title}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <StatusBadge active={form.isActive} />
                                </td>

                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(form.createdAt).toLocaleDateString()}
                                </td>

                                <td className="px-6 py-4 text-right space-x-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/admin/recruitment/edit/${form._id}`);
                                        }}
                                        className="font-medium text-blue-600 hover:text-blue-800 px-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleActive(form._id, form.isActive);
                                        }}
                                        className={`font-medium px-2 ${form.isActive
                                            ? "text-amber-600 hover:text-amber-800"
                                            : "text-green-600 hover:text-green-800"
                                            }`}
                                    >
                                        {form.isActive ? "Deactivate" : "Activate"}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(form._id);
                                        }}
                                        className="font-medium text-red-600 hover:text-red-800 px-2"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {forms.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-6 py-10 text-center text-gray-500"
                                >
                                    No recruitment forms yet. Create your first one 🚀
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
                }`}
        >
            {active ? "Active" : "Inactive"}
        </span>
    );
}
