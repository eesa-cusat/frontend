"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Library", href: "/academics" },
    { name: "Projects", href: "/projects" },
    { name: "About", href: "/about" },
    // { name: "Gallery", href: "/gallery" },
    // { name: "Alumni", href: "/alumni" },
    // { name: "Career", href: "/career" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* EESA Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/eesa-logo.svg"
                alt="EESA Logo"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <span className="ml-2 md:ml-3 text-lg md:text-xl font-bold text-black">
                EESA CUSAT
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-black border-b-2 border-lime-400 pb-1"
                    : "text-black hover:text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger Menu */}
          <button
            className="md:hidden p-2 rounded-md text-black hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className="w-6 h-0.5 bg-black mb-1.5 rounded"></div>
                <div className="w-6 h-0.5 bg-black mb-1.5 rounded"></div>
                <div className="w-6 h-0.5 bg-black rounded"></div>
              </div>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-black bg-lime-50 border-l-4 border-lime-400"
                      : "text-black hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
