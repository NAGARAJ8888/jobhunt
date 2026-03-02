import { MapPin, Briefcase, DollarSign, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ApplicationForm } from "./ApplicationForm";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

import { Job } from "../types";

interface JobDetailsProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
}

export function JobDetails({ job, open, onClose }: JobDetailsProps) {
  if (!job) return null;

  const { user } = useAuth();
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Mock participants data - in a real app, this would come from the job data or API
  const participants = [
    { id: 1, name: "Alice Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3MTkyNzU3Nnww&ixlib=rb-4.1.0&q=80&w=100" },
    { id: 2, name: "Bob Smith", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzE5Mjc1NzZ8MA&ixlib=rb-4.1.0&q=80&w=100" },
    { id: 3, name: "Carol Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3MTkyNzU3Nnww&ixlib=rb-4.1.0&q=80&w=100" },
  ];

  const [participantImageLoading, setParticipantImageLoading] = useState<boolean[]>(participants.map(() => true));

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    }
  }, [user, job?.id]);

  const checkApplicationStatus = async () => {
    if (!user || !job) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/applications/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const applied = data.applications.some((app: any) => app.job._id === job.id || app.job === job.id);
        setHasApplied(applied);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmitted = () => {
    setHasApplied(true);
  };

  const handleApplicationFailed = () => {
    setHasApplied(false);
  };

  // Preload images and manage loading state
  useEffect(() => {
    const preloadImages = participants.map((participant, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          setParticipantImageLoading(prev => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
          resolve();
        };
        img.onerror = () => {
          setParticipantImageLoading(prev => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
          resolve();
        };
        img.src = participant.avatar;
      });
    });

    Promise.all(preloadImages).then(() => {
      // All images have been processed
    });

    // Fallback: hide shimmer after 2 seconds if images haven't loaded
    const timer = setTimeout(() => {
      setParticipantImageLoading(prev => prev.map(() => false));
    }, 2000);

    return () => clearTimeout(timer);
  }, [participants]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{job.title} at {job.company}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <ImageWithFallback
                src={job.logo}
                alt={job.company}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{job.title}</h2>
              <p className="text-lg text-gray-600 mb-3">{job.company}</p>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Posted {job.postedDate}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description" className="cursor-pointer">Job Details</TabsTrigger>
              {!hasApplied && <TabsTrigger value="apply" className="cursor-pointer">Apply Now</TabsTrigger>}
            </TabsList>

            <TabsContent value="description" className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Job Description</h3>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex gap-2 text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex gap-2 text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">About {job.company}</h3>
                <p className="text-gray-700 leading-relaxed">{job.about}</p>
              </div>

              {/* Participants Section */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Team Members</h3>
                <div className="flex flex-wrap gap-3">
                  {participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center gap-2">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        {participantImageLoading[index] && (
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                        )}
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className={`w-full h-full object-cover ${participantImageLoading[index] ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                          loading="lazy"
                        />
                      </div>
                      <span className="text-sm text-gray-600">{participant.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {hasApplied ? (
                  <Button disabled className="flex-1" variant="secondary">
                    Applied
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 text-white bg-blue-400 hover:bg-blue-500 cursor-pointer"
                    onClick={() => setActiveTab("apply")}
                  >
                    Apply Now
                  </Button>
                )}
                <Button variant="outline" className="cursor-pointer">Save Job</Button>
              </div>
            </TabsContent>

            <TabsContent value="apply" className="mt-6">
              <ApplicationForm jobId={job._id || job.id || ''} jobTitle={job.title} company={job.company} featured={job.featured} onSubmitSuccess={handleApplicationSubmitted} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
