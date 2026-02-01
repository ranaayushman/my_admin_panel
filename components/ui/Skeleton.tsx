import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string; // Standard HTML div props include className
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 ${className || ""}`}
            {...props}
        />
    );
}
