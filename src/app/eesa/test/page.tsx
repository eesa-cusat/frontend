"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  data?: any;
  error?: string;
}

export default function APITestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const endpoints = [
    { name: 'CSRF Token', url: '/accounts/auth/csrf/', method: 'GET' },
    { name: 'Current User', url: '/accounts/auth/me/', method: 'GET' },
    { name: 'Admin Stats', url: '/accounts/admin/stats/', method: 'GET' },
    { name: 'Events', url: '/events/events/', method: 'GET' },
    { name: 'Academics - Schemes', url: '/academics/schemes/', method: 'GET' },
    { name: 'Academics - Subjects', url: '/academics/subjects/', method: 'GET' },
    { name: 'Academics - Resources', url: '/academics/resources/', method: 'GET' },
    { name: 'Team Members', url: '/people/team-members/', method: 'GET' },
    { name: 'Alumni', url: '/people/alumni/', method: 'GET' },
    { name: 'Careers', url: '/careers/', method: 'GET' },
  ];

  const testEndpoint = async (endpoint: { name: string; url: string; method: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => null);

      return {
        endpoint: endpoint.name,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        data: data,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      } as TestResult;
    } catch (error) {
      return {
        endpoint: endpoint.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Network error',
      } as TestResult;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      results.push(result);
      setTestResults([...results]);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsRunning(false);
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    if (successCount > 0) {
      toast.success(`${successCount} endpoints working`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} endpoints failed`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Testing...' : 'Test All Endpoints'}
            </Button>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded border ${
                      result.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : result.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{result.endpoint}</h3>
                        {result.statusCode && (
                          <p className="text-sm">Status: {result.statusCode}</p>
                        )}
                        {result.error && (
                          <p className="text-sm text-red-600">Error: {result.error}</p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        result.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : result.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.status}
                      </div>
                    </div>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer">View Response</summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
