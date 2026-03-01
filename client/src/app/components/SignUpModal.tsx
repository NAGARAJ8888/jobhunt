"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Briefcase, UserCircle } from "lucide-react";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export function SignUpModal({ open, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker" as "job_seeker" | "employer",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(formData.email, formData.password, formData.name, formData.role);
      toast.success("Account created successfully!");
      onClose();
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "job_seeker",
      });
    } catch (error: any) {
      console.error("Signup error details:", error);
      const errorMessage = error?.message || "Failed to create account. Please try again.";
      
      // Provide helpful suggestions based on the error
      if (errorMessage.includes("already exists")) {
        toast.error(errorMessage, {
          description: "Try signing in instead or use a different email address.",
          action: {
            label: "Sign In",
            onClick: () => {
              onClose();
              onSwitchToSignIn();
            },
          },
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create an Account</DialogTitle>
          <DialogDescription>
            Join JobPortal to find your dream job or hire top talent
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>I want to</Label>
            <RadioGroup
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as "job_seeker" | "employer" })
              }
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="job_seeker" id="job_seeker" />
                <Label htmlFor="job_seeker" className="flex items-center gap-2 cursor-pointer flex-1">
                  <UserCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Find a Job</div>
                    <div className="text-xs text-gray-500">I'm looking for opportunities</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="employer" id="employer" />
                <Label htmlFor="employer" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Post Jobs</div>
                    <div className="text-xs text-gray-500">I'm hiring talent</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
          </div>

          <Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500 text-white cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}