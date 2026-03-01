import { useState, useMemo } from "react";
import { Search, MapPin, Building, Users, Star, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { CompanyCard } from "../components/CompanyCard";
import { AIChatbot } from "../components/AIChatbot";

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  size: string;
  openPositions: number;
  description: string;
  featured: boolean;
}

const COMPANIES: Company[] = [
  {
    id: "1",
    name: "TechCorp Inc.",
    logo: "https://images.unsplash.com/photo-1628017975048-74768e00219e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cCUyMG9mZmljZXxlbnwxfHx8fDE3NzE5NDU1NDB8MA&ixlib=rb-4.1.0&q=80&w=400",
    industry: "Technology",
    location: "San Francisco, CA",
    size: "1000+",
    openPositions: 12,
    description: "Leading technology company specializing in innovative web solutions and cutting-edge software development.",
    featured: true,
  },
  {
    id: "2",
    name: "DesignHub",
    logo: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGFnZW5jeSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzE5Mjc1NzZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    industry: "Design",
    location: "Remote",
    size: "50-200",
    openPositions: 8,
    description: "Creative agency dedicated to crafting exceptional digital experiences and user-centered design solutions.",
    featured: true,
  },
  {
    id: "3",
    name: "StartupX",
    logo: "https://images.unsplash.com/photo-1621743018966-29194999d736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc3MTkwMTU5Mnww&ixlib=rb-4.1.0&q=80&w=400",
    industry: "Technology",
    location: "New York, NY",
    size: "200-500",
    openPositions: 15,
    description: "Revolutionizing the way businesses operate with innovative SaaS platform and modern workflows.",
    featured: true,
  },
  {
    id: "4",
    name: "InnovateCo",
    logo: "https://images.unsplash.com/photo-1692133211836-52846376d66f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzE5MDM2MjJ8MA&ixlib=rb-4.1.0&q=80&w=400",
    industry: "Enterprise Software",
    location: "London, UK",
    size: "500-1000",
    openPositions: 6,
    description: "Leading enterprise software company helping organizations digitize and optimize their operations.",
    featured: true,
  },
  {
    id: "5",
    name: "CloudTech Solutions",
    logo: "https://images.unsplash.com/photo-1617042375876-a13e36732a04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BlciUyMGNvZGluZ3xlbnwxfHx8fDE3NzE5Mzk1NzV8MA&ixlib=rb-4.1.0&q=80&w=400",
    industry: "Cloud Services",
    location: "Remote",
    size: "100-500",
    openPositions: 9,
    description: "Providing cloud infrastructure and DevOps services to businesses worldwide at the forefront of technology.",
    featured: false,
  },
  {
    id: "6",
    name: "GrowthLab",
    logo: "https://images.unsplash.com/photo-1603201667141-5a2d4c673378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc3MTg3ODk0Mnww&ixlib=rb-4.1.0&q=80&w=400",
    industry: "Marketing",
    location: "Berlin, Germany",
    size: "50-200",
    openPositions: 4,
    description: "Digital marketing agency helping businesses scale their online presence with creativity and data-driven results.",
    featured: false,
  },
  {
    id: "7",
    name: "DataMinds AI",
    logo: "https://images.unsplash.com/photo-1628017975048-74768e00219e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cCUyMG9mZmljZXxlbnwxfHx8fDE3NzE5NDU1NDB8MA&ixlib=rb-4.1.0&q=80&w=400",
    industry: "AI & Machine Learning",
    location: "Singapore",
    size: "100-500",
    openPositions: 11,
    description: "Pioneering artificial intelligence solutions for businesses across Asia, solving real-world problems with AI.",
    featured: false,
  },
  {
    id: "8",
    name: "AppWorks Studio",
    logo: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGFnZW5jeSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzE5Mjc1NzZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    industry: "Mobile Development",
    location: "Remote",
    size: "10-50",
    openPositions: 3,
    description: "Creating award-winning mobile applications for startups and enterprises with exceptional user experiences.",
    featured: false,
  },
];

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("most-active");

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = COMPANIES.filter((company) => {
      const matchesSearch =
        searchQuery === "" ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesIndustry = industryFilter === "all" || company.industry === industryFilter;
      const matchesLocation = locationFilter === "all" || company.location.includes(locationFilter);
      const matchesSize = sizeFilter === "all" || company.size === sizeFilter;

      return matchesSearch && matchesIndustry && matchesLocation && matchesSize;
    });

    // Sort companies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "most-active":
          return b.openPositions - a.openPositions;
        case "recently-added":
          return b.id.localeCompare(a.id); // Assuming higher ID is more recent
        case "most-jobs":
          return b.openPositions - a.openPositions;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, industryFilter, locationFilter, sizeFilter, sortBy]);

  const featuredCompanies = COMPANIES.filter((company) => company.featured);

  const industries = [...new Set(COMPANIES.map((company) => company.industry))];
  const locations = [...new Set(COMPANIES.map((company) => company.location.split(", ")[0]))];
  const sizes = [...new Set(COMPANIES.map((company) => company.size))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-300 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Partner Companies</h1>
          <p className="text-lg font-semibold md:text-xl mb-8 text-blue-100">
            Explore top companies hiring through our platform
          </p>

          <div className="bg-white rounded-lg shadow-lg p-2 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search companies by name or industry"
                  className="pl-10 text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Companies */}
      <div className="bg-white border-b py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Companies
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {featuredCompanies.map((company) => (
              <Card key={company.id} className="min-w-[300px] p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <Badge variant="secondary" className="text-xs">Top Employer</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{company.openPositions} open positions</span>
                  <Button size="sm">
                    View Jobs
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Company Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most-active">Most Active</SelectItem>
                <SelectItem value="recently-added">Recently Added</SelectItem>
                <SelectItem value="most-jobs">Most Jobs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Company Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">All Companies</h2>
          <p className="text-gray-600">{filteredAndSortedCompanies.length} companies found</p>
        </div>

        {filteredAndSortedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setIndustryFilter("all");
                setLocationFilter("all");
                setSizeFilter("all");
              }}
            >
              Clear all filters
            </Button>
          </Card>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Want your company listed?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that trust our platform to find top talent and grow their teams.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Register as Employer
          </Button>
        </div>
      </div>
      <AIChatbot />
    </div>
  );
}
