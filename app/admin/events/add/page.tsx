"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { eventsApi } from "@/services/api";
import { fileToBase64, validateImageFile } from '@/utils/file';
import type { SubmitHandler } from "react-hook-form";
import {
  Upload,
  X,
  Image as ImageIcon,
  Type,
  ArrowLeft,
  User
} from "lucide-react";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  venue: z.string().min(1, "Venue is required"),
  category: z.string().min(1, "Category is required"),
  registrationFee: z.string().optional(),
  upiID: z.string().optional(),
  details: z.string().min(1, "Details are required"),
  is_upcoming: z.boolean().catch(true),
  registration_open: z.boolean().catch(false),
  whatsappLink: z.string().min(1, "Whatsapp link is required"),
  contactInfo: z.array(z.object({
    name: z.string().min(1, "Contact name is required"),
    mobile: z.string().min(10, "Valid mobile number is required"),
    year: z.string().min(1, "Year is required"),
  })).catch([]),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function AddEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventBanner, setEventBanner] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      contactInfo: [{ name: "", mobile: "", year: "" }],
      is_upcoming: true,
      registration_open: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contactInfo",
  });

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      if (posterPreview) URL.revokeObjectURL(posterPreview);
    };
  }, [bannerPreview, posterPreview]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (s: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeFile = (
    setFile: (f: File | null) => void,
    setPreview: (s: string | null) => void
  ) => {
    setFile(null);
    setPreview(null);
  };

  const onSubmit: SubmitHandler<EventFormData> = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const payload: unknown = { ...data };
      const payloadObj = payload as Record<string, unknown>;

      payloadObj.is_upcoming = Boolean(data.is_upcoming);
      payloadObj.registration_open = Boolean(data.registration_open);

      if (eventBanner) {
        const imgErr = validateImageFile(eventBanner);
        if (imgErr) throw new Error(imgErr);
        payloadObj.eventBanner = await fileToBase64(eventBanner);
      }
      if (poster) {
        const imgErr = validateImageFile(poster);
        if (imgErr) throw new Error(imgErr);
        payloadObj.poster = await fileToBase64(poster);
      }

      const response = await eventsApi.createEventJson(payloadObj);

      if (response.data && response.data.success) {
        toast.success("Event created successfully");
        router.push("/admin/events");
      } else {
        toast.error(response.data?.message || "Failed to create event");
      }
    } catch (err: unknown) {
      console.error("Error creating event:", err);
      const errorMessage = err instanceof Error && 'message' in err
        ? (err as Error).message
        : err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to create event";
      toast.error(errorMessage || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* ================= Header ================= */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/admin/events")}
                className="rounded-md p-1.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <ArrowLeft />
              </button>
              <h1 className="text-2xl font-bold text-gray-100">Add New Event</h1>
            </div>
            <p className="mt-1 ml-10 text-sm text-gray-500">
              Create and publish a new event for the community
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-700 bg-gray-900 p-2 shadow-sm">

            {/* Upcoming */}
            <div className="flex items-center gap-2 px-3 border-r border-gray-700">
              <label className="inline-flex cursor-pointer items-center">
                <input type="checkbox" {...register("is_upcoming")} className="sr-only peer" />
                <span className="relative h-5 w-9 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-gray-300 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
              </label>
              <span className="text-sm font-medium text-gray-300">Upcoming</span>
            </div>

            {/* Registration */}
            <div className="flex items-center gap-2 px-3 border-r border-gray-700">
              <label className="inline-flex cursor-pointer items-center">
                <input type="checkbox" {...register("registration_open")} className="sr-only peer" />
                <span className="relative h-5 w-9 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-gray-300 after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
              </label>
              <span className="text-sm font-medium text-gray-300">Registration</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pl-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? "Publishing..." : "Publish Event"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= Event Media ================= */}
        <div className="rounded-xl border border-gray-700 bg-[#0b0b0c] p-6 shadow-sm">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-100">
            <ImageIcon className="mr-2 h-5 w-5 text-indigo-400" />
            Event Media
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            {/* Banner */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Event Banner</label>
              {bannerPreview ? (
                <div className="group relative h-48 w-full overflow-hidden rounded-lg border border-gray-700">
                  <img src={bannerPreview} alt="Banner Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => removeFile(setEventBanner, setBannerPreview)}
                      className="rounded-full bg-red-500 p-2 text-white transition-transform hover:scale-110 hover:bg-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-[#1a1a1c] transition-colors hover:bg-gray-700 hover:border-gray-500">
                  <span className="flex flex-col items-center justify-center pb-6 pt-5">
                    <span className="mb-3 rounded-full bg-[#0b0b0c] p-3">
                      <Upload className="h-6 w-6 text-indigo-400" />
                    </span>
                    <span className="mb-1 text-sm font-medium text-gray-300">Click to upload banner</span>
                    <span className="text-xs text-white">SVG, PNG, JPG (MAX. 800x400px)</span>
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setEventBanner, setBannerPreview)}
                  />
                </label>
              )}
            </div>

            {/* Poster */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Event Poster</label>
              {posterPreview ? (
                <div className="group relative h-48 w-full overflow-hidden rounded-lg border border-gray-700">
                  <img src={posterPreview} alt="Poster Preview" className="h-full w-full object-contain bg-[#1a1a1c]" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => removeFile(setPoster, setPosterPreview)}
                      className="rounded-full bg-red-500 p-2 text-white transition-transform hover:scale-110 hover:bg-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-[#1a1a1c] transition-colors hover:bg-gray-700 hover:border-gray-500">
                  <span className="flex flex-col items-center justify-center pb-6 pt-5">
                    <span className="mb-3 rounded-full bg-[#0b0b0c] p-3">
                      <Upload className="h-6 w-6 text-indigo-400" />
                    </span>
                    <span className="mb-1 text-sm font-medium text-gray-300">Click to upload poster</span>
                    <span className="text-xs text-white">SVG, PNG, JPG (MAX. 400x500px)</span>
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setPoster, setPosterPreview)}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ================= Event Details ================= */}
        <div className="rounded-xl border border-gray-700 bg-[#0b0b0c] p-6 shadow-sm">
          <h3 className="mb-6 flex items-center text-lg font-semibold text-white">
            <Type className="mr-2 h-5 w-5 text-indigo-400" />
            Event Details
          </h3>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">

            {/* Left */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-0.5">
                  Event Name *
                </label>
                <input
                  {...register("name")}
                  className="h-10 w-full rounded-lg border-gray-600 bg-gray-800 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500"
                  placeholder="Event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">Category *</label>
                  <select
                    {...register("category")}
                    className="h-10 w-full rounded-lg border-gray-600 bg-gray-800 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="meetup">Meetup</option>
                    <option value="conference">Conference</option>
                    <option value="networking">Networking</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">Venue *</label>
                  <input
                    {...register("venue")}
                    className="h-10 w-full rounded-lg border-gray-600 bg-gray-800 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500"
                    placeholder="Event location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">Date *</label>
                  <input
                    type="date"
                    {...register("eventDate")}
                    className="h-10 w-full rounded-lg border-gray-600 bg-gray-800 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">Time *</label>
                  <input
                    type="time"
                    {...register("eventTime")}
                    className="h-10 w-full rounded-lg border-gray-600 bg-gray-800 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-0.5">
                  Short Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full rounded-lg border-gray-600 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500"
                  placeholder="Brief overview of the event"
                />
              </div>
            </div>

            {/* Right */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">Fee</label>
                  <input
                    {...register("registrationFee")}
                    className="h-10 w-full rounded-lg border-gray-600 bg-gray-800 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500"
                    placeholder="Amount or Free"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">UPI ID</label>
                  <input
                    {...register("upiID")}
                    className="h-10 w-full rounded-lg border-gray-600 bg-gray-800 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500"
                    placeholder="example@upi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-0.5">WhatsApp Group *</label>
                <div className="">
                  <input
                    type="text"
                    {...register("whatsappLink")}
                    className="h-10 w-full rounded-lg border-gray-600 bg-gray-800 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500"
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>
                {errors.whatsappLink && <p className="mt-1 text-sm text-red-500">{errors.whatsappLink.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-0.5">
                  Full Event Details *
                </label>
                <textarea
                  {...register("details")}
                  rows={4}
                  className="w-full rounded-lg border-gray-600 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500"
                  placeholder="Complete event information"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= Contacts ================= */}
        <div className="rounded-xl border border-gray-700 bg-[#0b0b0c] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center text-sm font-semibold text-white">
              <User className="mr-2 h-4 w-4 text-indigo-400" />
              Contact Persons
            </h3>
            <button
              type="button"
              onClick={() => append({ name: "", mobile: "", year: "" })}
              className="rounded bg-indigo-900/40 px-2 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-900/60"
            >
              Add Contact
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-[#1a1a1c] p-3"
              >
                <div className="grid flex-grow grid-cols-3 gap-2">
                  <input
                    {...register(`contactInfo.${index}.name`)}
                    className="h-9 rounded border-gray-600 bg-gray-900 px-2 text-sm text-white focus:ring-indigo-500 placeholder-gray-500"
                    placeholder="Name"
                  />
                  <input
                    {...register(`contactInfo.${index}.mobile`)}
                    className="h-9 rounded border-gray-600 bg-gray-900 px-2 text-sm text-white focus:ring-indigo-500 placeholder-gray-500"
                    placeholder="Mobile"
                  />
                  <input
                    {...register(`contactInfo.${index}.year`)}
                    className="h-9 rounded border-gray-600 bg-gray-900 px-2 text-sm text-white focus:ring-indigo-500 placeholder-gray-500"
                    placeholder="Year"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
