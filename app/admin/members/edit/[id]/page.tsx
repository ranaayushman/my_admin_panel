"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { membersApi } from "@/services/api";
import { Member } from "@/types";
import type { SubmitHandler } from "react-hook-form";
import Image from "next/image";
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react";

// Departments aligned with backend values (include EE instead of EEE)
const departments = [
  "CSE",
  "CSE-DS",
  "CSE-AI/ML",
  "IT",
  "ECE",
  "EE",
  "ME",
  "CE",
  "CHE",
  "BCA",
  "MCA",
  // Include both variants to safely handle legacy data and new entries
  "Other",
  "OTHER",
] as const;

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email_id: z.string().email("Valid email is required"),
  department: z.enum(departments, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  batch: z.string().min(1, "Batch is required"),
  bio: z.string().min(1, "Bio is required"),
  github_url: z.string().optional().refine((val) => {
    if (!val || val.trim() === "") return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "Valid GitHub URL is required"),
  linkedin_url: z.string().optional().refine((val) => {
    if (!val || val.trim() === "") return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "Valid LinkedIn URL is required"),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function EditMemberPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const memberId = (routeParams?.id as string) || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  });

  // Fetch member data
  useEffect(() => {
    const fetchMember = async () => {
      setIsLoading(true);
      setError(null);
      try {
  const response = await membersApi.getMemberById(memberId);
        console.log("Fetched member response:", response.data);
        
        if (response.data && response.data.success) {
          const member = response.data.member;
          console.log("Member data:", member);
          setCurrentMember(member);
          
          // Reset form with fetched data
          reset({
            name: member.name || "",
            email_id: member.email_id || "",
            department: member.department || "",
            designation: member.designation || "",
            batch: member.batch || "",
            bio: member.bio || "",
            github_url: member.github_url || "",
            linkedin_url: member.linkedin_url || "",
          });
        } else {
          setError("Failed to fetch member data");
          toast.error("Failed to load member data");
        }
      } catch (err: unknown) {
        console.error("Error fetching member:", err);
        const errorMessage = err instanceof Error && 'response' in err 
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
          : "Failed to fetch member data";
        setError(errorMessage || "Failed to fetch member data");
        toast.error("Failed to load member data");
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      fetchMember();
    }
  }, [memberId, reset]);

  // New image selection and drag/drop handlers
  const handleFileSelected = (file: File | null | undefined) => {
    if (!file) {
      setProfileImage(null);
      setNewPreview(null);
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setNewPreview(reader.result as string);
    reader.readAsDataURL(file);
    setProfileImage(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelected(e.target.files?.[0] || null);
  };

  const handleRemoveNewImage = useCallback(() => {
    const input = document.getElementById("profile_image") as HTMLInputElement | null;
    if (input) input.value = "";
    setProfileImage(null);
    setNewPreview(null);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelected(file || null);
  };

  const onSubmit: SubmitHandler<MemberFormData> = async (data: MemberFormData) => {
    setIsSubmitting(true);
    try {
      // Convert profile image to base64 if present
      let base64Image = "";
      if (profileImage) {
        base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(profileImage);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      }

      // Prepare the request body as JSON - send all fields
      type UpdateMemberPayload = {
        name: string;
        email_id: string;
        department: string;
        designation: string;
        batch: string;
        bio: string;
        github_url: string;
        linkedin_url: string;
        profile_image?: string;
      };
      const updateData: UpdateMemberPayload = {
        name: data.name,
        email_id: data.email_id,
        department: data.department,
        designation: data.designation,
        batch: data.batch,
        bio: data.bio,
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
      };

      // Add profile image only if uploaded
      if (base64Image) {
        updateData.profile_image = base64Image;
      }

      console.log("Sending update request with data:", {
        memberId: memberId,
        data: {
          ...updateData,
          profile_image: base64Image ? `base64 string (length: ${base64Image.length})` : "no image"
        }
      });

      const response = await membersApi.updateMember(memberId, updateData);
      
      console.log("Update response:", response.data);
      
      if (response.data && response.data.success) {
        toast.success("Member updated successfully");
        router.push("/admin/members");
      } else {
        toast.error("Failed to update member");
      }
    } catch (err: unknown) {
      console.error("Error updating member:", err);
      
      // Enhanced error logging
      if (err && typeof err === 'object' && 'response' in err) {
        type AxiosErrorLike = { response?: { data?: { message?: string }; status?: number; statusText?: string } };
        const axiosError = err as AxiosErrorLike;
        console.error("Response status:", axiosError.response?.status);
        console.error("Response statusText:", axiosError.response?.statusText);
        console.error("Response data:", axiosError.response?.data);
        
        // Check if it's an authentication error
        if (axiosError.response?.status === 400 || axiosError.response?.status === 401) {
          const errorMsg = axiosError.response?.data?.message || "";
          if (errorMsg.toLowerCase().includes("login") || errorMsg.toLowerCase().includes("auth")) {
            toast.error("Session expired. Please login again.");
            // Redirect to login page after 2 seconds
            setTimeout(() => {
              router.push("/login");
            }, 2000);
            return;
          }
        }
        
        const errorMessage = axiosError.response?.data?.message || 
                           axiosError.response?.statusText || 
                           "Failed to update member";
        toast.error(errorMessage);
      } else {
        const errorMessage = err instanceof Error ? err.message : "Failed to update member";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
          <span className="ml-3 text-lg">Loading member data...</span>
        </div>
      </div>
    );
  }

  if (error || !currentMember) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 14c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading member</h3>
            <p className="mt-1 text-sm text-red-500">{error || "Member not found"}</p>
            <button
              onClick={() => router.push("/admin/members")}
              className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Back to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/members")}
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Member</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Editing: <span className="font-medium">{currentMember.name}</span>
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow form-container">
        {/* Profile Image Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Image</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
            <div className="order-2 md:order-1">
              <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-gray-200">
                {newPreview ? (
                  <Image src={newPreview} alt="New Profile" width={112} height={112} className="h-full w-full object-cover" unoptimized={true} />
                ) : currentMember.profile_image?.url ? (
                  <Image src={currentMember.profile_image.url} alt={currentMember.name} width={112} height={112} className="h-full w-full object-cover" unoptimized={true} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              {newPreview && (
                <button
                  type="button"
                  onClick={handleRemoveNewImage}
                  className="mt-2 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  <X className="mr-1 h-3 w-3" /> Remove
                </button>
              )}
            </div>
            <div className="order-1 md:order-2 md:col-span-2">
              <label
                htmlFor="profile_image"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <Upload className="mb-2 h-6 w-6 text-gray-500" />
                <span className="text-sm text-gray-700">{newPreview ? 'Change profile image' : 'Click to upload or drag & drop'}</span>
                <span className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</span>
                <input id="profile_image" type="file" accept="image/*" onChange={onInputChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="e.g., Ayushman Rana"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email_id" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="email_id"
                {...register("email_id")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="name@example.com"
              />
              {errors.email_id && <p className="mt-1 text-sm text-red-600">{errors.email_id.message}</p>}
            </div>

            <div className="custom-select">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department *
              </label>
              <select
                id="department"
                {...register("department")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                style={{ zIndex: 1000, position: 'relative' }}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
            </div>

            <div className="custom-select">
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                Designation *
              </label>
              <select
                id="designation"
                {...register("designation")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                style={{ zIndex: 1000, position: 'relative' }}
              >
                <option value="">Select Designation</option>
                <option value="Lead">Lead</option>
                <option value="Co-Lead">Co-Lead</option>
                <option value="Web Developer">Web Developer</option>
                <option value="App Developer">App Developer</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Tech Member">Tech Member</option>
                <option value="Video Editor">Video Editor</option>
                <option value="Graphic Designer">Graphic Designer</option>
                <option value="Content Writer">Content Writer</option>
                <option value="Photographer">Photographer</option>
                <option value="PR Team">PR Team</option>
                <option value="Core Team">Core Team</option>
              </select>
              {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation.message}</p>}
            </div>

            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-gray-700">
                Batch *
              </label>
              <input
                type="text"
                id="batch"
                placeholder="e.g., 2024"
                {...register("batch")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              {errors.batch && <p className="mt-1 text-sm text-red-600">{errors.batch.message}</p>}
            </div>

            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">
                GitHub URL
              </label>
              <input
                type="url"
                id="github_url"
                placeholder="https://github.com/username"
                {...register("github_url")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              {errors.github_url && <p className="mt-1 text-sm text-red-600">{errors.github_url.message}</p>}
            </div>

            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin_url"
                placeholder="https://linkedin.com/in/username"
                {...register("linkedin_url")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              {errors.linkedin_url && <p className="mt-1 text-sm text-red-600">{errors.linkedin_url.message}</p>}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio *
            </label>
            <textarea
              id="bio"
              rows={4}
              {...register("bio")}
              className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
          </div>

          {/* Profile Image Upload handled above */}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/admin/members")}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                "Updating..."
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Update Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
