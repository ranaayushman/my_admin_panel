import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function EventCardSkeleton() {
    return (
        <div className="group relative overflow-hidden rounded-xl bg-[#18181B] border border-zinc-900 shadow-md">
            {/* Banner Skeleton */}
            <Skeleton className="h-52 w-full rounded-none" />

            {/* Content Skeleton */}
            <div className="p-5">
                {/* Title */}
                <Skeleton className="mb-2 h-7 w-3/4" />

                {/* Description */}
                <div className="mb-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>

                {/* Meta Info */}
                <div className="space-y-3">
                    {/* Date */}
                    <div className="flex items-start gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-col gap-2">
                    {/* Primary Buttons */}
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-1/2 rounded-md" />
                        <Skeleton className="h-9 w-1/2 rounded-md" />
                    </div>

                    {/* Secondary Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        <Skeleton className="h-9 rounded-md" />
                        <Skeleton className="h-9 rounded-md" />
                        <Skeleton className="h-9 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}
