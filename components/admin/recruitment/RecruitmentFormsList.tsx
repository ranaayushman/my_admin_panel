"use client";

import { useMemo } from "react";
import { RecruitmentForm } from "@/types";
import { Calendar, Users, CheckCircle2, Circle } from "lucide-react";

interface RecruitmentFormsListProps {
  forms: RecruitmentForm[];
  selectedFormId?: string;
  onSelectForm: (formId: string) => void;
  isLoading?: boolean;
}

export default function RecruitmentFormsList({
  forms,
  selectedFormId,
  onSelectForm,
  isLoading = false,
}: RecruitmentFormsListProps) {
  const sortedForms = useMemo(() => {
    return [...forms].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [forms]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-[#27272A] rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No recruitment forms found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {sortedForms.map((form) => (
        <button
          key={form._id}
          onClick={() => onSelectForm(form._id)}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selectedFormId === form._id
              ? "border-blue-500 bg-blue-500/10"
              : "border-zinc-800 bg-[#18181B] hover:border-zinc-700"
          }`}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-white line-clamp-2">
                {form.title}
              </h3>
              <div
                className={`flex-shrink-0 ${
                  form.isActive ? "text-green-500" : "text-gray-500"
                }`}
              >
                {form.isActive ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Description */}
            {form.description && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {form.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1 text-gray-400">
                <Users className="w-4 h-4" />
                <span>{form.roles.length} role{form.roles.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{new Date(form.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* WhatsApp Links Count */}
            <div className="pt-2 border-t border-zinc-800">
              <p className="text-xs text-gray-500">
                {form.roles.filter((r) => r.whatsappLink).length} of{" "}
                {form.roles.length} roles with WhatsApp links
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
