"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import {
  AlumniBatchItem,
  AlumniListItem,
  AlumniRegistrationPayload,
  PaginatedResponse,
} from "@/types/api";
import { getImageUrl } from "@/utils/api";

const MAX_IMAGE_SIZE_KB = 300;
const PAGE_SIZE = 12;

const initialFormState: AlumniRegistrationPayload = {
  full_name: "",
  email: "",
  batch: null,
  current_engagement: "working",
  job_title: "",
  current_company: "",
  current_location: "",
  linkedin_profile: "",
  willing_to_mentor: false,
  phone_number: "",
  profile_image: null,
};

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<AlumniListItem[]>([]);
  const [batches, setBatches] = useState<AlumniBatchItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [engagementFilter, setEngagementFilter] = useState<"all" | "working" | "higher_studies" | "other">("all");
  const [mentorFilter, setMentorFilter] = useState<"all" | "yes" | "no">("all");
  const [batchFilter, setBatchFilter] = useState<"all" | string>("all");

  const [formData, setFormData] = useState<AlumniRegistrationPayload>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount]);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const response = await api.alumni.batches({ page_size: 200 });
        const payload = response.data as PaginatedResponse<AlumniBatchItem> | AlumniBatchItem[];
        const batchList = Array.isArray(payload) ? payload : payload.results || [];
        setBatches(batchList);
      } catch {
        setBatches([]);
      }
    };

    loadBatches();
  }, []);

  const loadAlumni = async (pageNumber: number) => {
    setListLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page: pageNumber,
        page_size: PAGE_SIZE,
      };

      if (engagementFilter !== "all") {
        params.current_engagement = engagementFilter;
      }
      if (mentorFilter !== "all") {
        params.willing_to_mentor = mentorFilter === "yes";
      }
      if (batchFilter !== "all") {
        params.batch = Number(batchFilter);
      }

      const response = await api.alumni.list(params);
      const payload = response.data as PaginatedResponse<AlumniListItem>;
      setAlumni(payload.results || []);
      setTotalCount(payload.count || 0);
    } catch {
      setAlumni([]);
      setTotalCount(0);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadAlumni(page);
  }, [page, engagementFilter, mentorFilter, batchFilter]);

  useEffect(() => {
    setPage(1);
  }, [engagementFilter, mentorFilter, batchFilter]);

  const onImageChange = (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, profile_image: null }));
      setImageError(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_KB * 1024) {
      setImageError(`Image must be ${MAX_IMAGE_SIZE_KB}KB or smaller.`);
      setFormData((prev) => ({ ...prev, profile_image: null }));
      return;
    }

    setImageError(null);
    setFormData((prev) => ({ ...prev, profile_image: file }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (imageError) return;

    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      await api.alumni.register({
        ...formData,
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        linkedin_profile: formData.linkedin_profile?.trim() || undefined,
        phone_number: formData.phone_number?.trim() || undefined,
      });

      setMessage("Alumni registration submitted successfully. Your profile will be visible after admin approval.");
      setFormData(initialFormState);
      setPage(1);
      await loadAlumni(1);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ email?: string[]; detail?: string; message?: string }>;
      const apiError =
        axiosErr.response?.data?.email?.[0] ||
        axiosErr.response?.data?.detail ||
        axiosErr.response?.data?.message ||
        "Registration failed. Please check your details and try again.";
      setError(apiError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-[#191A23]">Alumni</h1>
          <p className="text-gray-600 mt-2">
            Meet registered alumni and join the network by submitting your details.
          </p>
          <a
            href="#alumni-register-form"
            className="inline-flex mt-5 px-5 py-2.5 rounded-lg bg-[#191A23] text-[#B9FF66] font-medium"
          >
            Register
          </a>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#191A23]">Registered Alumni</h2>
            <p className="text-sm text-gray-600">{totalCount} total</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">Engagement</label>
              <select
                value={engagementFilter}
                onChange={(e) => setEngagementFilter(e.target.value as typeof engagementFilter)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="all">All</option>
                <option value="working">Working</option>
                <option value="higher_studies">Higher Studies</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ready to mentor</label>
              <select
                value={mentorFilter}
                onChange={(e) => setMentorFilter(e.target.value as typeof mentorFilter)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Batch</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="all">All</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={String(batch.id)}>
                    {batch.batch_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {listLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-600">Loading alumni...</div>
          ) : alumni.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-600">
              No alumni registered yet.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {alumni.map((person) => {
                  const imageUrl = getImageUrl(person.profile_image || undefined);
                  return (
                    <article key={person.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`${person.full_name} profile`}
                            className="h-14 w-14 rounded-full object-cover border border-gray-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-lime-100 text-[#191A23] flex items-center justify-center font-bold">
                            {person.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-[#191A23]">{person.full_name}</h3>
                          <p className="text-sm text-gray-600">{person.email}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-700 space-y-1">
                        <p>
                          <span className="font-medium">Status:</span> {person.current_engagement.replace("_", " ")}
                        </p>
                        {person.current_company && (
                          <p>
                            <span className="font-medium">Company:</span> {person.current_company}
                          </p>
                        )}
                        {person.batch_name && (
                          <p>
                            <span className="font-medium">Batch:</span> {person.batch_name}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>

        <section id="alumni-register-form" className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-[#191A23]">Register as Alumni</h2>
            <p className="text-sm text-gray-600 mt-2">
              Your profile will be reviewed and approved by our admin team before appearing on the public alumni list.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address (optional)</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                required
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Batch *</label>
              <select
                required
                value={formData.batch ? String(formData.batch) : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    batch: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Select batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current Engagement *</label>
              <select
                value={formData.current_engagement}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    current_engagement: e.target.value as AlumniRegistrationPayload["current_engagement"],
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="working">Working</option>
                <option value="higher_studies">Higher Studies</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Job Title (optional)</label>
              <input
                type="text"
                value={formData.job_title || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, job_title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="e.g., Software Engineer, Product Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current Company (optional)</label>
              <input
                type="text"
                value={formData.current_company || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, current_company: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="e.g., Google, Microsoft, Startup Inc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current Location (optional)</label>
              <input
                type="text"
                value={formData.current_location || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, current_location: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="e.g., Bangalore, New York"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn Profile (optional)</label>
              <input
                type="url"
                value={formData.linkedin_profile || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, linkedin_profile: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number (optional)</label>
              <input
                value={formData.phone_number || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Profile Image (optional, max {MAX_IMAGE_SIZE_KB}KB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageChange(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              {imageError && <p className="text-red-600 text-sm mt-1">{imageError}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.willing_to_mentor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    willing_to_mentor: e.target.checked,
                  }))
                }
              />
              Ready to mentor
            </label>

            {message && <p className="text-green-700 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-200">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting || Boolean(imageError)}
              className="px-6 py-2 rounded-lg bg-[#191A23] text-[#B9FF66] disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Register"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
