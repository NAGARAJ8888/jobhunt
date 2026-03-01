"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Briefcase, Plus, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { Job } from "../types";

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
  onJobPosted?: () => void;
  job?: Job | null;
  isEditMode?: boolean;
  onJobUpdated?: () => void;
}

export function PostJobModal({ open, onClose, onJobPosted, job, isEditMode = false, onJobUpdated }: PostJobModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    requirements: [""],
    benefits: [""],
    about: "",
    tags: [""],
  });

  // Initialize form with job data when in edit mode
  useEffect(() => {
    if (job && isEditMode) {
      setFormData({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        type: job.type || "Full-time",
        salary: job.salary || "",
        description: job.description || "",
        requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [""],
        benefits: job.benefits && job.benefits.length > 0 ? job.benefits : [""],
        about: job.about || "",
        tags: job.tags && job.tags.length > 0 ? job.tags : [""],
      });
    }
  }, [job, isEditMode]);

  const handleAddField = (field: "requirements" | "benefits" | "tags") => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const handleRemoveField = (field: "requirements" | "benefits" | "tags", index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [field]: newArray.length > 0 ? newArray : [""],
    });
  };

  const handleUpdateField = (
    field: "requirements" | "benefits" | "tags",
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.role !== "employer") {
      toast.error("Only employers can post jobs");
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Filter out empty values
    const requirements = formData.requirements.filter((r) => r.trim() !== "");
    const benefits = formData.benefits.filter((b) => b.trim() !== "");
    const tags = formData.tags.filter((t) => t.trim() !== "");

    if (requirements.length === 0) {
      toast.error("Please add at least one requirement");
      return;
    }

    if (tags.length === 0) {
      toast.error("Please add at least one skill tag");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create job object
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        requirements,
        benefits,
        about: formData.about,
        tags,
        logo: "https://images.unsplash.com/photo-1628017975048-74768e00219e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      };

      // Post job to Node.js backend
      const response = await fetch(
        "http://localhost:5000/api/jobs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": user.id,
          },
          body: JSON.stringify(jobData),
        }
      ).catch(() => {
        throw new Error("Unable to connect to the server. Please ensure the backend is running on port 5000.");
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error response:", data);
        throw new Error(data.error || data.message || "Failed to post job");
      }

      toast.success("Job posted successfully!", {
        description: "Your job listing is now live and visible to candidates.",
      });

      // Reset form
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        requirements: [""],
        benefits: [""],
        about: "",
        tags: [""],
      });

      onClose();
      
      // Reload page to show new job
      window.location.reload();
      
      // Call onJobPosted callback if provided
      if (onJobPosted) {
        onJobPosted();
      }
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast.error(error.message || "Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Post a New Job
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new job posting
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Senior Frontend Developer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              placeholder="e.g. TechCorp Inc."
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>

          {/* Location and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA or Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Job Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range</Label>
            <Input
              id="salary"
              placeholder="e.g. $120k - $160k or £70k - £95k"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what makes this position exciting..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Requirements <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddField("requirements")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Requirement
              </Button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Requirement ${index + 1}`}
                    value={req}
                    onChange={(e) => handleUpdateField("requirements", index, e.target.value)}
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField("requirements", index)}
                    >
                      <X className="h-4 w-4 cursor-pointer" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Benefits</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddField("benefits")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Benefit
              </Button>
            </div>
            <div className="space-y-2">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Benefit ${index + 1}`}
                    value={benefit}
                    onChange={(e) => handleUpdateField("benefits", index, e.target.value)}
                  />
                  {formData.benefits.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField("benefits", index)}
                    >
                      <X className="h-4 w-4 cursor-pointer" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skill Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Skills/Tags <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddField("tags")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Tag
              </Button>
            </div>
            <div className="space-y-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`e.g. React, TypeScript, etc.`}
                    value={tag}
                    onChange={(e) => handleUpdateField("tags", index, e.target.value)}
                  />
                  {formData.tags.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField("tags", index)}
                    >
                      <X className="h-4 w-4 cursor-pointer" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {formData.tags.some((t) => t.trim()) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.tags
                  .filter((t) => t.trim())
                  .map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          {/* About Company */}
          <div className="space-y-2">
            <Label htmlFor="about">About the Company</Label>
            <Textarea
              id="about"
              placeholder="Tell candidates about your company, culture, and mission..."
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "Posting Job..." : "Post Job"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer hover:bg-blue-500 hover:text-white">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}