"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { membersApi } from "@/services/api";
import toast from "react-hot-toast";
import Image from "next/image";
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react";

// Define departments and designations for dropdown options
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
  "OTHER",
] as const;

// Designations aligned to your categorization
const newDesignations = [
  "Faculty Co-ordinator",
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

const batches = ["2021", "2022", "2023", "2024", "2025", "2026", "2027"];

// Create a schema for form validation
const newMemberSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters"),
  email_id: z.string().email("Invalid email address"),
  mobile_number: z.string().min(10, "Mobile number must be at least 10 digits"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  batch: z.string().min(1, "Batch is required"),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
  github_url: z.string().url("Invalid URL").or(z.literal("NA")),
  linkedin_url: z.string().url("Invalid URL").or(z.literal("NA")),
});

export default function AddMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof newMemberSchema>>({
    resolver: zodResolver(newMemberSchema),
    defaultValues: {
      name: "",
      email_id: "",
      mobile_number: "",
      department: "",
      designation: "",
      batch: "",
      bio: "",
      github_url: "",
      linkedin_url: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        e.target.value = "";
        setPreviewImage(null);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        e.target.value = "";
        setPreviewImage(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleRemoveImage = useCallback(() => {
    const fileInput = document.getElementById('profile_image') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
    setPreviewImage(null);
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
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please drop a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof newMemberSchema>) => {
    const fileInput = document.getElementById('profile_image') as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      toast.error("Profile image is required");
      return;
    }

    setIsLoading(true);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const memberData = {
        ...data,
        profile_image: base64Image,
      };

      const response = await membersApi.createMember(memberData);

      if (response.data.success) {
        toast.success("Member added successfully!");
        reset();
        setPreviewImage(null);

        setTimeout(() => {
          router.push('/admin/members');
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to add member");
      }
    } catch (err: unknown) {
      console.error("Error adding member - Full Error Object:", err);

      if (err && typeof err === 'object' && 'response' in err) {
        console.error("Server Response Data:", (err as any).response?.data);
      }

      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "An error occurred while adding the member";
      toast.error(errorMessage || "An error occurred while adding the member");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/members')}
            className="inline-flex items-center rounded-md border border-zinc-900 bg-[#18181B] px-3 py-1.5 text-sm text-white hover:bg-[#141417]"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-semibold text-white">Add New Member</h1>
          <span className="ml-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">Required fields are marked *</span>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-900 bg-[#0b0b0c] p-6 shadow-sm form-container">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white">
                  Profile Image <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
                  <div className="order-2 md:order-1">
                    <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-zinc-700">
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt="Profile Preview"
                          width={112}
                          height={112}
                          className="h-full w-full object-cover"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#141417] text-zinc-500">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    {previewImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
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
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:bg-[#141417]'
                        }`}
                    >
                      <Upload className="mb-2 h-6 w-6 text-zinc-400" />
                      <span className="text-sm text-white">
                        {previewImage ? 'Change profile image' : 'Click to upload or drag & drop'}
                      </span>
                      <span className="mt-1 text-xs text-zinc-500">PNG, JPG, JPEG up to 5MB</span>
                      <input
                        id="profile_image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`mt-1 block w-full rounded-md border text-white bg-[#141417] px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-zinc-700"
                    }`}
                  placeholder="e.g., Ayushman Rana"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email_id" className="block text-sm font-medium text-white">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email_id"
                  type="email"
                  {...register("email_id")}
                  className={`mt-1 block w-full text-white bg-[#141417] rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.email_id ? "border-red-500" : "border-zinc-700"
                    }`}
                  placeholder="name@example.com"
                />
                {errors.email_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.email_id.message}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile_number" className="block text-sm font-medium text-white">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="mobile_number"
                  type="text"
                  {...register("mobile_number")}
                  className={`mt-1 block w-full text-white bg-[#141417] rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.mobile_number ? "border-red-500" : "border-zinc-700"
                    }`}
                  placeholder="e.g. 9876543210"
                />
                {errors.mobile_number && (
                  <p className="mt-1 text-sm text-red-500">{errors.mobile_number.message}</p>
                )}
              </div>

              {/* Department */}
              <div className="custom-select">
                <label htmlFor="department" className="block text-sm font-medium text-white">
                  Department <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm bg-[#141417] text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.department ? "border-red-500" : "border-zinc-700"
                        }`}
                      style={{ zIndex: 1000, position: 'relative' }}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>
                )}
              </div>

              {/* Batch */}
              <div className="custom-select">
                <label htmlFor="batch" className="block text-sm font-medium text-white">
                  Batch <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="batch"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm bg-[#141417] text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.batch ? "border-red-500" : "border-zinc-700"
                        }`}
                      style={{ zIndex: 1000, position: 'relative' }}
                    >
                      <option value="">Select Batch Year</option>
                      {batches.map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.batch && (
                  <p className="mt-1 text-sm text-red-500">{errors.batch.message}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Designation */}
              <div className="custom-select">
                <label htmlFor="designation" className="block text-sm font-medium text-white">
                  Designation <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm bg-[#141417] text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.designation ? "border-red-500" : "border-zinc-700"
                        }`}
                      style={{ zIndex: 1000, position: 'relative' }}
                    >
                      <option value="">Select Designation</option>
                      {newDesignations.map((designation) => (
                        <option key={designation} value={designation}>
                          {designation}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-500">{errors.designation.message}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-white">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  {...register("bio")}
                  className={`mt-1 block w-full text-white bg-[#141417] rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.bio ? "border-red-500" : "border-zinc-700"
                    }`}
                  placeholder="A brief description about the member..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>

              {/* GitHub URL */}
              <div>
                <label htmlFor="github_url" className="block text-sm font-medium text-white">
                  GitHub URL (or NA if not available)
                </label>
                <input
                  id="github_url"
                  type="text"
                  {...register("github_url")}
                  placeholder="https://github.com/username or NA"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm text-white bg-[#141417] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.github_url ? "border-red-500" : "border-zinc-700"
                    }`}
                />
                {errors.github_url && (
                  <p className="mt-1 text-sm text-red-500">{errors.github_url.message}</p>
                )}
              </div>

              {/* LinkedIn URL */}
              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-white">
                  LinkedIn URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="linkedin_url"
                  type="text"
                  {...register("linkedin_url")}
                  placeholder="https://www.linkedin.com/in/username"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm text-white bg-[#141417] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.linkedin_url ? "border-red-500" : "border-zinc-700"
                    }`}
                />
                {errors.linkedin_url && (
                  <p className="mt-1 text-sm text-red-500">{errors.linkedin_url.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/members')}
              className="inline-flex items-center rounded-md border border-zinc-700 bg-[#141417] px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
