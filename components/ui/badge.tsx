import * as React from "react"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "accepted" | "rejected" | "pending" | "shortlisted"
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:
      "border-transparent bg-indigo-100 text-indigo-800",
    secondary:
      "border-transparent bg-gray-100 text-gray-200",
    destructive:
      "border-transparent bg-red-100 text-red-800",
    outline: "text-gray-900",
    accepted: "border-transparent bg-green-100 text-green-800",
    rejected: "border-transparent bg-red-100 text-red-800",
    pending: "border-transparent bg-yellow-100 text-yellow-800",
    shortlisted: "border-transparent bg-blue-100 text-blue-800",
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 ${
        variants[variant] || variants["default"]
      } ${className}`}
      {...props}
    />
  )
}

export { Badge }
