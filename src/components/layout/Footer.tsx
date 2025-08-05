"use client";

import React from "react";
import Image from "next/image";
import { Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24">
      {/* Glass blur effect overlay at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/10 backdrop-blur-md"></div>

      {/* Glass-like Separator Line at the top of the footer content */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-white/20 backdrop-blur-sm z-20"></div>

      {/* Main footer content container with light background */}
      <div className="bg-gray-50 text-gray-800 relative z-10 py-6 md:py-10 shadow-lg">
        {" "}
        {/* Changed background to bg-gray-50 and reduced vertical padding for mobile */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {" "}
            {/* Reduced vertical spacing for mobile */}
            {/* Logo and name section */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              {" "}
              {/* Reduced vertical spacing for mobile */}
              <div className="relative">
                <Image
                  src="/eesa-logo.svg"
                  alt="EESA Logo"
                  width={56} // Slightly reduced logo size for better mobile fit
                  height={56}
                  className="w-14 h-14"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#191A23]">EESA</h3>{" "}
                {/* Slightly reduced font size for mobile */}
                <p className="text-sm text-gray-600">
                  Electrical Engineering Students Association
                </p>
              </div>
            </div>
            {/* Social media icons & Contact Info */}
            <div className="flex flex-col items-center lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
              {" "}
              {/* Reduced vertical spacing for mobile */}
              <div className="flex items-center space-x-3">
                {" "}
                {/* Reduced horizontal spacing for mobile */}
                <span className="text-sm text-gray-600">Follow us:</span>
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 hover:bg-[#B9FF66] rounded-full flex items-center justify-center transition-all duration-300 group shadow-md"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-gray-600 group-hover:text-[#191A23] transition-colors" />{" "}
                  {/* Slightly reduced icon size */}
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 hover:bg-[#B9FF66] rounded-full flex items-center justify-center transition-all duration-300 group shadow-md"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 text-gray-600 group-hover:text-[#191A23] transition-colors" />{" "}
                  {/* Slightly reduced icon size */}
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-gray-100 hover:bg-[#B9FF66] rounded-full flex items-center justify-center transition-all duration-300 group shadow-md"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-gray-600 group-hover:text-[#191A23] transition-colors" />{" "}
                  {/* Slightly reduced icon size */}
                </a>
              </div>
              <div className="flex items-center space-x-2 mt-3 text-sm text-gray-600">
                {" "}
                {/* Reduced top margin and font size for mobile */}
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>CUSAT, Kerala</span>
              </div>
            </div>
            {/* Contact Us button and Copyright */}
            <div className="flex flex-col items-center lg:items-end space-y-3">
              {" "}
              {/* Reduced vertical spacing for mobile */}
              <a
                href="mailto:eesacusatweb@gmail.com"
                className="bg-[#B9FF66] hover:bg-[#a8e25d] text-[#191A23] px-5 py-2.5 rounded-full font-medium text-sm transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {" "}
                {/* Reduced padding and font size for mobile */}
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </a>
              <div className="text-xs text-gray-500 text-center lg:text-right">
                {" "}
                {/* Reduced font size for mobile */}
                <p>© {currentYear} EESA CUSAT</p>
                <p>All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
