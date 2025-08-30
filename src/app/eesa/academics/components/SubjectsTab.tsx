import { Scheme, SubjectListItem } from "@/types/common";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";

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

export default function SubjectsTab({
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
      const csrfResponse = await fetch(`${API_BASE_URL}/accounts/auth/csrf/`, {
        credentials: "include",
      });

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
      const csrfResponse = await fetch(`${API_BASE_URL}/accounts/auth/csrf/`, {
        credentials: "include",
      });

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
      const csrfResponse = await fetch(`${API_BASE_URL}/accounts/auth/csrf/`, {
        credentials: "include",
      });

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
              <Button variant="outline" onClick={() => setEditingSubject(null)}>
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
