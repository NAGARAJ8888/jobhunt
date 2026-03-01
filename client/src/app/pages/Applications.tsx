import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { useLocation, useNavigate } from "react-router";
import {
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  Link2,
  Globe,
  AtSign,
  Briefcase,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  ExternalLink,
  Save,
  Loader2,
} from "lucide-react";
import { Application, Job } from "../types";

const API_BASE_URL = "http://localhost:5000/api";

type EditableJobFields = Pick<
  Job,
  | "title"
  | "company"
  | "location"
  | "type"
  | "salary"
  | "description"
  | "about"
  | "logo"
  | "tags"
  | "requirements"
  | "benefits"
>;

const emptyJobDraft: EditableJobFields = {
  title: "",
  company: "",
  location: "",
  type: "",
  salary: "",
  description: "",
  about: "",
  logo: "",
  tags: [],
  requirements: [],
  benefits: [],
};

export default function Applications() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"jobs" | "applications">("jobs");
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [editJob, setEditJob] = useState<Job | null>(null);
  const [jobDraft, setJobDraft] = useState<EditableJobFields>(emptyJobDraft);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [skillFilter, setSkillFilter] = useState("");
  const [educationFilter, setEducationFilter] = useState("");
  const [selectedApplicantProfile, setSelectedApplicantProfile] = useState<{
    name: string;
    email: string;
    profile?: Application["applicantProfile"];
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSkillFilter(params.get("skill") || "");
    setEducationFilter(params.get("education") || "");
  }, [location.search]);

  const hasApplicantSearch = useMemo(
    () => skillFilter.trim().length > 0 || educationFilter.trim().length > 0,
    [skillFilter, educationFilter]
  );

  useEffect(() => {
    if (!user || user.role !== "employer") return;
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/employer/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched jobs:", data);
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const enrichApplicantProfile = async (applicantId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobseeker-profiles/user/${applicantId}`);
      if (!response.ok) return undefined;
      const data = await response.json();
      const profile = data?.profile;
      if (!profile) return undefined;
      return {
        headline: profile?.headline,
        bio: profile?.bio,
        phone: profile?.phone,
        location: profile?.location,
        profileImage: profile?.profileImage,
        resume: profile?.resume,
        profileStrength: profile?.profileStrength,
        skills: Array.isArray(profile?.skills) ? profile.skills : [],
        experience: Array.isArray(profile?.experience) ? profile.experience : [],
        internships: Array.isArray(profile?.internships) ? profile.internships : [],
        education: Array.isArray(profile?.education) ? profile.education : [],
        projects: Array.isArray(profile?.projects) ? profile.projects : [],
        certifications: Array.isArray(profile?.certifications) ? profile.certifications : [],
        achievements: Array.isArray(profile?.achievements) ? profile.achievements : [],
        languages: Array.isArray(profile?.languages) ? profile.languages : [],
        socialLinks: profile?.socialLinks || {},
        jobPreferences: profile?.jobPreferences || {},
      };
    } catch {
      return undefined;
    }
  };

  const formatApplications = async (rawApplications: any[]) => {
    return Promise.all(
      rawApplications.map(async (app: any) => ({
        id: app._id,
        job: {
          id: app.job._id,
          title: app.job.title,
          company: app.job.company,
        },
        applicant: {
          id: app.applicant._id,
          name: app.applicant.name,
          email: app.applicant.email,
        },
        applicantProfile: await enrichApplicantProfile(app.applicant._id),
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        coverLetter: app.coverLetter,
        resume: app.resume,
        status: app.status,
        appliedAt: new Date(app.appliedAt).toLocaleDateString(),
      }))
    );
  };

  const fetchApplications = async (jobId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/job/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedApplications = await formatApplications(data.applications ?? []);
        setApplications(formattedApplications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchEmployerApplications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/applications/employer/${user.id}`);
      if (!response.ok) return;
      const data = await response.json();
      const formattedApplications = await formatApplications(data.applications ?? []);
      setApplications(formattedApplications);
      setSelectedJob(null);
      setView("applications");
    } catch (error) {
      console.error("Error fetching employer applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: Application["status"]) => {
    setUpdatingApplicationId(applicationId);
    setStatusError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to update application status.");
      }

      const updatedStatus = payload?.application?.status as Application["status"] | undefined;
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: updatedStatus ?? status } : app
        )
      );
    } catch (error: any) {
      setStatusError(error?.message || "Failed to update application status.");
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setJobs((prev) => prev.filter((job) => job._id !== jobId));
        }
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const viewApplications = (job: Job) => {
    setSelectedJob(job);
    fetchApplications(job._id);
    setView("applications");
  };

  const backToApplications = () => {
    setView("jobs");
    setSelectedJob(null);
    setApplications([]);
    setStatusError(null);
    navigate("/applications");
  };

  useEffect(() => {
    if (!user || user.role !== "employer") return;
    if (!hasApplicantSearch) return;
    fetchEmployerApplications();
  }, [user, hasApplicantSearch, location.search]);


  const openEditJob = (job: Job) => {
    setEditError(null);
    setEditJob(job);
    setJobDraft({
      title: job.title ?? "",
      company: job.company ?? "",
      location: job.location ?? "",
      type: job.type ?? "",
      salary: job.salary ?? "",
      description: job.description ?? "",
      about: job.about ?? "",
      logo: job.logo ?? "",
      tags: Array.isArray(job.tags) ? job.tags : [],
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
    });
    setShowEditDialog(true);
  };

  const closeEditJob = () => {
    if (editSaving) return;
    setShowEditDialog(false);
    setEditJob(null);
    setEditError(null);
  };

  const updateJobOnServer = async () => {
    if (!editJob) return;

    if (!jobDraft.title.trim()) {
      setEditError("Title is required.");
      return;
    }
    if (!jobDraft.company.trim()) {
      setEditError("Company is required.");
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${editJob._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobDraft,
          tags: jobDraft.tags.map((t) => t.trim()).filter(Boolean),
          requirements: jobDraft.requirements.map((t) => t.trim()).filter(Boolean),
          benefits: jobDraft.benefits.map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const maybeJson = await response.json().catch(() => null);
        throw new Error(maybeJson?.error || "Failed to update job.");
      }

      const updated: Job = await response.json();
      setJobs((prev) => prev.map((j) => (j._id === updated._id ? updated : j)));

      // Keep selectedJob in sync if user edited the same job while in applications view later.
      setSelectedJob((prev) => (prev?._id === updated._id ? updated : prev));

      setShowEditDialog(false);
      setEditJob(null);
    } catch (e: any) {
      setEditError(e?.message || "Failed to update job.");
    } finally {
      setEditSaving(false);
    }
  };

  // Helper to get status badge styling
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
      }
  };

  const formatDate = (value?: string | Date) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  };

  const show = (value?: string | number | null) =>
    value === null || value === undefined || value === "" ? "-" : String(value);

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

  const renderArraySection = (title: string, value: unknown) => {
    const items = Array.isArray(value) ? value : [];
    const isSkillsSection = title.toLowerCase() === "skills";
    const count = items.length;
    const cardHeader =
      title.toLowerCase() === "experience"
        ? "position"
        : title.toLowerCase() === "internships"
          ? "role"
          : title.toLowerCase() === "education"
            ? "degree"
            : title.toLowerCase() === "projects"
              ? "title"
              : title.toLowerCase() === "certifications"
                ? "title"
                : title.toLowerCase() === "achievements"
                  ? "title"
                  : title.toLowerCase() === "languages"
                    ? "language"
                    : "title";
    const cardSubHeader =
      title.toLowerCase() === "experience"
        ? "company"
        : title.toLowerCase() === "internships"
          ? "company"
          : title.toLowerCase() === "education"
            ? "institution"
            : title.toLowerCase() === "certifications"
              ? "issuingOrganization"
              : title.toLowerCase() === "languages"
                ? "proficiency"
                : "";

    return (
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold tracking-wide text-foreground">{title}</h4>
        </div>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
            No details added yet.
          </p>
        ) : isSkillsSection ? (
          <div className="flex flex-wrap gap-2">
            {items
              .map((item) => (typeof item === "string" ? item.trim() : ""))
              .filter(Boolean)
              .map((skill, index) => (
                <Badge key={`${title}-skill-${index}`} variant="secondary" className="px-2.5 py-1">
                  {skill}
                </Badge>
              ))}
          </div>
        ) : (
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
              const headerValue =
                item?.[cardHeader] ||
                item?.position ||
                item?.role ||
                item?.title ||
                item?.degree ||
                item?.language ||
                `${title.slice(0, -1) || title} #${index + 1}`;
              const subHeaderValue =
                (cardSubHeader && item?.[cardSubHeader]) ||
                item?.company ||
                item?.institution ||
                item?.issuingOrganization ||
                item?.proficiency ||
                "";

              return (
                <article
                  key={`${title}-item-${index}`}
                  className="rounded-lg border border-border/80 bg-muted/25 p-3"
                >
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-foreground">{show(headerValue)}</p>
                    {subHeaderValue ? (
                      <p className="text-xs text-muted-foreground">{show(subHeaderValue)}</p>
                    ) : null}
                  </div>
                  {entries.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {entries.map(([key, val]) => (
                        <div
                          key={`${title}-${index}-${key}`}
                          className="rounded-md border border-border/70 bg-background px-2.5 py-2"
                        >
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {toLabel(key)}
                          </p>
                          <p className="text-xs text-foreground break-words">{renderValue(val)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{renderValue(item)}</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  const filteredApplications = useMemo(() => {
    const normalizedSkill = skillFilter.trim().toLowerCase();
    const normalizedEducation = educationFilter.trim().toLowerCase();

    return applications.filter((application) => {
      if (!normalizedSkill && !normalizedEducation) return true;

      const skillText = (application.applicantProfile?.skills ?? []).join(" ").toLowerCase();
      const educationText = (application.applicantProfile?.education ?? [])
        .map((item) =>
          [
            item?.institution,
            item?.degree,
            item?.fieldOfStudy,
            item?.grade,
            item?.startYear?.toString(),
            item?.endYear?.toString(),
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ")
        .toLowerCase();

      const matchesSkill = !normalizedSkill || skillText.includes(normalizedSkill);
      const matchesEducation =
        !normalizedEducation || educationText.includes(normalizedEducation);

      return matchesSkill && matchesEducation;
    });
  }, [applications, skillFilter, educationFilter]);

  if (!user || user.role !== "employer") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center shadow-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Only employers can view applications.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading applications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Employer Dashboard</h1>

      {view === "jobs" ? (
        <div className="space-y-6">
          {jobs.length === 0 ? (
            <Card className="p-12 text-center shadow-md">
              <Briefcase className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-6">
                Post your first job to start receiving applications.
              </p>
              <Button>Post a Job</Button>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card
                key={job._id}
                className="p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border-border"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                    <p className="text-muted-foreground">
                      {job.company} • {job.location}
                    </p>
                    <p className="text-sm text-muted-foreground/80 mt-1">
                      {job.type} • {job.salary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewApplications(job)}
                      className="gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">View Applications</span>
                      <span className="sm:hidden">Apps</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditJob(job)}
                      className="gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteJob(job._id)}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {job.description}
                </p>

                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {job.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={backToApplications} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {selectedJob?.title || "All Job Applications"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {selectedJob?.company || "Across all jobs"}
              </p>
              {(skillFilter || educationFilter) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Filters:
                  {skillFilter ? ` skill="${skillFilter}"` : ""}
                  {educationFilter ? ` education="${educationFilter}"` : ""}
                </p>
              )}
            </div>
          </div>

          {applications.length === 0 ? (
            <Card className="p-12 text-center shadow-md">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground">Applications for this job will appear here.</p>
            </Card>
          ) : filteredApplications.length === 0 ? (
            <Card className="p-12 text-center shadow-md">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No matching applicants</h3>
              <p className="text-muted-foreground">
                Try different skill or education keywords in the navbar search.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {statusError && (
                <div className="border border-red-200 bg-red-50 text-red-700 rounded-md p-4 text-sm">
                  {statusError}
                </div>
              )}

              {filteredApplications.map((application) => (
                <Card
                  key={application.id}
                  className="p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {application.fullName}
                      </h3>
                      <p className="text-muted-foreground text-sm">{application.email}</p>
                    </div>
                    <Badge className={`${getStatusBadgeVariant(application.status)} border px-3 py-1`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{application.fullName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${application.email}`} className="text-primary hover:underline">
                          {application.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${application.phone}`} className="text-foreground hover:underline">
                          {application.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">Applied on {application.appliedAt}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {application.applicantProfile?.skills &&
                        application.applicantProfile.skills.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-1">Skills</h4>
                            <div className="flex flex-wrap gap-1">
                              {application.applicantProfile.skills.slice(0, 6).map((skill, index) => (
                                <Badge key={`${application.id}-skill-${index}`} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      {application.applicantProfile?.education &&
                        application.applicantProfile.education.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-1">Education</h4>
                            <p className="text-sm text-muted-foreground">
                              {application.applicantProfile.education
                                .map((item) =>
                                  [item.degree, item.fieldOfStudy, item.institution]
                                    .filter(Boolean)
                                    .join(", ")
                                )
                                .filter(Boolean)
                                .slice(0, 2)
                                .join(" | ")}
                            </p>
                          </div>
                        )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() =>
                          setSelectedApplicantProfile({
                            name: application.fullName,
                            email: application.email,
                            profile: application.applicantProfile,
                          })
                        }
                        disabled={!application.applicantProfile}
                      >
                        <User className="h-4 w-4" />
                        View Full Profile
                      </Button>
                      {application.coverLetter && (
                        <div>
                          <h4 className="font-medium text-sm text-foreground mb-1">Cover Letter</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3 bg-muted/30 p-2 rounded-md">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}
                      {application.resume && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResume(application.resume ?? null)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm" asChild className="gap-1">
                            <a href={application.resume} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              Open
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(application.id, "reviewed")}
                      disabled={
                        application.status !== "pending" || updatingApplicationId === application.id
                      }
                      className="gap-1"
                    >
                      {updatingApplicationId === application.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Mark as Reviewed
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateApplicationStatus(application.id, "accepted")}
                      disabled={
                        application.status === "accepted" || updatingApplicationId === application.id
                      }
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      {updatingApplicationId === application.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateApplicationStatus(application.id, "rejected")}
                      disabled={
                        application.status === "rejected" || updatingApplicationId === application.id
                      }
                      className="gap-1"
                    >
                      {updatingApplicationId === application.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Job Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => (!open ? closeEditJob() : null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl">Edit Job</DialogTitle>
          </DialogHeader>

          {editError && (
            <div className="border border-red-200 bg-red-50 text-red-700 rounded-md p-4 text-sm mb-4">
              {editError}
            </div>
          )}

          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="job-title"
                  value={jobDraft.title}
                  onChange={(e) => setJobDraft((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-company" className="text-sm font-medium">
                  Company <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="job-company"
                  value={jobDraft.company}
                  onChange={(e) => setJobDraft((p) => ({ ...p, company: e.target.value }))}
                  placeholder="e.g. Acme Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-location">Location</Label>
                <Input
                  id="job-location"
                  value={jobDraft.location}
                  onChange={(e) => setJobDraft((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Remote / New York, NY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-type">Type</Label>
                <Input
                  id="job-type"
                  value={jobDraft.type}
                  onChange={(e) => setJobDraft((p) => ({ ...p, type: e.target.value }))}
                  placeholder="e.g. Full-time, Part-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-salary">Salary</Label>
                <Input
                  id="job-salary"
                  value={jobDraft.salary}
                  onChange={(e) => setJobDraft((p) => ({ ...p, salary: e.target.value }))}
                  placeholder="e.g. $80k - $100k"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-logo">Logo URL</Label>
                <Input
                  id="job-logo"
                  value={jobDraft.logo}
                  onChange={(e) => setJobDraft((p) => ({ ...p, logo: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-tags">Tags (comma separated)</Label>
              <Input
                id="job-tags"
                value={jobDraft.tags.join(", ")}
                onChange={(e) =>
                  setJobDraft((p) => ({
                    ...p,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="React, TypeScript, Remote"
              />
              <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-description">Description</Label>
              <Textarea
                id="job-description"
                rows={5}
                value={jobDraft.description}
                onChange={(e) => setJobDraft((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the role and responsibilities..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-about">About the company</Label>
              <Textarea
                id="job-about"
                rows={4}
                value={jobDraft.about}
                onChange={(e) => setJobDraft((p) => ({ ...p, about: e.target.value }))}
                placeholder="Tell applicants about your company..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="job-req">Requirements (one per line)</Label>
                <Textarea
                  id="job-req"
                  rows={6}
                  value={jobDraft.requirements.join("\n")}
                  onChange={(e) =>
                    setJobDraft((p) => ({
                      ...p,
                      requirements: e.target.value.split("\n"),
                    }))
                  }
                  placeholder="3+ years React experience&#10;Experience with TypeScript&#10;..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-benefits">Benefits (one per line)</Label>
                <Textarea
                  id="job-benefits"
                  rows={6}
                  value={jobDraft.benefits.join("\n")}
                  onChange={(e) =>
                    setJobDraft((p) => ({
                      ...p,
                      benefits: e.target.value.split("\n"),
                    }))
                  }
                  placeholder="Health insurance&#10;401k matching&#10;Remote work&#10;..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-background py-4">
              <Button variant="outline" onClick={closeEditJob} disabled={editSaving}>
                Cancel
              </Button>
              <Button onClick={updateJobOnServer} disabled={editSaving} className="gap-2 min-w-[120px]">
                {editSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Preview Dialog */}
      <Dialog open={!!selectedResume} onOpenChange={() => setSelectedResume(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Resume Preview</DialogTitle>
          </DialogHeader>
          <div className="h-[75vh] w-full p-6 pt-0">
            {selectedResume && (
              <iframe
                src={selectedResume}
                className="w-full h-full border-0 rounded-md shadow-inner"
                title="Resume Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Applicant Full Profile Dialog */}
      <Dialog open={!!selectedApplicantProfile} onOpenChange={() => setSelectedApplicantProfile(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="border-b border-border bg-gradient-to-r from-slate-50 to-white p-6 pb-4">
            <DialogTitle className="text-xl">Jobseeker Profile</DialogTitle>
          </DialogHeader>
          {selectedApplicantProfile && (
            <div className="space-y-5 p-6 text-sm">
              <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-base font-semibold text-slate-700">
                      {(selectedApplicantProfile.name || "U")
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0] || "")
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {selectedApplicantProfile.name}
                      </h3>
                      <p className="text-muted-foreground">{selectedApplicantProfile.email}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-muted-foreground">
                  {show(selectedApplicantProfile.profile?.headline)}
                </p>
              </section>

              <div className="flex-col w-full gap-4">
                <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h4 className="mb-3 text-sm font-semibold tracking-wide text-foreground">
                    Basic Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{show(selectedApplicantProfile.profile?.headline)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{show(selectedApplicantProfile.profile?.phone)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{show(selectedApplicantProfile.profile?.location)}</span>
                    </p>
                  </div>
                </section>
                <section className="rounded-xl border border-border bg-card p-4 shadow-sm mt-4">
                  <h4 className="mb-3 text-sm font-semibold tracking-wide text-foreground">
                    Job Preferences
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{show(selectedApplicantProfile.profile?.jobPreferences?.preferredRole)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {show(selectedApplicantProfile.profile?.jobPreferences?.preferredLocation)}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Expected Salary:{" "}
                        {show(selectedApplicantProfile.profile?.jobPreferences?.expectedSalary)}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {`${show(selectedApplicantProfile.profile?.jobPreferences?.jobType)} / ${show(
                          selectedApplicantProfile.profile?.jobPreferences?.availability
                        )}`}
                      </span>
                    </p>
                  </div>
                </section>
              </div>

              <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h4 className="mb-2 text-sm font-semibold tracking-wide text-foreground">Bio</h4>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {show(selectedApplicantProfile.profile?.bio)}
                </p>
              </section>

              <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h4 className="mb-3 text-sm font-semibold tracking-wide text-foreground">Social Links</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <p className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{show(selectedApplicantProfile.profile?.socialLinks?.linkedin)}</span>
                  </p>
                  <p className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{show(selectedApplicantProfile.profile?.socialLinks?.github)}</span>
                  </p>
                  <p className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{show(selectedApplicantProfile.profile?.socialLinks?.portfolio)}</span>
                  </p>
                  <p className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <AtSign className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{show(selectedApplicantProfile.profile?.socialLinks?.twitter)}</span>
                  </p>
                </div>
              </section>

              <div className="grid gap-4">
                {renderArraySection("Skills", selectedApplicantProfile.profile?.skills)}
                {renderArraySection("Experience", selectedApplicantProfile.profile?.experience)}
                {renderArraySection("Internships", selectedApplicantProfile.profile?.internships)}
                {renderArraySection("Education", selectedApplicantProfile.profile?.education)}
                {renderArraySection("Projects", selectedApplicantProfile.profile?.projects)}
                {renderArraySection("Certifications", selectedApplicantProfile.profile?.certifications)}
                {renderArraySection("Achievements", selectedApplicantProfile.profile?.achievements)}
                {renderArraySection("Languages", selectedApplicantProfile.profile?.languages)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
