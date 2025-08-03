"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  User,
  Calendar,
  BookOpen,
  Upload,
  Plus,
  Folder,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

import { Note } from "@/types/api";

export default function LibraryPage() {
  // For demo purposes, hide upload button
  // In production, this would be controlled by staff login
  const isAuthenticated = false;
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScheme, setSelectedScheme] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sortBy, setSortBy] = useState("upload_date");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSchemes, setAvailableSchemes] = useState<any[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<number[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedNoteType, setSelectedNoteType] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [folderView, setFolderView] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  // Fetch available schemes on component mount
  const fetchSchemes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/academics/schemes/`);
      if (!response.ok) throw new Error("Failed to fetch schemes");
      const data = await response.json();
      setAvailableSchemes(data.schemes || []);
    } catch (err) {
      console.error("Error fetching schemes:", err);
    }
  }, [API_BASE_URL]);

  // Fetch available semesters when scheme changes
  const fetchSemesters = useCallback(
    async (schemeId: string) => {
      try {
        if (!schemeId) {
          setAvailableSemesters([]);
          return;
        }
        const response = await fetch(
          `${API_BASE_URL}/academics/semesters/?scheme_id=${schemeId}`
        );
        if (!response.ok) throw new Error("Failed to fetch semesters");
        const data = await response.json();
        setAvailableSemesters(data.semesters || []);
      } catch (err) {
        console.error("Error fetching semesters:", err);
        setAvailableSemesters([]);
      }
    },
    [API_BASE_URL]
  );

  // Fetch available subjects when scheme or semester changes
  const fetchSubjects = useCallback(
    async (schemeId: string, semester: string) => {
      try {
        if (!schemeId || !semester) {
          setAvailableSubjects([]);
          return;
        }
        const response = await fetch(
          `${API_BASE_URL}/academics/subjects/by-scheme-semester/?scheme_id=${schemeId}&semester=${semester}`
        );
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        setAvailableSubjects(data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setAvailableSubjects([]);
      }
    },
    [API_BASE_URL]
  );

  // Load schemes on mount
  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // Fetch semesters when scheme changes
  useEffect(() => {
    if (selectedScheme) {
      fetchSemesters(selectedScheme);
      setSelectedSemester(""); // Reset semester when scheme changes
      setSelectedSubject(""); // Reset subject when scheme changes
    } else {
      setAvailableSemesters([]);
      setSelectedSemester("");
      setSelectedSubject("");
    }
  }, [selectedScheme, fetchSemesters]);

  // Fetch subjects when scheme or semester changes
  useEffect(() => {
    if (selectedScheme && selectedSemester) {
      fetchSubjects(selectedScheme, selectedSemester);
      setSelectedSubject(""); // Reset subject when semester changes
    } else {
      setAvailableSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedScheme, selectedSemester, fetchSubjects]);

  // Fetch notes when filters change
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedScheme) params.append("scheme", selectedScheme);
        if (selectedSemester) params.append("semester", selectedSemester);
        if (selectedSubject) params.append("subject", selectedSubject);
        if (selectedNoteType) params.append("note_type", selectedNoteType);
        if (selectedModule) params.append("module_number", selectedModule);
        if (searchTerm) params.append("search", searchTerm);

        const url = `${API_BASE_URL}/academics/notes/?${params.toString()}`;
        console.log("Fetching notes from:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const fetchedNotes = data.notes || [];
        console.log("Fetched notes:", fetchedNotes.length);
        setNotes(fetchedNotes);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to fetch notes: ${errorMessage}`);
        console.error("Error fetching notes:", err);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [
    selectedScheme,
    selectedSemester,
    selectedSubject,
    selectedNoteType,
    selectedModule,
    searchTerm,
    API_BASE_URL,
  ]);

  // Helper function to group notes by type and module
  const groupNotesByFolders = () => {
    const folders: { [key: string]: Note[] } = {};

    notes.forEach((note) => {
      let folderKey = "";

      if (note.note_type === "module") {
        folderKey = `Module ${note.module_number}`;
      } else if (note.note_type === "pyq") {
        folderKey = "Previous Year Questions";
      } else if (note.note_type === "textbook") {
        folderKey = "Textbooks";
      } else {
        folderKey = "Other";
      }

      if (!folders[folderKey]) {
        folders[folderKey] = [];
      }
      folders[folderKey].push(note);
    });

    return folders;
  };

  const handleDownload = (note: Note) => {
    try {
      if (!note.file) {
        alert("No file is attached to this note.");
        return;
      }

      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = note.file;
      link.download = note.title; // Use title as filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Digital Library
              </h1>
              <p className="text-lg text-gray-600">
                Access and share academic notes with your peers
              </p>
            </div>
            {isAuthenticated && (
              <Link href="/notes/upload">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Notes
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search notes by title, description, subject, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:w-auto w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {isFilterOpen && (
            <div className="border-t pt-4 space-y-4">
              {/* First Row: Scheme, Semester, Subject */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Scheme Filter */}
                <select
                  value={selectedScheme}
                  onChange={(e) => {
                    setSelectedScheme(e.target.value);
                    setSelectedSemester(""); // Reset semester when scheme changes
                    setSelectedSubject(""); // Reset subject when scheme changes
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Schemes</option>
                  {availableSchemes.map((scheme) => (
                    <option key={scheme.id} value={scheme.id.toString()}>
                      Scheme {scheme.year} - {scheme.name}
                    </option>
                  ))}
                </select>

                {/* Semester Filter */}
                <select
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                    setSelectedSubject(""); // Reset subject when semester changes
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedScheme}
                >
                  <option value="">All Semesters</option>
                  {availableSemesters.map((semester) => (
                    <option key={semester} value={semester.toString()}>
                      Semester {semester}
                    </option>
                  ))}
                </select>

                {/* Subject Filter */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedScheme || !selectedSemester}
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id.toString()}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Second Row: Note Type, Module, View Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Note Type Filter */}
                <select
                  value={selectedNoteType}
                  onChange={(e) => setSelectedNoteType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="module">Module Notes</option>
                  <option value="pyq">Previous Year Questions</option>
                  <option value="textbook">Textbooks</option>
                  <option value="other">Other</option>
                </select>

                {/* Module Filter */}
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={
                    selectedNoteType !== "module" && selectedNoteType !== ""
                  }
                >
                  <option value="">All Modules</option>
                  <option value="1">Module 1</option>
                  <option value="2">Module 2</option>
                  <option value="3">Module 3</option>
                  <option value="4">Module 4</option>
                  <option value="5">Module 5</option>
                  <option value="0">Other/General</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFolderView(!folderView)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      folderView
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {folderView ? "List View" : "Folder View"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {notes.length} notes
          </div>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No notes found
            </h3>
            <p className="text-gray-600 mb-6">
              {notes.length === 0
                ? "No notes have been uploaded yet."
                : "Try adjusting your search or filter criteria."}
            </p>
            {isAuthenticated && (
              <Link href="/notes/upload">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload First Note
                </Button>
              </Link>
            )}
          </div>
        ) : folderView &&
          selectedScheme &&
          selectedSemester &&
          selectedSubject ? (
          // Folder View
          <div className="space-y-6">
            {Object.entries(groupNotesByFolders()).map(
              ([folderName, folderNotes]) => (
                <div
                  key={folderName}
                  className="bg-white rounded-lg shadow-sm border"
                >
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Folder className="w-5 h-5 mr-2 text-blue-600" />
                      {folderName}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({folderNotes.length}{" "}
                        {folderNotes.length === 1 ? "note" : "notes"})
                      </span>
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {folderNotes.map((note: Note) => (
                        <div
                          key={note.id}
                          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <FileText className="w-4 h-4 text-gray-500 mt-1" />
                            <div className="flex gap-1">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                {note.subject_details.scheme_details?.name ||
                                  `Scheme ${note.subject_details.scheme_year}`}
                              </span>
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                Sem {note.subject_details.semester}
                              </span>
                            </div>
                          </div>

                          <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                            {note.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {note.subject_details.name} (
                            {note.subject_details.code})
                          </p>

                          {note.description && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                              {note.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>
                              {note.uploaded_by.first_name}{" "}
                              {note.uploaded_by.last_name}
                            </span>
                            {note.is_approved && (
                              <span className="text-green-600">✓ Approved</span>
                            )}
                          </div>

                          <Button
                            onClick={() => handleDownload(note)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            size="sm"
                            disabled={!note.file}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {note.file ? "Download" : "No File"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          // List View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note: Note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        {note.subject_details.scheme_details?.name ||
                          `Scheme ${note.subject_details.scheme_year}`}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        Sem {note.subject_details.semester}
                      </span>
                      {/* Note Type Badge */}
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          note.note_type === "module"
                            ? "bg-purple-100 text-purple-800"
                            : note.note_type === "pyq"
                            ? "bg-orange-100 text-orange-800"
                            : note.note_type === "textbook"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {note.note_type === "module"
                          ? `Module ${note.module_number}`
                          : note.note_type === "pyq"
                          ? "PYQ"
                          : note.note_type === "textbook"
                          ? "Textbook"
                          : "Other"}
                      </span>
                    </div>
                  </div>

                  {/* Title and Subject */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-sm font-medium text-blue-600 mb-3">
                    {note.subject_details.name}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {note.description}
                  </p>

                  {/* Subject Code */}
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                      {note.subject_details.code}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span>
                        {note.uploaded_by.first_name}{" "}
                        {note.uploaded_by.last_name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(note.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        File:{" "}
                        {note.file
                          ? note.file.split("/").pop()
                          : "No file attached"}
                      </span>
                      {note.is_approved && (
                        <span className="text-green-600 text-xs">
                          ✓ Approved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Download Button */}
                  <Button
                    onClick={() => handleDownload(note)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                    size="sm"
                    disabled={!note.file}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {note.file ? "Download" : "No File Available"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
