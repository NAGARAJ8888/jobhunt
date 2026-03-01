import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../context/AuthContext";
import {
  UserCircle,
  Mail,
  Briefcase,
  ShieldCheck,
  LogIn,
  Save,
  Building2,
  Globe,
  MapPin,
  Phone,
  Linkedin,
  Calendar,
  Image,
  FileText,
  AtSign,
  Link2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router";

const API_BASE_URL = "http://localhost:5000/api";

interface EmployerProfileData {
  _id: string;
  employer: string | { _id: string; name: string; email: string; role: string };
  companyName: string;
  companyLogo?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  aboutCompany?: string;
  contactEmail?: string;
  contactPhone?: string;
  linkedIn?: string;
  companyBanner?: string;
  foundedYear?: number;
}

interface EmployerProfileForm {
  companyName: string;
  companyLogo: string;
  industry: string;
  companySize: string;
  website: string;
  location: string;
  aboutCompany: string;
  contactEmail: string;
  contactPhone: string;
  linkedIn: string;
  companyBanner: string;
  foundedYear: string;
}

const emptyEmployerForm: EmployerProfileForm = {
  companyName: "",
  companyLogo: "",
  industry: "",
  companySize: "",
  website: "",
  location: "",
  aboutCompany: "",
  contactEmail: "",
  contactPhone: "",
  linkedIn: "",
  companyBanner: "",
  foundedYear: "",
};

function mapProfileToForm(profile: EmployerProfileData): EmployerProfileForm {
  return {
    companyName: profile.companyName || "",
    companyLogo: profile.companyLogo || "",
    industry: profile.industry || "",
    companySize: profile.companySize || "",
    website: profile.website || "",
    location: profile.location || "",
    aboutCompany: profile.aboutCompany || "",
    contactEmail: profile.contactEmail || "",
    contactPhone: profile.contactPhone || "",
    linkedIn: profile.linkedIn || "",
    companyBanner: profile.companyBanner || "",
    foundedYear: profile.foundedYear ? String(profile.foundedYear) : "",
  };
}

interface JobseekerProfileData {
  _id: string;
  user: string | { _id: string; name: string; email: string; role: string };
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  resume?: string;
  skills?: string[];
  experience?: Array<{
    company?: string;
    position?: string;
    employmentType?: "Full-time" | "Part-time" | "Internship" | "Freelance";
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
    startYear?: number;
    endYear?: number;
    grade?: string;
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
  achievements?: Array<{ title?: string; description?: string; date?: string }>;
  languages?: Array<{
    language?: string;
    proficiency?: "Basic" | "Conversational" | "Fluent" | "Native";
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
    jobType?: "Remote" | "Onsite" | "Hybrid";
    availability?: "Immediate" | "15 Days" | "1 Month" | "2+ Months";
  };
  profileStrength?: number;
}

interface JobseekerProfileForm {
  headline: string;
  bio: string;
  phone: string;
  location: string;
  profileImage: string;
  resume: string;
  skills: string;
  experience: string;
  internships: string;
  education: string;
  projects: string;
  certifications: string;
  achievements: string;
  languages: string;
  linkedin: string;
  github: string;
  portfolio: string;
  twitter: string;
  preferredRole: string;
  preferredLocation: string;
  expectedSalary: string;
  jobType: string;
  availability: string;
  profileStrength: string;
}

const emptyJobseekerForm: JobseekerProfileForm = {
  headline: "",
  bio: "",
  phone: "",
  location: "",
  profileImage: "",
  resume: "",
  skills: "[]",
  experience: "[]",
  internships: "[]",
  education: "[]",
  projects: "[]",
  certifications: "[]",
  achievements: "[]",
  languages: "[]",
  linkedin: "",
  github: "",
  portfolio: "",
  twitter: "",
  preferredRole: "",
  preferredLocation: "",
  expectedSalary: "",
  jobType: "",
  availability: "",
  profileStrength: "",
};

function mapJobseekerProfileToForm(profile: JobseekerProfileData): JobseekerProfileForm {
  return {
    headline: profile.headline || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
    location: profile.location || "",
    profileImage: profile.profileImage || "",
    resume: profile.resume || "",
    skills: JSON.stringify(profile.skills || [], null, 2),
    experience: JSON.stringify(profile.experience || [], null, 2),
    internships: JSON.stringify(profile.internships || [], null, 2),
    education: JSON.stringify(profile.education || [], null, 2),
    projects: JSON.stringify(profile.projects || [], null, 2),
    certifications: JSON.stringify(profile.certifications || [], null, 2),
    achievements: JSON.stringify(profile.achievements || [], null, 2),
    languages: JSON.stringify(profile.languages || [], null, 2),
    linkedin: profile.socialLinks?.linkedin || "",
    github: profile.socialLinks?.github || "",
    portfolio: profile.socialLinks?.portfolio || "",
    twitter: profile.socialLinks?.twitter || "",
    preferredRole: profile.jobPreferences?.preferredRole || "",
    preferredLocation: profile.jobPreferences?.preferredLocation || "",
    expectedSalary: profile.jobPreferences?.expectedSalary
      ? String(profile.jobPreferences.expectedSalary)
      : "",
    jobType: profile.jobPreferences?.jobType || "",
    availability: profile.jobPreferences?.availability || "",
    profileStrength:
      typeof profile.profileStrength === "number" ? String(profile.profileStrength) : "",
  };
}

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulValue(item));
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "_id")
      .some(([, val]) => hasMeaningfulValue(val));
  }
  return false;
};

const calculateCompletionPercentage = (checks: boolean[]): number => {
  if (!checks.length) return 0;
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
};

function calculateJobseekerProfileStrengthFromData(profile: JobseekerProfileData): number {
  const checks = [
    hasMeaningfulValue(profile.headline),
    hasMeaningfulValue(profile.bio),
    hasMeaningfulValue(profile.phone),
    hasMeaningfulValue(profile.location),
    hasMeaningfulValue(profile.profileImage),
    hasMeaningfulValue(profile.resume),
    hasMeaningfulValue(profile.skills),
    hasMeaningfulValue(profile.experience),
    hasMeaningfulValue(profile.internships),
    hasMeaningfulValue(profile.education),
    hasMeaningfulValue(profile.projects),
    hasMeaningfulValue(profile.certifications),
    hasMeaningfulValue(profile.achievements),
    hasMeaningfulValue(profile.languages),
    hasMeaningfulValue(profile.socialLinks?.linkedin),
    hasMeaningfulValue(profile.socialLinks?.github),
    hasMeaningfulValue(profile.socialLinks?.portfolio),
    hasMeaningfulValue(profile.socialLinks?.twitter),
    hasMeaningfulValue(profile.jobPreferences?.preferredRole),
    hasMeaningfulValue(profile.jobPreferences?.preferredLocation),
    hasMeaningfulValue(profile.jobPreferences?.expectedSalary),
    hasMeaningfulValue(profile.jobPreferences?.jobType),
    hasMeaningfulValue(profile.jobPreferences?.availability),
  ];

  return calculateCompletionPercentage(checks);
}

