import React from "react";

interface StatsOverviewProps {
    stats: {
        totalApplications?: number;
        activeForms?: number;
        inactiveForms?: number;
        lastUpdated?: string;
    } | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                label="Total Applications"
                value={stats?.totalApplications ?? 0}
            />
            <StatCard
                label="Active Forms"
                value={stats?.activeForms ?? 0}
                accent="green"
            />
            <StatCard
                label="Inactive Forms"
                value={stats?.inactiveForms ?? 0}
                accent="red"
            />
            <StatCard
                label="Last Updated"
                value={stats?.lastUpdated ?? "—"}
                small
            />
        </div>
    );
}

function StatCard({
    label,
    value,
    accent = "indigo",
    small = false,
}: {
    label: string;
    value: any;
    accent?: "indigo" | "green" | "red";
    small?: boolean;
}) {
    const accentMap = {
        indigo: "text-indigo-600",
        green: "text-green-600",
        red: "text-red-600",
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">{label}</p>
            <p
                className={`mt-2 font-bold ${small ? "text-lg" : "text-3xl"
                    } ${accentMap[accent]}`}
            >
                {value}
            </p>
        </div>
    );
}
