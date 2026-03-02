import { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AIChatbot } from "../components/AIChatbot";
import { toast } from "sonner";

const CONTACT_INFO = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us an email and we'll respond within 24 hours",
    contact: "support@jobportal.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Fri from 8am to 5pm",
    contact: "+1 (555) 123-4567",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello at our office",
    contact: "123 Business Ave, Suite 100\nSan Francisco, CA 94105",
  },
  {
    icon: Clock,
    title: "Business Hours",
    description: "We're here to help during these hours",
    contact: "Monday - Friday: 8:00 AM - 5:00 PM PST\nSaturday: 9:00 AM - 1:00 PM PST",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: "",
    });

    setIsSubmitting(false);
    toast.success("Thank you for your message! We'll get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl mb-8 text-white">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {CONTACT_INFO.map((info, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <info.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                <p className="text-gray-600 mb-4">{info.description}</p>
                <p className="text-sm text-gray-800 whitespace-pre-line">{info.contact}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Send us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Brief description of your inquiry"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* FAQ Section */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600">
                  Quick answers to common questions.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    How do I create an account?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Click the "Sign Up" button in the top right corner and follow the registration process.
                    You can sign up as either a job seeker or employer.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    How do I post a job?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    After signing up as an employer, click "Post a Job" in the header.
                    Fill out the job details and publish it to reach thousands of candidates.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    How do I apply for jobs?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Browse jobs on the homepage, click on any job card to view details,
                    then click "Apply Now" to submit your application.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Is there a fee to use JobPortal?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    JobPortal is free for job seekers. Employers can post jobs for free,
                    with premium features available for enhanced visibility.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section (Placeholder) */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Find Us</h2>
          <p className="text-gray-600 mb-8">Located in the heart of San Francisco's tech district</p>
          <div className="bg-gray-300 h-64 rounded-lg flex items-center justify-center">
            <iframe
  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d124434.86580842591!2d77.7877722438595!3d12.934080905350307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1772480893356!5m2!1sen!2sin"
  width="100%"
  height="100%"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
          </div>
        </div>
      </div>
      <AIChatbot />
    </div>
  );
}
