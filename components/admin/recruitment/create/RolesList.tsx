import React, { useState } from "react";

export interface Role {
    roleName: string;
    description: string;
    fields: Field[];
}

export interface Field {
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder: string;
    options?: string[];
}

interface RolesListProps {
    roles: Role[];
    updateRole: (index: number, key: string, value: string) => void;
    removeRole: (index: number) => void;
    addField: (roleIndex: number) => void;
    removeField: (roleIndex: number, fieldIndex: number) => void;
    updateField: (roleIndex: number, fieldIndex: number, key: string, value: string | boolean | string[]) => void;
}

function RoleCard({
    role,
    rIndex,
    updateRole,
    removeRole,
    addField,
    removeField,
    updateField,
}: {
    role: Role;
    rIndex: number;
    updateRole: (index: number, key: string, value: string) => void;
    removeRole: (index: number) => void;
    addField: (roleIndex: number) => void;
    removeField: (roleIndex: number, fieldIndex: number) => void;
    updateField: (roleIndex: number, fieldIndex: number, key: string, value: string | boolean | string[]) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative rounded-lg bg-[#18181B] shadow-lg border border-zinc-900 hover:border-blue-500/50 transition-all duration-200">
            {/* Header / Summary Row */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#141417] to-[#18181B] border-b border-zinc-900">
                <div className="flex-1 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                        aria-label={isExpanded ? "Collapse role details" : "Expand role details"}
                    >
                        {isExpanded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-900/20 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <input
                                    required
                                    className="w-full text-lg font-semibold bg-transparent border-none p-0 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                                    value={role.roleName}
                                    onChange={(e) => updateRole(rIndex, "roleName", e.target.value)}
                                    placeholder="Role Name (e.g. Web Developer)"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {role.description && (
                                    <p className="text-sm text-zinc-400 mt-1 truncate">{role.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.fields.length > 0 ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800 text-white'}`}>
                        {role.fields.length} {role.fields.length === 1 ? 'field' : 'fields'}
                    </span>
                    <button
                        type="button"
                        onClick={() => removeRole(rIndex)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove Role"
                        aria-label="Remove role"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Description
                        </label>
                        <input
                            className="w-full rounded-lg border border-zinc-700 bg-[#141417] px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 transition-shadow"
                            value={role.description}
                            onChange={(e) => updateRole(rIndex, "description", e.target.value)}
                            placeholder="Describe the responsibilities and requirements for this role..."
                        />
                    </div>

                    {/* Fields Section */}
                    <div className="border-l-3 border-blue-900/50 pl-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Questions & Fields
                                </h3>
                                <p className="text-sm text-zinc-400 mt-1">Define the information you need from applicants</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => addField(rIndex)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Field
                            </button>
                        </div>

                        {role.fields.length === 0 ? (
                            <div className="text-center py-8 px-4 border-2 border-dashed border-zinc-900 rounded-xl bg-[#141417]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-zinc-400 mt-2">No questions added yet</p>
                                <p className="text-sm text-zinc-500 mt-1">Add fields to collect specific information from applicants</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {role.fields.map((field, fIndex) => (
                                    <div
                                        key={fIndex}
                                        className="group bg-[#141417] border border-zinc-900 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-sm transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-lg group-hover:bg-blue-900/30 transition-colors">
                                                <span className="text-xs font-semibold text-white group-hover:text-blue-400">
                                                    {fIndex + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                                                            Field Label *
                                                        </label>
                                                        <input
                                                            placeholder="e.g. Years of Experience"
                                                            className="w-full rounded-lg border border-zinc-700 bg-[#18181B] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                            value={field.label}
                                                            onChange={(e) => updateField(rIndex, fIndex, "label", e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                                                            Field Type
                                                        </label>
                                                        <select
                                                            className="w-full rounded-lg border border-zinc-700 bg-[#18181B] px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                            value={field.type}
                                                            onChange={(e) => updateField(rIndex, fIndex, "type", e.target.value)}
                                                        >
                                                            <option value="text">Short Text</option>
                                                            <option value="textarea">Long Text</option>
                                                            <option value="number">Number</option>
                                                            <option value="email">Email</option>
                                                            <option value="url">URL</option>
                                                            <option value="date">Date</option>
                                                            <option value="file">File Upload</option>
                                                            <option value="select">Dropdown</option>
                                                        </select>
                                                    </div>

                                                    {field.type === 'select' && (
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium text-zinc-400 mb-1">
                                                                Options (comma separated)
                                                            </label>
                                                            <input
                                                                placeholder="Option 1, Option 2, Option 3"
                                                                className="w-full rounded-lg border border-zinc-700 bg-[#18181B] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                                value={field.options?.join(', ') || ''}
                                                                onChange={(e) => updateField(rIndex, fIndex, "options", e.target.value.split(','))}
                                                                required={field.required}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                                                            Placeholder Text
                                                        </label>
                                                        <input
                                                            placeholder="Hint text for applicants"
                                                            className="w-full rounded-lg border border-zinc-700 bg-[#18181B] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                            value={field.placeholder}
                                                            onChange={(e) => updateField(rIndex, fIndex, "placeholder", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <label className="block text-xs font-medium text-zinc-400 mb-1">
                                                                Validation
                                                            </label>
                                                            <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#141417] rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.required}
                                                                    onChange={(e) => updateField(rIndex, fIndex, "required", e.target.checked)}
                                                                    className="rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm font-medium text-white">Required field</span>
                                                            </label>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeField(rIndex, fIndex)}
                                                            className="mt-6 p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Remove Field"
                                                            aria-label="Remove field"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RolesList({
    roles,
    updateRole,
    removeRole,
    addField,
    removeField,
    updateField
}: RolesListProps) {
    return (
        <div className="space-y-6">
            {roles.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-900 rounded-2xl bg-[#141417]/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-white">No roles added yet</h3>
                    <p className="mt-1 text-zinc-400">Start by adding your first role above</p>
                </div>
            ) : (
                roles.map((role, rIndex) => (
                    <RoleCard
                        key={rIndex}
                        role={role}
                        rIndex={rIndex}
                        updateRole={updateRole}
                        removeRole={removeRole}
                        addField={addField}
                        removeField={removeField}
                        updateField={updateField}
                    />
                ))
            )}
        </div>
    );
}
