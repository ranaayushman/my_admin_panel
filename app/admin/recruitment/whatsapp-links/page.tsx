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

  const loadFormDetails = useCallback(async (formId: string) => {
    setIsManagerLoading(true);
    try {
      const response = await recruitmentApi.getFormById(formId);
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

  useEffect(() => {
    loadForms();
  }, [loadForms]);

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
    <div className="min-h-screen bg-gradient-to-br from-[#09090B] via-[#0f0f13] to-[#121218] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              WhatsApp Links Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage group links for each recruitment form
            </p>
          </div>

          <PageHeader
            title=""
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </div>

        {/* INFO BANNER */}
        <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 backdrop-blur">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>

          <div>
            <p className="font-medium text-blue-200 mb-1">
              How it works
            </p>
            <ul className="text-xs text-blue-100/80 space-y-1 list-disc list-inside">
              <li>Select a recruitment form</li>
              <li>Add WhatsApp group links for each role</li>
              <li>Links are automatically shared after submission</li>
            </ul>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT CARD */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur hover:border-white/20 transition">
              <h2 className="text-lg font-semibold mb-4">
                Recruitment Forms
              </h2>

              <RecruitmentFormsList
                forms={forms}
                selectedFormId={selectedFormId}
                onSelectForm={handleFormSelect}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur hover:border-white/20 transition">
              <h2 className="text-lg font-semibold mb-4">
                Manage Links
              </h2>

              <WhatsAppLinksManager
                form={selectedForm}
                isLoading={isManagerLoading}
                onRefresh={() =>
                  selectedFormId && loadFormDetails(selectedFormId)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}