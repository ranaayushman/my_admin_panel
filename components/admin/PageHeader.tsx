"use client";

import { useRouter } from "next/navigation";

interface StatItem {
    key: string;
    label: string;
    value: number | string;
}

interface PageHeaderProps {
    title: string;
    stats?: StatItem[];
    addButtonLabel?: string;
    addButtonHref?: string;
    onRefresh?: () => void;
    isLoading?: boolean;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    searchPlaceholder?: string;
    filters?: { key: string; label: string }[];
    activeFilter?: string;
    onFilterChange?: (key: string) => void;
}

export default function PageHeader({
    title,
    stats = [],
    addButtonLabel,
    addButtonHref,
    onRefresh,
    isLoading = false,
    searchQuery = "",
    onSearchChange,
    searchPlaceholder = "Search...",
    filters = [],
    activeFilter = "all",
    onFilterChange,
}: PageHeaderProps) {
    const router = useRouter();

    return (
        <div className="mb-6 flex flex-col space-y-4">
            {/* Row 1: Title, Stats, Refresh, Add Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <h1 className="text-2xl font-semibold text-white">{title}</h1>

                    {stats.length > 0 && (
                        <div className="ml-4 flex items-center space-x-3 text-sm">
                            {stats.map((stat) => (
                                <span
                                    key={stat.key}
                                    className="text-sm shadow-md text-white border border-zinc-900 p-1 px-2 rounded-full bg-[#18181B]"
                                >
                                    {stat.label}: {stat.value}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {onRefresh && (
                        <button
                            aria-label="Refresh"
                            onClick={onRefresh}
                            className="flex items-center justify-center rounded-full bg-blue-500 px-3 py-1 text-sm text-white shadow-sm hover:bg-[#141417] border border-zinc-900"
                            disabled={isLoading}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-6 w-6 ${isLoading ? "animate-spin" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                    )}

                    {addButtonLabel && addButtonHref && (
                        <button
                            onClick={() => router.push(addButtonHref)}
                            className="flex items-center rounded-full bg-blue-500 px-8 py-2.5 text-[16px] text-white shadow-sm hover:bg-blue-600"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-1 h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            {addButtonLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Row 2: Filters + Search */}
            {(filters.length > 0 || onSearchChange) && (
                <div className="flex justify-between gap-2 border border-zinc-900 px-2 bg-[#18181B] py-2 rounded-full shadow-md">
                    {filters.length > 0 && onFilterChange && (
                        <div className="flex gap-2">
                            {filters.map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => onFilterChange(filter.key)}
                                    className={`rounded-full text-white px-3 py-1 text-sm capitalize ${activeFilter === filter.key
                                        ? "bg-blue-500 text-white font-medium"
                                        : "bg-[#141417] text-white hover:bg-zinc-800"
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {onSearchChange && (
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="rounded-full bg-[#141417] text-white shadow-sm px-4 py-2 border border-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-500"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
