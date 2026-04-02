"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { AlumniCsvSyncResult } from "@/types/api";

export default function AlumniManagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AlumniCsvSyncResult | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.alumni.bulkSyncCsv(file);
      setResult(response.data);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const apiError = axiosErr.response?.data?.error || "CSV sync failed. Please check your file and try again.";
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#191A23] mb-2">Alumni CSV Sync</h1>
        <p className="text-gray-600 mb-6">
          Upload periodic alumni sheets. The backend updates only changed records using `reg_no`.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <p className="text-sm text-gray-700">
            Required columns: <code>reg_no, full_name, current_engagement, willing_to_mentor</code>
          </p>
          <p className="text-sm text-gray-700">
            Optional columns: <code>linkedin_profile, phone_number</code>
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-[#191A23] text-[#B9FF66] disabled:opacity-70"
          >
            {loading ? "Syncing..." : "Sync CSV"}
          </button>

          {result && (
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm space-y-1">
              <p>Created: {result.created}</p>
              <p>Updated: {result.updated}</p>
              <p>Unchanged: {result.unchanged}</p>
              {result.errors?.length > 0 && (
                <div>
                  <p className="font-medium text-red-700">Errors:</p>
                  <ul className="list-disc ml-5">
                    {result.errors.map((item, idx) => (
                      <li key={idx} className="text-red-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
