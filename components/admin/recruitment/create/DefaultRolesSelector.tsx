import React from "react";
import { DEFAULT_ROLES_DATA } from "@/constants/recruitmentDefaults";

interface DefaultRolesSelectorProps {
    isDefaultRoleSelected: (roleName: string) => boolean;
    toggleDefaultRole: (roleName: string) => void;
}

export default function DefaultRolesSelector({
    isDefaultRoleSelected,
    toggleDefaultRole
}: DefaultRolesSelectorProps) {
    return (
        <div className="rounded-lg bg-white p-6 shadow border">
            <h3 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Pre-defined Roles (Check to Add)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {DEFAULT_ROLES_DATA.map((defaultRole) => {
                    const isSelected = isDefaultRoleSelected(defaultRole.roleName);
                    return (
                        <label
                            key={defaultRole.roleName}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${isSelected
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={isSelected}
                                onChange={() => toggleDefaultRole(defaultRole.roleName)}
                            />
                            <span
                                className={`text-sm font-medium ${isSelected ? "text-indigo-900" : "text-gray-700"
                                    }`}
                            >
                                {defaultRole.roleName}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
