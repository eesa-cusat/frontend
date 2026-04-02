"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { AlumniCsvSyncResult } from "@/types/api";

export default function AlumniManagePage() {
  const [activeTab, setActiveTab] = useState<"import" | "sync">("import");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AlumniCsvSyncResult | null>(null);

  const handleImport = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.alumni.bulkImportCsv(file);
      setResult(response.data);
      setFile(null);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const apiError = axiosErr.response?.data?.error || "CSV import failed. Please check your file and try again.";
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
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
      setFile(null);
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
        <h1 className="text-3xl font-bold text-[#191A23] mb-2">Alumni Management</h1>
        <p className="text-gray-600 mb-6">
          Import or sync alumni records from CSV files.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => {
              setActiveTab("import");
              setError(null);
              setResult(null);
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "import"
                ? "border-[#191A23] text-[#191A23]"
                : "border-transparent text-gray-600 hover:text-[#191A23]"
            }`}
          >
            Bulk Import
          </button>
          <button
            onClick={() => {
              setActiveTab("sync");
              setError(null);
              setResult(null);
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "sync"
                ? "border-[#191A23] text-[#191A23]"
                : "border-transparent text-gray-600 hover:text-[#191A23]"
            }`}
          >
            Sync Records
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {activeTab === "import" && (
            <>
              <div className="space-y-2 mb-4">
                <h2 className="font-semibold text-[#191A23]">Bulk Import Alumni</h2>
                <p className="text-sm text-gray-600">Add new alumni records from CSV</p>
              </div>
              <p className="text-sm text-gray-700">
                Required columns: <code className="bg-gray-100 px-2 py-1 rounded">full_name, email, batch_year_range</code>
              </p>
              <p className="text-sm text-gray-700">
                Optional columns: <code className="bg-gray-100 px-2 py-1 rounded">phone_number, linkedin_profile, job_title, current_company, current_location, employment_status, current_engagement, willing_to_mentor</code>
              </p>
            </>
          )}

          {activeTab === "sync" && (
            <>
              <div className="space-y-2 mb-4">
                <h2 className="font-semibold text-[#191A23]">Sync Alumni Records</h2>
                <p className="text-sm text-gray-600">Update existing alumni records by email</p>
              </div>
              <p className="text-sm text-gray-700">
                Required columns: <code className="bg-gray-100 px-2 py-1 rounded">email, full_name, batch_year_range</code>
              </p>
              <p className="text-sm text-gray-700">
                Optional columns: <code className="bg-gray-100 px-2 py-1 rounded">phone_number, linkedin_profile, job_title, current_company, current_location, employment_status, current_engagement, willing_to_mentor</code>
              </p>
            </>
          )}

          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError(null);
            }}
            className="block w-full text-sm border border-gray-300 rounded-lg p-2"
          />

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            onClick={activeTab === "import" ? handleImport : handleSync}
            disabled={loading || !file}
            className="px-6 py-2 rounded-lg bg-[#191A23] text-[#B9FF66] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (activeTab === "import" ? "Importing..." : "Syncing...") : (activeTab === "import" ? "Import CSV" : "Sync CSV")}
          </button>

          {result && (
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm space-y-2">
              {activeTab === "import" && (
                <>
                  <p className="font-semibold text-[#191A23]">Import Results</p>
                  <p><span className="font-medium">Successfully imported:</span> {result.successful_imports || 0}</p>
                  <p><span className="font-medium">Total rows processed:</span> {result.total_rows || 0}</p>
                </>
              )}
              {activeTab === "sync" && (
                <>
                  <p className="font-semibold text-[#191A23]">Sync Results</p>
                  <p><span className="font-medium">Created:</span> {result.created || 0}</p>
                  <p><span className="font-medium">Updated:</span> {result.updated || 0}</p>
                  <p><span className="font-medium">Unchanged:</span> {result.unchanged || 0}</p>
                </>
              )}
              {result.errors?.length > 0 && (
                <div>
                  <p className="font-medium text-red-700 mt-2">Errors ({result.errors.length}):</p>
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
