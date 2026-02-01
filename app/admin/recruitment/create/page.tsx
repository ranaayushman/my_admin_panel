"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { recruitmentApi } from "@/services/api";
import { DEFAULT_ROLES_DATA } from "@/constants/recruitmentDefaults";
import BasicDetails from "@/components/admin/recruitment/create/BasicDetails";
import DefaultRolesSelector from "@/components/admin/recruitment/create/DefaultRolesSelector";
import RolesList, { Role } from "@/components/admin/recruitment/create/RolesList";
import FormActions from "@/components/admin/recruitment/create/FormActions";

export default function CreateRecruitmentForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        generalInstructions: "",
        isActive: false,
    });

    const [roles, setRoles] = useState<Role[]>([]);

    // --- Helpers ---

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (copy[index] as any)[key] = value;
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
        value: string | boolean | string[]
    ) => {
        const copy = [...roles];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (copy[roleIndex].fields[fieldIndex] as any)[key] = value;

        if (key === "label") {
            copy[roleIndex].fields[fieldIndex].name = (value as string)
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
            await recruitmentApi.createForm({
                ...formData,
                roles,
            });
            toast.success("Recruitment form created successfully");
            router.push("/admin/recruitment");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create form");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            <h1 className="mb-6 text-3xl font-bold text-white">
                Create Recruitment Form
                {formData.isActive && (
                    <span className="ml-3 rounded-full bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-400 border border-green-800">
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
                        <h2 className="text-2xl font-bold text-white">Roles & Questions</h2>
                        <button
                            type="button"
                            onClick={addRole}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-600 transition-colors"
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

                <FormActions loading={loading} />

            </form>
        </div>
    );
}
