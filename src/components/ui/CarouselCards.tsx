"use client";

import React from "react";
import { Calendar, MapPin } from "lucide-react";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location?: string;
    venue?: string;
    event_type?: string;
    is_featured: boolean;
    image?: string;
    poster?: string;
  };
  onClick?: () => void;
}

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    technologies: string[];
    is_featured: boolean;
    image?: string;
    github_url?: string;
    project_report?: string;
    demo_url?: string;
  };
  onClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(`/events/${event.id}`, "_blank");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="w-full h-48 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl p-6 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group"
    >
      {/* Electrical circuit background pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5"
        viewBox="0 0 200 150"
        fill="none"
      >
        <path
          d="M20 30 L180 30 M20 60 L100 60 L100 90 L180 90 M20 120 L60 120 L60 60"
          stroke="#191A23"
          strokeWidth="1"
        />
        <circle cx="60" cy="30" r="3" fill="#191A23" />
        <circle cx="100" cy="60" r="3" fill="#191A23" />
        <circle cx="180" cy="90" r="3" fill="#191A23" />
        <rect
          x="140"
          y="25"
          width="10"
          height="10"
          fill="none"
          stroke="#191A23"
          strokeWidth="1"
        />
        <rect
          x="80"
          y="85"
          width="10"
          height="10"
          fill="none"
          stroke="#191A23"
          strokeWidth="1"
        />
      </svg>

      <div className="relative z-10">
        <h3 className="text-lg font-semibold mb-2 text-black group-hover:text-[#B9FF66] transition-colors">
          {event.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {event.description}
        </p>
      </div>

      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3" />
          <span className="truncate">
            {new Date(event.start_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        {(event.venue || event.location) && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{event.venue || event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(`/projects/${project.id}`, "_blank");
    }
  };

  const truncatedTechnologies = project.technologies?.slice(0, 3) || [];
  const additionalTechnologiesCount = (project.technologies?.length || 0) - 3;

  return (
    <div
      onClick={handleClick}
      className="w-full h-48 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl p-6 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group"
    >
      {/* Electrical circuit background pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5"
        viewBox="0 0 200 150"
        fill="none"
      >
        <path
          d="M20 30 L180 30 M20 60 L100 60 L100 90 L180 90 M20 120 L60 120 L60 60"
          stroke="#191A23"
          strokeWidth="1"
        />
        <circle cx="60" cy="30" r="3" fill="#191A23" />
        <circle cx="100" cy="60" r="3" fill="#191A23" />
        <circle cx="180" cy="90" r="3" fill="#191A23" />
        <rect
          x="140"
          y="25"
          width="10"
          height="10"
          fill="none"
          stroke="#191A23"
          strokeWidth="1"
        />
        <rect
          x="80"
          y="85"
          width="10"
          height="10"
          fill="none"
          stroke="#191A23"
          strokeWidth="1"
        />
      </svg>

      <div className="relative z-10">
        <h3 className="text-lg font-semibold mb-2 text-black group-hover:text-[#B9FF66] transition-colors">
          {project.title}
        </h3>

        {/*
          Potential error location: `project.description.slice(...)`
          Adding optional chaining to prevent a similar error if `description` is undefined.
        */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {project.description?.slice(0, 100) || "No description available."}
        </p>
      </div>

      <div className="relative z-10">
        <div className="flex flex-wrap gap-1">
          {truncatedTechnologies.map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-[#B9FF66] text-black text-xs rounded-full font-medium"
            >
              {tech}
            </span>
          ))}
          {additionalTechnologiesCount > 0 && (
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
              +{additionalTechnologiesCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
