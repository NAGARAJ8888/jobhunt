export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  logo: string;
  tags: string[];
  postedDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  about: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "job_seeker" | "employer";
}

export interface Application {
  id: string;
  job: Job;
  applicant: {
    id: string;
    name: string;
    email: string;
  };
  applicantProfile?: {
    headline?: string;
    bio?: string;
    phone?: string;
    location?: string;
    profileImage?: string;
    resume?: string;
    profileStrength?: number;
    skills?: string[];
    experience?: Array<{
      company?: string;
      position?: string;
      employmentType?: string;
      startDate?: string;
      endDate?: string;
      currentlyWorking?: boolean;
      description?: string;
      location?: string;
    }>;
    internships?: Array<{
      company?: string;
      role?: string;
      duration?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
      certificateUrl?: string;
    }>;
    education?: Array<{
      institution?: string;
      degree?: string;
      fieldOfStudy?: string;
      grade?: string;
      startYear?: number;
      endYear?: number;
    }>;
    projects?: Array<{
      title?: string;
      description?: string;
      technologies?: string[];
      githubLink?: string;
      liveLink?: string;
      startDate?: string;
      endDate?: string;
    }>;
    certifications?: Array<{
      title?: string;
      issuingOrganization?: string;
      issueDate?: string;
      expiryDate?: string;
      credentialId?: string;
      credentialUrl?: string;
    }>;
    achievements?: Array<{
      title?: string;
      description?: string;
      date?: string;
    }>;
    languages?: Array<{
      language?: string;
      proficiency?: string;
    }>;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
      twitter?: string;
    };
    jobPreferences?: {
      preferredRole?: string;
      preferredLocation?: string;
      expectedSalary?: number;
      jobType?: string;
      availability?: string;
    };
  };
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  resume?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
}
