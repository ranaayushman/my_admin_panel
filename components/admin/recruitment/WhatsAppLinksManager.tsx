"use client";

import { useState } from "react";
import { RecruitmentForm, IRoleDefinition } from "@/types";
import { Link, Plus, Edit2, ExternalLink } from "lucide-react";
import WhatsAppLinkModal from "./WhatsAppLinkModal";

interface WhatsAppLinksManagerProps {
  form: RecruitmentForm | null;
  isLoading?: boolean;
  onRefresh: () => void;
}

export default function WhatsAppLinksManager({
  form,
  isLoading = false,
  onRefresh,
}: WhatsAppLinksManagerProps) {
  const [selectedRole, setSelectedRole] = useState<IRoleDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditRole = (role: IRoleDefinition) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Select a recruitment form to manage WhatsApp links</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Form Info */}
      <div className="bg-[#18181B] rounded-lg border border-zinc-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">{form.title}</h2>
        {form.description && (
          <p className="text-sm text-gray-400 mb-4">{form.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-400">Status: </span>
            <span
              className={`font-medium ${
                form.isActive ? "text-green-400" : "text-gray-400"
              }`}
            >
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Roles: </span>
            <span className="font-medium text-white">{form.roles.length}</span>
          </div>
          <div>
            <span className="text-gray-400">With WhatsApp Links: </span>
            <span className="font-medium text-white">
              {form.roles.filter((r) => r.whatsappLink).length}
            </span>
          </div>
        </div>
      </div>

      {/* Roles List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Manage Role Links</h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-[#27272A] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : form.roles.length === 0 ? (
          <div className="text-center py-10 bg-[#18181B] rounded-lg border border-zinc-800">
            <p className="text-gray-400">No roles found in this form</p>
          </div>
        ) : (
          <div className="space-y-3">
            {form.roles.map((role) => (
              <div
                key={role._id || role.roleName}
                className="bg-[#18181B] rounded-lg border border-zinc-800 p-4 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white">{role.roleName}</h4>
                    {role.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {role.description}
                      </p>
                    )}

                    {/* Link Status */}
                    <div className="mt-3 flex items-start gap-2">
                      {role.whatsappLink ? (
                        <>
                          <Link className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-500 font-medium">
                              Link configured
                            </p>
                            <a
                              href={role.whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-400 truncate flex items-center gap-1 mt-1"
                            >
                              Preview
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
                          <p className="text-xs text-gray-500">No link configured yet</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditRole(role)}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                  >
                    {role.whatsappLink ? (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <WhatsAppLinkModal
        isOpen={isModalOpen}
        role={selectedRole}
        formId={form._id}
        onClose={handleCloseModal}
        onSuccess={onRefresh}
      />
    </div>
  );
}
