import { apiClient } from './index';

export interface Alumni {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    alternative_phone: string;
    student_id: string;
    scheme: number;
    year_of_joining: number;
    year_of_passout: number;
    department: string;
    specialization: string;
    cgpa: number;
    job_title: string;
    current_company: string;
    current_location: string;
    linkedin_profile: string;
    employment_status: 'employed' | 'self_employed' | 'unemployed' | 'higher_studies' | 'entrepreneur' | 'other';
    achievements: string;
    feedback: string;
    willing_to_mentor: boolean;
    allow_contact_from_juniors: boolean;
    newsletter_subscription: boolean;
    is_verified: boolean;
    is_active: boolean;
    years_since_graduation: number;
    batch_name: string;
    created_by_username: string;
    created_at: string;
    updated_at: string;
}

export interface AlumniStats {
    total_alumni: number;
    employed_count: number;
    self_employed_count: number;
    higher_studies_count: number;
    unemployment_rate: number;
    top_companies: Array<{ current_company: string; count: number }>;
    year_wise_distribution: Array<{ year_of_passout: number; count: number }>;
    department_wise_distribution: Array<{ department: string; count: number }>;
}

export interface AlumniFilters {
    search?: string;
    year_of_passout?: number;
    employment_status?: string;
    is_verified?: boolean;
    willing_to_mentor?: boolean;
    current_company?: string;
}

class AlumniService {
    private baseUrl = '/alumni';

    // Get all alumni with optional filters
    async getAlumni(filters?: AlumniFilters): Promise<Alumni[]> {
        try {
            const params = new URLSearchParams();

            if (filters?.search) params.append('search', filters.search);
            if (filters?.year_of_passout) params.append('year_of_passout', filters.year_of_passout.toString());
            if (filters?.employment_status) params.append('employment_status', filters.employment_status);
            if (filters?.is_verified !== undefined) params.append('is_verified', filters.is_verified.toString());
            if (filters?.willing_to_mentor !== undefined) params.append('willing_to_mentor', filters.willing_to_mentor.toString());
            if (filters?.current_company) params.append('current_company', filters.current_company);

            const response = await apiClient.get(`${this.baseUrl}/alumni/?${params}`);
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching alumni:', error);
            throw new Error('Failed to fetch alumni data');
        }
    }

    // Get a specific alumni by ID
    async getAlumniById(id: string): Promise<Alumni> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/alumni/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching alumni by ID:', error);
            throw new Error('Failed to fetch alumni details');
        }
    }

    // Get alumni statistics
    async getAlumniStats(): Promise<AlumniStats> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/alumni/stats/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching alumni stats:', error);
            throw new Error('Failed to fetch alumni statistics');
        }
    }

    // Create new alumni
    async createAlumni(alumniData: Partial<Alumni>): Promise<Alumni> {
        try {
            const response = await apiClient.post(`${this.baseUrl}/alumni/`, alumniData);
            return response.data;
        } catch (error) {
            console.error('Error creating alumni:', error);
            throw new Error('Failed to create alumni record');
        }
    }

    // Update alumni
    async updateAlumni(id: string, alumniData: Partial<Alumni>): Promise<Alumni> {
        try {
            const response = await apiClient.patch(`${this.baseUrl}/alumni/${id}/`, alumniData);
            return response.data;
        } catch (error) {
            console.error('Error updating alumni:', error);
            throw new Error('Failed to update alumni record');
        }
    }

    // Delete alumni
    async deleteAlumni(id: string): Promise<void> {
        try {
            await apiClient.delete(`${this.baseUrl}/alumni/${id}/`);
        } catch (error) {
            console.error('Error deleting alumni:', error);
            throw new Error('Failed to delete alumni record');
        }
    }

    // Bulk import from CSV
    async bulkImportCSV(csvFile: File): Promise<{
        message: string;
        total_records: number;
        successful_imports: number;
        failed_imports: number;
        errors: string[];
    }> {
        try {
            const formData = new FormData();
            formData.append('csv_file', csvFile);

            const response = await apiClient.post(`${this.baseUrl}/alumni/bulk_import_csv/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error importing CSV:', error);
            throw new Error('Failed to import CSV file');
        }
    }

    // Export to CSV
    async exportCSV(filters?: AlumniFilters): Promise<Blob> {
        try {
            const params = new URLSearchParams();

            if (filters?.search) params.append('search', filters.search);
            if (filters?.year_of_passout) params.append('year_of_passout', filters.year_of_passout.toString());
            if (filters?.employment_status) params.append('employment_status', filters.employment_status);
            if (filters?.is_verified !== undefined) params.append('is_verified', filters.is_verified.toString());
            if (filters?.willing_to_mentor !== undefined) params.append('willing_to_mentor', filters.willing_to_mentor.toString());
            if (filters?.current_company) params.append('current_company', filters.current_company);

            const response = await apiClient.get(`${this.baseUrl}/alumni/export_csv/?${params}`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting CSV:', error);
            throw new Error('Failed to export CSV file');
        }
    }

    // Download CSV template
    async downloadCSVTemplate(): Promise<Blob> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/alumni/csv_template/`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading CSV template:', error);
            throw new Error('Failed to download CSV template');
        }
    }

    // Utility functions
    getEmploymentStatusLabel(status: string): string {
        const statusMap: Record<string, string> = {
            employed: 'Employed',
            self_employed: 'Self Employed',
            unemployed: 'Unemployed',
            higher_studies: 'Higher Studies',
            entrepreneur: 'Entrepreneur',
            other: 'Other',
        };
        return statusMap[status] || status;
    }

    getEmploymentStatusColor(status: string): string {
        const colorMap: Record<string, string> = {
            employed: 'bg-green-100 text-green-800',
            self_employed: 'bg-blue-100 text-blue-800',
            unemployed: 'bg-red-100 text-red-800',
            higher_studies: 'bg-purple-100 text-purple-800',
            entrepreneur: 'bg-orange-100 text-orange-800',
            other: 'bg-gray-100 text-gray-800',
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    }

    getProfileImageUrl(alumni: Alumni): string {
        // For now, use a placeholder service. In the future, this could be a real profile image
        const name = alumni.full_name.replace(/\s+/g, '+');
        return `https://ui-avatars.com/api/?name=${name}&background=random&size=200`;
    }

    getLinkedInUrl(alumni: Alumni): string | null {
        if (!alumni.linkedin_profile) return null;

        // Ensure the URL has the proper format
        if (alumni.linkedin_profile.startsWith('http')) {
            return alumni.linkedin_profile;
        }

        return `https://linkedin.com/in/${alumni.linkedin_profile}`;
    }
}

export const alumniService = new AlumniService();
export default alumniService;
