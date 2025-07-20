"use client";

import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  FileText, 
  Library, 
  Lightbulb, 
  CheckCircle, 
  Calendar,
  ArrowRight 
} from "lucide-react";

const academicsModules = [
  {
    title: "Notes",
    description: "Access and upload academic notes for all subjects and semesters",
    href: "/academics/notes",
    icon: FileText,
    color: "bg-blue-500",
    features: ["Upload Notes", "Download Resources", "Subject-wise Organization"]
  },
  {
    title: "Library",
    description: "Digital library with books, journals, and research materials",
    href: "/academics/library", 
    icon: Library,
    color: "bg-green-500",
    features: ["Digital Books", "Research Papers", "Online Resources"]
  },
  {
    title: "Projects",
    description: "Showcase and browse student projects and research work",
    href: "/academics/projects",
    icon: Lightbulb,
    color: "bg-purple-500", 
    features: ["Project Gallery", "Research Work", "Innovation Hub"]
  },
  {
    title: "Schemes",
    description: "Academic schemes and curriculum information",
    href: "/academics/schemes",
    icon: Calendar,
    color: "bg-orange-500",
    features: ["Curriculum Details", "Semester Plans", "Academic Calendar"]
  },
  {
    title: "Subjects",
    description: "Subject details, syllabus, and course information",
    href: "/academics/subjects",
    icon: BookOpen,
    color: "bg-indigo-500",
    features: ["Subject Catalog", "Syllabus", "Course Materials"]
  }
];

const AcademicsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Academic Resources
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Your comprehensive hub for notes, library resources, projects, and academic information
            </p>
            <div className="flex items-center justify-center space-x-4">
              <BookOpen className="w-8 h-8" />
              <span className="text-lg font-medium">Empowering Education</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Academic Modules
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive academic resources designed to support your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {academicsModules.map((module, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {module.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {module.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {module.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Link
                    href={module.href}
                    className="inline-flex items-center w-full justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-700 font-medium"
                  >
                    <span>Explore {module.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Academic Notes</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-600">Student Projects</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Subjects Covered</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AcademicsPage;
