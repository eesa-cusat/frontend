"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { getImageUrl } from "@/utils/api";

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
    banner_image?: string;
    event_flyer?: string;
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

  // Get the best available image (prioritize event_flyer, then banner_image, then fallback)
  const eventImage = event.event_flyer || event.banner_image || event.image || event.poster;

  return (
    <div
      onClick={handleClick}
      className="w-full h-48 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group relative"
    >
      {/* Event Image Background */}
      {eventImage ? (
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(eventImage) || eventImage}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>
      ) : (
        <>
          {/* Electrical circuit background pattern as fallback */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
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
        </>
      )}

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        <div>
          <h3 className={`text-lg font-semibold mb-2 transition-colors ${
            eventImage ? 'text-white group-hover:text-[#B9FF66]' : 'text-black group-hover:text-[#B9FF66]'
          }`}>
            {event.title}
          </h3>
          <p className={`text-sm line-clamp-2 mb-3 ${
            eventImage ? 'text-white/90' : 'text-gray-600'
          }`}>
            {event.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className={`w-3 h-3 ${eventImage ? 'text-white/80' : 'text-gray-600'}`} />
            <span className={`truncate ${eventImage ? 'text-white/90' : 'text-gray-600'}`}>
              {new Date(event.start_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {(event.venue || event.location) && (
            <div className="flex items-center gap-1 text-sm">
              <MapPin className={`w-3 h-3 ${eventImage ? 'text-white/80' : 'text-gray-600'}`} />
              <span className={`truncate ${eventImage ? 'text-white/90' : 'text-gray-600'}`}>
                {event.venue || event.location}
              </span>
            </div>
          )}
        </div>
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
      className="w-full h-48 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group relative"
    >
      {/* Project Image or Fallback Background */}
      {project.image ? (
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(project.image) || project.image}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>
      ) : (
        <>
          {/* Electrical circuit background pattern as fallback */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
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
        </>
      )}

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        <div>
          <h3 className={`text-lg font-semibold mb-2 transition-colors ${
            project.image ? 'text-white group-hover:text-[#B9FF66]' : 'text-black group-hover:text-[#B9FF66]'
          }`}>
            {project.title}
          </h3>
          <p className={`text-sm line-clamp-2 mb-3 ${
            project.image ? 'text-white/90' : 'text-gray-600'
          }`}>
            {project.description?.slice(0, 100) || "No description available."}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {truncatedTechnologies.map((tech, index) => (
            <span
              key={index}
              className={`px-2 py-1 text-xs rounded-full font-medium ${
                project.image 
                  ? 'bg-[#B9FF66]/90 text-black' 
                  : 'bg-[#B9FF66] text-black'
              }`}
            >
              {tech}
            </span>
          ))}
          {additionalTechnologiesCount > 0 && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              project.image 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              +{additionalTechnologiesCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
