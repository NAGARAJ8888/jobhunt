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
import Companies from "./pages/Companies";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import MyApplications from "./pages/MyApplications";
import JobDetailsPage from "./pages/JobDetailsPage";

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

const JOBS: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    logo: "https://images.unsplash.com/photo-1628017975048-74768e00219e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cCUyMG9mZmljZXxlbnwxfHx8fDE3NzE5NDU1NDB8MA&ixlib=rb-4.1.0&q=80&w=400",
    tags: ["React", "TypeScript", "Tailwind CSS"],
    postedDate: "2 days ago",
    description:
      "We are looking for a talented Senior Frontend Developer to join our dynamic team. You will be responsible for building and maintaining high-quality web applications using modern technologies. This role offers an opportunity to work on cutting-edge projects and collaborate with a passionate team of engineers.",
    requirements: [
      "5+ years of experience in frontend development",
      "Expert knowledge of React and TypeScript",
      "Experience with modern CSS frameworks (Tailwind, styled-components)",
      "Strong understanding of web performance optimization",
      "Experience with testing frameworks (Jest, React Testing Library)",
      "Excellent problem-solving skills and attention to detail",
    ],
    benefits: [
      "Competitive salary and equity package",
      "Health, dental, and vision insurance",
      "401(k) with company match",
      "Unlimited PTO",
      "Remote-friendly work environment",
      "Professional development budget",
    ],
    about:
      "TechCorp Inc. is a leading technology company specializing in innovative web solutions. We're passionate about creating products that make a difference and fostering a culture of continuous learning and growth.",
  },
  {
    id: "2",
    title: "UX/UI Designer",
    company: "DesignHub",
    location: "Remote",
    type: "Full-time",
    salary: "$90k - $130k",
    logo: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGFnZW5jeSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzE5Mjc1NzZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    tags: ["Figma", "UI Design", "User Research"],
    postedDate: "1 week ago",
    description:
      "Join our creative team as a UX/UI Designer and help shape the future of digital experiences. You'll work on diverse projects, from mobile apps to web platforms, creating intuitive and beautiful interfaces that users love.",
    requirements: [
      "3+ years of experience in UX/UI design",
      "Proficiency in Figma and other design tools",
      "Strong portfolio showcasing user-centered design",
      "Experience with user research and testing",
      "Understanding of design systems and component libraries",
      "Excellent communication and collaboration skills",
    ],
    benefits: [
      "Fully remote position",
      "Flexible working hours",
      "Health insurance coverage",
      "Annual design conference budget",
      "Latest design tools and software",
      "Creative freedom and autonomy",
    ],
    about:
      "DesignHub is a creative agency dedicated to crafting exceptional digital experiences. We believe in the power of design to transform businesses and improve lives.",
  },
  {
    id: "3",
    title: "Full Stack Engineer",
    company: "StartupX",
    location: "New York, NY",
    type: "Full-time",
    salary: "$110k - $150k",
    logo: "https://images.unsplash.com/photo-1621743018966-29194999d736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc3MTkwMTU5Mnww&ixlib=rb-4.1.0&q=80&w=400",
    tags: ["Node.js", "React", "PostgreSQL", "AWS"],
    postedDate: "3 days ago",
    description:
      "We're seeking a Full Stack Engineer to build scalable web applications from the ground up. You'll work across the entire stack, from database design to frontend implementation, and have a significant impact on our product direction.",
    requirements: [
      "4+ years of full stack development experience",
      "Strong proficiency in Node.js and React",
      "Experience with SQL and NoSQL databases",
      "Knowledge of cloud platforms (AWS, GCP, or Azure)",
      "Understanding of microservices architecture",
      "Experience with CI/CD pipelines",
    ],
    benefits: [
      "Competitive salary and startup equity",
      "Comprehensive health benefits",
      "Commuter benefits",
      "Catered lunches and snacks",
      "Learning and development stipend",
      "Modern office in Manhattan",
    ],
    about:
      "StartupX is revolutionizing the way businesses operate with our innovative SaaS platform. Join us in our mission to simplify complex workflows and empower teams.",
  },
  {
    id: "4",
    title: "Product Manager",
    company: "InnovateCo",
    location: "London, UK",
    type: "Full-time",
    salary: "£70k - £95k",
    logo: "https://images.unsplash.com/photo-1692133211836-52846376d66f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzE5MDM2MjJ8MA&ixlib=rb-4.1.0&q=80&w=400",
    tags: ["Product Strategy", "Agile", "Analytics"],
    postedDate: "5 days ago",
    description:
      "As a Product Manager at InnovateCo, you'll drive product vision and strategy for our flagship products. You'll work closely with engineering, design, and business teams to deliver features that delight customers and drive growth.",
    requirements: [
      "5+ years of product management experience",
      "Proven track record of launching successful products",
      "Strong analytical and data-driven decision making skills",
      "Experience with Agile methodologies",
      "Excellent stakeholder management abilities",
      "Technical background or strong technical acumen",
    ],
    benefits: [
      "Competitive salary package",
      "Private health insurance",
      "Pension scheme",
      "25 days annual leave plus bank holidays",
      "Hybrid work model",
      "Career progression opportunities",
    ],
    about:
      "InnovateCo is a leading enterprise software company helping organizations digitize and optimize their operations. We're committed to innovation and excellence.",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Remote",
    type: "Full-time",
    salary: "$100k - $140k",
    logo: "https://images.unsplash.com/photo-1617042375876-a13e36732a04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BlciUyMGNvZGluZ3xlbnwxfHx8fDE3NzE5Mzk1NzV8MA&ixlib=rb-4.1.0&q=80&w=400",
    tags: ["Kubernetes", "Docker", "Terraform", "CI/CD"],
    postedDate: "1 day ago",
    description:
      "Join our DevOps team to build and maintain robust infrastructure that powers our cloud-native applications. You'll work on automation, monitoring, and ensuring high availability of our services.",
    requirements: [
      "3+ years of DevOps/SRE experience",
      "Strong experience with Kubernetes and Docker",
      "Proficiency in Infrastructure as Code (Terraform, CloudFormation)",
      "Experience with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)",
      "Knowledge of monitoring and logging tools (Prometheus, Grafana, ELK)",
      "Strong scripting skills (Python, Bash)",
    ],
    benefits: [
      "Work from anywhere",
      "Flexible schedule",
      "Premium health insurance",
      "Annual bonus",
      "Conference and training budget",
      "Home office setup allowance",
    ],
    about:
      "CloudTech Solutions provides cloud infrastructure and DevOps services to businesses worldwide. We're at the forefront of cloud technology and automation.",
  },
  {
    id: "6",
    title: "Marketing Manager",
    company: "GrowthLab",
    location: "Berlin, Germany",
    type: "Full-time",
    salary: "€60k - €80k",
    logo: "https://images.unsplash.com/photo-1603201667141-5a2d4c673378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc3MTg3ODk0Mnww&ixlib=rb-4.1.0&q=80&w=400",
    tags: ["Digital Marketing", "SEO", "Content Strategy"],
    postedDate: "4 days ago",
    description:
      "We're looking for a creative Marketing Manager to lead our marketing efforts and drive brand awareness. You'll develop and execute marketing strategies across multiple channels to reach our target audience.",
    requirements: [
      "4+ years of marketing experience",
      "Proven expertise in digital marketing and SEO",
      "Experience with marketing automation tools",
      "Strong content creation and copywriting skills",
      "Data-driven approach to marketing",
      "Experience managing marketing budgets",
    ],
    benefits: [
      "Competitive salary",
      "Health and wellness benefits",
      "30 days vacation",
      "Professional development opportunities",
      "International team environment",
      "Modern office in central Berlin",
    ],
    about:
      "GrowthLab is a digital marketing agency helping businesses scale their online presence. We combine creativity with data to deliver measurable results.",
  },
  {
    id: "7",
    title: "Data Scientist",
    company: "DataMinds AI",
    location: "Singapore",
    type: "Full-time",
    salary: "S$90k - S$130k",
    logo: "https://images.unsplash.com/photo-1628017975048-74768e00219e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cCUyMG9mZmljZXxlbnwxfHx8fDE3NzE5NDU1NDB8MA&ixlib=rb-4.1.0&q=80&w=400",
    tags: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    postedDate: "6 days ago",
    description:
      "Join our AI team as a Data Scientist to develop machine learning models and extract insights from large datasets. You'll work on exciting projects involving natural language processing, computer vision, and predictive analytics.",
    requirements: [
      "Master's degree in Computer Science, Statistics, or related field",
      "3+ years of data science experience",
      "Strong programming skills in Python",
      "Experience with ML frameworks (TensorFlow, PyTorch, scikit-learn)",
      "Proficiency in SQL and data manipulation",
      "Experience with big data technologies (Spark, Hadoop)",
    ],
    benefits: [
      "Competitive compensation",
      "Medical and dental coverage",
      "Annual learning budget",
      "Flexible working arrangements",
      "GPU workstations provided",
      "Access to cutting-edge AI research",
    ],
    about:
      "DataMinds AI is pioneering artificial intelligence solutions for businesses across Asia. We're passionate about using AI to solve real-world problems.",
  },
  {
    id: "8",
    title: "Mobile Developer (iOS)",
    company: "AppWorks Studio",
    location: "Remote",
    type: "Contract",
    salary: "$80 - $120/hr",
    logo: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGFnZW5jeSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzE5Mjc1NzZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    tags: ["Swift", "SwiftUI", "iOS", "Mobile"],
    postedDate: "2 days ago",
    description:
      "We're seeking an experienced iOS developer for a 6-month contract to build a revolutionary mobile app. You'll work with the latest iOS technologies and contribute to all phases of the app development lifecycle.",
    requirements: [
      "5+ years of iOS development experience",
      "Expert knowledge of Swift and SwiftUI",
      "Experience with RESTful APIs and JSON",
      "Familiarity with Apple's Human Interface Guidelines",
      "Published apps in the App Store",
      "Strong understanding of mobile UI/UX principles",
    ],
    benefits: [
      "Competitive hourly rate",
      "Fully remote work",
      "Flexible hours",
      "Possibility of extension or full-time conversion",
      "Work with latest Apple technologies",
    ],
    about:
      "AppWorks Studio creates award-winning mobile applications for startups and enterprises. We pride ourselves on delivering exceptional user experiences.",
  },
];

const CATEGORIES = [
  { name: "Engineering", count: 45, icon: TrendingUp },
  { name: "Design", count: 28, icon: Users },
  { name: "Marketing", count: 32, icon: MapPin },
  { name: "Sales", count: 19, icon: TrendingUp },
];

const API_BASE_URL = "http://localhost:5000/api";

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

  // Combine sample jobs with backend jobs
  const allJobs = useMemo(() => {
    return [...backendJobs, ...JOBS];
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
        job.tags.some((tag) =>
          tag.toLowerCase().includes(categoryFilter.toLowerCase())
        );

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
                <AnimatedCounter end={JOBS.length} suffix="+" />
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
              {filteredJobs.length > 0 ? (
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
