import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { 
  Briefcase, 
  Calendar, 
  Loader2, 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Application } from "../types";

const API_BASE_URL = "http://localhost:5000/api";

type UserApplication = Application & {
  job: {
    _id?: string;
    title?: string;
    company?: string;
    location?: string;
    type?: string;
  };
};

// Status steps configuration
const STATUS_STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { key: 'reviewed', label: 'Reviewed', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' }
];

// Helper to determine which steps are completed based on current status
const getCompletedSteps = (status: Application['status']) => {
  const order = ['pending', 'reviewed', 'accepted', 'rejected'];
  const currentIndex = order.indexOf(status);
  return order.map((_, index) => index <= currentIndex);
};

export default function MyApplications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyApplications = async () => {
      if (!user || user.role !== "job_seeker") {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/applications/user/${user.id}`);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load your applications.");
        }

        const apps = Array.isArray(payload?.applications) ? payload.applications : [];
        const normalized = apps.map((app: any) => ({
          id: app._id,
          job: app.job || {},
          applicant: app.applicant,
          fullName: app.fullName || "",
          email: app.email || "",
          phone: app.phone || "",
          coverLetter: app.coverLetter || "",
          resume: app.resume || "",
          status: (app.status || "pending") as Application["status"],
          appliedAt: app.appliedAt || app.createdAt || new Date().toISOString(),
        }));

        setApplications(normalized);
      } catch (e: any) {
        setError(e?.message || "Failed to load your applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyApplications();
  }, [user]);

  const stats = useMemo(() => {
    return applications.reduce(
      (acc, app) => {
        acc.total += 1;
        acc[app.status] += 1;
        return acc;
      },
      { total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 }
    );
  }, [applications]);

  if (!user || user.role !== "job_seeker") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center shadow-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Only job seekers can view this page.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your applications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground mt-2">
          Track progress for every job you have applied to.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-100' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-100' },
          { label: 'Reviewed', value: stats.reviewed, color: 'bg-blue-100' },
          { label: 'Accepted', value: stats.accepted, color: 'bg-green-100' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-100' }
        ].map((stat) => (
          <Card key={stat.label} className={`p-4 ${stat.color} border-0 shadow-sm`}>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-md p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <Card className="p-12 text-center shadow-md">
          <Briefcase className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
          <p className="text-muted-foreground mb-6">
            Start applying for jobs and your progress will appear here.
          </p>
          <Button onClick={() => navigate("/")}>Browse Jobs</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const status = application.status || "pending";
            const completedSteps = getCompletedSteps(status);
            
            // Get company initials for logo placeholder
            const companyName = application.job?.company || "UK";
            const initials = companyName
              .split(' ')
              .map(word => word[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card 
                key={application.id} 
                className="p-6 shadow-sm border-border hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Company logo placeholder */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
                    {initials}
                  </div>

                  {/* Main content */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {application.job?.title || "Untitled role"}
                        </h3>
                        <p className="text-muted-foreground">
                          {companyName}
                        </p>
                        <p className="text-sm text-muted-foreground/80 mt-1">
                          {[application.job?.location, application.job?.type].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                      
                      {/* Current status badge */}
                      <Badge 
                        className={`
                          ${status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                          ${status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                          ${status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                          border-0 px-3 py-1 font-medium
                        `}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>

                    {/* Step progress indicator */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        {STATUS_STEPS.map((step, index) => {
                          const isCompleted = completedSteps[index];
                          const isRejected = status === 'rejected' && step.key === 'rejected';
                          const isAccepted = status === 'accepted' && step.key === 'accepted';
                          
                          // Skip showing accepted step if rejected, and vice versa
                          if ((status === 'rejected' && step.key === 'accepted') ||
                              (status === 'accepted' && step.key === 'rejected')) {
                            return null;
                          }

                          return (
                            <div key={step.key} className="flex items-center">
                              <div className="flex flex-col items-center">
                                <div 
                                  className={`
                                    w-8 h-8 rounded-full flex items-center justify-center
                                    ${isCompleted ? step.bg : 'bg-gray-100'}
                                    ${isCompleted ? step.color : 'text-gray-400'}
                                    transition-colors duration-200
                                  `}
                                >
                                  <step.icon className="h-4 w-4" />
                                </div>
                                <span className="text-xs mt-1 text-gray-600">{step.label}</span>
                              </div>
                              {index < STATUS_STEPS.length - 1 && (
                                <ChevronRight className="h-4 w-4 mx-2 text-gray-300" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer with date and view button */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/jobs/${application.job?._id}`)}
                        className="text-primary hover:text-primary/80"
                      >
                        View Job
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}