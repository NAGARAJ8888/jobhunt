"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export function SignInModal({ open, onClose, onSwitchToSignUp }: SignInModalProps) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<"signin" | "forgot_request" | "forgot_verify" | "forgot_reset">(
    "signin"
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

  useEffect(() => {
    if (!open) {
      setMode("signin");
      setForgotEmail("");
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(formData.email, formData.password);
      toast.success("Welcome back!");
      onClose();
      // Reset form
      setFormData({
        email: "",
        password: "",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Invalid email or password";
      toast.error(errorMessage, {
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestOtp();
  };

  const requestOtp = async () => {
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send OTP");
      }

      setMode("forgot_verify");
      toast.success(data?.message || "OTP sent successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !otp.trim()) {
      toast.error("Please enter email and OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Invalid OTP");
      }

      setResetToken(data?.resetToken || "");
      setMode("forgot_reset");
      toast.success("OTP verified. Set your new password.");
    } catch (error: any) {
      toast.error(error?.message || "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          resetToken,
          newPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to reset password");
      }

      toast.success("Password reset successful. Please sign in.");
      setMode("signin");
      setFormData((prev) => ({ ...prev, email: forgotEmail.trim().toLowerCase(), password: "" }));
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTitle = () => {
    if (mode === "forgot_request") return "Forgot Password";
    if (mode === "forgot_verify") return "Verify OTP";
    if (mode === "forgot_reset") return "Reset Password";
    return "Sign In";
  };

  const renderDescription = () => {
    if (mode === "forgot_request") return "Enter your email and we will send an OTP.";
    if (mode === "forgot_verify") return "Enter the OTP sent to your email address.";
    if (mode === "forgot_reset") return "Set a new password for your account.";
    return "Welcome back! Please sign in to continue";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{renderTitle()}</DialogTitle>
          <DialogDescription>{renderDescription()}</DialogDescription>
        </DialogHeader>

        {mode === "signin" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email Address</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(formData.email);
                setMode("forgot_request");
              }}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>

            <Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500 text-white cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-blue-600 cursor-pointer hover:underline font-medium"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {mode === "forgot_request" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="john@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending OTP..." : "Send OTP"}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-blue-600 hover:underline"
              onClick={() => setMode("signin")}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {mode === "forgot_verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-email">Email Address</Label>
              <Input
                id="verify-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verify-otp">OTP</Label>
              <Input
                id="verify-otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying OTP..." : "Verify OTP"}
            </Button>
            <div className="flex justify-between text-sm">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => setMode("forgot_request")}
              >
                Change email
              </button>
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={requestOtp}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {mode === "forgot_reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating Password..." : "Reset Password"}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-blue-600 hover:underline"
              onClick={() => setMode("signin")}
            >
              Back to Sign In
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
