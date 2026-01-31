"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { recruitmentApi } from "@/services/api";
import { DEFAULT_ROLES_DATA } from "@/constants/recruitmentDefaults";
import BasicDetails from "@/components/admin/recruitment/create/BasicDetails";
import DefaultRolesSelector from "@/components/admin/recruitment/create/DefaultRolesSelector";
import RolesList from "@/components/admin/recruitment/create/RolesList";

export default function EditRecruitmentForm() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        generalInstructions: "",
        isActive: false,
    });

    const [roles, setRoles] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            fetchFormData();
        }
    }, [id]);

    const fetchFormData = async () => {
        try {
            // Fetch all forms and find current (no single get endpoint yet)
            const res = await recruitmentApi.getAllForms();
            const form = res.data.forms.find((f: any) => f._id === id);

            if (form) {
                setFormData({
                    title: form.title,
                    generalInstructions: form.generalInstructions || "",
                    isActive: form.isActive
                });
                setRoles(form.roles || []);
            } else {
                alert("Form not found");
                router.push("/admin/recruitment");
            }
        } catch (error) {
            console.error("Error fetching form:", error);
        } finally {
            setDataLoading(false);
        }
    };

    // --- Helpers (Same as Create) ---
    const isDefaultRoleSelected = (roleName: string) => {
        return roles.some((r) => r.roleName === roleName);
    };

    const toggleDefaultRole = (roleName: string) => {
        if (isDefaultRoleSelected(roleName)) {
            setRoles(roles.filter((r) => r.roleName !== roleName));
        } else {
            const roleToAdd = DEFAULT_ROLES_DATA.find((r) => r.roleName === roleName);
            if (roleToAdd) {
                setRoles([...roles, JSON.parse(JSON.stringify(roleToAdd))]);
            }
        }
    };

    const addRole = () =>
        setRoles([...roles, { roleName: "", description: "", fields: [] }]);

    const removeRole = (index: number) => {
        const copy = [...roles];
        copy.splice(index, 1);
        setRoles(copy);
    };

    const updateRole = (index: number, key: string, value: string) => {
        const copy = [...roles];
        copy[index][key] = value;
        setRoles(copy);
    };

    const addField = (roleIndex: number) => {
        const copy = [...roles];
        copy[roleIndex].fields.push({
            name: "",
            label: "",
            type: "text",
            required: false,
            placeholder: "",
        });
        setRoles(copy);
    };

    const removeField = (roleIndex: number, fieldIndex: number) => {
        const copy = [...roles];
        copy[roleIndex].fields.splice(fieldIndex, 1);
        setRoles(copy);
    };

    const updateField = (
        roleIndex: number,
        fieldIndex: number,
        key: string,
        value: any
    ) => {
        const copy = [...roles];
        copy[roleIndex].fields[fieldIndex][key] = value;

        if (key === "label") {
            copy[roleIndex].fields[fieldIndex].name = value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
        }

        setRoles(copy);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await recruitmentApi.updateForm(id as string, {
                ...formData,
                roles,
            });
            router.push("/admin/recruitment");
        } catch (err) {
            console.error(err);
            alert("Failed to update form");
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) return <div className="p-10 text-center">Loading form data...</div>;

    return (
        <div className="mx-auto max-w-4xl p-6">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">
                Edit Recruitment Form
                {formData.isActive && (
                    <span className="ml-3 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                    </span>
                )}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">

                <BasicDetails
                    formData={formData}
                    setFormData={setFormData}
                />

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

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
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
