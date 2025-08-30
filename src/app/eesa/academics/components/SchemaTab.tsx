"use client";

import { Scheme } from "@/types/common";
import { useState } from "react";
import toast from "react-hot-toast";
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
import { Edit, Plus, Trash2 } from "lucide-react";
// Schemes Tab Component
export default function SchemesTab({
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleUpdateScheme = async (scheme: Scheme) => {
    try {
      // Get CSRF token first
      const csrfResponse = await fetch(`${API_BASE_URL}/accounts/auth/csrf/`, {
        credentials: "include",
      });

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
      const csrfResponse = await fetch(`${API_BASE_URL}/accounts/auth/csrf/`, {
        credentials: "include",
      });

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
      const csrfResponse = await fetch(`${API_BASE_URL}/accounts/auth/csrf/`, {
        credentials: "include",
      });

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
              <Button variant="outline" onClick={() => setEditingScheme(null)}>
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
