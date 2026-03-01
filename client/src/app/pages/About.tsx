import { Users, Target, Award, Heart, CheckCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AIChatbot } from "../components/AIChatbot";

const STATS = [
  { number: "10,000+", label: "Active Users", icon: Users },
  { number: "500+", label: "Partner Companies", icon: Target },
  { number: "95%", label: "Success Rate", icon: Award },
  { number: "24/7", label: "Support", icon: Heart },
];

const VALUES = [
  {
    title: "Innovation",
    description: "We leverage cutting-edge technology to revolutionize the job search experience.",
    icon: Target,
  },
  {
    title: "Integrity",
    description: "We maintain the highest standards of transparency and ethical practices.",
    icon: CheckCircle,
  },
  {
    title: "Community",
    description: "We foster a supportive community where everyone can thrive and succeed.",
    icon: Users,
  },
  {
    title: "Excellence",
    description: "We strive for excellence in everything we do, from user experience to service quality.",
    icon: Award,
  },
];

const TEAM = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzfGVufDF8fHx8MTc3MTkwMzY0Nnww&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    name: "Michael Chen",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzc3xlbnwxfHx8fDE3NzE5MDM4NTJ8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Talent",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzfGVufDF8fHx8MTc3MTkwMzY0Nnww&ixlib=rb-4.1.0&q=80&w=400",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About JobPortal</h1>
          <p className="text-xl md:text-xl mb-8 text-white">
            Connecting talent with opportunity, one job at a time
          </p>
          <p className="text-lg max-w-2xl mx-auto text-white">
            We're on a mission to transform the job search experience by creating a platform
            that empowers both job seekers and employers to find their perfect match.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-lg text-gray-600">
              How we started and where we're going
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Born from Frustration</h3>
              <p className="text-gray-600 mb-6">
                JobPortal was founded in 2020 by a team of frustrated job seekers and recruiters
                who saw the inefficiencies in traditional job boards. We believed there had to be
                a better way to connect talent with opportunity.
              </p>
              <p className="text-gray-600 mb-6">
                What started as a simple idea has grown into a comprehensive platform that serves
                thousands of users daily, featuring advanced matching algorithms, real-time
                notifications, and a user-friendly interface that makes job hunting enjoyable.
              </p>
              <Button size="lg">Learn More About Our Journey</Button>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">4 Years</div>
                <div className="text-lg text-gray-700 mb-4">of Innovation</div>
                <div className="text-2xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-lg text-gray-700 mb-4">Team Members</div>
                <div className="text-2xl font-bold text-blue-600 mb-2">25+</div>
                <div className="text-lg text-gray-700">Countries Served</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="bg-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <value.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">
              The passionate people behind JobPortal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map((member, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-xl mb-8 text-blue-100">
            Whether you're looking for your next opportunity or hiring top talent,
            JobPortal is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Find Your Dream Job
            </Button>
            <Button size="lg" variant="outline" className="border-white text-blue-600 hover:bg-white hover:text-blue-600">
              Post a Job
            </Button>
          </div>
        </div>
      </div>
      <AIChatbot />
    </div>
  );
}
