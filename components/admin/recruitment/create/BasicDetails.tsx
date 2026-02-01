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
                <p className="text-sm font-medium text-gray-900">{label}</p>
                {hint && <p className="text-xs text-gray-500">{hint}</p>}
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? "bg-indigo-600" : "bg-gray-300"
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
        <div className="rounded-lg bg-white p-6 shadow text-black space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Basic Details</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Form Title
                </label>
                <input
                    required
                    className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.title}
                    onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Winter 2025 Recruitment"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Instructions
                </label>
                <textarea
                    rows={3}
                    className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
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
