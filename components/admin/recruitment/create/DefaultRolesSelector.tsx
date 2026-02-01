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
        <div className="rounded-lg border border-zinc-900 bg-[#0b0b0c] p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                Pre-defined Roles (Check to Add)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {DEFAULT_ROLES_DATA.map((defaultRole) => {
                    const isSelected = isDefaultRoleSelected(defaultRole.roleName);
                    return (
                        <label
                            key={defaultRole.roleName}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${isSelected
                                ? "border-blue-500 bg-blue-500/20"
                                : "border-zinc-700 hover:bg-[#141417]"
                                }`}
                        >
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded-full border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
                                checked={isSelected}
                                onChange={() => toggleDefaultRole(defaultRole.roleName)}
                            />
                            <span
                                className={`text-sm font-medium ${isSelected ? "text-blue-300" : "text-white"
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
