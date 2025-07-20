"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalGuardProps {
  children: React.ReactNode;
  requireApproval?: boolean;
}

export default function ApprovalGuard({
  children,
  requireApproval = true,
}: ApprovalGuardProps) {
  const { user, isAuthenticated, logout } = useAuth();

  // If not authenticated, render children (redirect to login will be handled elsewhere)
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  // Students don't need approval, they're automatically approved
  if (user.role === "student") {
    return <>{children}</>;
  }

  // Tech heads are always approved (admin-created)
  if (user.role === "tech_head") {
    return <>{children}</>;
  }

  // Check if approval is required and user is not approved
  if (requireApproval && !user.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Account Pending Approval
            </h2>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-800">
                    Your {user.role} account is awaiting admin approval.
                  </p>
                  <p className="mt-2 text-sm text-yellow-700">
                    You will receive an email notification once your account has
                    been reviewed and approved by an administrator. This process
                    typically takes 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-600">Account Details:</p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Name:</div>
                  <div className="font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-gray-600">Email:</div>
                  <div className="font-medium">{user.email}</div>
                  <div className="text-gray-600">Role:</div>
                  <div className="font-medium capitalize">{user.role}</div>
                  <div className="text-gray-600">Status:</div>
                  <div className="font-medium text-yellow-600">
                    Pending Approval
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" onClick={logout} className="flex-1">
                  Logout
                </Button>
                <Button
                  variant="default"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is approved or approval not required
  return <>{children}</>;
}
