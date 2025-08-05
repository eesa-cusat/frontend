"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-300",
    iconColor: "text-green-600",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-300",
    iconColor: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-300",
    iconColor: "text-yellow-600",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
    iconColor: "text-blue-600",
  },
};

export default function Toast({
  message,
  type,
  duration = 5000,
  onClose,
  isVisible,
}: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const config = toastConfig[type];
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-auto">
      <div
        className={`
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          border rounded-lg p-4 shadow-lg max-w-sm w-full
          transform transition-all duration-300 ease-in-out
          ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        `}
      >
        <div className="flex items-start">
          <Icon className={`w-5 h-5 ${config.iconColor} mr-3 mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 300);
            }}
            className={`ml-3 ${config.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for using toast notifications
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
  }>>([]);

  const showToast = (message: string, type: ToastType, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
          isVisible={true}
        />
      ))}
    </>
  );

  return {
    showToast,
    ToastContainer,
    showSuccess: (message: string, duration?: number) => showToast(message, "success", duration),
    showError: (message: string, duration?: number) => showToast(message, "error", duration),
    showInfo: (message: string, duration?: number) => showToast(message, "info", duration),
    showWarning: (message: string, duration?: number) => showToast(message, "warning", duration),
  };
}
