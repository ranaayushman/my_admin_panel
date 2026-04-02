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
        <div className="group relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/40 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-indigo-500/30">
            {/* Header / Summary Row */}
            <div 
                className={`flex flex-col sm:flex-row items-center  sm:items-center gap-2  p-3 sm:p-3 transition-colors duration-300 ${
                    isExpanded ? "bg-indigo-500/5 border-b border-zinc-800/50" : "bg-transparent"
                }`}
            >
                <div className="flex-1 flex items-center gap-4 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-xl  transition-all duration-300 ${
                            isExpanded ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                        }`}
                        aria-label={isExpanded ? "Collapse role details" : "Expand role details"}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <div className={`hidden sm:flex flex-shrink-0 w-8 h-8 items-center justify-center rounded-lg border ${
                                isExpanded ? "border-indigo-500/50 bg-indigo-500/10" : "border-zinc-800 bg-zinc-950"
                            }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isExpanded ? "text-indigo-400" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <input
                                    required
                                    className="w-full text-lg font-bold bg-transparent rounded-lg border p-0 text-white placeholder-zinc-600 focus:outline-none focus:ring-0"
                                    value={role.roleName}
                                    onChange={(e) => updateRole(rIndex, "roleName", e.target.value)}
                                    placeholder="Role Name (e.g. Web Developer)"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {role.description && (
                                    <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px] sm:max-w-md">{role.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                    <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border shadow-sm ${
                        role.fields.length > 0 
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                            : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                    }`}>
                        {role.fields.length} {role.fields.length === 1 ? 'Field' : 'Fields'}
                    </div>
                    <button
                        type="button"
                        onClick={() => removeRole(rIndex)}
                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
                        title="Remove Role"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Description Column */}
                        <div className="lg:col-span-4 space-y-4">
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                    <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] text-zinc-500">1</span>
                                    Role Description
                                </h4>
                                <textarea
                                    className="w-full min-h-[120px] rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-inner"
                                    value={role.description}
                                    onChange={(e) => updateRole(rIndex, "description", e.target.value)}
                                    placeholder="Briefly describe the responsibilities..."
                                />
                            </div>
                            
                            <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-4">
                                <h5 className="text-xs font-bold text-indigo-300 mb-2 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Quick Tip
                                </h5>
                                <p className="text-[11px] text-zinc-500 leading-relaxed">
                                    Adding clear descriptions helps applicants understand if they&apos;re a good fit for the role.
                                </p>
                            </div>
                        </div>

                        {/* Fields Column */}
                        <div className="lg:col-span-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-zinc-800/50">
                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                        <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] text-zinc-500">2</span>
                                        Custom Questions
                                    </h4>
                                    <p className="text-[11px] text-zinc-600 mt-1 uppercase tracking-wider font-bold">Applicant fields for this role</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addField(rIndex)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Field
                                </button>
                            </div>

                            {role.fields.length === 0 ? (
                                <div className="text-center py-10 rounded-2xl border-2 border-dashed border-zinc-800/50 bg-zinc-950/50">
                                    <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                    <h5 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">No Questions yet</h5>
                                    <p className="text-[10px] text-zinc-700 mt-1 uppercase font-bold">Start adding fields to collect info</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {role.fields.map((field, fIndex) => (
                                        <div
                                            key={fIndex}
                                            className="group/field relative bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/5"
                                        >
                                            <div className="flex flex-col sm:flex-row items-start gap-5">
                                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 text-zinc-500 text-[10px] font-bold border border-zinc-800">
                                                    {fIndex + 1}
                                                </div>
                                                <div className="flex-1 w-full space-y-5">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                                                                Question Label
                                                            </label>
                                                            <input
                                                                placeholder="e.g. Portfolio URL"
                                                                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:border-indigo-500/50 focus:ring-0 transition-all shadow-sm"
                                                                value={field.label}
                                                                onChange={(e) => updateField(rIndex, fIndex, "label", e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                                                                Response Type
                                                            </label>
                                                            <select
                                                                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white focus:border-indigo-500/50 focus:ring-0 transition-all shadow-sm appearance-none cursor-pointer"
                                                                value={field.type}
                                                                onChange={(e) => updateField(rIndex, fIndex, "type", e.target.value)}
                                                            >
                                                                <option value="text">Short Answer</option>
                                                                <option value="textarea">Paragraph</option>
                                                                <option value="number">Numeric Value</option>
                                                                <option value="email">Email address</option>
                                                                <option value="url">Link / URL</option>
                                                                <option value="date">Specific Date</option>
                                                                <option value="file">File Attachment</option>
                                                                <option value="select">Selection Dropdown</option>
                                                            </select>
                                                        </div>

                                                        {field.type === 'select' && (
                                                            <div className="sm:col-span-2 space-y-1.5">
                                                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                                                                    Options (Comma Separated)
                                                                </label>
                                                                <input
                                                                    placeholder="Yes, No, Maybe"
                                                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:border-indigo-500/50 focus:ring-0 transition-all shadow-sm"
                                                                    value={field.options?.join(', ') || ''}
                                                                    onChange={(e) => updateField(rIndex, fIndex, "options", e.target.value.split(','))}
                                                                    required={field.required}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-2">
                                                        <div className="flex-1 w-full space-y-1.5">
                                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                                                                Helper Text / Placeholder
                                                            </label>
                                                            <input
                                                                placeholder="e.g. Include https://"
                                                                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:border-indigo-500/50 focus:ring-0 transition-all shadow-sm"
                                                                value={field.placeholder}
                                                                onChange={(e) => updateField(rIndex, fIndex, "placeholder", e.target.value)}
                                                            />
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                                            <label className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.required}
                                                                    onChange={(e) => updateField(rIndex, fIndex, "required", e.target.checked)}
                                                                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-indigo-500 focus:ring-0 focus:ring-offset-0"
                                                                />
                                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Required</span>
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeField(rIndex, fIndex)}
                                                                className="p-2 sm:p-2.5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                                title="Remove Field"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {roles.length === 0 ? (
                <div className="text-center py-24 rounded-3xl border-2 border-dashed border-zinc-800/50 bg-[#0a0a0c] overflow-hidden relative">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full -top-24 -right-24 h-48 w-48 opacity-20"></div>
                    <div className="absolute inset-0 bg-rose-500/5 blur-3xl rounded-full -bottom-24 -left-24 h-48 w-48 opacity-20"></div>
                    
                    <div className="relative">
                        <div className="mx-auto w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-6 border border-zinc-800 shadow-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">No hiring roles defined</h3>
                        <p className="mt-2 text-sm text-zinc-500 font-medium tracking-wide">Add your first role using the options above to get started</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {roles.map((role, rIndex) => (
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
                    ))}
                </div>
            )}
        </div>
    );
}
