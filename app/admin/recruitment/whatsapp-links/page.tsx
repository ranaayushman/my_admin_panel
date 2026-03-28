"use client";

import { useEffect, useState, useCallback } from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { RecruitmentForm } from "@/types";
import { recruitmentApi } from "@/services/api";
import PageHeader from "@/components/admin/PageHeader";
import RecruitmentFormsList from "@/components/admin/recruitment/RecruitmentFormsList";
import WhatsAppLinksManager from "@/components/admin/recruitment/WhatsAppLinksManager";
import { MessageCircle } from "lucide-react";

interface ApiErrorResponse {
  message?: string;
}

export default function WhatsAppLinksPage() {
  const [forms, setForms] = useState<RecruitmentForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isManagerLoading, setIsManagerLoading] = useState(false);

  const selectedForm = forms.find((f) => f._id === selectedFormId) || null;

  // Load all forms
  const loadForms = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await recruitmentApi.getAllForms();
      setForms(response.data.forms || []);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || axiosError.message;
      toast.error(message || "Failed to load recruitment forms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load form details when selected
  const loadFormDetails = useCallback(async (formId: string) => {
    setIsManagerLoading(true);
    try {
      const response = await recruitmentApi.getFormById(formId);
      // Update the form in the list with fresh data
      setForms((prevForms) =>
        prevForms.map((f) => (f._id === formId ? response.data.form : f))
      );
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || axiosError.message;
      toast.error(message || "Failed to load form details");
    } finally {
      setIsManagerLoading(false);
    }
  }, []);

  // Load forms on mount
  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Auto-select first form when forms are loaded
  useEffect(() => {
    if (forms.length > 0 && !selectedFormId) {
      setSelectedFormId(forms[0]._id);
    }
  }, [forms, selectedFormId]);

  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId);
    loadFormDetails(formId);
  };

  const handleRefresh = () => {
    if (selectedFormId) {
      loadFormDetails(selectedFormId);
    } else {
      loadForms();
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title="WhatsApp Group Links Management"
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex gap-3">
          <MessageCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-100">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="text-xs space-y-0.5 text-blue-100/80 list-disc list-inside">
              <li>Select a recruitment form</li>
              <li>Add WhatsApp group links for each role</li>
              <li>Users applying will automatically receive these links when they submit</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forms List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-white mb-4">
              Recruitment Forms
            </h2>
            <RecruitmentFormsList
              forms={forms}
              selectedFormId={selectedFormId}
              onSelectForm={handleFormSelect}
              isLoading={isLoading}
            />
          </div>

          {/* Manager */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4">
              Manage Links
            </h2>
            <WhatsAppLinksManager
              form={selectedForm}
              isLoading={isManagerLoading}
              onRefresh={() => selectedFormId && loadFormDetails(selectedFormId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
