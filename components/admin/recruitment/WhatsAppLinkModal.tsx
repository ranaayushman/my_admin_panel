"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { X, Loader } from "lucide-react";
import { IRoleDefinition } from "@/types";
import { recruitmentApi } from "@/services/api";

const whatsappLinkSchema = z.object({
  whatsappLink: z
    .string()
    .min(1, "WhatsApp link is required")
    .refine(
      (link) =>
        link.includes("whatsapp") || link.includes("chat.whatsapp"),
      "Link must be a valid WhatsApp group link (must contain 'whatsapp' or 'chat.whatsapp')"
    ),
});

type WhatsappLinkFormData = z.infer<typeof whatsappLinkSchema>;

interface WhatsAppLinkModalProps {
  isOpen: boolean;
  role: IRoleDefinition | null;
  formId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WhatsAppLinkModal({
  isOpen,
  role,
  formId,
  onClose,
  onSuccess,
}: WhatsAppLinkModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WhatsappLinkFormData>({
    resolver: zodResolver(whatsappLinkSchema),
    defaultValues: {
      whatsappLink: role?.whatsappLink || "",
    },
  });

  const onSubmit = async (data: WhatsappLinkFormData) => {
    if (!role?.roleName) {
      toast.error("Role name not found");
      return;
    }

    setIsSubmitting(true);
    try {
      await recruitmentApi.updateRoleWhatsappLink(
        formId,
        role.roleName,
        data.whatsappLink
      );

      toast.success("WhatsApp link updated successfully");
      reset();
      onClose();
      onSuccess();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || axiosError.message;
      toast.error(message || "Failed to update WhatsApp link");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#18181B] rounded-lg shadow-2xl border border-zinc-800 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Add WhatsApp Link
            </h2>
            <p className="text-sm text-gray-400 mt-1">{role.roleName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              WhatsApp Group Link
            </label>
            <input
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              className={`w-full px-4 py-2 rounded-lg bg-[#27272A] border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                errors.whatsappLink
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-700 focus:ring-blue-500"
              }`}
              {...register("whatsappLink")}
            />
            {errors.whatsappLink && (
              <p className="mt-1 text-sm text-red-500">
                {errors.whatsappLink.message}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Paste a valid WhatsApp group invitation link.
              <br />
              Example: https://chat.whatsapp.com/xxxxx
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
