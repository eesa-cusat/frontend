"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Linkedin, Facebook, Twitter } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-black leading-tight">
                Electrical Engineering Students Association, CUSAT
              </h1>
              
              <p className="text-base md:text-lg lg:text-xl text-black leading-relaxed">
                EESA is a vibrant student-led body under the Department of Electrical Engineering, CUSAT, that fosters innovation, leadership, and technical excellence through dynamic academic and co-curricular initiatives.
              </p>
              
              <div className="pt-4">
                <Link href="/events">
                  <Button className="bg-black text-white hover:bg-gray-800 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-medium rounded-xl transition-colors">
                    Explore Now
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Graphic - Electrical Tower */}
            <div className="relative order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <Image
                  src="/electrical-tower.svg"
                  alt="Electrical Tower"
                  width={300}
                  height={400}
                  className="w-64 h-80 lg:w-80 lg:h-96"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Notifications */}
      <section className="py-4 bg-white overflow-hidden">
        <div className="whitespace-nowrap animate-marquee">
          <span className="text-black text-lg md:text-xl font-medium mx-4">
            🎉 Welcome to EESA CUSAT - Join our upcoming tech fest registration open now
          </span>
          <span className="text-black text-lg md:text-xl font-medium mx-4">
            📚 New study materials uploaded for Electrical Engineering semester exams
          </span>
          <span className="text-black text-lg md:text-xl font-medium mx-4">
            🔬 Research paper submission deadline extended till August 15th
          </span>
          <span className="text-black text-lg md:text-xl font-medium mx-4">
            💼 Campus placement drive by leading companies starting next week
          </span>
          <span className="text-black text-lg md:text-xl font-medium mx-4">
            🎓 Alumni meetup scheduled for August 20th - register now
          </span>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-block bg-lime-400 text-black px-6 py-2 rounded-full text-lg font-medium mb-6">
              Events
            </div>
            
            {/* Events Description Text */}
            <div className="max-w-4xl mx-auto text-left space-y-4 mb-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                Discover upcoming workshops, seminars, and technical events designed to enhance your engineering skills and career prospects.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From industry expert talks to hands-on coding sessions, join us for exciting learning opportunities.
              </p>
            </div>
          </div>
          
          {/* Events Container - 3 Fixed Cards */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="w-full h-48 bg-gray-900 rounded-3xl border border-gray-200 flex items-center justify-center overflow-hidden relative">
                <div className="animate-carousel-left-1-set1 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Tech Workshop</span>
                </div>
                <div className="animate-carousel-left-1-set2 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Industry Talk</span>
                </div>
                <div className="animate-carousel-left-1-set3 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Hackathon 2024</span>
                </div>
                <div className="animate-carousel-left-1-set4 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Career Fair</span>
                </div>
                <div className="animate-carousel-left-1-set5 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Alumni Meet</span>
                </div>
                <div className="animate-carousel-left-1-set6 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Research Expo</span>
                </div>
              </div>
              
              {/* Card 2 - Hidden on mobile */}
              <div className="hidden sm:flex w-full h-48 bg-gray-900 rounded-3xl border border-gray-200 items-center justify-center overflow-hidden relative">
                <div className="animate-carousel-left-2-set1 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Industry Talk</span>
                </div>
                <div className="animate-carousel-left-2-set2 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Hackathon 2024</span>
                </div>
                <div className="animate-carousel-left-2-set3 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Career Fair</span>
                </div>
                <div className="animate-carousel-left-2-set4 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Alumni Meet</span>
                </div>
                <div className="animate-carousel-left-2-set5 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Research Expo</span>
                </div>
                <div className="animate-carousel-left-2-set6 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Tech Workshop</span>
                </div>
              </div>
              
              {/* Card 3 - Hidden on mobile */}
              <div className="hidden sm:flex w-full h-48 bg-gray-900 rounded-3xl border border-gray-200 items-center justify-center overflow-hidden relative">
                <div className="animate-carousel-left-3-set1 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Hackathon 2024</span>
                </div>
                <div className="animate-carousel-left-3-set2 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Career Fair</span>
                </div>
                <div className="animate-carousel-left-3-set3 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Alumni Meet</span>
                </div>
                <div className="animate-carousel-left-3-set4 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Research Expo</span>
                </div>
                <div className="animate-carousel-left-3-set5 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Tech Workshop</span>
                </div>
                <div className="animate-carousel-left-3-set6 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Industry Talk</span>
                </div>
              </div>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-3 h-3 bg-gray-900 rounded-full animate-dot-6-1"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-2"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-3"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-4"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-5"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-6"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-block bg-lime-400 text-black px-6 py-2 rounded-full text-lg font-medium mb-6">
              Projects
            </div>
            
            {/* Projects Description Text */}
            <div className="max-w-4xl mx-auto text-left space-y-4 mb-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                Explore innovative student projects ranging from IoT solutions to renewable energy systems and smart grid technologies.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Join collaborative research initiatives and contribute to cutting-edge developments in electrical engineering.
              </p>
            </div>
          </div>
          
          {/* Projects Container - 3 Fixed Cards */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="w-full h-48 bg-gray-900 rounded-3xl border-2 border-gray-900 overflow-hidden relative">
                <div className="animate-carousel-left-1-set1 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Smart Grid IoT</span>
                </div>
                <div className="animate-carousel-left-1-set2 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Solar Tracker</span>
                </div>
                <div className="animate-carousel-left-1-set3 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">EV Charger</span>
                </div>
                <div className="animate-carousel-left-1-set4 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Power Monitor</span>
                </div>
                <div className="animate-carousel-left-1-set5 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Home Automation</span>
                </div>
                <div className="animate-carousel-left-1-set6 absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Wind Turbine</span>
                </div>
              </div>
              
              {/* Card 2 - Hidden on mobile */}
              <div className="hidden sm:flex w-full h-48 bg-gray-50 rounded-3xl border-2 border-gray-900 items-center justify-center overflow-hidden relative">
                <div className="animate-carousel-left-2-set1 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Solar Tracker</span>
                </div>
                <div className="animate-carousel-left-2-set2 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">EV Charger</span>
                </div>
                <div className="animate-carousel-left-2-set3 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Power Monitor</span>
                </div>
                <div className="animate-carousel-left-2-set4 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Home Automation</span>
                </div>
                <div className="animate-carousel-left-2-set5 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Wind Turbine</span>
                </div>
                <div className="animate-carousel-left-2-set6 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Smart Grid IoT</span>
                </div>
              </div>
              
              {/* Card 3 - Hidden on mobile */}
              <div className="hidden sm:flex w-full h-48 bg-lime-400 rounded-3xl border-2 border-gray-900 items-center justify-center overflow-hidden relative">
                <div className="animate-carousel-left-3-set1 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">EV Charger</span>
                </div>
                <div className="animate-carousel-left-3-set2 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Power Monitor</span>
                </div>
                <div className="animate-carousel-left-3-set3 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Home Automation</span>
                </div>
                <div className="animate-carousel-left-3-set4 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Wind Turbine</span>
                </div>
                <div className="animate-carousel-left-3-set5 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Smart Grid IoT</span>
                </div>
                <div className="animate-carousel-left-3-set6 absolute inset-0 flex items-center justify-center">
                  <span className="text-black text-lg font-medium">Solar Tracker</span>
                </div>
              </div>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-3 h-3 bg-gray-900 rounded-full animate-dot-6-1"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-2"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-3"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-4"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-5"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-dot-6-6"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Logo and Contact */}
            <div className="space-y-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <Image
                  src="/eesa-logo.svg"
                  alt="EESA Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 filter invert"
                />
                <span className="ml-3 text-xl font-bold">EESA</span>
              </div>
              
              <div className="space-y-4">
                <div className="inline-block bg-lime-400 text-black px-4 py-2 rounded-full text-sm font-medium">
                  Contact us:
                </div>
                <p className="text-gray-300">Email: info@eesa.cusat.ac.in</p>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="flex items-center justify-center space-x-4">
              <a href="#" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            
            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">© EESA CUSAT All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 