"use client";

import React from "react";
import Image from "next/image";
import { Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16">
      {/* Subtle glass blur */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/10 backdrop-blur-md"></div>

      {/* Top separator line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-white/20 backdrop-blur-sm z-20"></div>

      {/* Main footer */}
      <div className="relative z-10 bg-gray-50 text-gray-800 py-5 sm:py-7 md:py-9 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 sm:gap-y-6 md:gap-y-8 md:gap-x-10 items-center text-center md:text-left">
            {/* Column 1: Logo + name */}
            <div className="flex flex-col items-center md:items-start space-y-1.5 sm:space-y-2">
              <div className="flex items-center space-x-2">
                <Image
                  src="/eesa-logo.svg"
                  alt="EESA Logo"
                  width={48}
                  height={48}
                  className="w-11 h-11 sm:w-13 sm:h-13"
                />
                <h3 className="text-lg sm:text-xl font-bold text-[#191A23]">
                  EESA
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                Electrical Engineering Students Association
              </p>
            </div>

            {/* Column 2: Socials + location */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <a
                  href="https://www.instagram.com/eesa.cusat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-100 hover:bg-[#B9FF66] rounded-full flex items-center justify-center transition-all duration-300 shadow-md group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-gray-600 group-hover:text-[#191A23]" />
                </a>
                <a
                  href="https://www.facebook.com/p/EESA-CUSAT-100064166226427/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-100 hover:bg-[#B9FF66] rounded-full flex items-center justify-center transition-all duration-300 shadow-md group"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 text-gray-600 group-hover:text-[#191A23]" />
                </a>
                <a
                  href="https://www.linkedin.com/company/88060018/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-100 hover:bg-[#B9FF66] rounded-full flex items-center justify-center transition-all duration-300 shadow-md group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-gray-600 group-hover:text-[#191A23]" />
                </a>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-600 space-x-1.5">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>CUSAT, Kerala</span>
              </div>
            </div>

            {/* Column 3: Contact + copyright */}
            <div className="flex flex-col items-center md:items-end space-y-2 sm:space-y-3">
              <a
                href="mailto:eesacusatweb@gmail.com"
                className="bg-[#B9FF66] hover:bg-[#a8e25d] text-[#191A23] px-4 sm:px-5 py-2 rounded-full font-medium text-xs sm:text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </a>

              <div className="text-[11px] sm:text-xs text-gray-500 text-center md:text-right leading-tight">
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
