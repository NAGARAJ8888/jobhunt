import { useState, useEffect, useMemo } from "react";
import { Routes, Route } from "react-router";
import { Search, TrendingUp, Users, MapPin } from "lucide-react";
import { Header } from "./components/Header";
import { JobCard } from "./components/JobCard";
import { JobDetails } from "./components/JobDetails";
import { JobFilters } from "./components/JobFilters";
import { AnimatedCounter } from "./components/AnimatedCounter";
import { SignInModal } from "./components/SignInModal";
import { SignUpModal } from "./components/SignUpModal";
import { PostJobModal } from "./components/PostJobModal";
import { AIChatbot } from "./components/AIChatbot";
import { AuthProvider } from "./context/AuthContext";
import { Card } from "./components/ui/card";
import { Toaster } from "./components/ui/sonner";
import { Skeleton } from "./components/ui/skeleton";
import Companies from "./pages/Companies";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import MyApplications from "./pages/MyApplications";
import JobDetailsPage from "./pages/JobDetailsPage";
import { Subscribe } from "./pages/Subscribe";

import { Job } from "./types";

export type { Job };

function formatPostedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
  } else {
    return date.toLocaleDateString();
  }
}

const CATEGORIES = [
  { name: "Engineering", count: 45, icon: TrendingUp },
  { name: "Design", count: 28, icon: Users },
  { name: "Marketing", count: 32, icon: MapPin },
  { name: "Sales", count: 19, icon: TrendingUp },
];

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

function HomePage() {
  const JOBS_PER_PAGE = 6;
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [backendJobs, setBackendJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Fetch jobs from backend on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/jobs`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).catch(() => {
        throw new Error("Server connection failed");
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched jobs from Node.js server:", data);
        
        // Use jobs from response
        const jobsToUse = Array.isArray(data) ? data : (data.jobs || []);
        
        // Format the postedDate for backend jobs
        const formattedJobs = jobsToUse.map((job: any) => ({
          ...job,
          id: job._id || job.id, // MongoDB uses _id
          title: job.title || "No Title",
          company: job.company || "Unknown Company",
          location: job.location || "N/A",
          type: job.type || "Full-time",
          salary: job.salary || "N/A",
          tags: job.tags || [],
          category: job.category || "",
          description: job.description || "",
          requirements: job.requirements || [],
          benefits: job.benefits || [],
          about: job.about || "",
          postedDate: job.postedDate ? formatPostedDate(job.postedDate) : "Recently",
        }));

        setBackendJobs(formattedJobs);
      } else {
        console.error("Failed to fetch jobs:", response.status);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Use only backend jobs
  const allJobs = useMemo(() => {
    return backendJobs;
  }, [backendJobs]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesLocation =
        locationFilter === "all" ||
        job.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        job.type.toLowerCase() === typeFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "all" ||
        (job as any).category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesLocation && matchesType && matchesCategory;
    });
  }, [allJobs, searchQuery, locationFilter, typeFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    const end = start + JOBS_PER_PAGE;
    return filteredJobs.slice(start, end);
  }, [filteredJobs, currentPage]);

  const startResultIndex = filteredJobs.length === 0 ? 0 : (currentPage - 1) * JOBS_PER_PAGE + 1;
  const endResultIndex = Math.min(currentPage * JOBS_PER_PAGE, filteredJobs.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationFilter, typeFilter, categoryFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-300 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Dream Job Today
          </h1>
          <p className="text-lg font-semibold md:text-xl mb-8">
            Thousands of jobs in technology, design, marketing, and more
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-blue-400 cursor-pointer hover:bg-blue-500 text-white px-8 py-3 rounded-md font-semibold transition-colors">
              Search Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                <AnimatedCounter end={backendJobs.length} suffix="+" />
              </div>
              <div className="text-gray-600 text-sm">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                <AnimatedCounter end={500} suffix="+" />
              </div>
              <div className="text-gray-600 text-sm">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                <AnimatedCounter end={10000} suffix="+" />
              </div>
              <div className="text-gray-600 text-sm">Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                <AnimatedCounter end={95} suffix="%" />
              </div>
              <div className="text-gray-600 text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {CATEGORIES.map((category) => (
            <Card
              key={category.name}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <category.icon className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.count} jobs</p>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters
              onSearch={setSearchQuery}
              onLocationChange={setLocationFilter}
              onTypeChange={setTypeFilter}
              onCategoryChange={setCategoryFilter}
            />
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-700">
                <span className="font-semibold">{filteredJobs.length}</span> jobs found
                {filteredJobs.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    (showing {startResultIndex}-{endResultIndex})
                  </span>
                )}
              </div>
              {(searchQuery || locationFilter !== "all" || typeFilter !== "all" || categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setLocationFilter("all");
                    setTypeFilter("all");
                    setCategoryFilter("all");
                    setCurrentPage(1);
                  }}
                  className="text-blue-400 hover:text-blue-500 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="space-y-4">
              {loadingJobs ? (
                // Loading skeleton - show 6 skeleton cards while loading
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div>
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </Card>
                ))
              ) : filteredJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    {...job}
                    onClick={() => setSelectedJob(job)}
                  />
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setLocationFilter("all");
                      setTypeFilter("all");
                      setCategoryFilter("all");
                      setCurrentPage(1);
                    }}
                    className="text-blue-400 hover:text-blue-500 font-medium"
                  >
                    Clear all filters
                  </button>
                </Card>
              )}
            </div>
            {filteredJobs.length > 0 && totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-sm rounded-md border ${
                      currentPage === page
                        ? "bg-blue-400 text-white border-blue-400"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetails
        job={selectedJob}
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
      <AIChatbot/>
    </>
  );
}

export default function App() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);

  const handleSwitchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  return (
    <AuthProvider>
      <Header
        onSignInClick={() => setShowSignIn(true)}
        onSignUpClick={() => setShowSignUp(true)}
        onPostJobClick={() => setShowPostJob(true)}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/subscribe" element={<Subscribe />} />
      </Routes>

      <SignInModal
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      <SignUpModal
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
      <PostJobModal
        open={showPostJob}
        onClose={() => setShowPostJob(false)}
      />
      <Toaster />
    </AuthProvider>
  );
}
