"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { membersApi, eventsApi, usersApi } from "@/services/api";
import {
  Users,
  UserCheck,
  Calendar,
  FileText,
  Plus,
  Activity
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalMembers: number;
  totalEvents: number;
  activeRecruitmentForms: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMembers: 0,
    totalEvents: 0,
    activeRecruitmentForms: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  type RecentActivityItem = { type: 'user' | 'member'; title: string; time: string };
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersResponse, membersResponse, eventsResponse] = await Promise.all([
        usersApi.getAllUsers().catch(() => ({ data: { users: [] } })),
        membersApi.getAllMembers().catch(() => ({ data: { members: [] } })),
        eventsApi.getAllEvents().catch(() => ({ data: { events: [] } })),
      ]);

      type SimpleUser = { name: string; createdAt: string };
      type SimpleMember = { name: string; createdAt: string };
      type SimpleEvent = { is_upcoming: boolean };

      const users = (usersResponse.data?.users as SimpleUser[]) || [];
      const members = (membersResponse.data?.members as SimpleMember[] | { members: SimpleMember[] }) || [] as unknown as SimpleMember[];
      const membersArray: SimpleMember[] = Array.isArray(members)
        ? members
        : ((members as { members: SimpleMember[] })?.members || []);
      const events = (eventsResponse.data?.events as SimpleEvent[]) || [];

      setStats({
        totalUsers: users.length,
        totalMembers: membersArray.length,
        totalEvents: events.length,
        activeRecruitmentForms: 0,
      });

      const recentItems: RecentActivityItem[] = [
        ...users.slice(-3).map((u): RecentActivityItem => ({
          type: 'user',
          title: `New user: ${u.name}`,
          time: new Date(u.createdAt).toLocaleDateString(),
        })),
        ...membersArray.slice(-2).map((m): RecentActivityItem => ({
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
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
    iconColor,
    onClick
  }: {
    title: string;
    value: number;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    iconColor: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`rounded-lg bg-[#18181B] border border-zinc-900 p-6 shadow-sm border-l-4 ${color} ${onClick ? 'cursor-pointer hover:shadow-md hover:border-zinc-700 transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {isLoading ? "..." : value}
          </p>
        </div>
        <div className={`rounded-full ${bgColor} p-3`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-zinc-400">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="border-l-blue-500"
            bgColor="bg-blue-500/20"
            iconColor="text-blue-400"
            onClick={() => router.push("/admin/users")}
          />
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={UserCheck}
            color="border-l-green-500"
            bgColor="bg-green-500/20"
            iconColor="text-green-400"
            onClick={() => router.push("/admin/members")}
          />
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            color="border-l-purple-500"
            bgColor="bg-purple-500/20"
            iconColor="text-purple-400"
            onClick={() => router.push("/admin/events")}
          />
          <StatCard
            title="Active R-Forms"
            value={stats.activeRecruitmentForms}
            icon={FileText}
            color="border-l-pink-500"
            bgColor="bg-pink-500/20"
            iconColor="text-pink-400"
            onClick={() => router.push("/admin/recruitment/create")}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="rounded-lg bg-[#18181B] border border-zinc-900 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/admin/events/add")}
                className="w-full flex items-center justify-between rounded-lg border border-zinc-800 p-4 hover:bg-[#141417] transition-colors"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-500/20 p-2 mr-3">
                    <Plus className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Create New Event</p>
                    <p className="text-sm text-zinc-500">Add a new event to the system</p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => router.push("/admin/members/add")}
                className="w-full flex items-center justify-between rounded-lg border border-zinc-800 p-4 hover:bg-[#141417] transition-colors"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-green-500/20 p-2 mr-3">
                    <Plus className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Add New Member</p>
                    <p className="text-sm text-zinc-500">Add a team member</p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => router.push("/admin/events")}
                className="w-full flex items-center justify-between rounded-lg border border-zinc-800 p-4 hover:bg-[#141417] transition-colors"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-500/20 p-2 mr-3">
                    <FileText className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">View All Events</p>
                    <p className="text-sm text-zinc-500">Manage event registrations</p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-zinc-500"
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
          <div className="rounded-lg bg-[#18181B] border border-zinc-900 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="rounded-full bg-zinc-800 h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                      <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`rounded-full p-2 ${activity.type === 'user' ? 'bg-blue-500/20' : 'bg-green-500/20'
                      }`}>
                      {activity.type === 'user' ? (
                        <Users className={`h-4 w-4 ${activity.type === 'user' ? 'text-blue-400' : 'text-green-400'
                          }`} />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-zinc-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">System Status: All systems operational</h3>
              <p className="mt-1 text-sm text-blue-100">
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
