import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import axios from "axios";

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  company: string;
  featured?: boolean;
  onSubmitSuccess?: () => void;
}

export function ApplicationForm({ jobId, jobTitle, company, featured = false, onSubmitSuccess }: ApplicationFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || !user) {
      toast.error("Please fill in all required fields and ensure you're logged in");
      return;
    }

    // Check subscription for featured jobs
    if (featured && user.role === "job_seeker" && !user.isSubscribed) {
      toast.error(
        "Please subscribe to apply for featured jobs.",
        {
          action: {
            label: "Subscribe",
            onClick: () => navigate("/subscribe"),
          },
          duration: 5000,
        }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('jobId', jobId);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('coverLetter', formData.coverLetter);
      formDataToSend.append('userId', user.id);

      if (formData.resume) {
        // Upload resume to Cloudinary
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', formData.resume);
        cloudinaryFormData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); // Use environment variable

        const cloudinaryResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`, // Use environment variable
          cloudinaryFormData
        );

        const resumeUrl = cloudinaryResponse.data.secure_url;
        formDataToSend.append('resumeUrl', resumeUrl);
      }

      const response = await fetch('http://localhost:5000/api/applications/apply', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Application submitted successfully for ${jobTitle} at ${company}!`);
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          coverLetter: "",
          resume: null,
        });
        // Call the success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        // Handle subscription required error from backend
        if (result.requiresSubscription) {
          toast.error(
            "Please subscribe to apply for featured jobs.",
            {
              action: {
                label: "Subscribe",
                onClick: () => navigate("/subscribe"),
              },
              duration: 5000,
            }
          );
        } else {
          toast.error(result.error || 'Failed to submit application');
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          You are applying for <strong>{jobTitle}</strong> at <strong>{company}</strong>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Resume / CV</Label>
        <Input
          id="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) =>
            setFormData({
              ...formData,
              resume: e.target.files?.[0] || null,
            })
          }
        />
        <p className="text-xs text-gray-500">
          Accepted formats: PDF, DOC, DOCX (Max 5MB)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverLetter">Cover Letter</Label>
        <Textarea
          id="coverLetter"
          placeholder="Tell us why you're a great fit for this role..."
          rows={6}
          value={formData.coverLetter}
          onChange={(e) =>
            setFormData({ ...formData, coverLetter: e.target.value })
          }
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Submit Application
        </Button>
        <Button type="button" variant="outline">
          Save Draft
        </Button>
      </div>
    </form>
  );
}
