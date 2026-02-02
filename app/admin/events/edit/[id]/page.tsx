"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { eventsApi } from "@/services/api";
import { fileToBase64, validateImageFile } from '@/utils/file';
import { Event } from "@/types";
import type { SubmitHandler } from "react-hook-form";
import Image from "next/image";
import {
  Upload,
  X,
  Image as ImageIcon,
  Calendar,
  Clock,
  User,
  Type,
  ArrowLeft
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
  whatsappLink: z.string().min(1, "Whatsapp link is required"),
  registration_open: z.boolean().catch(false),
  contactInfo: z.array(z.object({
    name: z.string().min(1, "Contact name is required"),
    mobile: z.string().min(10, "Valid mobile number is required"),
    year: z.string().min(1, "Year is required"),
  })).catch([]),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EditEventPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const eventId = (routeParams?.id as string) || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [eventBanner, setEventBanner] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
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
      // Only revoke if it's a blob url (starts with blob:)
      if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview);
      if (posterPreview?.startsWith('blob:')) URL.revokeObjectURL(posterPreview);
    };
  }, [bannerPreview, posterPreview]);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await eventsApi.getEventById(eventId);
        if (response.data && response.data.success) {
          const event = response.data.event;
          setCurrentEvent(event);

          setBannerPreview(event.eventBanner?.url || null);
          setPosterPreview(event.poster?.url || null);

          // Reset form with fetched data
          reset({
            name: event.name || "",
            description: event.description || "",
            eventDate: event.eventDate || "",
            eventTime: event.eventTime || "",
            venue: event.venue || "",
            category: event.category || "",
            registrationFee: event.registrationFee?.toString() || "",
            upiID: event.upiID || "",
            details: event.details || "",
            is_upcoming: event.is_upcoming ?? true,
            whatsappLink: event.whatsappLink || "",
            registration_open: event.registration_open ?? false,
            contactInfo: event.contactInfo && event.contactInfo.length > 0
              ? event.contactInfo
              : [{ name: "", mobile: "", year: "" }],
          });
        } else {
          setError("Failed to fetch event data");
          toast.error("Failed to load event data");
        }
      } catch (err: unknown) {
        console.error("Error fetching event:", err);
        const errorMessage = err instanceof Error && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to fetch event data";
        setError(errorMessage || "Failed to fetch event data");
        toast.error("Failed to load event data");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, reset]);

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
      const payload: Partial<EventFormData> & { [key: string]: unknown } = { ...data };

      payload.is_upcoming = Boolean(data.is_upcoming);
      payload.registration_open = Boolean(data.registration_open);

      if (eventBanner) {
        const imgErr = validateImageFile(eventBanner);
        if (imgErr) throw new Error(imgErr);
        payload.eventBanner = await fileToBase64(eventBanner);
      }
      if (poster) {
        const imgErr = validateImageFile(poster);
        if (imgErr) throw new Error(imgErr);
        payload.poster = await fileToBase64(poster);
      }

      const response = await eventsApi.updateEvent(eventId, payload);

      if (response.data && response.data.success) {
        toast.success("Event updated successfully");
        router.push("/admin/events");
      } else {
        toast.error(response.data?.message || "Failed to update event");
      }
    } catch (err: unknown) {
      console.error("Error updating event:", err);
      // Log detailed error info if available
      if (err && typeof err === 'object' && 'response' in err) {
        console.log("Error Response Data:", (err as any).response?.data);
      }

      const errorMessage = err instanceof Error && 'message' in err
        ? (err as Error).message
        : err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to update event";
      toast.error(errorMessage || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-white">Loading event data...</span>
        </div>
      </div>
    );
  }

  if (error || !currentEvent) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="mt-2 text-lg font-medium text-white">Error loading event</h3>
            <p className="mt-1 text-sm text-red-400">{error || "Event not found"}</p>
            <button
              onClick={() => router.push("/admin/events")}
              className="mt-4 inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                className="rounded-md p-1.5 text-sm font-medium text-white hover:bg-[#18181B]"
              >
                <ArrowLeft />
              </button>
              <h1 className="text-2xl font-bold text-white">Edit Event</h1>
            </div>
            <p className="mt-1 ml-10 text-sm text-zinc-400">
              Update event details and settings
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-900 bg-[#18181B] p-2 shadow-sm">

            {/* Upcoming Toggle */}
            <div className="flex items-center gap-2 px-3 border-r border-zinc-800">
              <label className="inline-flex cursor-pointer items-center">
                <input type="checkbox" {...register("is_upcoming")} className="sr-only peer" />
                <span className="relative h-5 w-9 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-500 peer-checked:after:translate-x-full" />
              </label>
              <span className="text-sm font-medium text-white">Upcoming</span>
            </div>

            {/* Registration Toggle */}
            <div className="flex items-center gap-2 px-3 border-r border-zinc-800">
              <label className="inline-flex cursor-pointer items-center">
                <input type="checkbox" {...register("registration_open")} className="sr-only peer" />
                <span className="relative h-5 w-9 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
              </label>
              <span className="text-sm font-medium text-white">Registration</span>
            </div>


            {/* Actions */}
            <div className="flex items-center gap-2 pl-2">
              <button
                type="button"
                onClick={() => router.push("/admin/events")}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Event"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= Event Media ================= */}
        <div className="rounded-xl border border-zinc-900 bg-[#18181B] p-6 shadow-sm">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-white">
            <ImageIcon className="mr-2 h-5 w-5 text-blue-500" />
            Event Media
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            {/* Banner */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Event Banner</label>
              {bannerPreview ? (
                <div className="group relative h-48 w-full overflow-hidden rounded-lg border border-zinc-800">
                  <Image
                    src={bannerPreview}
                    alt="Banner Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => removeFile(setEventBanner, setBannerPreview)}
                      className="rounded-full bg-red-500 p-2 text-white transition-transform hover:scale-110 hover:bg-red-600"
                      title="Remove/Replace"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-[#141417] transition-colors hover:bg-zinc-800">
                  <span className="flex flex-col items-center justify-center pb-6 pt-5">
                    <span className="mb-3 rounded-full bg-blue-500/20 p-3">
                      <Upload className="h-6 w-6 text-blue-400" />
                    </span>
                    <span className="mb-1 text-sm font-medium text-white">Click to upload banner</span>
                    <span className="text-xs text-zinc-500">SVG, PNG, JPG (MAX. 800x400px)</span>
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
              <label className="block text-sm font-medium text-white">Event Poster</label>
              {posterPreview ? (
                <div className="group relative h-48 w-full overflow-hidden rounded-lg border border-zinc-800">
                  <Image
                    src={posterPreview}
                    alt="Poster Preview"
                    fill
                    className="object-contain bg-zinc-900"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => removeFile(setPoster, setPosterPreview)}
                      className="rounded-full bg-red-500 p-2 text-white transition-transform hover:scale-110 hover:bg-red-600"
                      title="Remove/Replace"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-[#141417] transition-colors hover:bg-zinc-800">
                  <span className="flex flex-col items-center justify-center pb-6 pt-5">
                    <span className="mb-3 rounded-full bg-purple-500/20 p-3">
                      <Upload className="h-6 w-6 text-purple-400" />
                    </span>
                    <span className="mb-1 text-sm font-medium text-white">Click to upload poster</span>
                    <span className="text-xs text-zinc-500">SVG, PNG, JPG (MAX. 400x500px)</span>
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
        <div className="rounded-xl border border-zinc-900 bg-[#18181B] p-6 shadow-sm">
          <h3 className="mb-6 flex items-center text-lg font-semibold text-white">
            <Type className="mr-2 h-5 w-5 text-blue-500" />
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
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-[#141417] px-3 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">Category *</label>
                  <select
                    {...register("category")}
                    className="h-10 w-full rounded-lg border border-zinc-700 bg-[#141417] px-3 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="h-10 w-full rounded-lg border border-zinc-700 bg-[#141417] px-3 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Event location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">Date *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      {...register("eventDate")}
                      className="pl-9 w-full h-10 rounded-lg border border-zinc-700 bg-[#141417] px-3 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="15th Jan"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">Time *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      {...register("eventTime")}
                      className="pl-9 w-full h-10 rounded-lg border border-zinc-700 bg-[#141417] px-3 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="10 AM - 2 PM"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-0.5">
                  Short Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-[#141417] px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Brief overview of the event"
                />
              </div>
            </div>

            {/* Right */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">Fee</label>
                  <div className="relative">

                    <input
                      {...register("registrationFee")}
                      className="pl-9 h-10 w-full rounded-lg border border-zinc-700 bg-[#141417] px-3 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Amount or Free"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-0.5">UPI ID</label>
                  <input
                    {...register("upiID")}
                    className="h-10 w-full rounded-lg border border-zinc-700 bg-[#141417] px-3 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="example@upi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-0.5">WhatsApp Group *</label>
                <input
                  type="text"
                  {...register("whatsappLink")}
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-[#141417] px-3 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://chat.whatsapp.com/..."
                />
                {errors.whatsappLink && <p className="mt-1 text-sm text-red-500">{errors.whatsappLink.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-0.5">
                  Full Event Details *
                </label>
                <textarea
                  {...register("details")}
                  rows={4}
                  className="w-full rounded-lg border border-zinc-700 bg-[#141417] px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Complete event information"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= Contacts ================= */}
        <div className="rounded-xl border border-zinc-900 bg-[#18181B] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center text-sm font-semibold text-white">
              <User className="mr-2 h-4 w-4 text-blue-500" />
              Contact Persons
            </h3>
            <button
              type="button"
              onClick={() => append({ name: "", mobile: "", year: "" })}
              className="rounded bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/30"
            >
              Add Contact
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#141417] p-3"
              >
                <div className="grid flex-grow grid-cols-3 gap-2">
                  <input
                    {...register(`contactInfo.${index}.name`)}
                    className="h-9 rounded border border-zinc-700 bg-zinc-900 px-2 text-sm text-white focus:ring-blue-500"
                    placeholder="Name"
                  />
                  <input
                    {...register(`contactInfo.${index}.mobile`)}
                    className="h-9 rounded border border-zinc-700 bg-zinc-900 px-2 text-sm text-white focus:ring-blue-500"
                    placeholder="Mobile"
                  />
                  <input
                    {...register(`contactInfo.${index}.year`)}
                    className="h-9 rounded border border-zinc-700 bg-zinc-900 px-2 text-sm text-white focus:ring-blue-500"
                    placeholder="Year"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-400 hover:text-red-500"
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
