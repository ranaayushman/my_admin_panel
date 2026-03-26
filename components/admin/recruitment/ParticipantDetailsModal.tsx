"use client";

import { X, ExternalLink, Loader2, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { recruitmentApi } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GeneralInfo {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  rollNumber?: string;
  branch?: string;
  branchYear?: string | number;
  positions?: string[];
}

interface FinalInfo {
  linkedIn?: string;
  previousClubs?: string;
}

interface RoleSpecificData {
  [key: string]: {
    [key: string]: string;
  };
}

interface WhatsAppLinks {
  [key: string]: string;
}

interface ParticipantData {
  _id: string;
  user: string;
  formId: string;
  generalInfo?: GeneralInfo;
  finalInfo?: FinalInfo;
  roleSpecific?: RoleSpecificData;
  whatsappGroupLinks?: WhatsAppLinks;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

interface ParticipantDetailsModalProps {
  isOpen: boolean;
  participant: ParticipantData | null;
  onClose: () => void;
  onStatusUpdate?: (participantId: string, newStatus: string) => void;
}

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export default function ParticipantDetailsModal({
  isOpen,
  participant,
  onClose,
  onStatusUpdate,
}: ParticipantDetailsModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(participant?.status || "pending");
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen || !participant) return null;

  const { generalInfo, finalInfo, roleSpecific, status, createdAt } = participant;

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    setIsUpdatingStatus(true);
    setUpdateMessage(null);

    try {
      await recruitmentApi.updateApplicationStatus(participant._id, newStatus);
      setUpdateMessage({
        type: "success",
        text: `Status updated to ${newStatus}`,
      });
      onStatusUpdate?.(participant._id, newStatus);

      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      console.error("Error updating status:", error);
      setUpdateMessage({
        type: "error",
        text: "Failed to update status. Please try again.",
      });
      setSelectedStatus(status || "pending");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between border-b">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              {generalInfo?.fullName || "Participant Details"}
            </h2>
            {updateMessage && (
              <p
                className={`text-sm mt-2 ${
                  updateMessage.type === "success"
                    ? "text-green-100"
                    : "text-red-100"
                }`}
              >
                {updateMessage.text}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Status:</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={isUpdatingStatus}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition ${
                      selectedStatus === "accepted"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : selectedStatus === "rejected"
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    } ${isUpdatingStatus ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className="capitalize">{selectedStatus}</span>
                    {isUpdatingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-gray-200 text-gray-900">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("pending")}
                    disabled={isUpdatingStatus}
                    className="cursor-pointer flex items-center justify-between px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <span>Pending</span>
                    {selectedStatus === "pending" && <Check className="w-4 h-4 text-gray-700" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("accepted")}
                    disabled={isUpdatingStatus}
                    className="cursor-pointer flex items-center justify-between px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <span>Accepted</span>
                    {selectedStatus === "accepted" && <Check className="w-4 h-4 text-green-600" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("rejected")}
                    disabled={isUpdatingStatus}
                    className="cursor-pointer flex items-center justify-between px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <span>Rejected</span>
                    {selectedStatus === "rejected" && <Check className="w-4 h-4 text-red-600" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Full Name
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {generalInfo?.fullName || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Email
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {generalInfo?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Phone Number
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {generalInfo?.phoneNumber || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Roll Number
                </p>
                <p className="text-gray-900 font-medium mt-1 font-mono">
                  {generalInfo?.rollNumber || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Branch
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {generalInfo?.branch || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Year
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {generalInfo?.branchYear || "N/A"}
                </p>
              </div>
            </div>

            {/* Positions Applied */}
            {generalInfo?.positions && generalInfo.positions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Positions Applied
                </p>
                <div className="flex flex-wrap gap-2">
                  {generalInfo.positions.map((position) => (
                    <span
                      key={position}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200"
                    >
                      {position}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Final Information */}
          {finalInfo && (Object.keys(finalInfo).length > 0) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">
                Final Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finalInfo.linkedIn && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      LinkedIn
                    </p>
                    {isValidUrl(finalInfo.linkedIn) ? (
                      <a
                        href={finalInfo.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 font-medium mt-1 flex items-center gap-1"
                      >
                        View Profile
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <p className="text-gray-900 font-medium mt-1">{finalInfo.linkedIn}</p>
                    )}
                  </div>
                )}

                {finalInfo.previousClubs && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Previous Clubs
                    </p>
                    <p className="text-gray-900 font-medium mt-1">
                      {finalInfo.previousClubs}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role-Specific Information */}
          {roleSpecific && Object.keys(roleSpecific).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">
                Role-Specific Details
              </h3>
              <div className="space-y-6">
                {Object.entries(roleSpecific).map(([role, details]) => (
                  <div
                    key={role}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <h4 className="font-semibold text-gray-900 mb-3 ">
                      {role}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(details).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          {typeof value === "string" && isValidUrl(value) ? (
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-700 font-medium mt-1 flex items-center gap-1 break-all"
                            >
                              {value.substring(0, 40)}...
                              <ExternalLink size={14} />
                            </a>
                          ) : (
                            <p className="text-gray-900 font-medium mt-1 break-words">
                              {String(value) || "N/A"}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status and Metadata */}
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Status
                </p>
                <div className="mt-1">
                  <span
                    className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full capitalize border ${
                      status === "accepted"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : status === "rejected"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-yellow-50 text-yellow-800 border-yellow-200"
                    }`}
                  >
                    {status || "pending"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Applied On
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {new Date(createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Participant ID
                </p>
                <p className="text-gray-900 font-medium mt-1 font-mono text-xs">
                  {participant._id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
