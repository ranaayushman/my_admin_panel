"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { recruitmentApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
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
  CardHeader,
  CardTitle as CardTitleComponent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DomainStatus, RecruitmentApplication, RecruitmentStatus } from "@/types";

interface ParticipantDetailsModalProps {
  isOpen: boolean;
  participant: RecruitmentApplication | null;
  onClose: () => void;
  onStatusUpdate?: (
    participantId: string,
    update: { domain: string; status: RecruitmentStatus; remarks?: string; updatedAt?: string }
  ) => void;
}

const RECRUITMENT_STATUSES: RecruitmentStatus[] = ["pending", "shortlisted", "accepted", "rejected"];

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

const getStatusVariant = (status?: string): "accepted" | "rejected" | "pending" | "shortlisted" => {
  if (status === "accepted" || status === "rejected" || status === "shortlisted") return status;
  return "pending";
};

export default function ParticipantDetailsModal({
  isOpen,
  participant,
  onClose,
  onStatusUpdate,
}: ParticipantDetailsModalProps) {
  const { user } = useAuth();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<RecruitmentStatus>("pending");
  const [remarks, setRemarks] = useState("");
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const selectedDomains = useMemo(() => participant?.generalInfo?.positions || [], [participant]);
  const isDomainLead = user?.role === "domain_lead";
  const assignedDomains = useMemo(() => user?.assignedDomains || [], [user]);

  const permittedDomains = useMemo(() => {
    if (!isDomainLead) return selectedDomains;
    return selectedDomains.filter((domain) => assignedDomains.includes(domain));
  }, [isDomainLead, selectedDomains, assignedDomains]);

  const normalizedDomainStatuses = useMemo<DomainStatus[]>(() => {
    if (!participant) return [];

    const existingStatuses = participant.domainStatuses || [];
    const statusMap = new Map(existingStatuses.map((entry) => [entry.domain, entry]));

    return selectedDomains.map((domain) => {
      const existing = statusMap.get(domain);
      return {
        domain,
        status: existing?.status || "pending",
        updatedBy: existing?.updatedBy,
        updatedAt: existing?.updatedAt,
        remarks: existing?.remarks,
      };
    });
  }, [participant, selectedDomains]);

  const domainStatusMap = useMemo(() => {
    return new Map(normalizedDomainStatuses.map((entry) => [entry.domain, entry]));
  }, [normalizedDomainStatuses]);

  useEffect(() => {
    if (!participant || !isOpen) return;

    const defaultDomain = permittedDomains[0] || "";
    const currentDomainStatus = defaultDomain ? domainStatusMap.get(defaultDomain) : undefined;

    setSelectedDomain(defaultDomain);
    setSelectedStatus(currentDomainStatus?.status || "pending");
    setRemarks(currentDomainStatus?.remarks || "");
    setUpdateMessage(null);
  }, [participant, isOpen, permittedDomains, domainStatusMap]);

  if (!isOpen || !participant) return null;

  const { generalInfo, finalInfo, roleSpecific, status, createdAt } = participant;

  const onDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    const currentDomainStatus = domainStatusMap.get(domain);
    setSelectedStatus(currentDomainStatus?.status || "pending");
    setRemarks(currentDomainStatus?.remarks || "");
    setUpdateMessage(null);
  };

  const handleDomainStatusUpdate = async () => {
    if (isUpdatingStatus) return;

    if (!selectedDomain) {
      toast.error("Select a domain before updating status.");
      return;
    }

    if (!RECRUITMENT_STATUSES.includes(selectedStatus)) {
      toast.error("Select a valid status.");
      return;
    }

    if (!selectedDomains.includes(selectedDomain)) {
      toast.error("Selected domain is not part of this candidate's application.");
      return;
    }

    if (isDomainLead && !assignedDomains.includes(selectedDomain)) {
      toast.error("You are not authorized to update this domain.");
      return;
    }

    setIsUpdatingStatus(true);
    setUpdateMessage(null);

    try {
      const response = await recruitmentApi.updateApplicationStatus(participant._id, {
        domain: selectedDomain,
        status: selectedStatus,
        remarks: remarks.trim() || undefined,
      });

      const responseData = response.data as { data?: { updatedAt?: string } };
      const updatedAt = responseData?.data?.updatedAt || new Date().toISOString();

      onStatusUpdate?.(participant._id, {
        domain: selectedDomain,
        status: selectedStatus,
        remarks: remarks.trim() || undefined,
        updatedAt,
      });

      setUpdateMessage({
        type: "success",
        text: `Updated ${selectedDomain} to ${selectedStatus}.`,
      });
      toast.success("Domain status updated successfully.");
    } catch (error: unknown) {
      const apiMessage =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string } | undefined)?.message
          : undefined;

      const fallback = "Failed to update domain status. Please try again.";
      const message = apiMessage || fallback;
      if (message.toLowerCase().includes("domain") && message.toLowerCase().includes("required")) {
        toast.error("Domain specification is required. Select a domain and try again.");
      } else if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("forbidden")) {
        toast.error("You are not authorized to update this domain.");
      } else {
        toast.error(message);
      }

      setUpdateMessage({ type: "error", text: message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const disableUpdate =
    isUpdatingStatus ||
    !selectedDomain ||
    !selectedStatus ||
    !selectedDomains.includes(selectedDomain) ||
    (isDomainLead && !assignedDomains.includes(selectedDomain));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader className="border-b pb-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  {generalInfo?.fullName || "Participant Details"}
                </DialogTitle>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">Overall Status:</label>
                  <Badge variant={getStatusVariant(status)} className="capitalize">
                    {status || "pending"}
                  </Badge>
                </div>
              </div>
            </div>
            {updateMessage && (
              <p
                className={`text-sm ${
                  updateMessage.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {updateMessage.text}
              </p>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitleComponent className="text-lg">Domain Evaluation</CardTitleComponent>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-600">
                  Selected Domains
                </p>
                <div className="flex flex-wrap gap-2">
                  {normalizedDomainStatuses.length > 0 ? (
                    normalizedDomainStatuses.map((entry) => (
                      <Badge
                        key={entry.domain}
                        variant={getStatusVariant(entry.status)}
                        className="capitalize"
                        title={entry.updatedAt ? `Last updated: ${new Date(entry.updatedAt).toLocaleString()}` : "No updates yet"}
                      >
                        {entry.domain}: {entry.status}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="pending">No domains found</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
                    Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => onDomainChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select a domain</option>
                    {selectedDomains.map((domain) => (
                      <option
                        key={domain}
                        value={domain}
                        disabled={isDomainLead && !assignedDomains.includes(domain)}
                      >
                        {domain}
                        {isDomainLead && !assignedDomains.includes(domain) ? " (Not allowed)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as RecruitmentStatus)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm capitalize text-gray-900 focus:border-indigo-500 focus:outline-none"
                  >
                    {RECRUITMENT_STATUSES.map((statusOption) => (
                      <option key={statusOption} value={statusOption} className="capitalize">
                        {statusOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
                  Remarks (optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add domain-specific evaluation notes"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleDomainStatusUpdate}
                  disabled={disableUpdate}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Domain Status
                </button>
              </div>

              {isDomainLead && permittedDomains.length === 0 && (
                <p className="text-sm text-red-600">
                  No permitted domains available for your role on this application.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitleComponent className="text-lg">General Information</CardTitleComponent>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Full Name</p>
                  <p className="mt-1 font-medium text-gray-900">{generalInfo?.fullName || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Email</p>
                  <p className="mt-1 font-medium text-gray-900">{generalInfo?.email || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Phone Number</p>
                  <p className="mt-1 font-medium text-gray-900">{generalInfo?.phoneNumber || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Roll Number</p>
                  <p className="mt-1 font-mono font-medium text-gray-900">{generalInfo?.rollNumber || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Branch</p>
                  <p className="mt-1 font-medium text-gray-900">{generalInfo?.branch || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Year</p>
                  <p className="mt-1 font-medium text-gray-900">{generalInfo?.branchYear || "N/A"}</p>
                </div>
              </div>

              {generalInfo?.positions && generalInfo.positions.length > 0 && (
                <div className="border-t pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-600">Positions Applied</p>
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

          {finalInfo && Object.keys(finalInfo).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitleComponent className="text-lg">Final Information</CardTitleComponent>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {finalInfo.linkedIn && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">LinkedIn</p>
                      {isValidUrl(finalInfo.linkedIn) ? (
                        <a
                          href={finalInfo.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          View Profile
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <p className="mt-1 font-medium text-gray-900">{finalInfo.linkedIn}</p>
                      )}
                    </div>
                  )}

                  {finalInfo.previousClubs && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Previous Clubs</p>
                      <p className="mt-1 font-medium text-gray-900">{finalInfo.previousClubs}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {roleSpecific && Object.keys(roleSpecific).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitleComponent className="text-lg">Role-Specific Details</CardTitleComponent>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(roleSpecific).map(([role, details]) => (
                  <Card key={role} className="bg-gray-50">
                    <CardHeader className="pb-3">
                      <CardTitleComponent className="text-sm text-indigo-600">{role}</CardTitleComponent>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {Object.entries(details).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            {typeof value === "string" && isValidUrl(value) ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 flex items-center gap-1 break-all font-medium text-indigo-600 hover:text-indigo-700"
                              >
                                {value.substring(0, 40)}...
                                <ExternalLink size={14} />
                              </a>
                            ) : (
                              <p className="mt-1 break-words font-medium text-gray-900">{String(value) || "N/A"}</p>
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

          <Card>
            <CardHeader>
              <CardTitleComponent className="text-lg">Metadata</CardTitleComponent>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Applied On</p>
                  <p className="mt-1 font-medium text-gray-900">
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
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Participant ID</p>
                  <p className="mt-1 font-mono text-xs font-medium text-gray-900">{participant._id}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Current Status</p>
                  <Badge variant={getStatusVariant(status)} className="mt-1 capitalize">
                    {status || "pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-900 transition hover:bg-gray-300"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
