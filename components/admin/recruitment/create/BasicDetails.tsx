import React from "react";

interface BasicDetailsProps {
    formData: {
        title: string;
        generalInstructions: string;
        isActive: boolean;
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        title: string;
        generalInstructions: string;
        isActive: boolean;
    }>>;
}

function ToggleSwitch({
    enabled,
    onChange,
    label,
    hint,
}: {
    enabled: boolean;
    onChange: (val: boolean) => void;
    label: string;
    hint?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-white">{label}</p>
                {hint && <p className="text-xs text-zinc-400">{hint}</p>}
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? "bg-blue-500" : "bg-zinc-700"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>
        </div>
    );
}

export default function BasicDetails({ formData, setFormData }: BasicDetailsProps) {
    const handleToggleActive = (val: boolean) => {
        if (val) {
            const ok = confirm(
                "Activating this form will deactivate all other recruitment forms. Continue?"
            );
            if (!ok) return;
        }
        setFormData({ ...formData, isActive: val });
    };

    return (
        <div className="rounded-lg border border-zinc-900 bg-[#0b0b0c] p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold text-white">Basic Details</h2>

            <div>
                <label className="block text-sm font-medium text-white">
                    Form Title
                </label>
                <input
                    required
                    className="mt-1 w-full rounded border border-zinc-700 bg-[#141417] p-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Winter 2025 Recruitment"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-white">
                    Instructions
                </label>
                <textarea
                    rows={3}
                    className="mt-1 w-full rounded border border-zinc-700 bg-[#141417] p-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={formData.generalInstructions}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            generalInstructions: e.target.value,
                        })
                    }
                />
            </div>

            <ToggleSwitch
                enabled={formData.isActive}
                onChange={handleToggleActive}
                label="Activate this form"
                hint="This will make the form live and deactivate other forms."
            />
        </div>
    );
}