function calculateJobseekerProfileStrengthFromForm(form: JobseekerProfileForm): number {
  const parseArrayOrEmpty = (value: string): unknown[] => {
    try {
      const parsed = JSON.parse(value.trim() || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const checks = [
    hasMeaningfulValue(form.headline),
    hasMeaningfulValue(form.bio),
    hasMeaningfulValue(form.phone),
    hasMeaningfulValue(form.location),
    hasMeaningfulValue(form.profileImage),
    hasMeaningfulValue(form.resume),
    hasMeaningfulValue(parseArrayOrEmpty(form.skills)),
    hasMeaningfulValue(parseArrayOrEmpty(form.experience)),
    hasMeaningfulValue(parseArrayOrEmpty(form.internships)),
    hasMeaningfulValue(parseArrayOrEmpty(form.education)),
    hasMeaningfulValue(parseArrayOrEmpty(form.projects)),
    hasMeaningfulValue(parseArrayOrEmpty(form.certifications)),
    hasMeaningfulValue(parseArrayOrEmpty(form.achievements)),
    hasMeaningfulValue(parseArrayOrEmpty(form.languages)),
    hasMeaningfulValue(form.linkedin),
    hasMeaningfulValue(form.github),
    hasMeaningfulValue(form.portfolio),
    hasMeaningfulValue(form.twitter),
    hasMeaningfulValue(form.preferredRole),
    hasMeaningfulValue(form.preferredLocation),
    hasMeaningfulValue(form.expectedSalary),
    hasMeaningfulValue(form.jobType),
    hasMeaningfulValue(form.availability),
  ];

  return calculateCompletionPercentage(checks);
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-gray-200">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">{label}</p>
      <div className="flex items-center gap-3 text-gray-800">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm md:text-base font-medium">{value || "—"}</span>
      </div>
    </div>
  );
}

function UserSummaryCard({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: "job_seeker" | "employer";
}) {
  return (
    <Card className="md:col-span-2 p-6 shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-5 mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 flex items-center justify-center ring-4 ring-white shadow-sm">
          <UserCircle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          <Badge variant="outline" className="mt-1.5 border-gray-200 text-gray-700 bg-gray-50/80">
            {role === "job_seeker" ? "Job Seeker" : "Employer"}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <InfoRow label="Email Address" value={email} icon={<Mail className="h-5 w-5" />} />
        <InfoRow
          label="Account Role"
          value={role === "job_seeker" ? "Job Seeker" : "Employer"}
          icon={<Briefcase className="h-5 w-5" />}
        />
      </div>
    </Card>
  );
}

function ProfileStatusCard() {
  return (
    <Card className="p-6 shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg mb-5 text-gray-800 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-gray-500" />
        Profile Status
      </h3>
      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3 text-gray-700 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
          <ShieldCheck className="h-5 w-5 text-gray-500" />
          <span className="font-medium">Authenticated session</span>
        </div>
        <p className="text-gray-500 leading-relaxed">
          Your profile information is securely loaded from your active session.
        </p>
      </div>
    </Card>
  );
}

function EmployerProfileView({
  profile,
  onEdit,
}: {
  profile: EmployerProfileData | null;
  onEdit: () => void;
}) {
  if (!profile) {
    return (
      <Card className="md:col-span-3 p-6 shadow-sm border border-gray-200 bg-white relative">
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Edit profile"
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </button>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No company profile yet</h3>
          <p className="text-gray-500 mb-4">Click the pencil icon to create one.</p>
        </div>
      </Card>
    );
  }

  const displayValue = (value?: string | number | null) => value || "—";

  return (
    <Card className="md:col-span-3 p-6 shadow-sm border border-gray-200 bg-white relative hover:shadow-md transition-shadow">
      <button
        onClick={onEdit}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Edit profile"
      >
        <Pencil className="h-4 w-4 text-gray-500" />
      </button>

      <div className="ml-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            Employer Profile
          </h3>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Building2 className="h-4 w-4 text-gray-400" />
            Company Information
          </h4>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Company Name</p>
              <p className="text-gray-900">{displayValue(profile.companyName)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Industry</p>
              <p className="text-gray-900">{displayValue(profile.industry)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Company Size</p>
              <p className="text-gray-900">{displayValue(profile.companySize)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Founded Year</p>
              <p className="text-gray-900">{displayValue(profile.foundedYear)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
              <p className="text-gray-900">{displayValue(profile.location)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <AtSign className="h-4 w-4 text-gray-400" />
            Contact Information
          </h4>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Contact Email</p>
              <p className="text-gray-900">{displayValue(profile.contactEmail)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Contact Phone</p>
              <p className="text-gray-900">{displayValue(profile.contactPhone)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Website</p>
              {profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:underline"
                >
                  {profile.website}
                </a>
              ) : (
                <p className="text-gray-900">—</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">LinkedIn</p>
              {profile.linkedIn ? (
                <a
                  href={profile.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:underline"
                >
                  {profile.linkedIn}
                </a>
              ) : (
                <p className="text-gray-900">—</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Image className="h-4 w-4 text-gray-400" />
            Media
          </h4>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Company Logo</p>
              {profile.companyLogo ? (
                <img
                  src={profile.companyLogo}
                  alt="Company logo"
                  className="h-16 w-16 object-contain border rounded"
                />
              ) : (
                <p className="text-gray-900">—</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Company Banner</p>
              {profile.companyBanner ? (
                <img
                  src={profile.companyBanner}
                  alt="Company banner"
                  className="h-16 w-32 object-cover border rounded"
                />
              ) : (
                <p className="text-gray-900">—</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <FileText className="h-4 w-4 text-gray-400" />
            About Company
          </h4>
          <p className="text-gray-900 whitespace-pre-wrap">{displayValue(profile.aboutCompany)}</p>
        </div>
      </div>
    </Card>
  );
}

function EmployerProfileEditor({
  form,
  loading,
  saving,
  saveError,
  saveSuccess,
  fetchError,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: EmployerProfileForm;
  loading: boolean;
  saving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  fetchError: string | null;
  onChange: (field: keyof EmployerProfileForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (loading) {
    return (
      <Card className="md:col-span-3 p-8 shadow-sm border border-gray-200 bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-400">Loading employer profile...</div>
        </div>
      </Card>
    );
  }

  const hasValue = (value: string) => value.trim().length > 0;

  return (
    <Card className="md:col-span-3 p-6 shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-500" />
          Employer Profile
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Fill in your company details. Fields with data appear with darker text.
        </p>
      </div>

      {fetchError && (
        <div className="border border-gray-200 bg-gray-50 text-gray-700 rounded-lg p-4 text-sm mb-6">
          {fetchError}
        </div>
      )}
      {saveError && (
        <div className="border border-gray-200 bg-gray-50 text-gray-700 rounded-lg p-4 text-sm mb-6">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="border border-gray-200 bg-gray-50 text-gray-700 rounded-lg p-4 text-sm mb-6">
          {saveSuccess}
        </div>
      )}

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <Building2 className="h-4 w-4 text-gray-400" />
          Company Information
        </h4>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Company Name <span className="text-gray-400">*</span>
            </label>
            <Input
              placeholder="e.g. Acme Inc."
              value={form.companyName}
              onChange={(e) => onChange("companyName", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.companyName) ? "text-gray-900 font-medium" : "text-gray-600"
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Industry
            </label>
            <Input
              placeholder="e.g. Technology"
              value={form.industry}
              onChange={(e) => onChange("industry", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.industry) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Company Size
            </label>
            <Input
              placeholder="e.g. 51-200 employees"
              value={form.companySize}
              onChange={(e) => onChange("companySize", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.companySize) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Founded Year
            </label>
            <Input
              placeholder="e.g. 2010"
              value={form.foundedYear}
              onChange={(e) => onChange("foundedYear", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.foundedYear) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Location
            </label>
            <Input
              placeholder="e.g. San Francisco, CA"
              value={form.location}
              onChange={(e) => onChange("location", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.location) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <AtSign className="h-4 w-4 text-gray-400" />
          Contact Information
        </h4>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Contact Email
            </label>
            <Input
              placeholder="e.g. hr@company.com"
              type="email"
              value={form.contactEmail}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.contactEmail) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Contact Phone
            </label>
            <Input
              placeholder="e.g. +1 234 567 890"
              value={form.contactPhone}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.contactPhone) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Website URL
            </label>
            <Input
              placeholder="https://example.com"
              value={form.website}
              onChange={(e) => onChange("website", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.website) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              LinkedIn URL
            </label>
            <Input
              placeholder="https://linkedin.com/company/..."
              value={form.linkedIn}
              onChange={(e) => onChange("linkedIn", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.linkedIn) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <Image className="h-4 w-4 text-gray-400" />
          Media
        </h4>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Company Logo URL
            </label>
            <Input
              placeholder="https://example.com/logo.png"
              value={form.companyLogo}
              onChange={(e) => onChange("companyLogo", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.companyLogo) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Company Banner URL
            </label>
            <Input
              placeholder="https://example.com/banner.jpg"
              value={form.companyBanner}
              onChange={(e) => onChange("companyBanner", e.target.value)}
              className={`focus-visible:ring-1 focus-visible:ring-gray-300 ${
                hasValue(form.companyBanner) ? "text-gray-900" : "text-gray-600"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <FileText className="h-4 w-4 text-gray-400" />
          About Company
        </h4>
        <div className="space-y-1">
          <Textarea
            placeholder="Tell potential candidates about your company..."
            rows={5}
            value={form.aboutCompany}
            onChange={(e) => onChange("aboutCompany", e.target.value)}
            className={`focus-visible:ring-1 focus-visible:ring-gray-300 resize-none ${
              hasValue(form.aboutCompany) ? "text-gray-900" : "text-gray-600"
            }`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={saving}
          className="bg-gray-800 hover:bg-gray-900 text-white shadow-sm hover:shadow-md transition-all px-6"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Employer Profile"}
        </Button>
      </div>
    </Card>
  );
}

function JsonSection({ title, value }: { title: string; value: unknown }) {
  const items = Array.isArray(value) ? value : [];
  const hasItems = items.length > 0;
  const isSkillsSection = title.toLowerCase() === "skills";
  const isProfileDetailSection = [
    "experience",
    "internships",
    "education",
    "projects",
    "certifications",
    "achievements",
    "languages",
  ].includes(title.toLowerCase());

  const toLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

  const renderValue = (raw: unknown) => {
    if (Array.isArray(raw)) return raw.filter(Boolean).join(", ") || "-";
    if (typeof raw === "boolean") return raw ? "Yes" : "No";
    if (raw === null || raw === undefined || raw === "") return "-";
    return String(raw);
  };

  const sectionConfig: Record<string, { badge: string; card: string; accent: string }> = {
    experience: {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      card: "bg-gray-50 border-gray-200",
      accent: "bg-gray-400",
    },
    internships: {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      card: "bg-gray-50 border-gray-200",
      accent: "bg-gray-400",
    },
    education: {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      card: "bg-gray-50 border-gray-200",
      accent: "bg-gray-400",
    },
    projects: {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      card: "bg-gray-50 border-gray-200",
      accent: "bg-gray-400",
    },
    certifications: {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      card: "bg-gray-50 border-gray-200",
      accent: "bg-gray-400",
    },
    achievements: {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      card: "bg-gray-50 border-gray-200",
      accent: "bg-gray-400",
    },
    languages: {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      card: "bg-gray-50 border-gray-200",
      accent: "bg-gray-400",
    },
  };
  const activeConfig =
    sectionConfig[title.toLowerCase()] || sectionConfig.experience;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
      </div>
      {hasItems ? (
        isSkillsSection ? (
          <div className="flex flex-wrap gap-2">
            {items
              .map((item) => (typeof item === "string" ? item.trim() : ""))
              .filter(Boolean)
              .map((skill, index) => (
                <div
                  key={`${skill}-${index}`}
                  className="inline-flex w-fit items-center rounded-full border border-gray-400 bg-white px-3 py-1.5 text-sm text-gray-800"
                >
                  {skill}
                </div>
              ))}
          </div>
        ) : isProfileDetailSection ? (
          <div className="space-y-3">
            {items.map((item: any, index) => {
              const entries =
                item && typeof item === "object"
                  ? Object.entries(item).filter(
                      ([key, val]) =>
                        key !== "_id" &&
                        val !== null &&
                        val !== undefined &&
                        !(typeof val === "string" && val.trim() === "") &&
                        !(Array.isArray(val) && val.length === 0)
                    )
                  : [];
              const header =
                (item?.position as string) ||
                (item?.role as string) ||
                (item?.title as string) ||
                (item?.degree as string) ||
                (item?.language as string) ||
                `${title.slice(0, -1) || title} #${index + 1}`;
              const subHeader =
                (item?.company as string) ||
                (item?.institution as string) ||
                (item?.issuingOrganization as string) ||
                (item?.proficiency as string) ||
                "";

              return (
                <div
                  key={index}
                  className={`rounded-lg border p-4 shadow-sm ${activeConfig.card}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{header}</p>
                      {subHeader ? (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{subHeader}</p>
                      ) : null}
                    </div>
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${activeConfig.accent}`}
                      aria-hidden="true"
                    />
                  </div>

                  {entries.length > 0 ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {entries.map(([key, val]) => (
                        <div key={key} className="rounded-md border border-gray-200 bg-white px-2.5 py-2">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                            {toLabel(key)}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-800 break-words">
                            {renderValue(val)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-400">
                      {renderValue(item)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item: any, index) => {
            const entries =
              item && typeof item === "object"
                ? Object.entries(item).filter(
                    ([key, val]) =>
                      key !== "_id" &&
                      val !== null &&
                      val !== undefined &&
                      !(typeof val === "string" && val.trim() === "") &&
                      !(Array.isArray(val) && val.length === 0)
                  )
                : [];

            return (
              <div key={index} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                {entries.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    {entries.map(([key, val]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-500">{toLabel(key)}: </span>
                        <span className="text-gray-800">{renderValue(val)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">{renderValue(item)}</div>
                )}
              </div>
            );
            })}
          </div>
        )
      ) : (
        <div className="text-xs rounded-md border border-gray-100 bg-gray-50 p-3 text-gray-400">
          No details added yet.
        </div>
      )}
    </div>
  );
}

function JobseekerProfileView({
  profile,
  onEdit,
}: {
  profile: JobseekerProfileData | null;
  onEdit: () => void;
}) {
  if (!profile) {
    return (
      <Card className="md:col-span-3 p-6 shadow-sm border border-gray-200 bg-white relative">
        <button
          onClick={onEdit}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Edit profile"
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </button>
        <div className="text-center py-12">
          <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No jobseeker profile yet</h3>
          <p className="text-gray-500 mb-4">Click the pencil icon to create one.</p>
        </div>
      </Card>
    );
  }

  const show = (value?: string | number | null) => value || "-";
  const profileStrength = calculateJobseekerProfileStrengthFromData(profile);

  return (
    <Card className="md:col-span-3 p-6 shadow-sm border border-gray-200 bg-white relative hover:shadow-md transition-shadow">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-gray-500" />
            Jobseeker Profile
          </h3>
          <button
            onClick={onEdit}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Edit profile"
          >
            <Pencil className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <InfoRow label="Headline" value={show(profile.headline)} icon={<Briefcase className="h-4 w-4" />} />
          <InfoRow label="Phone" value={show(profile.phone)} icon={<Phone className="h-4 w-4" />} />
          <InfoRow label="Location" value={show(profile.location)} icon={<MapPin className="h-4 w-4" />} />
          <InfoRow
            label="Profile Strength"
            value={`${profileStrength}%`}
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Bio</h4>
          <p className="text-gray-900 whitespace-pre-wrap">{show(profile.bio)}</p>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Social Links</h4>
          <div className="grid md:grid-cols-2 gap-5">
            <InfoRow label="LinkedIn" value={show(profile.socialLinks?.linkedin)} icon={<Linkedin className="h-4 w-4" />} />
            <InfoRow label="GitHub" value={show(profile.socialLinks?.github)} icon={<Link2 className="h-4 w-4" />} />
            <InfoRow label="Portfolio" value={show(profile.socialLinks?.portfolio)} icon={<Globe className="h-4 w-4" />} />
            <InfoRow label="Twitter" value={show(profile.socialLinks?.twitter)} icon={<AtSign className="h-4 w-4" />} />
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Job Preferences</h4>
          <div className="grid md:grid-cols-2 gap-5">
            <InfoRow label="Preferred Role" value={show(profile.jobPreferences?.preferredRole)} icon={<Briefcase className="h-4 w-4" />} />
            <InfoRow label="Preferred Location" value={show(profile.jobPreferences?.preferredLocation)} icon={<MapPin className="h-4 w-4" />} />
            <InfoRow label="Expected Salary" value={show(profile.jobPreferences?.expectedSalary)} icon={<Calendar className="h-4 w-4" />} />
            <InfoRow label="Job Type / Availability" value={`${show(profile.jobPreferences?.jobType)} / ${show(profile.jobPreferences?.availability)}`} icon={<ShieldCheck className="h-4 w-4" />} />
          </div>
        </div>

        <div className="grid gap-4">
          <JsonSection title="Skills" value={profile.skills} />
          <JsonSection title="Experience" value={profile.experience} />
          <JsonSection title="Internships" value={profile.internships} />
          <JsonSection title="Education" value={profile.education} />
          <JsonSection title="Projects" value={profile.projects} />
          <JsonSection title="Certifications" value={profile.certifications} />
          <JsonSection title="Achievements" value={profile.achievements} />
          <JsonSection title="Languages" value={profile.languages} />
        </div>
      </div>
    </Card>
  );
}

function JobseekerProfileEditor({
  form,
  loading,
  saving,
  saveError,
  saveSuccess,
  fetchError,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: JobseekerProfileForm;
  loading: boolean;
  saving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  fetchError: string | null;
  onChange: (field: keyof JobseekerProfileForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (loading) {
    return (
      <Card className="md:col-span-3 p-8 shadow-sm border border-gray-200 bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-400">Loading jobseeker profile...</div>
        </div>
      </Card>
    );
  }

  type SkillItem = string;
  type ExperienceItem = {
    company?: string;
    position?: string;
    employmentType?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    description?: string;
    location?: string;
  };
  type InternshipItem = {
    company?: string;
    role?: string;
    duration?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    certificateUrl?: string;
  };
  type EducationItem = {
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
    grade?: string;
  };
  type ProjectItem = {
    title?: string;
    description?: string;
    technologies?: string[];
    githubLink?: string;
    liveLink?: string;
    startDate?: string;
    endDate?: string;
  };
  type CertificationItem = {
    title?: string;
    issuingOrganization?: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  };
  type AchievementItem = { title?: string; description?: string; date?: string };
  type LanguageItem = { language?: string; proficiency?: string };

  const parseArrayField = <T,>(value: string): T[] => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  };

  const setArrayField = (
    field:
      | "skills"
      | "experience"
      | "internships"
      | "education"
      | "projects"
      | "certifications"
      | "achievements"
      | "languages",
    value: unknown[]
  ) => {
    onChange(field, JSON.stringify(value));
  };

  const skills = parseArrayField<SkillItem>(form.skills).filter(
    (skill): skill is string => typeof skill === "string"
  );
  const experience = parseArrayField<ExperienceItem>(form.experience);
  const internships = parseArrayField<InternshipItem>(form.internships);
  const education = parseArrayField<EducationItem>(form.education);
  const projects = parseArrayField<ProjectItem>(form.projects);
  const certifications = parseArrayField<CertificationItem>(form.certifications);
  const achievements = parseArrayField<AchievementItem>(form.achievements);
  const languages = parseArrayField<LanguageItem>(form.languages);
  const calculatedProfileStrength = calculateJobseekerProfileStrengthFromForm(form);
  const [skillQuery, setSkillQuery] = useState("");

  const predefinedSkills = [
    "React",
    "Node.js",
    "Express.js",
    "TypeScript",
    "JavaScript",
    "MongoDB",
    "SQL",
    "HTML",
    "CSS",
    "Next.js",
    "Redux",
    "Git",
  ];

  const isSelectedSkill = (value: string) =>
    skills.some((skill) => skill.toLowerCase() === value.toLowerCase());

  const filteredSkillOptions = predefinedSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(skillQuery.trim().toLowerCase()) &&
      !isSelectedSkill(skill)
  );

  const addSkill = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value || isSelectedSkill(value)) return;
    setArrayField("skills", [...skills, value]);
    setSkillQuery("");
  };

  const removeSkill = (skillToRemove: string) => {
    setArrayField(
      "skills",
      skills.filter((skill) => skill.toLowerCase() !== skillToRemove.toLowerCase())
    );
  };

  return (
    <Card className="md:col-span-3 p-6 shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-gray-500" />
          Jobseeker Profile
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Fill all your details.
        </p>
      </div>

      {fetchError && <div className="border border-gray-200 bg-gray-50 text-gray-700 rounded-lg p-4 text-sm mb-6">{fetchError}</div>}
      {saveError && <div className="border border-gray-200 bg-gray-50 text-gray-700 rounded-lg p-4 text-sm mb-6">{saveError}</div>}
      {saveSuccess && <div className="border border-gray-200 bg-gray-50 text-gray-700 rounded-lg p-4 text-sm mb-6">{saveSuccess}</div>}

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <Input placeholder="Headline" value={form.headline} onChange={(e) => onChange("headline", e.target.value)} />
        <Input placeholder="Phone" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />
        <Input placeholder="Location" value={form.location} onChange={(e) => onChange("location", e.target.value)} />
        <Input placeholder="Profile Image URL" value={form.profileImage} onChange={(e) => onChange("profileImage", e.target.value)} />
        <Input placeholder="Resume URL" value={form.resume} onChange={(e) => onChange("resume", e.target.value)} />
        <div className="flex h-9 items-center rounded-md border border-input bg-gray-50 px-3 text-sm text-gray-700">
          Profile Strength: <span className="ml-1.5 font-semibold text-gray-800">{calculatedProfileStrength}%</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-600 mb-1 block">Bio</label>
        <Textarea rows={4} placeholder="Write your bio..." value={form.bio} onChange={(e) => onChange("bio", e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <Input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => onChange("linkedin", e.target.value)} />
        <Input placeholder="GitHub URL" value={form.github} onChange={(e) => onChange("github", e.target.value)} />
        <Input placeholder="Portfolio URL" value={form.portfolio} onChange={(e) => onChange("portfolio", e.target.value)} />
        <Input placeholder="Twitter URL" value={form.twitter} onChange={(e) => onChange("twitter", e.target.value)} />
        <Input placeholder="Preferred Role" value={form.preferredRole} onChange={(e) => onChange("preferredRole", e.target.value)} />
        <Input placeholder="Preferred Location" value={form.preferredLocation} onChange={(e) => onChange("preferredLocation", e.target.value)} />
        <Input placeholder="Expected Salary" value={form.expectedSalary} onChange={(e) => onChange("expectedSalary", e.target.value)} />
        <select
          value={form.jobType}
          onChange={(e) => onChange("jobType", e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
        >
          <option value="">Select job type</option>
          <option value="Remote">Remote</option>
          <option value="Onsite">Onsite</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <select
          value={form.availability}
          onChange={(e) => onChange("availability", e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
        >
          <option value="">Select availability</option>
          <option value="Immediate">Immediate</option>
          <option value="15 Days">15 Days</option>
          <option value="1 Month">1 Month</option>
          <option value="2+ Months">2+ Months</option>
        </select>
      </div>

      <div className="grid gap-6 mb-6">
        <div className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Skills</label>
          </div>
          <Input
            placeholder="Search or type a skill and press Enter"
            value={skillQuery}
            onChange={(e) => setSkillQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillQuery);
              }
            }}
          />

          {skillQuery.trim().length > 0 && filteredSkillOptions.length > 0 && (
            <div className="border border-gray-100 rounded-md max-h-40 overflow-auto bg-white">
              {filteredSkillOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0"
                  onClick={() => addSkill(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {skills.length === 0 ? (
            <p className="text-sm text-gray-500">No skills added.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={`${skill}-${index}`}
                  className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gray-400 bg-white px-3 py-1.5 text-sm text-gray-800"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Experience</label>
            <Button type="button" size="sm" variant="outline" onClick={() => setArrayField("experience", [...experience, { company: "", position: "", employmentType: "", startDate: "", endDate: "", currentlyWorking: false, description: "", location: "" }])}>
              <Plus className="h-4 w-4 mr-1" />
              Add Experience
            </Button>
          </div>
          {experience.length === 0 && <p className="text-sm text-gray-500">No experience added.</p>}
          {experience.map((item, index) => (
            <div key={index} className="border border-gray-100 rounded-md p-3 grid md:grid-cols-2 gap-3">
              <Input placeholder="Company" value={item.company || ""} onChange={(e) => { const next = [...experience]; next[index] = { ...next[index], company: e.target.value }; setArrayField("experience", next); }} />
              <Input placeholder="Position" value={item.position || ""} onChange={(e) => { const next = [...experience]; next[index] = { ...next[index], position: e.target.value }; setArrayField("experience", next); }} />
              <select
                value={item.employmentType || ""}
                onChange={(e) => {
                  const next = [...experience];
                  next[index] = { ...next[index], employmentType: e.target.value };
                  setArrayField("experience", next);
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
              >
                <option value="">Select employment type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
              <Input placeholder="Location" value={item.location || ""} onChange={(e) => { const next = [...experience]; next[index] = { ...next[index], location: e.target.value }; setArrayField("experience", next); }} />
              <Input type="date" value={item.startDate || ""} onChange={(e) => { const next = [...experience]; next[index] = { ...next[index], startDate: e.target.value }; setArrayField("experience", next); }} />
              <Input type="date" value={item.endDate || ""} onChange={(e) => { const next = [...experience]; next[index] = { ...next[index], endDate: e.target.value }; setArrayField("experience", next); }} />
              <Textarea className="md:col-span-2" rows={3} placeholder="Description" value={item.description || ""} onChange={(e) => { const next = [...experience]; next[index] = { ...next[index], description: e.target.value }; setArrayField("experience", next); }} />
              <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
                <input
                  type="checkbox"
                  checked={!!item.currentlyWorking}
                  onChange={(e) => {
                    const next = [...experience];
                    next[index] = { ...next[index], currentlyWorking: e.target.checked };
                    setArrayField("experience", next);
                  }}
                />
                Currently working here
              </label>
              <Button type="button" variant="outline" className="md:col-span-2" onClick={() => setArrayField("experience", experience.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4 mr-1" />
                Remove Experience
              </Button>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Internships</label>
            <Button type="button" size="sm" variant="outline" onClick={() => setArrayField("internships", [...internships, { company: "", role: "", duration: "", startDate: "", endDate: "", description: "", certificateUrl: "" }])}>
              <Plus className="h-4 w-4 mr-1" />
              Add Internship
            </Button>
          </div>
          {internships.map((item, index) => (
            <div key={index} className="border border-gray-100 rounded-md p-3 grid md:grid-cols-2 gap-3">
              <Input placeholder="Company" value={item.company || ""} onChange={(e) => { const next = [...internships]; next[index] = { ...next[index], company: e.target.value }; setArrayField("internships", next); }} />
              <Input placeholder="Role" value={item.role || ""} onChange={(e) => { const next = [...internships]; next[index] = { ...next[index], role: e.target.value }; setArrayField("internships", next); }} />
              <Input placeholder="Duration" value={item.duration || ""} onChange={(e) => { const next = [...internships]; next[index] = { ...next[index], duration: e.target.value }; setArrayField("internships", next); }} />
              <Input placeholder="Certificate URL" value={item.certificateUrl || ""} onChange={(e) => { const next = [...internships]; next[index] = { ...next[index], certificateUrl: e.target.value }; setArrayField("internships", next); }} />
              <Input type="date" value={item.startDate || ""} onChange={(e) => { const next = [...internships]; next[index] = { ...next[index], startDate: e.target.value }; setArrayField("internships", next); }} />
              <Input type="date" value={item.endDate || ""} onChange={(e) => { const next = [...internships]; next[index] = { ...next[index], endDate: e.target.value }; setArrayField("internships", next); }} />
              <Textarea className="md:col-span-2" rows={3} placeholder="Description" value={item.description || ""} onChange={(e) => { const next = [...internships]; next[index] = { ...next[index], description: e.target.value }; setArrayField("internships", next); }} />
              <Button type="button" variant="outline" className="md:col-span-2" onClick={() => setArrayField("internships", internships.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4 mr-1" />
                Remove Internship
              </Button>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Education</label>
            <Button type="button" size="sm" variant="outline" onClick={() => setArrayField("education", [...education, { institution: "", degree: "", fieldOfStudy: "", startYear: undefined, endYear: undefined, grade: "" }])}>
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </Button>
          </div>
          {education.map((item, index) => (
            <div key={index} className="border border-gray-100 rounded-md p-3 grid md:grid-cols-2 gap-3">
              <Input placeholder="Institution" value={item.institution || ""} onChange={(e) => { const next = [...education]; next[index] = { ...next[index], institution: e.target.value }; setArrayField("education", next); }} />
              <Input placeholder="Degree" value={item.degree || ""} onChange={(e) => { const next = [...education]; next[index] = { ...next[index], degree: e.target.value }; setArrayField("education", next); }} />
              <Input placeholder="Field of Study" value={item.fieldOfStudy || ""} onChange={(e) => { const next = [...education]; next[index] = { ...next[index], fieldOfStudy: e.target.value }; setArrayField("education", next); }} />
              <Input placeholder="Grade" value={item.grade || ""} onChange={(e) => { const next = [...education]; next[index] = { ...next[index], grade: e.target.value }; setArrayField("education", next); }} />
              <Input type="number" placeholder="Start Year" value={item.startYear ?? ""} onChange={(e) => { const next = [...education]; next[index] = { ...next[index], startYear: e.target.value ? Number(e.target.value) : undefined }; setArrayField("education", next); }} />
              <Input type="number" placeholder="End Year" value={item.endYear ?? ""} onChange={(e) => { const next = [...education]; next[index] = { ...next[index], endYear: e.target.value ? Number(e.target.value) : undefined }; setArrayField("education", next); }} />
              <Button type="button" variant="outline" className="md:col-span-2" onClick={() => setArrayField("education", education.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4 mr-1" />
                Remove Education
              </Button>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Projects</label>
            <Button type="button" size="sm" variant="outline" onClick={() => setArrayField("projects", [...projects, { title: "", description: "", technologies: [], githubLink: "", liveLink: "", startDate: "", endDate: "" }])}>
              <Plus className="h-4 w-4 mr-1" />
              Add Project
            </Button>
          </div>
          {projects.map((item, index) => (
            <div key={index} className="border border-gray-100 rounded-md p-3 grid md:grid-cols-2 gap-3">
              <Input placeholder="Title" value={item.title || ""} onChange={(e) => { const next = [...projects]; next[index] = { ...next[index], title: e.target.value }; setArrayField("projects", next); }} />
              <Input placeholder="Technologies (comma separated)" value={(item.technologies || []).join(", ")} onChange={(e) => { const next = [...projects]; next[index] = { ...next[index], technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }; setArrayField("projects", next); }} />
              <Input placeholder="GitHub Link" value={item.githubLink || ""} onChange={(e) => { const next = [...projects]; next[index] = { ...next[index], githubLink: e.target.value }; setArrayField("projects", next); }} />
              <Input placeholder="Live Link" value={item.liveLink || ""} onChange={(e) => { const next = [...projects]; next[index] = { ...next[index], liveLink: e.target.value }; setArrayField("projects", next); }} />
              <Input type="date" value={item.startDate || ""} onChange={(e) => { const next = [...projects]; next[index] = { ...next[index], startDate: e.target.value }; setArrayField("projects", next); }} />
              <Input type="date" value={item.endDate || ""} onChange={(e) => { const next = [...projects]; next[index] = { ...next[index], endDate: e.target.value }; setArrayField("projects", next); }} />
              <Textarea className="md:col-span-2" rows={3} placeholder="Description" value={item.description || ""} onChange={(e) => { const next = [...projects]; next[index] = { ...next[index], description: e.target.value }; setArrayField("projects", next); }} />
              <Button type="button" variant="outline" className="md:col-span-2" onClick={() => setArrayField("projects", projects.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4 mr-1" />
                Remove Project
              </Button>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Certifications</label>
            <Button type="button" size="sm" variant="outline" onClick={() => setArrayField("certifications", [...certifications, { title: "", issuingOrganization: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" }])}>
              <Plus className="h-4 w-4 mr-1" />
              Add Certification
            </Button>
          </div>
          {certifications.map((item, index) => (
            <div key={index} className="border border-gray-100 rounded-md p-3 grid md:grid-cols-2 gap-3">
              <Input placeholder="Title" value={item.title || ""} onChange={(e) => { const next = [...certifications]; next[index] = { ...next[index], title: e.target.value }; setArrayField("certifications", next); }} />
              <Input placeholder="Issuing Organization" value={item.issuingOrganization || ""} onChange={(e) => { const next = [...certifications]; next[index] = { ...next[index], issuingOrganization: e.target.value }; setArrayField("certifications", next); }} />
              <Input placeholder="Credential ID" value={item.credentialId || ""} onChange={(e) => { const next = [...certifications]; next[index] = { ...next[index], credentialId: e.target.value }; setArrayField("certifications", next); }} />
              <Input placeholder="Credential URL" value={item.credentialUrl || ""} onChange={(e) => { const next = [...certifications]; next[index] = { ...next[index], credentialUrl: e.target.value }; setArrayField("certifications", next); }} />
              <Input type="date" value={item.issueDate || ""} onChange={(e) => { const next = [...certifications]; next[index] = { ...next[index], issueDate: e.target.value }; setArrayField("certifications", next); }} />
              <Input type="date" value={item.expiryDate || ""} onChange={(e) => { const next = [...certifications]; next[index] = { ...next[index], expiryDate: e.target.value }; setArrayField("certifications", next); }} />
              <Button type="button" variant="outline" className="md:col-span-2" onClick={() => setArrayField("certifications", certifications.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4 mr-1" />
                Remove Certification
              </Button>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Achievements</label>
            <Button type="button" size="sm" variant="outline" onClick={() => setArrayField("achievements", [...achievements, { title: "", description: "", date: "" }])}>
              <Plus className="h-4 w-4 mr-1" />
              Add Achievement
            </Button>
          </div>
          {achievements.map((item, index) => (
            <div key={index} className="border border-gray-100 rounded-md p-3 grid md:grid-cols-2 gap-3">
              <Input placeholder="Title" value={item.title || ""} onChange={(e) => { const next = [...achievements]; next[index] = { ...next[index], title: e.target.value }; setArrayField("achievements", next); }} />
              <Input type="date" value={item.date || ""} onChange={(e) => { const next = [...achievements]; next[index] = { ...next[index], date: e.target.value }; setArrayField("achievements", next); }} />
              <Textarea className="md:col-span-2" rows={3} placeholder="Description" value={item.description || ""} onChange={(e) => { const next = [...achievements]; next[index] = { ...next[index], description: e.target.value }; setArrayField("achievements", next); }} />
              <Button type="button" variant="outline" className="md:col-span-2" onClick={() => setArrayField("achievements", achievements.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4 mr-1" />
                Remove Achievement
              </Button>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Languages</label>
            <Button type="button" size="sm" variant="outline" onClick={() => setArrayField("languages", [...languages, { language: "", proficiency: "" }])}>
              <Plus className="h-4 w-4 mr-1" />
              Add Language
            </Button>
          </div>
          {languages.map((item, index) => (
            <div key={index} className="grid md:grid-cols-3 gap-3 items-center">
              <Input
                placeholder="Language"
                value={item.language || ""}
                onChange={(e) => {
                  const next = [...languages];
                  next[index] = { ...next[index], language: e.target.value };
                  setArrayField("languages", next);
                }}
              />
              <select
                value={item.proficiency || ""}
                onChange={(e) => {
                  const next = [...languages];
                  next[index] = { ...next[index], proficiency: e.target.value };
                  setArrayField("languages", next);
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
              >
                <option value="">Select proficiency</option>
                <option value="Basic">Basic</option>
                <option value="Conversational">Conversational</option>
                <option value="Fluent">Fluent</option>
                <option value="Native">Native</option>
              </select>
              <Button type="button" variant="outline" onClick={() => setArrayField("languages", languages.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={saving} className="bg-gray-800 hover:bg-gray-900 text-white px-6">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Jobseeker Profile"}
        </Button>
      </div>
    </Card>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [employerProfile, setEmployerProfile] = useState<EmployerProfileData | null>(null);
  const [employerForm, setEmployerForm] = useState<EmployerProfileForm>(emptyEmployerForm);
  const [employerLoading, setEmployerLoading] = useState(false);
  const [employerError, setEmployerError] = useState<string | null>(null);
  const [jobseekerProfile, setJobseekerProfile] = useState<JobseekerProfileData | null>(null);
  const [jobseekerForm, setJobseekerForm] = useState<JobseekerProfileForm>(emptyJobseekerForm);
  const [jobseekerLoading, setJobseekerLoading] = useState(false);
  const [jobseekerError, setJobseekerError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchEmployerProfile = async () => {
      if (!user || user.role !== "employer") {
        setEmployerProfile(null);
        setEmployerForm(emptyEmployerForm);
        setEmployerError(null);
        return;
      }

      setEmployerLoading(true);
      setEmployerError(null);
      setSaveError(null);
      setSaveSuccess(null);
      try {
        const response = await fetch(`${API_BASE_URL}/employer-profiles/employer/${user.id}`);
        const data = await response.json().catch(() => null);

        if (response.status === 404) {
          setEmployerProfile(null);
          setEmployerForm(emptyEmployerForm);
          return;
        }
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load employer profile");
        }

        const profile = data?.profile as EmployerProfileData;
        setEmployerProfile(profile);
        setEmployerForm(mapProfileToForm(profile));
      } catch (error: any) {
        setEmployerError(error?.message || "Failed to load employer profile");
      } finally {
        setEmployerLoading(false);
      }
    };

    const fetchJobseekerProfile = async () => {
      if (!user || user.role !== "job_seeker") {
        setJobseekerProfile(null);
        setJobseekerForm(emptyJobseekerForm);
        setJobseekerError(null);
        return;
      }

      setJobseekerLoading(true);
      setJobseekerError(null);
      setSaveError(null);
      setSaveSuccess(null);
      try {
        const response = await fetch(`${API_BASE_URL}/jobseeker-profiles/user/${user.id}`);
        const data = await response.json().catch(() => null);

        if (response.status === 404) {
          setJobseekerProfile(null);
          setJobseekerForm(emptyJobseekerForm);
          return;
        }
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load jobseeker profile");
        }

        const profile = data?.profile as JobseekerProfileData;
        setJobseekerProfile(profile);
        setJobseekerForm(mapJobseekerProfileToForm(profile));
      } catch (error: any) {
        setJobseekerError(error?.message || "Failed to load jobseeker profile");
      } finally {
        setJobseekerLoading(false);
      }
    };

    fetchEmployerProfile();
    fetchJobseekerProfile();
    setIsEditing(false);
  }, [user]);

  const handleEmployerChange = (field: keyof EmployerProfileForm, value: string) => {
    setEmployerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleJobseekerChange = (field: keyof JobseekerProfileForm, value: string) => {
    setJobseekerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user?.role === "employer") {
      if (employerProfile) {
        setEmployerForm(mapProfileToForm(employerProfile));
      } else {
        setEmployerForm(emptyEmployerForm);
      }
    }
    if (user?.role === "job_seeker") {
      if (jobseekerProfile) {
        setJobseekerForm(mapJobseekerProfileToForm(jobseekerProfile));
      } else {
        setJobseekerForm(emptyJobseekerForm);
      }
    }
    setSaveError(null);
    setSaveSuccess(null);
  };

  const parseJsonArray = (value: string, fieldName: string) => {
    try {
      const parsed = JSON.parse(value.trim() || "[]");
      if (!Array.isArray(parsed)) {
        throw new Error(`${fieldName} must be a JSON array.`);
      }
      return parsed;
    } catch (err) {
      throw new Error(`${fieldName} must be valid JSON array.`);
    }
  };

  const handleJobseekerSave = async () => {
    if (!user || user.role !== "job_seeker") return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const parsedSkills = parseJsonArray(jobseekerForm.skills, "skills");
      const parsedExperience = parseJsonArray(jobseekerForm.experience, "experience");
      const parsedInternships = parseJsonArray(jobseekerForm.internships, "internships");
      const parsedEducation = parseJsonArray(jobseekerForm.education, "education");
      const parsedProjects = parseJsonArray(jobseekerForm.projects, "projects");
      const parsedCertifications = parseJsonArray(jobseekerForm.certifications, "certifications");
      const parsedAchievements = parseJsonArray(jobseekerForm.achievements, "achievements");
      const parsedLanguages = parseJsonArray(jobseekerForm.languages, "languages");
      const calculatedProfileStrength = calculateJobseekerProfileStrengthFromForm(jobseekerForm);
      const payload = {
        user: user.id,
        headline: jobseekerForm.headline.trim(),
        bio: jobseekerForm.bio.trim(),
        phone: jobseekerForm.phone.trim(),
        location: jobseekerForm.location.trim(),
        profileImage: jobseekerForm.profileImage.trim(),
        resume: jobseekerForm.resume.trim(),
        skills: parsedSkills
          .map((skill) => (typeof skill === "string" ? skill : ""))
          .filter((skill) => skill.trim().length > 0),
        experience: parsedExperience,
        internships: parsedInternships,
        education: parsedEducation,
        projects: parsedProjects,
        certifications: parsedCertifications,
        achievements: parsedAchievements,
        languages: parsedLanguages,
        socialLinks: {
          linkedin: jobseekerForm.linkedin.trim(),
          github: jobseekerForm.github.trim(),
          portfolio: jobseekerForm.portfolio.trim(),
          twitter: jobseekerForm.twitter.trim(),
        },
        jobPreferences: {
          preferredRole: jobseekerForm.preferredRole.trim(),
          preferredLocation: jobseekerForm.preferredLocation.trim(),
          expectedSalary: jobseekerForm.expectedSalary.trim()
            ? Number(jobseekerForm.expectedSalary.trim())
            : undefined,
          jobType: jobseekerForm.jobType.trim() || undefined,
          availability: jobseekerForm.availability.trim() || undefined,
        },
        profileStrength: calculatedProfileStrength,
      };

      const url = jobseekerProfile
        ? `${API_BASE_URL}/jobseeker-profiles/${jobseekerProfile._id}`
        : `${API_BASE_URL}/jobseeker-profiles`;
      const method = jobseekerProfile ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save jobseeker profile");
      }

      const savedProfile = data?.profile as JobseekerProfileData | undefined;
      if (savedProfile) {
        setJobseekerProfile(savedProfile);
        setJobseekerForm(mapJobseekerProfileToForm(savedProfile));
      }
      setSaveSuccess("Jobseeker profile saved successfully.");
      setIsEditing(false);
    } catch (error: any) {
      setSaveError(error?.message || "Failed to save jobseeker profile");
    } finally {
      setSaving(false);
    }
  };

  const handleEmployerSave = async () => {
    if (!user || user.role !== "employer") return;

    if (!employerForm.companyName.trim()) {
      setSaveError("Company name is required.");
      setSaveSuccess(null);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const payload = {
      employer: user.id,
      companyName: employerForm.companyName.trim(),
      companyLogo: employerForm.companyLogo.trim(),
      industry: employerForm.industry.trim(),
      companySize: employerForm.companySize.trim(),
      website: employerForm.website.trim(),
      location: employerForm.location.trim(),
      aboutCompany: employerForm.aboutCompany.trim(),
      contactEmail: employerForm.contactEmail.trim(),
      contactPhone: employerForm.contactPhone.trim(),
      linkedIn: employerForm.linkedIn.trim(),
      companyBanner: employerForm.companyBanner.trim(),
      foundedYear: employerForm.foundedYear.trim()
        ? Number(employerForm.foundedYear.trim())
        : undefined,
    };

    try {
      const url = employerProfile
        ? `${API_BASE_URL}/employer-profiles/${employerProfile._id}`
        : `${API_BASE_URL}/employer-profiles`;
      const method = employerProfile ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save employer profile");
      }

      const savedProfile = data?.profile as EmployerProfileData | undefined;
      if (savedProfile) {
        setEmployerProfile(savedProfile);
        setEmployerForm(mapProfileToForm(savedProfile));
      }
      setSaveSuccess("Employer profile saved successfully.");
      setIsEditing(false);
    } catch (error: any) {
      setSaveError(error?.message || "Failed to save employer profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="p-10 text-center shadow-sm border border-gray-200 bg-white">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <LogIn className="h-10 w-10 text-gray-500" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">Welcome back</h1>
          <p className="text-gray-500 mb-8">Please sign in to view and manage your profile.</p>
          <Button asChild className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white shadow-sm hover:shadow-md">
            <Link to="/">Go to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="rounded-2xl bg-white border border-gray-200 p-8 mb-8 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-gray-500 text-sm font-medium tracking-wide mb-2 flex items-center gap-1">
          <span className="w-1 h-4 bg-gray-400 rounded-full mr-2"></span>
          Account
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-3 text-lg">
          Manage your personal information and role settings.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <UserSummaryCard name={user.name} email={user.email} role={user.role} />
        <ProfileStatusCard />
        {user.role === "employer" &&
          (isEditing ? (
            <EmployerProfileEditor
              form={employerForm}
              loading={employerLoading}
              saving={saving}
              saveError={saveError}
              saveSuccess={saveSuccess}
              fetchError={employerError}
              onChange={handleEmployerChange}
              onSubmit={handleEmployerSave}
              onCancel={handleCancelEdit}
            />
          ) : (
            <EmployerProfileView
              profile={employerProfile}
              onEdit={() => setIsEditing(true)}
            />
          ))}
        {user.role === "job_seeker" &&
          (isEditing ? (
            <JobseekerProfileEditor
              form={jobseekerForm}
              loading={jobseekerLoading}
              saving={saving}
              saveError={saveError}
              saveSuccess={saveSuccess}
              fetchError={jobseekerError}
              onChange={handleJobseekerChange}
              onSubmit={handleJobseekerSave}
              onCancel={handleCancelEdit}
            />
          ) : (
            <JobseekerProfileView
              profile={jobseekerProfile}
              onEdit={() => setIsEditing(true)}
            />
          ))}
      </div>
    </div>
  );
}
