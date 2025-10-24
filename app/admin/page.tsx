"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { membersApi, eventsApi, usersApi } from "@/services/api";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText,
  Plus,
  TrendingUp,
  Activity
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalMembers: number;
  totalEvents: number;
  upcomingEvents: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMembers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [usersResponse, membersResponse, eventsResponse] = await Promise.all([
        usersApi.getAllUsers().catch(() => ({ data: { users: [] } })),
        membersApi.getAllMembers().catch(() => ({ data: { members: [] } })),
        eventsApi.getAllEvents().catch(() => ({ data: { events: [] } })),
      ]);

      // Calculate stats
      const users = usersResponse.data?.users || [];
      const members = membersResponse.data?.members || [];
      const events = eventsResponse.data?.events || [];

      // Count upcoming events
      const upcomingCount = events.filter((event: any) => event.is_upcoming).length;

      setStats({
        totalUsers: users.length,
        totalMembers: members.length,
        totalEvents: events.length,
        upcomingEvents: upcomingCount,
      });

      // Set recent activity (last 5 items)
      const recentItems = [
        ...users.slice(-3).map((u: any) => ({
          type: 'user',
          title: `New user: ${u.name}`,
          time: new Date(u.createdAt).toLocaleDateString(),
        })),
        ...members.slice(-2).map((m: any) => ({
          type: 'member',
          title: `New member: ${m.name}`,
          time: new Date(m.createdAt).toLocaleDateString(),
        })),
      ].slice(-5);

      setRecentActivity(recentItems);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    bgColor,
    onClick 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
    bgColor: string;
    onClick?: () => void;
  }) => (
    <div 
      onClick={onClick}
      className={`rounded-lg bg-white p-6 shadow-sm border-l-4 ${color} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoading ? "..." : value}
          </p>
        </div>
        <div className={`rounded-full ${bgColor} p-3`}>
          <Icon className={`h-8 w-8 ${color.replace('border-l', 'text')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="border-l-blue-500"
            bgColor="bg-blue-50"
            onClick={() => router.push("/admin/users")}
          />
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={UserCheck}
            color="border-l-green-500"
            bgColor="bg-green-50"
            onClick={() => router.push("/admin/members")}
          />
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            color="border-l-purple-500"
            bgColor="bg-purple-50"
            onClick={() => router.push("/admin/events")}
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={TrendingUp}
            color="border-l-orange-500"
            bgColor="bg-orange-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/admin/events/add")}
                className="w-full flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-indigo-100 p-2 mr-3">
                    <Plus className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Create New Event</p>
                    <p className="text-sm text-gray-500">Add a new event to the system</p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => router.push("/admin/members/add")}
                className="w-full flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add New Member</p>
                    <p className="text-sm text-gray-500">Add a team member</p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => router.push("/admin/events")}
                className="w-full flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-100 p-2 mr-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">View All Events</p>
                    <p className="text-sm text-gray-500">Manage event registrations</p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`rounded-full p-2 ${
                      activity.type === 'user' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {activity.type === 'user' ? (
                        <Users className={`h-4 w-4 ${
                          activity.type === 'user' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">System Status: All systems operational</h3>
              <p className="mt-1 text-sm text-indigo-100">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
