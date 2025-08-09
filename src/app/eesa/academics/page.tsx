"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Upload,
  Plus,
  Edit,
  Trash2,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Scheme {
  id: number;
  name: string;
  year: number;
  is_active: boolean;
  created_at: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  scheme: {
    id: number;
    name: string;
    year: number;
  };
  semester: number;
  department: string;
  credits: number;
  is_active: boolean;
}

interface SubjectListItem {
  id: number;
  name: string;
  code: string;
  semester: number;
  scheme_name: string;
}

interface Resource {
  id: number;
  title: string;
  description?: string;
  category: string;
  subject: {
    id: number;
    name: string;
    code: string;
    department: string;
    semester: number;
    scheme: {
      id: number;
      name: string;
      year: number;
    };
  };
  module_number: number | null;
  uploaded_by: {
    id: number;
    name: string;
  };
  is_approved?: boolean; // Optional because list endpoint doesn't include it
  file_size_mb: number;
  download_count: number;
  like_count: number;
  is_liked: boolean;
  created_at: string;
  file_url: string | null;
}

export default function AcademicsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "schemes" | "subjects" | "resources" | "upload"
  >("overview");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  // Load saved tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("eesa-academics-tab");
    if (
      savedTab &&
      ["overview", "schemes", "subjects", "resources", "upload"].includes(
        savedTab
      )
    ) {
      setActiveTab(savedTab as typeof activeTab);
    }
  }, []);

  // Save current tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("eesa-academics-tab", activeTab);
  }, [activeTab]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load schemes using the proper API endpoint
      const schemesResponse = await fetch(
        `${API_BASE_URL}/academics/schemes/`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      let schemesData: { results?: Scheme[] } | Scheme[] = [];
      if (schemesResponse.ok) {
        schemesData = await schemesResponse.json();
        const schemesArray = Array.isArray(schemesData)
          ? schemesData
          : schemesData.results || [];
        setSchemes(schemesArray);
      }

      // Load all subjects for proper count and resource filtering
      const allSubjects: Subject[] = [];
      try {
        // First, get all schemes to load subjects from each
        const schemes = Array.isArray(schemesData)
          ? schemesData
          : schemesData.results || [];
        for (const scheme of schemes) {
          for (let semester = 1; semester <= 8; semester++) {
            try {
              const subjectsResponse = await fetch(
                `${API_BASE_URL}/academics/subjects/?scheme=${scheme.id}&semester=${semester}`,
                {
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              if (subjectsResponse.ok) {
                const subjectsData = await subjectsResponse.json();
                const subjectsList = (subjectsData.results ||
                  subjectsData) as SubjectListItem[];

                // Convert to full Subject objects
                for (const subject of subjectsList) {
                  try {
                    const detailResponse = await fetch(
                      `${API_BASE_URL}/academics/subjects/${subject.id}/`,
                      {
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                        },
                      }
                    );
                    if (detailResponse.ok) {
                      const detailedSubject =
                        (await detailResponse.json()) as Subject;
                      allSubjects.push(detailedSubject);
                    }
                  } catch {
                    // Skip if individual fetch fails
                  }
                }
              }
            } catch {
              // Skip if semester fetch fails
            }
          }
        }

        // Remove duplicates based on ID
        const uniqueSubjects = Array.from(
          new Map(allSubjects.map((subject) => [subject.id, subject])).values()
        );

        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error("Error loading all subjects:", error);
        setSubjects([]);
      }

      // Load resources with detailed information including approval status
      const resourcesResponse = await fetch(
        `${API_BASE_URL}/academics/resources/`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (resourcesResponse.ok) {
        const resourcesData = await resourcesResponse.json();
        const resourcesList = resourcesData.results || resourcesData;

        // Fetch detailed info for each resource to get approval status
        // Note: This is needed because the list endpoint doesn't include is_approved field
        const detailedResources = await Promise.all(
          resourcesList.map(async (resource: Omit<Resource, "is_approved">) => {
            try {
              const detailResponse = await fetch(
                `${API_BASE_URL}/academics/resources/${resource.id}/`,
                {
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              if (detailResponse.ok) {
                return await detailResponse.json();
              }
              // Default to approved if we can't fetch details (fallback for public view)
              return { ...resource, is_approved: true };
            } catch {
              return { ...resource, is_approved: true };
            }
          })
        );

        setResources(detailedResources);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(
        "Failed to load data. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Show loading state during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to access the admin panel.
          </p>
          <Link href="/eesa/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Overview Tab Component
  function OverviewTab({
    schemes,
    subjects,
    resources,
  }: {
    schemes: Scheme[];
    subjects: Subject[];
    resources: Resource[];
  }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schemes</CardTitle>
            <CardDescription>Academic schemes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schemes.length}</div>
            <p className="text-sm text-gray-600">Active schemes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Course subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-sm text-gray-600">Total subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Academic resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-sm text-gray-600">Uploaded resources</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Schemes Tab Component
  function SchemesTab({
    schemes,
    onUpdate,
  }: {
    schemes: Scheme[];
    onUpdate: () => void;
  }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
    const [newScheme, setNewScheme] = useState({
      name: "",
      year: new Date().getFullYear(),
    });

    const handleUpdateScheme = async (scheme: Scheme) => {
      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // API call to update scheme
        const response = await fetch(
          `${API_BASE_URL}/academics/schemes/${scheme.id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({
              name: scheme.name,
              year: scheme.year,
              is_active: scheme.is_active,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        toast.success(data.message || "Scheme updated successfully");
        setEditingScheme(null);
        onUpdate();
      } catch (error) {
        console.error("Error updating scheme:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update scheme"
        );
      }
    };

    const handleDeleteScheme = async (schemeId: number) => {
      if (
        !confirm(
          "Are you sure you want to delete this scheme? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // API call to delete scheme
        const response = await fetch(
          `${API_BASE_URL}/academics/schemes/${schemeId}/`,
          {
            method: "DELETE",
            headers: {
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        toast.success("Scheme deleted successfully");
        onUpdate();
      } catch (error) {
        console.error("Error deleting scheme:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete scheme"
        );
      }
    };

    const handleCreate = async () => {
      if (!newScheme.name.trim()) {
        toast.error("Please enter a scheme name");
        return;
      }

      setIsCreating(true);
      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // API call to create scheme
        const response = await fetch(`${API_BASE_URL}/academics/schemes/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({
            name: newScheme.name,
            year: newScheme.year,
          }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        toast.success(data.message || "Scheme created successfully");
        setNewScheme({ name: "", year: new Date().getFullYear() });
        setIsCreating(false);
        onUpdate();
      } catch (error) {
        console.error("Error creating scheme:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create scheme"
        );
        setIsCreating(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Manage Schemes</h2>
          <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            Add Scheme
          </Button>
        </div>

        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="schemeName">Scheme Name</Label>
                <Input
                  id="schemeName"
                  value={newScheme.name}
                  onChange={(e) =>
                    setNewScheme({ ...newScheme, name: e.target.value })
                  }
                  placeholder="e.g., CBCS 2024"
                />
              </div>
              <div>
                <Label htmlFor="schemeYear">Year</Label>
                <Input
                  id="schemeYear"
                  type="number"
                  value={newScheme.year}
                  onChange={(e) =>
                    setNewScheme({
                      ...newScheme,
                      year: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreate}>Create</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {editingScheme && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="editSchemeName">Scheme Name</Label>
                <Input
                  id="editSchemeName"
                  value={editingScheme.name}
                  onChange={(e) =>
                    setEditingScheme({ ...editingScheme, name: e.target.value })
                  }
                  placeholder="e.g., CBCS 2024"
                />
              </div>
              <div>
                <Label htmlFor="editSchemeYear">Year</Label>
                <Input
                  id="editSchemeYear"
                  type="number"
                  value={editingScheme.year}
                  onChange={(e) =>
                    setEditingScheme({
                      ...editingScheme,
                      year: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleUpdateScheme(editingScheme)}>
                  Update
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingScheme(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {schemes.map((scheme) => (
            <Card key={scheme.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-semibold">{scheme.name}</h3>
                  <p className="text-sm text-gray-600">Year: {scheme.year}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingScheme(scheme)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteScheme(scheme.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Subjects Tab Component
  function SubjectsTab({
    schemes,
    onUpdate,
  }: {
    schemes: Scheme[];
    onUpdate: () => void;
  }) {
    const [selectedScheme, setSelectedScheme] = useState<number | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<number>(1);
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [newSubject, setNewSubject] = useState({
      name: "",
      code: "",
      scheme: null as number | null,
      semester: 1,
      department: "Electrical & Electronics Engineering",
      credits: 4,
    });

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

    const loadSubjects = async (scheme: number, semester: number) => {
      setIsLoadingSubjects(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/academics/subjects/?scheme=${scheme}&semester=${semester}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const listData = await response.json();
          const subjectsList = (listData.results ||
            listData) as SubjectListItem[];

          // Fetch detailed info for each subject to get the full scheme object
          const detailedSubjects = await Promise.all(
            subjectsList.map(async (subject: SubjectListItem) => {
              try {
                const detailResponse = await fetch(
                  `${API_BASE_URL}/academics/subjects/${subject.id}/`,
                  {
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
                if (detailResponse.ok) {
                  return (await detailResponse.json()) as Subject;
                }
                // Fallback: create a subject with minimal scheme info
                return {
                  ...subject,
                  scheme: { id: scheme, name: subject.scheme_name, year: 0 },
                  department: "Unknown",
                  credits: 4,
                  is_active: true,
                } as Subject;
              } catch {
                return {
                  ...subject,
                  scheme: { id: scheme, name: subject.scheme_name, year: 0 },
                  department: "Unknown",
                  credits: 4,
                  is_active: true,
                } as Subject;
              }
            })
          );

          setFilteredSubjects(detailedSubjects);
        } else {
          console.error("Failed to load subjects");
          setFilteredSubjects([]);
        }
      } catch (error) {
        console.error("Error loading subjects:", error);
        setFilteredSubjects([]);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    const handleSchemeChange = (schemeId: number) => {
      setSelectedScheme(schemeId);
      if (schemeId && selectedSemester) {
        loadSubjects(schemeId, selectedSemester);
      }
    };

    const handleSemesterChange = (semester: number) => {
      setSelectedSemester(semester);
      if (selectedScheme && semester) {
        loadSubjects(selectedScheme, semester);
      }
    };

    const handleCreateSubject = async () => {
      if (
        !newSubject.name.trim() ||
        !newSubject.code.trim() ||
        !newSubject.scheme
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // API call to create subject
        const response = await fetch(`${API_BASE_URL}/academics/subjects/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({
            name: newSubject.name,
            code: newSubject.code,
            scheme: newSubject.scheme,
            semester: newSubject.semester,
            department: newSubject.department,
            credits: newSubject.credits,
          }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        toast.success(data.message || "Subject created successfully");
        setNewSubject({
          name: "",
          code: "",
          scheme: null,
          semester: 1,
          department: "Electrical & Electronics Engineering",
          credits: 4,
        });
        setIsCreating(false);

        // Reload subjects if we're viewing the same scheme/semester
        if (
          selectedScheme === newSubject.scheme &&
          selectedSemester === newSubject.semester
        ) {
          loadSubjects(selectedScheme, selectedSemester);
        }
        onUpdate();
      } catch (error) {
        console.error("Error creating subject:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create subject"
        );
      }
    };

    const handleUpdateSubject = async (subject: Subject) => {
      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // Validate that subject data is complete
        if (!subject.scheme?.id) {
          toast.error(
            "Subject scheme information is missing. Please refresh and try again."
          );
          return;
        }

        if (!subject.name?.trim() || !subject.code?.trim()) {
          toast.error("Please fill in all required fields");
          return;
        }

        // API call to update subject
        const response = await fetch(
          `${API_BASE_URL}/academics/subjects/${subject.id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({
              name: subject.name,
              code: subject.code,
              scheme: subject.scheme.id,
              semester: subject.semester,
              department: subject.department,
              credits: subject.credits,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        toast.success(data.message || "Subject updated successfully");
        setEditingSubject(null);

        // Reload subjects
        if (selectedScheme && selectedSemester) {
          loadSubjects(selectedScheme, selectedSemester);
        }
        onUpdate();
      } catch (error) {
        console.error("Error updating subject:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update subject"
        );
      }
    };

    const handleDeleteSubject = async (subjectId: number) => {
      if (
        !confirm(
          "Are you sure you want to delete this subject? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // API call to delete subject
        const response = await fetch(
          `${API_BASE_URL}/academics/subjects/${subjectId}/`,
          {
            method: "DELETE",
            headers: {
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        toast.success("Subject deleted successfully");

        // Reload subjects
        if (selectedScheme && selectedSemester) {
          loadSubjects(selectedScheme, selectedSemester);
        }
        onUpdate();
      } catch (error) {
        console.error("Error deleting subject:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete subject"
        );
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Manage Subjects</h2>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {/* Create Subject Form */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Subject</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subjectName">Subject Name</Label>
                  <Input
                    id="subjectName"
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, name: e.target.value })
                    }
                    placeholder="e.g., Engineering Mathematics I"
                  />
                </div>
                <div>
                  <Label htmlFor="subjectCode">Subject Code</Label>
                  <Input
                    id="subjectCode"
                    value={newSubject.code}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, code: e.target.value })
                    }
                    placeholder="e.g., 18MAT11"
                  />
                </div>
                <div>
                  <Label htmlFor="subjectScheme">Scheme</Label>
                  <select
                    id="subjectScheme"
                    className="w-full p-2 border rounded-md"
                    value={newSubject.scheme || ""}
                    onChange={(e) =>
                      setNewSubject({
                        ...newSubject,
                        scheme: Number(e.target.value) || null,
                      })
                    }
                  >
                    <option value="">Select a scheme</option>
                    {schemes.map((scheme) => (
                      <option key={scheme.id} value={scheme.id}>
                        {scheme.name} ({scheme.year})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="subjectSemester">Semester</Label>
                  <select
                    id="subjectSemester"
                    className="w-full p-2 border rounded-md"
                    value={newSubject.semester}
                    onChange={(e) =>
                      setNewSubject({
                        ...newSubject,
                        semester: Number(e.target.value),
                      })
                    }
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                    <option value={7}>Semester 7</option>
                    <option value={8}>Semester 8</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="subjectDepartment">Department</Label>
                  <select
                    id="subjectDepartment"
                    className="w-full p-2 border rounded-md"
                    value={newSubject.department}
                    onChange={(e) =>
                      setNewSubject({
                        ...newSubject,
                        department: e.target.value,
                      })
                    }
                  >
                    <option value="Electrical & Electronics Engineering">
                      Electrical & Electronics Engineering
                    </option>
                    <option value="Electronics & Communication Engineering">
                      Electronics & Communication Engineering
                    </option>
                    <option value="Information Technology Engineering">
                      Information Technology Engineering
                    </option>
                    <option value="Computer Science & Engineering">
                      Computer Science & Engineering
                    </option>
                    <option value="Mechanical Engineering">
                      Mechanical Engineering
                    </option>
                    <option value="Safety & Fire Engineering">
                      Safety & Fire Engineering
                    </option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="subjectCredits">Credits</Label>
                  <Input
                    id="subjectCredits"
                    type="number"
                    value={newSubject.credits}
                    onChange={(e) =>
                      setNewSubject({
                        ...newSubject,
                        credits: Number(e.target.value),
                      })
                    }
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateSubject}>Create</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Subject Form */}
        {editingSubject && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Subject</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editSubjectName">Subject Name</Label>
                  <Input
                    id="editSubjectName"
                    value={editingSubject.name}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Engineering Mathematics I"
                  />
                </div>
                <div>
                  <Label htmlFor="editSubjectCode">Subject Code</Label>
                  <Input
                    id="editSubjectCode"
                    value={editingSubject.code}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        code: e.target.value,
                      })
                    }
                    placeholder="e.g., 18MAT11"
                  />
                </div>
                <div>
                  <Label htmlFor="editSubjectDepartment">Department</Label>
                  <select
                    id="editSubjectDepartment"
                    className="w-full p-2 border rounded-md"
                    value={editingSubject.department}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        department: e.target.value,
                      })
                    }
                  >
                    <option value="Electrical & Electronics Engineering">
                      Electrical & Electronics Engineering
                    </option>
                    <option value="Electronics & Communication Engineering">
                      Electronics & Communication Engineering
                    </option>
                    <option value="Information Technology Engineering">
                      Information Technology Engineering
                    </option>
                    <option value="Computer Science & Engineering">
                      Computer Science & Engineering
                    </option>
                    <option value="Mechanical Engineering">
                      Mechanical Engineering
                    </option>
                    <option value="Safety & Fire Engineering">
                      Safety & Fire Engineering
                    </option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="editSubjectCredits">Credits</Label>
                  <Input
                    id="editSubjectCredits"
                    type="number"
                    value={editingSubject.credits}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        credits: Number(e.target.value),
                      })
                    }
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleUpdateSubject(editingSubject)}>
                  Update
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingSubject(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Subjects</CardTitle>
            <CardDescription>
              Select scheme and semester to view subjects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schemeSelect">Scheme</Label>
                <select
                  id="schemeSelect"
                  className="w-full p-2 border rounded-md"
                  value={selectedScheme || ""}
                  onChange={(e) => handleSchemeChange(Number(e.target.value))}
                >
                  <option value="">Select a scheme</option>
                  {schemes.map((scheme) => (
                    <option key={scheme.id} value={scheme.id}>
                      {scheme.name} ({scheme.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="semesterSelect">Semester</Label>
                <select
                  id="semesterSelect"
                  className="w-full p-2 border rounded-md"
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(Number(e.target.value))}
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                  <option value={3}>Semester 3</option>
                  <option value={4}>Semester 4</option>
                  <option value={5}>Semester 5</option>
                  <option value={6}>Semester 6</option>
                  <option value={7}>Semester 7</option>
                  <option value={8}>Semester 8</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects List */}
        {isLoadingSubjects ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-lg">Loading subjects...</div>
            </CardContent>
          </Card>
        ) : !selectedScheme ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-800">
                Please select a scheme to view subjects
              </p>
            </CardContent>
          </Card>
        ) : filteredSubjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-800">
                No subjects found for the selected scheme and semester
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id}>
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <h3 className="font-semibold">{subject.name}</h3>
                    <p className="text-sm text-gray-600">
                      {subject.code} • Semester {subject.semester} •{" "}
                      {subject.department} • {subject.credits} credits
                    </p>
                    <p className="text-xs text-gray-500">
                      Scheme: {subject.scheme?.name || "N/A"} (
                      {subject.scheme?.year || "N/A"})
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSubject(subject)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Resources Tab Component
  function ResourcesTab({
    subjects,
    schemes,
    resources,
    onUpdate,
  }: {
    subjects: Subject[];
    schemes: Scheme[];
    resources: Resource[];
    onUpdate: () => void;
  }) {
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);

    // Initialize states with localStorage values
    const [selectedCategory, setSelectedCategory] = useState<string>(() => {
      return localStorage.getItem("eesa-filter-category") || "all";
    });
    const [selectedApprovalStatus, setSelectedApprovalStatus] =
      useState<string>(() => {
        return localStorage.getItem("eesa-filter-approval") || "all";
      });
    const [selectedSubject, setSelectedSubject] = useState<string>(() => {
      return localStorage.getItem("eesa-filter-subject") || "all";
    });
    const [selectedScheme, setSelectedScheme] = useState<string>(() => {
      return localStorage.getItem("eesa-filter-scheme") || "all";
    });
    const [selectedSemester, setSelectedSemester] = useState<string>(() => {
      return localStorage.getItem("eesa-filter-semester") || "all";
    });
    const [viewMode, setViewMode] = useState<string>(() => {
      return localStorage.getItem("eesa-filter-viewMode") || "all";
    });

    const [editingResource, setEditingResource] = useState<Resource | null>(
      null
    );
    const [approving, setApproving] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

    // Save filter states to localStorage when they change
    useEffect(() => {
      localStorage.setItem("eesa-filter-category", selectedCategory);
    }, [selectedCategory]);

    useEffect(() => {
      localStorage.setItem("eesa-filter-approval", selectedApprovalStatus);
    }, [selectedApprovalStatus]);

    useEffect(() => {
      localStorage.setItem("eesa-filter-subject", selectedSubject);
    }, [selectedSubject]);

    useEffect(() => {
      localStorage.setItem("eesa-filter-scheme", selectedScheme);
    }, [selectedScheme]);

    useEffect(() => {
      localStorage.setItem("eesa-filter-semester", selectedSemester);
    }, [selectedSemester]);

    useEffect(() => {
      localStorage.setItem("eesa-filter-viewMode", viewMode);
    }, [viewMode]);

    // Get unique values for filters
    // Get unique values for filters - use all subjects, not just those with resources
    const uniqueSubjects = subjects; // Use all subjects from the passed subjects array
    const uniqueSchemes = schemes; // Use all schemes from the passed schemes array

    const filterResources = useCallback(() => {
      let filtered = [...resources];

      if (selectedCategory !== "all") {
        filtered = filtered.filter(
          (resource) => resource.category === selectedCategory
        );
      }

      if (selectedApprovalStatus !== "all") {
        const isApproved = selectedApprovalStatus === "approved";
        filtered = filtered.filter(
          (resource) => (resource.is_approved ?? false) === isApproved
        );
      }

      if (selectedSubject !== "all") {
        const subjectId = parseInt(selectedSubject);
        filtered = filtered.filter(
          (resource) => resource.subject.id === subjectId
        );
      }

      if (selectedScheme !== "all") {
        const schemeId = parseInt(selectedScheme);
        filtered = filtered.filter(
          (resource) => resource.subject.scheme.id === schemeId
        );
      }

      if (selectedSemester !== "all") {
        const semester = parseInt(selectedSemester);
        filtered = filtered.filter(
          (resource) => resource.subject.semester === semester
        );
      }

      // Apply view mode filter
      if (viewMode === "approved") {
        filtered = filtered.filter((resource) => resource.is_approved === true);
      } else if (viewMode === "unapproved") {
        filtered = filtered.filter((resource) => resource.is_approved !== true);
      }

      setFilteredResources(filtered);
    }, [
      resources,
      selectedCategory,
      selectedApprovalStatus,
      selectedSubject,
      selectedScheme,
      selectedSemester,
      viewMode,
    ]);

    useEffect(() => {
      filterResources();
    }, [filterResources]);

    const handleUpdateResource = async (resource: Resource) => {
      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // API call to update resource
        const response = await fetch(
          `${API_BASE_URL}/academics/resources/${resource.id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({
              title: resource.title,
              description: resource.description,
              category: resource.category,
              module_number: resource.module_number,
              is_approved: resource.is_approved,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        toast.success(data.message || "Resource updated successfully");
        setEditingResource(null);
        onUpdate();
      } catch (error) {
        console.error("Error updating resource:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update resource"
        );
      }
    };

    const handleDeleteResource = async (resourceId: number) => {
      if (
        !confirm(
          "Are you sure you want to delete this resource? This action cannot be undone."
        )
      ) {
        return;
      }

      setDeleting(resourceId);
      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // API call to delete resource
        const response = await fetch(
          `${API_BASE_URL}/academics/resources/${resourceId}/`,
          {
            method: "DELETE",
            headers: {
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        toast.success("Resource deleted successfully");
        onUpdate();
      } catch (error) {
        console.error("Error deleting resource:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete resource"
        );
      } finally {
        setDeleting(null);
      }
    };

    const handleApproveResource = async (resourceId: number) => {
      setApproving(resourceId);
      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // Use the toggle-approval endpoint
        const response = await fetch(
          `${API_BASE_URL}/academics/toggle-approval/${resourceId}/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        toast.success(
          data.message || "Resource approval status updated successfully"
        );
        onUpdate();
      } catch (error) {
        console.error("Error updating approval:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update approval"
        );
      } finally {
        setApproving(null);
      }
    };

    // The corrected logic for the View button.
    const handleViewResource = async (resource: Resource) => {
      const fileUrl = resource.file_url || resource.file;
      if (!fileUrl) {
        toast.error("Failed to open resource - no file available");
        return;
      }

      // The download endpoint is the most reliable way to serve files,
      // as it's handled by the backend.
      const downloadUrl = `${API_BASE_URL}/academics/resources/${resource.id}/download/`;

      try {
        const response = await fetch(downloadUrl, {
          method: "GET",
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank");
          // Revoke the object URL to free up memory
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } else {
          throw new Error(`Download failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error opening resource:", error);
        toast.error("Failed to open resource. Attempting direct link.");

        // Fallback: Use the file_url or file directly if the download endpoint fails
        let directUrl = fileUrl;

        // If it's a relative path, construct the full URL from the base domain
        if (!directUrl.startsWith("http")) {
          const baseUrl = API_BASE_URL.replace(/\/api\/?$/, "");
          directUrl = `${baseUrl}${directUrl.startsWith("/") ? "" : "/"}${directUrl}`;
        }

        console.log("Fallback: Opening file URL:", directUrl);
        window.open(directUrl, "_blank");
      }
    };

    const handleUnapproveResource = async (resourceId: number) => {
      setApproving(resourceId);
      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // Use the toggle-approval endpoint (same as approve, it toggles)
        const response = await fetch(
          `${API_BASE_URL}/academics/toggle-approval/${resourceId}/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        toast.success(
          data.message || "Resource approval status updated successfully"
        );
        onUpdate();
      } catch (error) {
        console.error("Error revoking approval:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to revoke approval"
        );
      } finally {
        setApproving(null);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Manage Resources & Verify Notes
          </h2>
        </div>

        {/* Edit Resource Form */}
        {editingResource && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Resource</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="editResourceTitle">Title</Label>
                <Input
                  id="editResourceTitle"
                  value={editingResource.title}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      title: e.target.value,
                    })
                  }
                  placeholder="Resource title"
                />
              </div>
              <div>
                <Label htmlFor="editResourceDescription">Description</Label>
                <Input
                  id="editResourceDescription"
                  value={editingResource.description || ""}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      description: e.target.value,
                    })
                  }
                  placeholder="Resource description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editResourceCategory">Category</Label>
                  <select
                    id="editResourceCategory"
                    className="w-full p-2 border rounded-md"
                    value={editingResource.category}
                    onChange={(e) =>
                      setEditingResource({
                        ...editingResource,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="notes">Notes</option>
                    <option value="textbook">Textbook</option>
                    <option value="pyq">Previous Year Questions</option>
                    <option value="lab">Lab Manual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="editResourceModule">Module</Label>
                  <select
                    id="editResourceModule"
                    className="w-full p-2 border rounded-md"
                    value={editingResource.module_number || ""}
                    onChange={(e) =>
                      setEditingResource({
                        ...editingResource,
                        module_number: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">No specific module</option>
                    <option value={1}>Module 1</option>
                    <option value={2}>Module 2</option>
                    <option value={3}>Module 3</option>
                    <option value={4}>Module 4</option>
                    <option value={5}>Module 5</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="editResourceApproved"
                    checked={editingResource.is_approved}
                    onChange={(e) =>
                      setEditingResource({
                        ...editingResource,
                        is_approved: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="editResourceApproved">Approved</Label>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleUpdateResource(editingResource)}>
                  Update
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingResource(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Controls */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Filter & View Resources
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Comprehensive filtering and verification tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* View Mode Selection */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <Label className="text-lg font-semibold text-gray-700 mb-3 block">
                View Mode
              </Label>
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant={viewMode === "all" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setViewMode("all")}
                  className={`font-medium transition-all duration-200 ${
                    viewMode === "all"
                      ? "bg-blue-600 hover:bg-blue-700 shadow-md"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  All Resources ({resources.length})
                </Button>
                <Button
                  variant={viewMode === "approved" ? "default" : "outline"}
                  size="lg"
                  className={`font-medium transition-all duration-200 ${
                    viewMode === "approved"
                      ? "bg-green-600 hover:bg-green-700 shadow-md"
                      : "border-green-200 hover:border-green-400 text-green-700"
                  }`}
                  onClick={() => setViewMode("approved")}
                >
                  Approved (
                  {resources.filter((r) => r.is_approved === true).length})
                </Button>
                <Button
                  variant={viewMode === "unapproved" ? "default" : "outline"}
                  size="lg"
                  className={`font-medium transition-all duration-200 ${
                    viewMode === "unapproved"
                      ? "bg-orange-600 hover:bg-orange-700 shadow-md"
                      : "border-orange-200 hover:border-orange-400 text-orange-700"
                  }`}
                  onClick={() => setViewMode("unapproved")}
                >
                  Pending Review (
                  {resources.filter((r) => r.is_approved !== true).length})
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <Label className="text-lg font-semibold text-gray-700 mb-4 block">
                Advanced Filters
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="categoryFilter"
                    className="text-sm font-medium text-gray-700"
                  >
                    Category
                  </Label>
                  <select
                    id="categoryFilter"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="notes">Notes</option>
                    <option value="textbook">Textbooks</option>
                    <option value="pyq">Previous Year Questions</option>
                    <option value="regulations">Regulations</option>
                    <option value="syllabus">Syllabus</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="schemeFilter"
                    className="text-sm font-medium text-gray-700"
                  >
                    Scheme
                  </Label>
                  <select
                    id="schemeFilter"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium"
                    value={selectedScheme}
                    onChange={(e) => setSelectedScheme(e.target.value)}
                  >
                    <option value="all">All Schemes</option>
                    {uniqueSchemes.map((scheme) => (
                      <option
                        key={`scheme-${scheme.id}`}
                        value={scheme.id.toString()}
                      >
                        {scheme.name} ({scheme.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="semesterFilter"
                    className="text-sm font-medium text-gray-700"
                  >
                    Semester
                  </Label>
                  <select
                    id="semesterFilter"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                  >
                    <option value="all">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={`semester-${sem}`} value={sem.toString()}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="subjectFilter"
                    className="text-sm font-medium text-gray-700"
                  >
                    Subject
                  </Label>
                  <select
                    id="subjectFilter"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="all">All Subjects</option>
                    {uniqueSubjects.map((subject) => (
                      <option
                        key={`subject-${subject.id}`}
                        value={subject.id.toString()}
                      >
                        {subject.code} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="approvalFilter"
                    className="text-sm font-medium text-gray-700"
                  >
                    Status Filter
                  </Label>
                  <select
                    id="approvalFilter"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium"
                    value={selectedApprovalStatus}
                    onChange={(e) => setSelectedApprovalStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved Only</option>
                    <option value="unapproved">Unapproved Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Resource Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center bg-white p-4 rounded-lg shadow-sm border">
                  <div className="font-bold text-2xl text-blue-600">
                    {filteredResources.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Filtered Results
                  </div>
                </div>
                <div className="text-center bg-white p-4 rounded-lg shadow-sm border">
                  <div className="font-bold text-2xl text-green-600">
                    {
                      filteredResources.filter((r) => r.is_approved === true)
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Approved
                  </div>
                </div>
                <div className="text-center bg-white p-4 rounded-lg shadow-sm border">
                  <div className="font-bold text-2xl text-orange-600">
                    {
                      filteredResources.filter((r) => r.is_approved !== true)
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Pending
                  </div>
                </div>
                <div className="text-center bg-white p-4 rounded-lg shadow-sm border">
                  <div className="font-bold text-2xl text-purple-600">
                    {uniqueSubjects.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Total Subjects
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources List */}
        {filteredResources.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="mx-auto mb-6 w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No resources found
              </h3>
              <p className="text-gray-600 mb-4">
                No resources match your current filter selection.
              </p>
              {viewMode !== "all" && (
                <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg inline-block">
                  💡 Try switching to &ldquo;All Resources&rdquo; view or
                  adjusting your filters to see more results.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredResources.map((resource) => {
              const subject =
                subjects.find((s) => s.id === resource.subject.id) ||
                resource.subject;
              const scheme =
                schemes.find((s) => s.id === subject.scheme?.id) ||
                subject.scheme;
              return (
                <Card
                  key={resource.id}
                  className={`transition-all duration-300 hover:shadow-xl border-l-4 ${
                    resource.is_approved === true
                      ? "border-l-green-500 bg-gradient-to-r from-green-50 to-white shadow-lg"
                      : "border-l-orange-500 bg-gradient-to-r from-orange-50 to-white shadow-lg"
                  }`}
                >
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Header with title and status */}
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="font-bold text-xl text-gray-800">
                            {resource.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            {resource.is_approved === true ? (
                              <span className="px-4 py-2 text-sm bg-green-100 text-green-800 rounded-full border border-green-200 flex items-center gap-2 font-semibold">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                Approved
                              </span>
                            ) : (
                              <span className="px-4 py-2 text-sm bg-orange-100 text-orange-800 rounded-full border border-orange-200 flex items-center gap-2 font-semibold">
                                <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                                Pending Review
                              </span>
                            )}
                            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg capitalize font-medium">
                              {resource.category}
                            </span>
                          </div>
                        </div>

                        {/* Academic Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                              Subject
                            </div>
                            <div className="font-bold text-base text-gray-800">
                              {subject?.code}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {subject?.name}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                              Scheme
                            </div>
                            <div className="font-bold text-base text-gray-800">
                              {scheme?.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {scheme?.year}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                              Semester
                            </div>
                            <div className="font-bold text-base text-gray-800">
                              Semester {subject?.semester}
                            </div>
                          </div>
                        </div>

                        {/* Resource Details */}
                        <div className="mb-4">
                          <div className="flex items-center gap-6 text-base text-gray-700 mb-3 font-medium">
                            <span className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              {resource.uploaded_by?.name || "Unknown"}
                            </span>
                            <span className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8a3 3 0 01-3-3V8a3 3 0 116 0v4a3 3 0 01-3 3z"
                                />
                              </svg>
                              {new Date(
                                resource.created_at
                              ).toLocaleDateString()}
                            </span>
                            {resource.download_count && (
                              <span className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                  />
                                </svg>
                                {resource.download_count} downloads
                              </span>
                            )}
                            {resource.like_count && (
                              <span className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2v0a2 2 0 00-2 2v5m-4 0H4m4 0L4.9 14.1M4 10v10a2 2 0 002 2h2.2"
                                  />
                                </svg>
                                {resource.like_count} likes
                              </span>
                            )}
                            {resource.module_number && (
                              <span className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                  />
                                </svg>
                                Module {resource.module_number}
                              </span>
                            )}
                          </div>
                          {resource.description && (
                            <p className="text-base text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-200">
                              {resource.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Panel */}
                      <div className="flex flex-col space-y-4 ml-8">
                        {/* Primary Actions */}
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleViewResource(resource)}
                            className="text-blue-600 hover:text-white hover:bg-blue-600 border-blue-300 hover:border-blue-600 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            title={
                              resource.file_url
                                ? "View/Download Resource"
                                : "No file available"
                            }
                            disabled={
                              !(resource.file_url || resource.file) ||
                              ((resource.file_url || resource.file)?.trim() === "")
                            }
                          >
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Only
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setEditingResource(resource)}
                            className="text-gray-600 hover:text-white hover:bg-gray-600 border-gray-300 hover:border-gray-600 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Edit Resource"
                          >
                            <Edit className="h-5 w-5 mr-2" />
                            Modify
                          </Button>
                        </div>

                        {/* Approval Actions */}
                        <div className="flex space-x-2">
                          {resource.is_approved !== true ? (
                            <Button
                              size="lg"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 w-full transition-all duration-200 shadow-md hover:shadow-lg"
                              onClick={() => handleApproveResource(resource.id)}
                              disabled={approving === resource.id}
                              title="Approve this resource for public access"
                            >
                              {approving === resource.id ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                  Approving...
                                </div>
                              ) : (
                                <>
                                  <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Approve Resource
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="lg"
                              className="border-orange-300 text-orange-700 hover:bg-orange-600 hover:text-white font-bold px-6 py-3 w-full transition-all duration-200 shadow-md hover:shadow-lg"
                              onClick={() =>
                                handleUnapproveResource(resource.id)
                              }
                              disabled={approving === resource.id}
                              title="Revoke approval and mark for review"
                            >
                              {approving === resource.id ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent mr-2"></div>
                                  Processing...
                                </div>
                              ) : (
                                <>
                                  <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Revoke Approval
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Delete Action */}
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleDeleteResource(resource.id)}
                          disabled={deleting === resource.id}
                          className="border-red-300 text-red-700 hover:bg-red-600 hover:text-white font-bold transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Permanently delete this resource"
                        >
                          {deleting === resource.id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-2"></div>
                              Deleting...
                            </div>
                          ) : (
                            <>
                              <Trash2 className="h-5 w-5 mr-2" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Upload Tab Component
  function UploadTab({
    subjects,
    onUpdate,
  }: {
    subjects: Subject[];
    onUpdate: () => void;
  }) {
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
    const [moduleNumber, setModuleNumber] = useState<number>(1);
    const [title, setTitle] = useState<string>("");
    const [category, setCategory] = useState<string>("notes");
    const [files, setFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFiles(e.target.files);
    };

    const handleUpload = async () => {
      if (!selectedSubject || !files || files.length === 0) {
        toast.error("Please select a subject and at least one file");
        return;
      }

      if (!title.trim()) {
        toast.error("Please enter a title for the resource");
        return;
      }

      setIsUploading(true);
      try {
        // Get CSRF token first
        const csrfResponse = await fetch(
          `${API_BASE_URL}/accounts/auth/csrf/`,
          {
            credentials: "include",
          }
        );

        if (!csrfResponse.ok) {
          throw new Error("Failed to get CSRF token");
        }

        const { csrfToken } = await csrfResponse.json();

        // Upload each file as a separate resource
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("title", title);
          formData.append("description", "Uploaded via admin panel"); // You might want to add an input for this
          formData.append("category", category);
          formData.append("subject", selectedSubject.toString());
          formData.append("module_number", moduleNumber.toString());
          formData.append("file", file);
          formData.append("is_approved", "false"); // Default to unapproved

          const response = await fetch(`${API_BASE_URL}/academics/resources/`, {
            method: "POST",
            headers: {
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: "Unknown error" }));
            throw new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
          }

          return response.json();
        });

        await Promise.all(uploadPromises);
        toast.success(
          `${files.length} file(s) uploaded successfully (pending approval)`
        );

        // Reset form
        setFiles(null);
        setTitle("");
        setSelectedSubject(null);
        setModuleNumber(1);
        setCategory("notes");
        onUpdate();
      } catch (error) {
        console.error("Error uploading files:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to upload files"
        );
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Upload Multiple Files</h2>

        <Card>
          <CardHeader>
            <CardTitle>Upload Notes/Resources</CardTitle>
            <CardDescription>
              Select a subject and module, then upload multiple PDF files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Resource Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter resource title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full p-2 border rounded-md"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="notes">Notes</option>
                <option value="textbook">Textbooks</option>
                <option value="pyq">Previous Year Questions</option>
                <option value="lab">Lab Manuals</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                className="w-full p-2 border rounded-md"
                value={selectedSubject || ""}
                onChange={(e) => setSelectedSubject(Number(e.target.value))}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="module">Module Number</Label>
              <select
                id="module"
                className="w-full p-2 border rounded-md"
                value={moduleNumber}
                onChange={(e) => setModuleNumber(Number(e.target.value))}
              >
                <option value={0}>General/Complete</option>
                <option value={1}>Module 1</option>
                <option value={2}>Module 2</option>
                <option value={3}>Module 3</option>
                <option value={4}>Module 4</option>
                <option value={5}>Module 5</option>
              </select>
            </div>

            <div>
              <Label htmlFor="files">PDF Files</Label>
              <Input
                id="files"
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
              />
              {files && (
                <p className="text-sm text-gray-600 mt-2">
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={
                isUploading || !selectedSubject || !files || !title.trim()
              }
              className="w-full"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <Link href="/eesa">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Academics Panel
                </h1>
                <p className="text-sm text-gray-600">
                  Manage academic resources, schemes, and subjects
                </p>
              </div>
            </div>
            <div className="flex space-x-2 overflow-x-auto whitespace-nowrap pb-2 -mx-4 px-4 sm:p-0 sm:m-0">
              <Button
                variant="outline"
                onClick={() => setActiveTab("overview")}
                className={activeTab === "overview" ? "bg-blue-100" : ""}
              >
                Overview
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("schemes")}
                className={activeTab === "schemes" ? "bg-blue-100" : ""}
              >
                Schemes
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("subjects")}
                className={activeTab === "subjects" ? "bg-blue-100" : ""}
              >
                Subjects
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("resources")}
                className={activeTab === "resources" ? "bg-blue-100" : ""}
              >
                Resources
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("upload")}
                className={activeTab === "upload" ? "bg-blue-100" : ""}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                schemes={schemes}
                subjects={subjects}
                resources={resources}
              />
            )}
            {activeTab === "schemes" && (
              <SchemesTab schemes={schemes} onUpdate={loadData} />
            )}
            {activeTab === "subjects" && (
              <SubjectsTab schemes={schemes} onUpdate={loadData} />
            )}
            {activeTab === "resources" && (
              <ResourcesTab
                subjects={subjects}
                schemes={schemes}
                resources={resources}
                onUpdate={loadData}
              />
            )}
            {activeTab === "upload" && (
              <UploadTab subjects={subjects} onUpdate={loadData} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
