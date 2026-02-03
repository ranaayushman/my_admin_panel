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

// Departments aligned with backend values
const departments = [
  "CSE",
  "CSE-DS",
  "CSE-AI/ML",
  "CSE-CS",
  "IT",
  "ECE",
  "EE",
  "ME",
  "CE",
  "CHE",
  "BCA",
  "MCA",
  "BT",
  "Other",
  "OTHER",
] as const;

// Designations
const designationEnum = [
  "Founder",
  "Organizer",
  "Co-Organizer",
  "Secretary",
  "Join Secretary",
  "Treasurer",
  "Joint Treasurer",
  "Management Head",
  "Joint Management Head",
  "Public Relation Head",
  "Joint Public Relation Head",
  "Technical Lead",
  "Joint Technical Lead",
  "Web Development Lead",
  "App Development Lead",
  "Machine Learning Lead",
  "Content Writer Lead",
  "Joint Content Writer Lead",
  "Video Editor Lead",
  "Joint Video Editor Lead",
  "Graphic Designer Lead",
  "Web Developer",
  "App Developer",
  "Machine Learning",
  "Technical Member",
  "Video Editor",
  "Graphic Designer",
  "Content Writer",
  "Photographer",
  "PR",
] as const;

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email_id: z.string().email("Valid email is required"),
  mobile_number: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  batch: z.string().min(1, "Batch is required"),
  bio: z.string().min(1, "Bio is required"),
  github_url: z.string().optional().or(z.literal("")),
  linkedin_url: z.string().optional().or(z.literal("")),
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
        const response = await membersApi.getMemberByIdAdmin(memberId);

        if (response.data && response.data.success) {
          const member = response.data.member;
          setCurrentMember(member);

          // Reset form with fetched data
          reset({
            name: member.name || "",
            email_id: member.email_id || "",
            mobile_number: member.mobile_number || "",
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
        mobile_number?: string;
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
        mobile_number: data.mobile_number,
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

      const response = await membersApi.updateMember(memberId, updateData);

      if (response.data && response.data.success) {
        toast.success("Member updated successfully");
        router.push("/admin/members");
      } else {
        toast.error("Failed to update member");
      }
    } catch (err: unknown) {
      console.error("Error updating member:", err);
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Failed to update member";
      toast.error(errorMessage || "Failed to update member");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-white">Loading member data...</span>
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
              className="mx-auto h-12 w-12 text-red-500"
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
            <h3 className="mt-2 text-lg font-medium text-white">Error loading member</h3>
            <p className="mt-1 text-sm text-red-400">{error || "Member not found"}</p>
            <button
              onClick={() => router.push("/admin/members")}
              className="mt-4 inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600"
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
              className="inline-flex items-center rounded-md border border-zinc-900 bg-[#18181B] px-3 py-1.5 text-sm text-white hover:bg-[#141417]"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-semibold text-white">Edit Member</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Editing: <span className="font-medium text-white">{currentMember.name}</span>
        </p>
      </div>

      <div className="rounded-lg border border-zinc-900 bg-[#0b0b0c] p-6 shadow-sm form-container">
        {/* Profile Image Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Profile Image</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
            <div className="order-2 md:order-1">
              <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-zinc-700">
                {newPreview ? (
                  <Image src={newPreview} alt="New Profile" width={112} height={112} className="h-full w-full object-cover" unoptimized={true} />
                ) : currentMember.profile_image?.url ? (
                  <Image src={currentMember.profile_image.url} alt={currentMember.name} width={112} height={112} className="h-full w-full object-cover" unoptimized={true} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#141417] text-zinc-500">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              {newPreview && (
                <button
                  type="button"
                  onClick={handleRemoveNewImage}
                  className="mt-2 inline-flex items-center rounded-md bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30"
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
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:bg-[#141417]'}`}
              >
                <Upload className="mb-2 h-6 w-6 text-zinc-400" />
                <span className="text-sm text-white">{newPreview ? 'Change profile image' : 'Click to upload or drag & drop'}</span>
                <span className="mt-1 text-xs text-zinc-500">PNG, JPG, JPEG up to 5MB</span>
                <input id="profile_image" type="file" accept="image/*" onChange={onInputChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-[#141417] text-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Ayushman Rana"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email_id" className="block text-sm font-medium text-white">
                Email Address *
              </label>
              <input
                type="email"
                id="email_id"
                {...register("email_id")}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-[#141417] text-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="name@example.com"
              />
              {errors.email_id && <p className="mt-1 text-sm text-red-500">{errors.email_id.message}</p>}
            </div>

            <div>
              <label htmlFor="mobile_number" className="block text-sm font-medium text-white">
                Mobile Number
              </label>
              <input
                type="text"
                id="mobile_number"
                {...register("mobile_number")}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-[#141417] text-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. 9876543210"
              />
              {errors.mobile_number && <p className="mt-1 text-sm text-red-500">{errors.mobile_number.message}</p>}
            </div>

            <div className="custom-select">
              <label htmlFor="department" className="block text-sm font-medium text-white">
                Department *
              </label>
              <select
                id="department"
                {...register("department")}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-[#141417] text-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ zIndex: 1000, position: 'relative' }}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>}
            </div>

            <div className="custom-select">
              <label htmlFor="designation" className="block text-sm font-medium text-white">
                Designation *
              </label>
              <select
                id="designation"
                {...register("designation")}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-[#141417] text-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ zIndex: 1000, position: 'relative' }}
              >
                <option value="">Select Designation</option>
                {/* If current designation isn't in the new set, show it as a legacy option */}
                {currentMember && !designationEnum.some(d => d === currentMember.designation) && (
                  <option value={currentMember.designation}>{currentMember.designation} (legacy)</option>
                )}
                {designationEnum.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.designation && <p className="mt-1 text-sm text-red-500">{errors.designation.message}</p>}
            </div>

            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-white">
                Batch *
              </label>
              <input
                type="text"
                id="batch"
                placeholder="e.g., 2024"
                {...register("batch")}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-[#141417] text-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.batch && <p className="mt-1 text-sm text-red-500">{errors.batch.message}</p>}
            </div>

            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-white">
                GitHub URL
              </label>
              <input
                type="url"
                id="github_url"
                placeholder="https://github.com/username"
                {...register("github_url")}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-[#141417] text-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.github_url && <p className="mt-1 text-sm text-red-500">{errors.github_url.message}</p>}
            </div>

            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-white">
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin_url"
                placeholder="https://linkedin.com/in/username"
                {...register("linkedin_url")}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-[#141417] text-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.linkedin_url && <p className="mt-1 text-sm text-red-500">{errors.linkedin_url.message}</p>}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-white">
              Bio *
            </label>
            <textarea
              id="bio"
              rows={4}
              {...register("bio")}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-[#141417] text-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/admin/members")}
              className="rounded-md border border-zinc-700 bg-[#141417] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
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
