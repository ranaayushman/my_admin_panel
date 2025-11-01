"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { eventsApi } from "@/services/api";
import { fileToBase64, validateImageFile } from '@/utils/file';
import type { SubmitHandler } from "react-hook-form";


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


  const onSubmit: SubmitHandler<EventFormData> = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      // Build JSON payload. Convert images to base64 if provided.
  const payload: unknown = { ...data };
  const payloadObj = payload as Record<string, unknown>;

  // Convert booleans to actual booleans (react-hook-form may give strings)
  payloadObj.is_upcoming = Boolean(data.is_upcoming);
  payloadObj.registration_open = Boolean(data.registration_open);

      // Contact info is already an array

      // Validate & convert images
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
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Add New Event</h1>
          <button
            onClick={() => router.push("/admin/events")}
            className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow form-container">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="custom-select">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                {...register("category")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                style={{ zIndex: 1000, position: 'relative' }}
              >
                <option value="">Select Category</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="hackathon">Hackathon</option>
                <option value="meetup">Meetup</option>
                <option value="conference">Conference</option>
                <option value="networking">Networking</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>

            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
                Event Date *
              </label>
              <input
                type="text"
                id="eventDate"
                placeholder="e.g., 15th January 2024"
                {...register("eventDate")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              {errors.eventDate && <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>}
            </div>

            <div>
              <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700">
                Event Time *
              </label>
              <input
                type="text"
                id="eventTime"
                placeholder="e.g., 10:00 AM to 4:00 PM"
                {...register("eventTime")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              {errors.eventTime && <p className="mt-1 text-sm text-red-600">{errors.eventTime.message}</p>}
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                Venue *
              </label>
              <input
                type="text"
                id="venue"
                {...register("venue")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              {errors.venue && <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>}
            </div>

            <div>
              <label htmlFor="registrationFee" className="block text-sm font-medium text-gray-700">
                Registration Fee
              </label>
              <input
                type="text"
                id="registrationFee"
                placeholder="e.g., 100"
                {...register("registrationFee")}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="upiID" className="block text-sm font-medium text-gray-700">
                UPI ID
              </label>
              <input
                type="text"
                id="upiID"
                placeholder="e.g., gdg@upi"
                {...register("upiID")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status Checkboxes */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_upcoming"
                {...register("is_upcoming")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is_upcoming" className="ml-2 block text-sm text-gray-900">
                Is Upcoming Event
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="registration_open"
                {...register("registration_open")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="registration_open" className="ml-2 block text-sm text-gray-900">
                Registration Open
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          {/* Details */}
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700">
              Event Details *
            </label>
            <textarea
              id="details"
              rows={5}
              {...register("details")}
              className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
            {errors.details && <p className="mt-1 text-sm text-red-600">{errors.details.message}</p>}
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="eventBanner" className="block text-sm font-medium text-gray-700">
                Event Banner
              </label>
              <input
                type="file"
                id="eventBanner"
                accept="image/*"
                onChange={(e) => setEventBanner(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="poster" className="block text-sm font-medium text-gray-700">
                Event Poster
              </label>
              <input
                type="file"
                id="poster"
                accept="image/*"
                onChange={(e) => setPoster(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Contact Information</label>
              <button
                type="button"
                onClick={() => append({ name: "", mobile: "", year: "" })}
                className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
              >
                Add Contact
              </button>
            </div>
            
            <div className="mt-2 space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      {...register(`contactInfo.${index}.name`)}
                      className="block w-full rounded-md border text-black border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                    {errors.contactInfo?.[index]?.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.contactInfo[index]?.name?.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Mobile"
                      {...register(`contactInfo.${index}.mobile`)}
                      className="block w-full rounded-md border text-black border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                    {errors.contactInfo?.[index]?.mobile && (
                      <p className="mt-1 text-xs text-red-600">{errors.contactInfo[index]?.mobile?.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Year"
                      {...register(`contactInfo.${index}.year`)}
                      className="block w-full rounded-md border text-black border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                    {errors.contactInfo?.[index]?.year && (
                      <p className="mt-1 text-xs text-red-600">{errors.contactInfo[index]?.year?.message}</p>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="w-full rounded-md bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/admin/events")}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
