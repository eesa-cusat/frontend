"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService, AdminStats } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  Users,
  Briefcase,
  LogOut,
  Settings,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const adminPanels = [
  {
    title: "Academics",
    description: "Manage subjects, schemes, notes, and projects",
    icon: BookOpen,
    href: "/eesa/academics",
    group: "academics_team",
    color: "bg-blue-500",
  },
  {
    title: "Events",
    description: "Create and manage events",
    icon: Calendar,
    href: "/eesa/events",
    group: "events_team",
    color: "bg-green-500",
  },
  {
    title: "Careers",
    description: "Manage job opportunities and internships",
    icon: Briefcase,
    href: "/eesa/careers",
    group: "careers_team",
    color: "bg-purple-500",
  },
  {
    title: "People",
    description: "Manage alumni and team members",
    icon: Users,
    href: "/eesa/people",
    group: "people_team",
    color: "bg-orange-500",
  },
];

export default function AdminDashboard() {
  const { user, logout, hasGroupAccess, canAccessAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/accounts/admin/stats/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const adminStats = await response.json();
          setStats(adminStats);
        } else {
          console.error('Failed to load admin stats:', response.status);
          toast.error("Failed to load dashboard statistics");
        }
      } catch (error) {
        console.error("Failed to load admin stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    if (user && canAccessAdmin()) {
      loadStats();
    } else {
      setIsLoading(false);
    }
  }, [user, canAccessAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Check if user can access admin
  if (!user || !canAccessAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the admin panel. Please contact your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/eesa/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accessiblePanels = adminPanels.filter(
    (panel) => user?.is_superuser || hasGroupAccess(panel.group)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EESA Admin Panel</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.first_name || user?.username}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {!isLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Academic Resources</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.academics.resources}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.academics.schemes} schemes, {stats.academics.subjects} subjects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events.total_events}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.events.upcoming_events} upcoming
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Career Opportunities</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.careers.job_opportunities + stats.careers.internship_opportunities}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.careers.job_opportunities} jobs, {stats.careers.internship_opportunities} internships
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">People</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.people.alumni + stats.people.team_members}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.people.alumni} alumni, {stats.people.team_members} team members
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {accessiblePanels.map((panel) => {
            const Icon = panel.icon;
            return (
              <Link key={panel.title} href={panel.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${panel.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{panel.title}</CardTitle>
                        <CardDescription>{panel.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {accessiblePanels.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Access</CardTitle>
              <CardDescription>
                You don't have access to any admin panels. Contact your administrator.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
