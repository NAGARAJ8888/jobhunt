import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Check, Crown, Zap, Shield } from "lucide-react";
import { toast } from "sonner";

export function Subscribe() {
  const { user, refreshUserSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Check for success/canceled params after returning from Stripe
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    const verifyAndRefresh = async () => {
      if (success === 'true' && sessionId) {
        setIsLoading(true);
        try {
          // Call backend to verify the session and update subscription

          const backendUrl = import.meta.env.VITE_BACKEND_URL;
          console.log('Backend URL:', backendUrl);
          console.log('Full URL:', `${backendUrl}/api/subscriptions/verify-session`);

          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/verify-session`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            toast.success("Subscription successful! You are now a Pro Member.");
          } else {
            toast.error(data.error || "Failed to verify subscription");
          }
        } catch (error) {
          console.error("Error verifying session:", error);
          toast.error("An error occurred while verifying your subscription.");
        } finally {
          // Refresh user data and wait for it to complete
          await refreshUserSubscription();
          // Reload the page to get fresh state
          window.location.href = '/subscribe';
        }
      } else if (canceled === 'true') {
        toast.info("Subscription was canceled.");
        navigate('/subscribe', { replace: true });
      }
    };

    verifyAndRefresh();
  }, [searchParams, navigate, refreshUserSubscription]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate("/signin");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscriptions/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: "Apply to Featured Jobs",
      description: "Get exclusive access to apply for premium featured jobs",
      icon: Zap,
    },
    {
      title: "Priority Applications",
      description: "Your applications get prioritized attention from employers",
      icon: Crown,
    },
    {
      title: "Verified Badges",
      description: "Stand out with a verified Pro Member badge on your profile",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
            Pro Membership
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock Premium Job Opportunities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Subscribe to Pro and get access to featured jobs, priority applications, 
            and exclusive benefits that help you land your dream job faster.
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-md mx-auto shadow-xl border-purple-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Monthly Pro Plan</CardTitle>
            <CardDescription>Billed monthly, cancel anytime</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">$9.99</span>
              <span className="text-gray-500">/month</span>
            </div>

            <ul className="space-y-3 mb-8 text-left">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-1 flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{feature.title}</span>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleSubscribe}
              disabled={isLoading || user?.isSubscribed}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-6 text-lg"
            >
              {isLoading ? "Processing..." : user?.isSubscribed ? "You're Already a Pro Member" : "Subscribe Now"}
            </Button>

            {user?.isSubscribed && (
              <p className="mt-4 text-sm text-gray-500">
                Visit your profile to manage your subscription
              </p>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-purple-100">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600">Yes, you can cancel your subscription at any time from your profile settings. You'll continue to have access until the end of your billing period.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">What payment methods are accepted?</h3>
                <p className="text-gray-600">We accept all major credit cards, debit cards, and other payment methods supported by Stripe.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
