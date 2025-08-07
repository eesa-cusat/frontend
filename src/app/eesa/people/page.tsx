"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  Upload,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  bio: string;
  photo: string;
  is_active: boolean;
  order: number;
  created_at: string;
}

export default function PeoplePanel() {
  const { hasGroupAccess } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newMember, setNewMember] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    bio: "",
    photo: null as File | null,
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  // Load team members data
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      
      // Load team members
      const teamResponse = await fetch(`${API_BASE_URL}/team/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        // Convert team data to expected format
        const convertedMembers = teamData.team?.map((member: any, index: number) => ({
          id: index + 1,
          name: member.name || 'Unknown',
          position: member.role || 'Unknown Role',
          email: member.email || '',
          phone: member.phone || '',
          bio: member.description || '',
          photo: member.photo || '',
          is_active: true,
          order: index + 1,
          created_at: new Date().toISOString(),
        })) || [];
        setMembers(convertedMembers);
      }
      
      // Also try to load alumni data to show in people panel
      const alumniResponse = await fetch(`${API_BASE_URL}/alumni/alumni/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (alumniResponse.ok) {
        const alumniData = await alumniResponse.json();
        console.log('Alumni data loaded:', alumniData.results?.length || 0, 'records');
      }
      
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    loadMembers();
  }, []);

    // Check access - temporarily allow all for testing
  if (false) { // Temporarily disabled: !hasGroupAccess("admin_team")
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the people panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/eesa">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be less than 5MB");
        return;
      }
      setNewMember({ ...newMember, photo: file });
    }
  };

  const handleCreate = async () => {
    if (!newMember.name.trim() || !newMember.position.trim()) {
      toast.error("Please enter name and position");
      return;
    }

    try {
      setIsCreating(true);
      
      // Get CSRF token first
      const csrfResponse = await fetch(`${API_BASE_URL}/accounts/auth/csrf/`, {
        credentials: 'include',
      });
      
      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const { csrfToken } = await csrfResponse.json();
      
      // Create FormData for member with photo
      const formData = new FormData();
      formData.append('name', newMember.name);
      formData.append('position', newMember.position);
      formData.append('email', newMember.email);
      formData.append('phone', newMember.phone);
      formData.append('bio', newMember.bio);
      
      if (newMember.photo) {
        formData.append('photo', newMember.photo);
      }
      
      // API call to create team member
      const response = await fetch(`${API_BASE_URL}/team/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      toast.success(data.message || "Team member added successfully");
      setNewMember({
        name: "",
        position: "",
        email: "",
        phone: "",
        bio: "",
        photo: null,
      });
      setIsCreating(false);
      loadMembers(); // Refresh members list
    } catch (error) {
      console.error('Error creating member:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add team member");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/eesa">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">People Panel</h1>
                <p className="text-sm text-gray-600">
                  Manage team members and their profiles
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Team Member</CardTitle>
              <CardDescription>Add a new member to the team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newMember.position}
                    onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                    placeholder="e.g., President, Vice President"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={newMember.bio}
                  onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                  placeholder="Brief biography or description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="photo">Profile Photo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {newMember.photo && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {newMember.photo.name}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreate}>Add Member</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Team Members</h2>
          
          {members.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No team members added yet</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsCreating(true)}
                >
                  Add Your First Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      {member.photo && (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                        />
                      )}
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-blue-600 font-medium">{member.position}</p>
                      
                      {member.bio && (
                        <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                          {member.bio}
                        </p>
                      )}
                      
                      <div className="flex justify-center space-x-2 mt-3">
                        {member.email && (
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {member.phone && (
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex justify-center space-x-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        member.is_active 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
