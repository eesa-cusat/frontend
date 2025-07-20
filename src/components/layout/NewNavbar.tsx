"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { redirectToDjangoAdmin } from "@/lib/api";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  Upload,
  Home,
  Calendar,
  BookOpen,
  Briefcase,
  Image,
  GraduationCap,
  Users,
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const pathname = usePathname();

  const handleStaffAction = (action: string) => {
    redirectToDjangoAdmin(action);
    setIsStaffDropdownOpen(false);
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Academic Resources", href: "/academics", icon: BookOpen },
    { name: "Projects", href: "/projects", icon: Briefcase },
    { name: "Placements", href: "/placements", icon: GraduationCap },
    { name: "Alumni", href: "/alumni", icon: Users },
    { name: "Gallery", href: "/gallery", icon: Image },
  ];

  const staffActions = [
    { name: "Admin Panel", action: "", icon: User },
    { name: "Manage Events", action: "events/event/", icon: Calendar },
    {
      name: "Upload Notes",
      action: "academics/academicresource/",
      icon: Upload,
    },
    { name: "Manage Projects", action: "projects/project/", icon: Briefcase },
    { name: "Manage Alumni", action: "core/alumni/", icon: Users },
    { name: "Manage Gallery", action: "gallery/galleryitem/", icon: Image },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EESA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Staff Actions Dropdown */}
          <div className="hidden md:flex md:items-center">
            <div className="relative">
              <button
                onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Staff Portal
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {isStaffDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
                    Staff Management
                  </div>
                  {staffActions.map((action) => (
                    <button
                      key={action.name}
                      onClick={() => handleStaffAction(action.action)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <action.icon className="w-4 h-4 mr-2" />
                      {action.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            ))}

            {/* Mobile Staff Actions */}
            <div className="border-t pt-4 mt-4">
              <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                Staff Portal
              </div>
              {staffActions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => {
                    handleStaffAction(action.action);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
