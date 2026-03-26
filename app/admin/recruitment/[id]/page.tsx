"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import axios from "axios";
import { recruitmentApi } from "@/services/api";
import { DEFAULT_ROLES_DATA } from "@/constants/recruitmentDefaults";
import BasicDetails from "@/components/admin/recruitment/create/BasicDetails";
import DefaultRolesSelector from "@/components/admin/recruitment/create/DefaultRolesSelector";
import RolesList, { Role } from "@/components/admin/recruitment/create/RolesList";

export default function EditRecruitmentForm() {
    const router = useRouter();
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: "",
        generalInstructions: "",
        isActive: false,
    });
    const [roles, setRoles] = useState<Role[]>([]);

    const applyFormState = useCallback((form: {
        title?: string;
        generalInstructions?: string;
        isActive?: boolean;
        roles?: Role[];
    }) => {
        setFormData({
            title: form.title ?? "",
            generalInstructions: form.generalInstructions ?? "",
            isActive: Boolean(form.isActive),
        });
        setRoles(Array.isArray(form.roles) ? form.roles : []);
    }, []);

    const fetchFormData = useCallback(async () => {
        if (!id) {
            toast.error("Invalid form id");
            router.push("/admin/recruitment");
            return;
        }

        try {
            const res = await recruitmentApi.getFormById(id);
            const form = res.data?.form;

            if (!form) {
                toast.error("Form not found");
                router.push("/admin/recruitment");
                return;
            }

            applyFormState(form);
        } catch (error) {
            // Backward compatibility if API doesn't support GET /forms/:id.
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                try {
                    const allFormsRes = await recruitmentApi.getAllForms();
                    const forms = Array.isArray(allFormsRes.data?.forms) ? allFormsRes.data.forms : [];
                    const fallbackForm = forms.find((form: { _id?: string }) => form._id === id);

                    if (fallbackForm) {
                        applyFormState(fallbackForm);
                        return;
                    }

                    toast.error("Form not found");
                    router.push("/admin/recruitment");
                    return;
                } catch (fallbackError) {
                    console.error("Error fetching forms fallback:", fallbackError);
                    toast.error("Failed to load recruitment form");
                    router.push("/admin/recruitment");
                    return;
                }
            }

            console.error("Error fetching form:", error);
            toast.error("Failed to load recruitment form");
            router.push("/admin/recruitment");
        } finally {
            setDataLoading(false);
        }
    }, [applyFormState, id, router]);

    useEffect(() => {
        fetchFormData();
    }, [fetchFormData]);

    const isDefaultRoleSelected = (roleName: string) => {
        return roles.some((role) => role.roleName === roleName);
    };

    const toggleDefaultRole = (roleName: string) => {
        if (isDefaultRoleSelected(roleName)) {
            setRoles(roles.filter((role) => role.roleName !== roleName));
            return;
        }

        const roleToAdd = DEFAULT_ROLES_DATA.find((role) => role.roleName === roleName);
        if (roleToAdd) {
            setRoles([...roles, JSON.parse(JSON.stringify(roleToAdd))]);
        }
    };

    const addRole = () => {
        setRoles([...roles, { roleName: "", description: "", fields: [] }]);
    };

    const removeRole = (index: number) => {
        const nextRoles = [...roles];
        nextRoles.splice(index, 1);
        setRoles(nextRoles);
    };

    const updateRole = (index: number, key: string, value: string) => {
        const nextRoles = [...roles];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (nextRoles[index] as any)[key] = value;
        setRoles(nextRoles);
    };

    const addField = (roleIndex: number) => {
        const nextRoles = [...roles];
        nextRoles[roleIndex].fields.push({
            name: "",
            label: "",
            type: "text",
            required: false,
            placeholder: "",
        });
        setRoles(nextRoles);
    };

    const removeField = (roleIndex: number, fieldIndex: number) => {
        const nextRoles = [...roles];
        nextRoles[roleIndex].fields.splice(fieldIndex, 1);
        setRoles(nextRoles);
    };

    const updateField = (
        roleIndex: number,
        fieldIndex: number,
        key: string,
        value: string | boolean | string[]
    ) => {
        const nextRoles = [...roles];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (nextRoles[roleIndex].fields[fieldIndex] as any)[key] = value;

        if (key === "label") {
            nextRoles[roleIndex].fields[fieldIndex].name = (value as string)
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
        }

        setRoles(nextRoles);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) {
            toast.error("Invalid form id");
            return;
        }

        setLoading(true);
        try {
            await recruitmentApi.updateForm(id, {
                ...formData,
                roles,
            });
            toast.success("Recruitment form updated successfully");
            router.push("/admin/recruitment");
        } catch (error) {
            console.error("Error updating form:", error);
            toast.error("Failed to update form");
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return <div className="p-10 text-center">Loading form data...</div>;
    }

    return (
        <div className="mx-auto max-w-4xl p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold text-gray-200">
                    Edit Recruitment Form
                    {formData.isActive && (
                        <span className="ml-3 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Active
                        </span>
                    )}
                </h1>

                {id && (
                    <Link
                        href={`/admin/recruitment/${id}/participants`}
                        className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                        View Registered Participants
                    </Link>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <BasicDetails formData={formData} setFormData={setFormData} />

                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl font-bold text-black">Roles & Questions</h2>
                        <button
                            type="button"
                            onClick={addRole}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                        >
                            + Add Custom Role
                        </button>
                    </div>

                    <DefaultRolesSelector
                        isDefaultRoleSelected={isDefaultRoleSelected}
                        toggleDefaultRole={toggleDefaultRole}
                    />

                    <RolesList
                        roles={roles}
                        updateRole={updateRole}
                        removeRole={removeRole}
                        addField={addField}
                        removeField={removeField}
                        updateField={updateField}
                    />
                </div>

                <div className="flex justify-end gap-3 border-t pt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
