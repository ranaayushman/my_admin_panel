"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { membersApi } from "@/services/api";
import { NewMemberFormData } from "@/types";
import toast from "react-hot-toast";
import Image from "next/image";

// Define departments and designations for dropdown options
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
  "Other",
];

const designations = [
  // Core Team
  "Organizer",
  "PR and Management Lead",
  "Web Development Lead",
  "App Development Lead",
  "Content Writer Lead",
  "Video Editor Lead",
  "Graphic Designer Lead",
  
  // Tech Team
  "Web Developer",
  "App Developer",
  "Machine Learning Engineer",
  "Tech Member",
  
  // Media Team
  "Video Editor",
  "Graphic Designer",
  "Content Writer",
  "Photographer",
  
  // PR Team
  "PR",
];

const batches = ["2021", "2022", "2023", "2024", "2025", "2026", "2027"];

// Create a schema for form validation
const newMemberSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters"),
  email_id: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  batch: z.string().min(1, "Batch is required"),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
  github_url: z.string().url("Invalid URL").or(z.literal("NA")),
  linkedin_url: z.string().url("Invalid URL"),
  // Profile image is optional in the form but will be validated separately
});

export default function AddMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<NewMemberFormData>({
    resolver: zodResolver(newMemberSchema),
    defaultValues: {
      name: "",
      email_id: "",
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
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };
  
  const onSubmit = async (data: NewMemberFormData) => {
    const fileInput = document.getElementById('profile_image') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file) {
      toast.error("Profile image is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Append the file
      formData.append("profile_image", file);
      
      // Send the API request
      const response = await membersApi.createMember(formData);
      
      if (response.data.success) {
        toast.success("Member added successfully!");
        reset(); // Reset form fields
        setPreviewImage(null); // Clear image preview
        
        // Navigate back to members list after a short delay
        setTimeout(() => {
          router.push('/admin/members');
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to add member");
      }
    } catch (err: unknown) {
      console.error("Error adding member:", err);
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
        <h1 className="text-2xl font-semibold text-gray-800">Add New Member</h1>
        <button
          onClick={() => router.push('/admin/members')}
          className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
        >
          Back to Members List
        </button>
      </div>
      
      <div className="rounded-lg border bg-white p-6 shadow-sm form-container">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Image <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 flex items-center space-x-6">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt="Profile Preview"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <input
                      id="profile_image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full cursor-pointer rounded-lg border border-gray-300 text-sm
                        file:mr-4 file:cursor-pointer file:border-0
                        file:bg-indigo-50 file:py-2 file:px-4
                        file:text-sm file:font-medium file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG or JPEG (recommended size: 400x400px)
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email_id" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email_id"
                  type="email"
                  {...register("email_id")}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm ${
                    errors.email_id ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.email_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.email_id.message}</p>
                )}
              </div>
              
              {/* Department */}
              <div className="custom-select">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        errors.department ? "border-red-300" : "border-gray-300"
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
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>
              
              {/* Batch */}
              <div className="custom-select">
                <label htmlFor="batch" className="block text-sm font-medium text-gray-700">
                  Batch <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="batch"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        errors.batch ? "border-red-300" : "border-gray-300"
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
                  <p className="mt-1 text-sm text-red-600">{errors.batch.message}</p>
                )}
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              {/* Designation */}
              <div className="custom-select">
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                  Designation <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        errors.designation ? "border-red-300" : "border-gray-300"
                      }`}
                      style={{ zIndex: 1000, position: 'relative' }}
                    >
                      <option value="">Select Designation</option>
                      {designations.map((designation) => (
                        <option key={designation} value={designation}>
                          {designation}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-600">{errors.designation.message}</p>
                )}
              </div>
              
              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  {...register("bio")}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm ${
                    errors.bio ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="A brief description about the member..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>
              
              {/* GitHub URL */}
              <div>
                <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">
                  GitHub URL (or NA if not available)
                </label>
                <input
                  id="github_url"
                  type="text"
                  {...register("github_url")}
                  placeholder="https://github.com/username or NA"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm ${
                    errors.github_url ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.github_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.github_url.message}</p>
                )}
              </div>
              
              {/* LinkedIn URL */}
              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                  LinkedIn URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="linkedin_url"
                  type="text"
                  {...register("linkedin_url")}
                  placeholder="https://www.linkedin.com/in/username"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm ${
                    errors.linkedin_url ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.linkedin_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.linkedin_url.message}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                "Add Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
