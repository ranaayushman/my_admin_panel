"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { eventsApi } from "@/services/api";
import { Event } from "@/types";
import Image from "next/image";

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
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Events</h1>
            <button
              onClick={refreshEvents}
              className="ml-4 flex items-center rounded-md bg-white px-2 py-1 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
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
              Refresh
            </button>
            <span className="ml-4 text-sm text-gray-500">
              Total: {filteredEvents.length} events
            </span>
            <button
              onClick={() => router.push('/admin/events/add')}
              className="ml-4 flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-indigo-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
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
          <div className="w-64">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-1 text-sm capitalize ${
                activeFilter === filter
                  ? "bg-indigo-100 text-indigo-800 font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter === "all" ? "All Events" : filter === "registration_open" ? "Registration Open" : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Event
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Date & Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Venue
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Participants
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-red-500"
                >
                  {error}
                </td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No events found
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        {event.eventBanner?.url ? (
                          <Image
                            className="h-12 w-12 rounded-lg object-cover"
                            src={event.eventBanner.url}
                            alt={event.name}
                            width={48}
                            height={48}
                            unoptimized={true}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-gray-500">
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {event.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.description.length > 60
                            ? `${event.description.substring(0, 60)}...`
                            : event.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div>{formatDate(event.eventDate)}</div>
                    <div className="text-xs text-gray-400">
                      {formatTime(event.eventTime)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {event.venue}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-purple-100 px-2 text-xs font-semibold leading-5 text-purple-800">
                      {event.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(
                        event
                      )}`}
                    >
                      {event.is_upcoming ? 'Upcoming' : 'Past'}
                    </span>
                    {event.registration_open && (
                      <span className="ml-1 inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        Registration Open
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      {loadingParticipants[event._id] ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
                          <span className="ml-2 text-xs">Loading...</span>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-gray-900">
                            {participantCounts[event._id] !== undefined ? participantCounts[event._id] : 0} participants
                          </div>
                          <div className="text-xs text-gray-500">
                            {event.registration_open && (
                              <span className="text-green-600">Registration Open</span>
                            )}
                            {event.registrationFee && (
                              <span className="text-gray-500"> • Fee: ₹{event.registrationFee}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/admin/events/${event._id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => fetchParticipantCount(event._id)}
                        className="text-green-600 hover:text-green-900"
                        disabled={loadingParticipants[event._id]}
                        title="Refresh participant count"
                      >
                        Participants
                      </button>
                      <button
                        onClick={() => router.push(`/admin/events/edit/${event._id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
