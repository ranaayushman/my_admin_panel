import React from "react";
import { useRouter } from "next/navigation";

interface FormActionsProps {
    loading: boolean;
}

export default function FormActions({ loading }: FormActionsProps) {
    const router = useRouter();

    return (
        <div className="fixed bottom-0 right-0 w-full bg-[#18181B]/90 backdrop-blur-sm p-4 shadow-lg border-t border-zinc-900 md:w-auto md:relative md:bg-transparent md:border-none md:shadow-none md:p-0">
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-lg border border-zinc-700 bg-[#141417] px-6 py-2 text-white hover:bg-zinc-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-500 px-8 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                    {loading ? "Creating..." : "Create Form"}
                </button>
            </div>
        </div>
    );
}
