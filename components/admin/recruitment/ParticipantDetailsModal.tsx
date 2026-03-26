"use client";

import { ExternalLink, Loader2, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { recruitmentApi } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle as CardTitleComponent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {generalInfo?.fullName || "Participant Details"}
              </DialogTitle>
              {updateMessage && (
                <p
                  className={`text-sm mt-2 ${
                    updateMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {updateMessage.text}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Status:</label>
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
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("pending")}
                    disabled={isUpdatingStatus}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span>Pending</span>
                    {selectedStatus === "pending" && <Check className="w-4 h-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("accepted")}
                    disabled={isUpdatingStatus}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span>Accepted</span>
                    {selectedStatus === "accepted" && <Check className="w-4 h-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("rejected")}
                    disabled={isUpdatingStatus}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span>Rejected</span>
                    {selectedStatus === "rejected" && <Check className="w-4 h-4 ml-2" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* General Information Card */}
          <Card>
            <CardHeader>
              <CardTitleComponent className="text-lg">General Information</CardTitleComponent>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="pt-4 border-t">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                    Positions Applied
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {generalInfo.positions.map((position) => (
                      <Badge key={position} variant="default">
                        {position}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Final Information Card */}
          {finalInfo && Object.keys(finalInfo).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitleComponent className="text-lg">Final Information</CardTitleComponent>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Role-Specific Information Card */}
          {roleSpecific && Object.keys(roleSpecific).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitleComponent className="text-lg">Role-Specific Details</CardTitleComponent>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(roleSpecific).map(([role, details]) => (
                  <Card key={role} className="bg-gray-50">
                    <CardHeader className="pb-3">
                      <CardTitleComponent className="text-sm text-indigo-600">
                        {role}
                      </CardTitleComponent>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitleComponent className="text-lg">Metadata</CardTitleComponent>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Current Status
                  </p>
                  <Badge variant={selectedStatus as "accepted" | "rejected" | "pending"} className="mt-1">
                    {selectedStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

}
