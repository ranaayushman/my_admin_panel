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
        <div className="rounded-xl border border-zinc-800/50 bg-[#0d0d0f] p-3 shadow-2xl backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Pre-defined Roles
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">Select roles to add them to your recruitment form</p>
                </div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {DEFAULT_ROLES_DATA.map((defaultRole) => {
                    const isSelected = isDefaultRoleSelected(defaultRole.roleName);
                    return (
                        <label
                            key={defaultRole.roleName}
                            className={`group relative flex cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border p-2 transition-all duration-300 ${isSelected
                                ? "border-indigo-500/50 bg-indigo-500/10 ring-1 ring-indigo-500/20"
                                : "border-zinc-800 bg-[#121214] hover:border-zinc-700 hover:bg-[#16161a]"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className={`text-[12px] font-semibold transition-colors duration-300 ${isSelected ? "text-indigo-400" : "text-zinc-300 group-hover:text-white"
                                        }`}
                                >
                                    {defaultRole.roleName}
                                </span>
                                <div
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${isSelected
                                        ? "border-indigo-500 bg-indigo-500"
                                        : "border-zinc-700 bg-transparent group-hover:border-zinc-500"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isSelected}
                                        onChange={() => toggleDefaultRole(defaultRole.roleName)}
                                    />
                                    {isSelected && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-white">
                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            
                            {/* Decorative background element when selected */}
                            {isSelected && (
                                <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-indigo-500/10 blur-xl"></div>
                            )}
                        </label>
                    );
                })}
            </div>
        </div>

    );
}
