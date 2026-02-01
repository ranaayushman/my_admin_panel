import React from "react";
import { useRouter } from "next/navigation";

interface FormActionsProps {
    loading: boolean;
}

export default function FormActions({ loading }: FormActionsProps) {
    const router = useRouter();

    return (
        <div className="fixed bottom-0 right-0 w-full bg-white bg-opacity-90 p-4 shadow-lg border-t md:w-auto md:relative md:bg-transparent md:border-none md:shadow-none md:p-0">
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-indigo-600 px-8 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Form"}
                </button>
            </div>
        </div>
    );
}
