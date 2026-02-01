"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { eventsApi } from "@/services/api";
import { Event } from "@/types";
import Image from "next/image";
import { EventCardSkeleton } from "@/components/admin/events/EventCardSkeleton";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [loadingParticipants, setLoadingParticipants] = useState<Record<string, boolean>>({});

  // Fetch participant count for a specific event
  const fetchParticipantCount = useCallback(async (eventId: string) => {
    if (loadingParticipants[eventId] || participantCounts[eventId] !== undefined) {
      return; // Already loading or already have data
    }

    setLoadingParticipants(prev => ({ ...prev, [eventId]: true }));
    try {
      const response = await eventsApi.getEventParticipants(eventId);
      if (response.data && response.data.success) {
        const count = response.data.participants ? response.data.participants.length : 0;
        setParticipantCounts(prev => ({ ...prev, [eventId]: count }));
      } else {
        setParticipantCounts(prev => ({ ...prev, [eventId]: 0 }));
      }
    } catch (err: unknown) {
      console.error(`Error fetching participants for event ${eventId}:`, err);
      setParticipantCounts(prev => ({ ...prev, [eventId]: 0 }));
    } finally {
      setLoadingParticipants(prev => ({ ...prev, [eventId]: false }));
    }
  }, [loadingParticipants, participantCounts]);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await eventsApi.getAllEvents();
        if (response.data && response.data.success) {
          const eventsData = response.data.events;
          setEvents(eventsData);

          // Fetch participant counts for all events
          eventsData.forEach((event: Event) => {
            fetchParticipantCount(event._id);
          });
        } else {
          setError("Failed to fetch events data");
        }
      } catch (err: unknown) {
        console.error("Error fetching events:", err);
        const errorMessage = err instanceof Error && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "An error occurred while fetching events";
        setError(errorMessage || "An error occurred while fetching events");
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [fetchParticipantCount]);

  // Filter events based on search query and active filter
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase());

    // If active filter is 'all', return all events that match the search
    if (activeFilter === "all") {
      return matchesSearch;
    }

    // Filter by upcoming/past status
    if (activeFilter === "upcoming") {
      return matchesSearch && event.is_upcoming;
    } else if (activeFilter === "past") {
      return matchesSearch && !event.is_upcoming;
    } else if (activeFilter === "registration_open") {
      return matchesSearch && event.registration_open;
    }

    // Filter by category
    const matchesFilter = event.category.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Function to format date
  const formatDate = (dateString: string) => {
    // The API returns date as "13th September 2025" format, so we'll display it as is
    return dateString;
  };

  // Function to format time
  const formatTime = (timeString: string) => {
    // The API returns time as "09:00 AM to 05:00 PM" format, so we'll display it as is
    return timeString;
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await eventsApi.deleteEvent(id);
      if (response.data && response.data.success) {
        setEvents(events.filter((event) => event._id !== id));
        toast.success("Event deleted successfully");
      } else {
        toast.error("Failed to delete event");
      }
    } catch (err: unknown) {
      console.error("Error deleting event:", err);
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Failed to delete event";
      toast.error(errorMessage || "Failed to delete event");
    }
  };

  const [togglingRegIds, setTogglingRegIds] = useState<Record<string, boolean>>({});

  const handleToggleRegistration = async (eventId: string) => {
    const ev = events.find((e) => e._id === eventId);
    if (!ev) return;
    const next = !ev.registration_open;

    // Optimistic update
    setTogglingRegIds((p) => ({ ...p, [eventId]: true }));
    setEvents((prev) => prev.map((e) => (e._id === eventId ? { ...e, registration_open: next } : e)));

    try {
      const res = await eventsApi.updateEvent(eventId, { registration_open: next });
      if (!(res.data && res.data.success)) {
        throw new Error(res.data?.message || 'Failed to toggle registration');
      }
      toast.success(`Registration ${next ? 'opened' : 'closed'}`);
    } catch (err: unknown) {
      console.error('Toggle registration failed:', err);
      // rollback
      setEvents((prev) => prev.map((e) => (e._id === eventId ? { ...e, registration_open: !next } : e)));
      const msg = err instanceof Error && 'message' in err ? err.message : 'Failed to toggle registration';
      toast.error(msg);
    } finally {
      setTogglingRegIds((p) => {
        const c = { ...p };
        delete c[eventId];
        return c;
      });
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (event: Event) => {
    if (event.is_upcoming) {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  // Get unique categories and statuses for filtering
  const categories = [...new Set(events.map((event) => event.category))];
  const filters = [
    "all",
    "upcoming",
    "past",
    "registration_open",
    ...categories
  ];

  // Function to refresh events
  const refreshEvents = () => {
    setIsLoading(true);
    eventsApi
      .getAllEvents()
      .then((response) => {
        if (response.data && response.data.success) {
          const eventsData = response.data.events;
          setEvents(eventsData);

          // Refresh participant counts for all events
          setParticipantCounts({});
          setLoadingParticipants({});
          eventsData.forEach((event: Event) => {
            fetchParticipantCount(event._id);
          });

          toast.success("Events refreshed successfully");
        } else {
          toast.error("Failed to refresh events");
        }
      })
      .catch((err) => {
        console.error("Error refreshing events:", err);
        toast.error("Failed to refresh events");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center px-3">
            <h1 className="text-2xl font-semibold text-gray-800">Events</h1>
            <span className="ml-4 text-sm shadow-md text-gray-500 border border-gray-200 p-1 px-2 rounded-full bg-white">
              Total: {filteredEvents.length} events
            </span>
          </div>
          <div className="flex gap-2">
            <button
              aria-label="Refresh events"
              onClick={refreshEvents}
              className="ml-4 flex items-center justify-center rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={() => router.push('/admin/events/add')}
              className="flex items-center rounded-full bg-indigo-600 px-8 py-2.5 text-[16px] text-white shadow-sm hover:bg-indigo-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Event
            </button>
          </div>
        </div>

        <div className="flex justify-between gap-2 border px-2 bg-white py-2 rounded-full shadow-md">
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full text-black px-3 py-1 text-sm capitalize ${activeFilter === filter
                  ? "bg-indigo-100 text-indigo-800 font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {filter === "all" ? "All Events" : filter === "registration_open" ? "Registration Open" : filter}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=" rounded-full bg-gray-100  text-black shadow-sm px-4 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
      </div>

      <div className="space-y-6">
        {error ? (
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
              <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading events</h3>
              <p className="mt-1 text-sm text-red-500">{error}</p>
              <button
                onClick={refreshEvents}
                className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || activeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating a new event"}
              </p>
              <button
                onClick={() => router.push('/admin/events/add')}
                className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Event
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <div
                onClick={() => router.push(`/admin/events/edit/${event._id}`)}
                key={event._id}
                className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* ================= Banner ================= */}
                <div className="relative h-52 w-full overflow-hidden">
                  {event.eventBanner?.url ? (
                    <Image
                      src={event.eventBanner.url}
                      alt={event.name}
                      width={400}
                      height={208}
                      unoptimized
                      priority={false}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 bg-gray-100"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
                      <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Status */}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeColor(event)}`}>
                      {event.is_upcoming ? "Upcoming" : "Past"}
                    </span>
                    {event.registration_open && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                        Reg Open
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* ================= Content ================= */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="mb-1 line-clamp-2 text-lg font-bold text-gray-900">
                    {event.name}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                    {event.description}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {/* Date */}
                    <div className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium">{formatDate(event.eventDate)}</div>
                        <div className="text-xs text-gray-500">{formatTime(event.eventTime)}</div>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="truncate">{event.venue}</span>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
                      </svg>

                      {loadingParticipants[event._id] ? (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-3 w-3 animate-spin rounded-full border-b border-t border-indigo-600" />
                          Loading...
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className="font-medium">
                            {participantCounts[event._id] ?? 0} participants
                          </span>
                          {event.registrationFee && (
                            <span className="ml-2 text-xs text-green-600">
                              ₹{event.registrationFee}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= Actions ================= */}
                  <div className="mt-5 flex flex-col gap-2">
                    {/* Primary */}
                    <div className="flex gap-2 justify-baseline items-center">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/events/${event._id}`);
                        }}
                        className="w-1/2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        View Participants
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRegistration(event._id);
                        }}
                        disabled={!!togglingRegIds[event._id]}
                        className="w-1/2 rounded-md bg-yellow-500 px-3 py-2 text-white hover:bg-yellow-600"
                        title="Toggle Registration"
                      >
                        {event.registration_open ? "Close Registration" : "Open Registration"}
                      </button>
                    </div>

                    {/* Secondary */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchParticipantCount(event._id);
                        }}
                        disabled={loadingParticipants[event._id]}
                        className="rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                        title="Refresh"
                      >
                        ↻
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/events/edit/${event._id}`);
                        }}
                        className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event._id);
                        }}
                        className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            ))}
          </div>
        )}
      </div>
    </div>
  );
}
