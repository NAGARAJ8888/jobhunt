import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Briefcase, Building2, Calendar, Mail, MapPin, UserCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

type JobDetails = {
  _id: string;
  title?: string;
  company?: string;
  location?: string;
  type?: string;
  salary?: string;
  logo?: string;
  tags?: string[];
  postedDate?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  about?: string;
  postedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
};

type EmployerProfile = {
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  aboutCompany?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError("Missing job ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load job details.");
        }

        const jobPayload = data?.job || data;
        if (!jobPayload?._id) {
          throw new Error("Job details are not available.");
        }

        setJob(jobPayload);
        setEmployerProfile(data?.employerProfile || null);
      } catch (err: any) {
        setError(err?.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const postedOn = useMemo(() => {
    if (!job?.postedDate) return "N/A";
    const date = new Date(job.postedDate);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  }, [job?.postedDate]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Loading job details...</p>
        </Card>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Card className="p-8 space-y-4">
          <p className="text-red-700">{error || "Job not found."}</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div>
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{job.title || "Untitled Job"}</h1>
            <p className="text-gray-700">{job.company || employerProfile?.companyName || "Unknown Company"}</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location || employerProfile?.location || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {job.type || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Posted on {postedOn}
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-800">{job.salary || "Salary not specified"}</div>
        </div>

        {Array.isArray(job.tags) && job.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <Separator />

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description || "No description provided."}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
          {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {job.requirements.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No requirements listed.</p>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Benefits</h2>
          {Array.isArray(job.benefits) && job.benefits.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {job.benefits.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No benefits listed.</p>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">About Company</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {job.about || employerProfile?.aboutCompany || "No company overview provided."}
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Employer Details</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Contact Person</p>
              <p className="text-sm text-gray-800 inline-flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-gray-500" />
                {job.postedBy?.name || "N/A"}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm text-gray-800 inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                {job.postedBy?.email || employerProfile?.contactEmail || "N/A"}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Industry</p>
              <p className="text-sm text-gray-800 inline-flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                {employerProfile?.industry || "N/A"}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Company Size</p>
              <p className="text-sm text-gray-800">{employerProfile?.companySize || "N/A"}</p>
            </div>
          </div>
        </section>
      </Card>
    </div>
  );
}
