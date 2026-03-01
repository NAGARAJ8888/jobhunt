import { MapPin, Briefcase, Clock, DollarSign, CheckCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  logo: string;
  tags: string[];
  postedDate: string;
  onClick: () => void;
}

export function JobCard({
  id,
  title,
  company,
  location,
  type,
  salary,
  logo,
  tags,
  postedDate,
  onClick,
}: JobCardProps) {
  const { user } = useAuth();
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    }
  }, [user, id]);

  const checkApplicationStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5000/api/applications/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const applied = data.applications.some((app: any) => app.job._id === id || app.job === id);
        setHasApplied(applied);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <ImageWithFallback
            src={logo}
            alt={company}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-lg truncate">{title}</h3>
            {hasApplied && (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>Applied</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-3">{company}</p>

          <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{type}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{salary}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{postedDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <Button size="sm" className="w-full sm:w-auto bg-blue-400 hover:bg-blue-500 text-white cursor-pointer">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
