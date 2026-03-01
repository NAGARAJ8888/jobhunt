import { MapPin, Building, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

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

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={company.logo}
          alt={company.name}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 truncate">{company.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{company.industry}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{company.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{company.size}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{company.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{company.openPositions} open positions</Badge>
          {company.featured && (
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
              Featured
            </Badge>
          )}
        </div>
        <Button size="sm">
          View Jobs
        </Button>
      </div>
    </Card>
  );
}
