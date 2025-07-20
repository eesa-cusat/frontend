"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Users, Briefcase, ArrowRight, Sparkles, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Premier Engineering Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                EESA
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto opacity-90 leading-relaxed">
              The premier platform for Electrical and Electronics Engineering students, 
              teachers, and alumni to connect, collaborate, and grow together in the 
              digital age of innovation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/events">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Explore Events
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/academics">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Academic Resources
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: "500+", label: "Active Members", icon: Users },
                { number: "1000+", label: "Study Materials", icon: BookOpen },
                { number: "50+", label: "Events Hosted", icon: Calendar },
                { number: "200+", label: "Career Placements", icon: Briefcase }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-colors">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover all the tools and resources designed to enhance your
              academic and professional journey in electrical engineering.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Digital Library",
                description: "Access comprehensive study materials, notes, and academic resources shared by peers and faculty.",
                href: "/academics"
              },
              {
                icon: Calendar,
                title: "Events & Workshops",
                description: "Stay updated with cutting-edge workshops, seminars, and technical events in the EE community.",
                href: "/events"
              },
              {
                icon: Briefcase,
                title: "Career Opportunities",
                description: "Discover internships, job openings, and career guidance from industry professionals and alumni.",
                href: "/career"
              },
              {
                icon: Users,
                title: "Community Projects",
                description: "Collaborate on innovative projects and showcase your work to the global engineering community.",
                href: "/projects"
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <Link href={feature.href}>
                  <Button
                    variant="outline"
                    className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20">
            <Star className="w-4 h-4 mr-2" />
            Join Our Community
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Explore EESA?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with the community, access resources, and stay updated with
            the latest events and opportunities in electrical engineering.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Calendar className="w-5 h-5 mr-2" />
                Explore Events
              </Button>
            </Link>
            <Link href="/academics">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 