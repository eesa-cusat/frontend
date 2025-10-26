"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  UserPlus,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  CreditCard,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: RegistrationFormData) => Promise<void>;
  eventTitle: string;
  isRegistering: boolean;
  isPaidEvent?: boolean;
  paymentQrCode?: string;
  paymentUpiId?: string;
  registrationFee?: string;
  paymentInstructions?: string;
  isFoodAvailable?: boolean;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  mobile_number: string;
  participant_type?: 'student' | 'professional';
  // Student fields
  institution?: string;
  department?: string;
  year_of_study?: string;
  // Professional fields
  organization?: string;
  designation?: string;
  // Optional fields
  food_preference?: 'veg' | 'non_veg' | '';
  special_needs?: string;
  payment_reference_id?: string;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  eventTitle,
  isRegistering,
  isPaidEvent = false,
  paymentQrCode,
  paymentUpiId,
  registrationFee,
  paymentInstructions,
  isFoodAvailable = false,
}: RegistrationModalProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    email: "",
    mobile_number: "",
    participant_type: 'student',
    institution: "",
    department: "",
    year_of_study: "",
    organization: "",
    designation: "",
    food_preference: "",
    special_needs: "",
    payment_reference_id: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = "Mobile number is required";
    } else if (!/^\+?[\d\s-()]{8,15}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = "Please enter a valid mobile number";
    }

    // Conditional validation based on participant type
    if (formData.participant_type === 'student') {
      if (!formData.institution?.trim()) {
        newErrors.institution = "Institution/College name is required";
      }
      if (!formData.department?.trim()) {
        newErrors.department = "Department is required";
      }
      if (!formData.year_of_study?.trim()) {
        newErrors.year_of_study = "Year of study is required";
      }
    } else if (formData.participant_type === 'professional') {
      if (!formData.organization?.trim()) {
        newErrors.organization = "Organization name is required";
      }
      if (!formData.designation?.trim()) {
        newErrors.designation = "Job designation is required";
      }
    }

    // Payment Reference required for paid events
    if (isPaidEvent && !formData.payment_reference_id?.trim()) {
      newErrors.payment_reference_id = "Payment Reference ID is required for paid events";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: "",
        email: "",
        mobile_number: "",
        participant_type: 'student',
        institution: "",
        department: "",
        year_of_study: "",
        organization: "",
        designation: "",
        food_preference: "",
        special_needs: "",
        payment_reference_id: "",
      });
      setErrors({});
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleInputChange = (
    field: keyof RegistrationFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#B9FF66]/30 shadow-2xl rounded-2xl max-w-md w-full relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#B9FF66] to-[#A8EE55] p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#191A23] rounded-xl flex items-center justify-center mr-3">
                <UserPlus className="w-6 h-6 text-[#B9FF66]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#191A23]">
                  Event Registration
                </h2>
                <p className="text-[#191A23]/70 text-sm">
                  Join us for this amazing event!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isRegistering}
              className="text-[#191A23]/60 hover:text-[#191A23] transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Event Info */}
        <div className="p-4 bg-[#F3F3F3] border-b border-gray-200 flex-shrink-0">
          <h3 className="font-semibold text-[#191A23] truncate">
            {eventTitle}
          </h3>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isRegistering}
                className={`w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Participant Type Field */}
            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                <UserPlus className="w-4 h-4 inline mr-2" />
                Participant Type *
              </label>
              <select
                value={formData.participant_type}
                onChange={(e) => handleInputChange("participant_type", e.target.value)}
                disabled={isRegistering}
                className="w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all border-gray-300"
              >
                <option value="student">Student</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isRegistering}
                className={`w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Mobile Field */}
            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Mobile Number *
              </label>
              <input
                type="tel"
                value={formData.mobile_number}
                onChange={(e) =>
                  handleInputChange("mobile_number", e.target.value)
                }
                disabled={isRegistering}
                className={`w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all ${
                  errors.mobile_number ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your mobile number"
              />
              {errors.mobile_number && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.mobile_number}
                </p>
              )}
            </div>

            {/* Student Fields */}
            {formData.participant_type === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#191A23] mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Institution/College *
                  </label>
                  <input
                    type="text"
                    value={formData.institution || ''}
                    onChange={(e) =>
                      handleInputChange("institution", e.target.value)
                    }
                    disabled={isRegistering}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all ${
                      errors.institution ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your institution/college name"
                  />
                  {errors.institution && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.institution}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#191A23] mb-2">
                    <GraduationCap className="w-4 h-4 inline mr-2" />
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    disabled={isRegistering}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all ${
                      errors.department ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your department"
                  />
                  {errors.department && (
                    <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#191A23] mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Year of Study *
                  </label>
                  <select
                    value={formData.year_of_study || ''}
                    onChange={(e) =>
                      handleInputChange("year_of_study", e.target.value)
                    }
                    disabled={isRegistering}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all ${
                      errors.year_of_study ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select your year of study</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.year_of_study && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.year_of_study}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Professional Fields */}
            {formData.participant_type === 'professional' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#191A23] mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Organization *
                  </label>
                  <input
                    type="text"
                    value={formData.organization || ''}
                    onChange={(e) =>
                      handleInputChange("organization", e.target.value)
                    }
                    disabled={isRegistering}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all ${
                      errors.organization ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your organization name"
                  />
                  {errors.organization && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.organization}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#191A23] mb-2">
                    <GraduationCap className="w-4 h-4 inline mr-2" />
                    Job Designation *
                  </label>
                  <input
                    type="text"
                    value={formData.designation || ''}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    disabled={isRegistering}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all ${
                      errors.designation ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your job designation"
                  />
                  {errors.designation && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.designation}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Optional Fields */}
            {isFoodAvailable && (
              <div>
                <label className="block text-sm font-medium text-[#191A23] mb-2">
                  Food Preference *
                </label>
                <select
                  value={formData.food_preference || ''}
                  onChange={(e) =>
                    handleInputChange("food_preference", e.target.value)
                  }
                  disabled={isRegistering}
                  className="w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all border-gray-300"
                >
                  <option value="">Select your food preference</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non_veg">Non-Vegetarian</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                Special Needs
              </label>
              <input
                type="text"
                value={formData.special_needs || ''}
                onChange={(e) =>
                  handleInputChange("special_needs", e.target.value)
                }
                disabled={isRegistering}
                className="w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all border-gray-300"
                placeholder="Any accessibility requirements or special assistance needed (optional)"
              />
            </div>

            {/* Payment Section for Paid Events */}
            {isPaidEvent && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#191A23]">Payment Required</h3>
                </div>
                
                {registrationFee && (
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Registration Fee</p>
                    <p className="text-2xl font-bold text-[#191A23]">{registrationFee}</p>
                  </div>
                )}

                {paymentQrCode && (
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Scan QR Code to Pay
                    </p>
                    <div className="relative w-48 h-48 mx-auto mb-3 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={paymentQrCode}
                        alt="Payment QR Code"
                        fill
                        className="object-contain"
                      />
                    </div>
                    {paymentUpiId && (
                      <p className="text-xs text-gray-600 mb-3">
                        UPI ID: <span className="font-mono font-semibold">{paymentUpiId}</span>
                      </p>
                    )}
                  </div>
                )}

                {paymentUpiId && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const amount = registrationFee?.replace(/[^0-9.]/g, '') || '';
                        // Google Pay specific deep link (tez://)
                        const googlePayUrl = `tez://upi/pay?pa=${encodeURIComponent(paymentUpiId)}&pn=${encodeURIComponent('EESA Event')}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Registration for ${eventTitle}`)}`;
                        
                        // Open Google Pay
                        window.location.href = googlePayUrl;
                      }}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.5 5h-19C1.67 5 1 5.67 1 6.5v11c0 .83.67 1.5 1.5 1.5h19c.83 0 1.5-.67 1.5-1.5v-11c0-.83-.67-1.5-1.5-1.5zm-1 11.5h-17v-9h17v9z"/>
                      </svg>
                      Pay via Google Pay/PhonePe
                    </button>
                  </div>
                )}

                {paymentInstructions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-gray-700">{paymentInstructions}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-[#191A23] mb-2">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Payment Reference ID {isPaidEvent && '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.payment_reference_id || ''}
                    onChange={(e) =>
                      handleInputChange("payment_reference_id", e.target.value)
                    }
                    disabled={isRegistering}
                    required={isPaidEvent}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all ${
                      errors.payment_reference_id ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={isPaidEvent ? "Enter UPI Reference/Transaction ID" : "Payment reference ID (if payment was made)"}
                  />
                  {errors.payment_reference_id && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">
                      {errors.payment_reference_id}
                    </p>
                  )}
                  {isPaidEvent && (
                    <p className="text-xs text-gray-600 mt-2">
                      After making payment, enter the UPI Reference ID or Transaction ID from your payment app
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                disabled={isRegistering}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-black py-3 rounded-lg font-medium transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRegistering}
                className="flex-1 bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] py-3 rounded-lg font-medium transition-all"
              >
                {isRegistering ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-[#B9FF66] border-t-transparent rounded-full animate-spin"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register Now
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
