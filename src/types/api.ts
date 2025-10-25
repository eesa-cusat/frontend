export interface Scheme {
  id: number;
  year: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  scheme_details?: Scheme; // Nested scheme object
  scheme_year: number; // Computed property
  semester: number;
  credits: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  subject: string; // Subject ID
  subject_details: Subject; // Full subject object
  note_type: 'module' | 'pyq' | 'textbook' | 'other';
  module_number: number;
  file: string | null; // File URL (can be null)
  uploaded_by: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
  };
  is_approved: boolean;
  approved_by?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
  };
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NoteUpload {
  title: string;
  description: string;
  subject: string;
  semester: number;
  file: File;
  tags: string[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  abstract?: string;
  category: string;
  academic_year?: string; // New: Year-based grouping (e.g., "2023-2024")
  github_url: string | null;
  demo_url: string | null;
  project_report: string | null;
  thumbnail?: string | null; // New: Optimized thumbnail for cards
  project_image?: string | null; // New: Main project cover image
  created_by_name: string;
  team_count: number;
  created_at: string;
  // Legacy fields for backward compatibility
  thumbnail_image?: string | null;
  student_batch?: string;
}

export interface ProjectImage {
  id: number;
  image: string;
  caption: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface ProjectVideo {
  id: number;
  video_url: string;
  title: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface ProjectDetail {
  id: number;
  title: string;
  description: string;
  abstract: string | null;
  category: string;
  academic_year?: string | null; // New: Year-based grouping
  github_url: string | null;
  demo_url: string | null;
  project_report: string | null;
  thumbnail?: string | null; // New: Optimized thumbnail
  project_image?: string | null; // New: Main project image
  gallery_images?: ProjectImage[]; // Renamed from images
  created_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  team_members: TeamMember[];
  images: ProjectImage[]; // Keep for backward compatibility
  videos: ProjectVideo[];
  featured_image: ProjectImage | null;
  featured_video: ProjectVideo | null;
  created_at: string;
  updated_at: string;
  // Legacy fields
  thumbnail_image?: string | null;
}

export interface TeamMember {
  id: number;
  name: string;
  linkedin_url: string | null;
  role: string | null;
  avatar_url?: string; // Optional avatar for display
}

export interface ProjectCreate {
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_demo_url?: string;
  image?: File;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: 'workshop' | 'seminar' | 'competition' | 'social' | 'other';
  status: string;
  start_date: string;
  end_date: string;
  location: string;
  venue?: string;
  registration_required: boolean;
  registration_deadline?: string;
  max_participants?: number;
  registration_count: number;
  registration_fee: string;
  payment_required?: boolean;
  payment_qr_code?: string;
  payment_upi_id?: string;
  payment_instructions?: string;
  is_food_available?: boolean;
  banner_image?: string;
  created_by_name: string;
  is_active?: boolean;
  is_featured: boolean;
  is_upcoming: boolean;
  is_past?: boolean;
  is_ongoing?: boolean;
  is_registration_open: boolean;
  spots_remaining: number;
  created_at: string;
  updated_at?: string;
  is_paid?: boolean;
}

export interface EventCreate {
  title: string;
  description: string;
  event_type: 'workshop' | 'seminar' | 'competition' | 'social' | 'other';
  start_date: string;
  end_date: string;
  location: string;
  registration_required: boolean;
  registration_deadline?: string;
  max_participants?: number;
  image?: File;
}

export interface CareerOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'internship' | 'contract';
  experience_level: 'entry' | 'mid' | 'senior';
  description: string;
  requirements: string[];
  skills: string[];
  salary_range?: string;
  application_url?: string;
  application_deadline?: string;
  posted_by: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  posted_at: string;
  is_active: boolean;
}

export interface JobOpportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'contract';
  experience_level: 'entry' | 'mid' | 'senior';
  description: string;
  requirements: string[];
  skills: string[];
  salary_range?: string;
  application_url: string;
  application_deadline?: string;
  posted_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  posted_at: string;
  is_active: boolean;
}

export interface CareerCreate {
  title: string;
  company: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'internship' | 'contract';
  experience_level: 'entry' | 'mid' | 'senior';
  description: string;
  requirements: string[];
  skills: string[];
  salary_range?: string;
  application_url?: string;
  application_deadline?: string;
}

// Event Registration interfaces
export interface EventRegistration {
  id: number;
  event: number;
  user?: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_semester?: number;
  guest_department?: 'electrical' | 'electronics' | 'computer' | 'mechanical' | 'civil' | 'other';
  registered_at: string;
  is_confirmed: boolean;
  is_attended: boolean;
  notes?: string;
  participant_name: string;
  participant_email: string;
}

export interface GuestRegistrationData {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_semester?: number;
  guest_department?: 'electrical' | 'electronics' | 'computer' | 'mechanical' | 'civil' | 'other';
}

export interface InternshipOpportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  duration: '1_month' | '2_months' | '3_months' | '6_months' | '1_year';
  internship_type: 'paid' | 'unpaid' | 'stipend';
  description: string;
  requirements: string[];
  skills: string[];
  stipend?: string;
  application_url: string;
  application_deadline?: string;
  start_date?: string;
  is_remote: boolean;
  certificate_provided: boolean;
  letter_of_recommendation: boolean;
  posted_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  posted_at: string;
  is_active: boolean;
}

export interface CertificateOpportunity {
  id: number;
  title: string;
  provider: 'coursera' | 'edx' | 'udemy' | 'linkedin' | 'ieee' | 'cisco' | 'microsoft' | 'google' | 'amazon' | 'other';
  certificate_type: 'course' | 'certification' | 'workshop' | 'competition' | 'training';
  description: string;
  duration: string;
  prerequisites: string[];
  skills_covered: string[];
  is_free: boolean;
  price?: string;
  financial_aid_available: boolean;
  percentage_offer?: number;
  validity_till?: string;
  enrollment_url: string;
  registration_deadline?: string;
  start_date?: string;
  industry_recognized: boolean;
  university_credit: boolean;
  posted_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  posted_at: string;
  is_active: boolean;
}
