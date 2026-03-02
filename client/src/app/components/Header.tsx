"use client";

import { Briefcase, User, Menu, LogOut, UserCircle, FileText, Mail, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "./ui/use-mobile";
import { useEffect, useState, type FormEvent } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

interface HeaderProps {
  onSignInClick: () => void;
  onSignUpClick: () => void;
  onPostJobClick: () => void;
}

export function Header({ onSignInClick, onSignUpClick, onPostJobClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "employer") return;
    const params = new URLSearchParams(location.search);
    setSkillSearch(params.get("skill") || "");
  }, [location.search, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleEmployerSkillSearch = (
    event: FormEvent<HTMLFormElement>,
    closeMobileMenu = false
  ) => {
    event.preventDefault();
    if (!user || user.role !== "employer") return;

    const query = skillSearch.trim();
    const params = new URLSearchParams();
    if (query) {
      params.set("skill", query);
    }

    navigate(`/applications${params.toString() ? `?${params.toString()}` : ""}`);
    if (closeMobileMenu) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-blue-400 p-2 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className={`text-xl font-bold transition-all duration-200 ${isSearchFocused && isMobile ? 'hidden' : 'block'}`}>JobPortal</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-blue-500 transition-colors">
            Find Jobs
          </Link>
          <Link to="/companies" className="text-gray-700 hover:text-blue-500 transition-colors">
            Companies
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-500 transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-500 transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user?.role === "employer" && (
            <form
              onSubmit={handleEmployerSkillSearch}
              className="flex items-center gap-2"
            >
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                <Input
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search skills"
                  aria-label="Search jobseekers by skills"
                  className="
                    w-20 md:w-40 lg:w-64 pl-9
                    bg-gray-50 dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-lg
                    focus:border-blue-500 focus:ring-0 focus:outline-none focus:w-55 md:focus:w-48 lg:focus:w-64
                    transition-all duration-200
                    hover:bg-white dark:hover:bg-gray-900
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    text-sm
                  "
                />
              </div>
            </form>
          )}
          {user ? (
            <>
              {/* Subscribe button for job seekers who are not subscribed */}
              {user.role === "job_seeker" && !user.isSubscribed && (
                <Button
                  className="hidden md:block bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white cursor-pointer"
                  onClick={() => navigate("/subscribe")}
                >
                  Subscribe
                </Button>
              )}
              
              {/* Pro Member badge for subscribed users */}
              {user.role === "job_seeker" && user.isSubscribed && (
                <Badge className="hidden md:flex bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 mr-2">
                  Pro Member
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-2 cursor-pointer">
                    <UserCircle className="h-5 w-5" />
                    <span>{user.name}</span>
                    <Badge variant="secondary" className="ml-1">
                      {user.role === "job_seeker" ? "Job Seeker" : "Employer"}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "job_seeker" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/my-applications" className="flex items-center cursor-pointer">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>My Applications</span>
                        </Link>
                      </DropdownMenuItem>
                      {!user.isSubscribed && (
                        <DropdownMenuItem onClick={() => navigate("/subscribe")}>
                          <span className="mr-2">💎</span>
                          <span>Subscribe to Pro</span>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  {user.role === "employer" && (
                    <DropdownMenuItem asChild>
                      <Link to="/applications" className="flex items-center cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Jobs & Applications</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4 cursor-pointer" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {user.role === "employer" && (
                <Button className="hidden md:block bg-blue-400 hover:bg-blue-500 text-white cursor-pointer" onClick={onPostJobClick}>Post a Job</Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2 cursor-pointer"
                onClick={onSignInClick}
              >
                <User className="h-4 w-4" />
                Sign In
              </Button>
              <Button className="hidden md:block bg-blue-400 hover:bg-blue-500 text-white cursor-pointer" onClick={onSignUpClick}>
                Get Started
              </Button>
            </>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col p-0">
              <SheetHeader className="p-6 pb-2 border-b">
                <SheetTitle className="text-left">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Mobile navigation menu for JobPortal.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {user ? (
                  <>
                    {/* User Profile Section */}
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <UserCircle className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {user.role === "job_seeker" ? "Job Seeker" : "Employer"}
                          </Badge>
                          {user.role === "job_seeker" && user.isSubscribed && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
                              Pro
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Main Navigation */}
                    <nav className="space-y-1">
                      <Link
                        to="/"
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        Find Jobs
                      </Link>
                      <Link
                        to="/companies"
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Companies
                      </Link>
                      <Link
                        to="/about"
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        About
                      </Link>
                      <Link
                        to="/contact"
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Contact
                      </Link>
                    </nav>

                    {/* User Actions */}
                    <div className="mt-6 pt-4 border-t">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Profile
                      </Link>
                      <Link
                        to={user.role === "job_seeker" ? "/my-applications" : "/applications"}
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        {user.role === "job_seeker" ? "My Applications" : "My Applications"}
                      </Link>
                      
                      {/* Subscribe option for job seekers */}
                      {user.role === "job_seeker" && !user.isSubscribed && (
                        <Button
                          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white cursor-pointer"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/subscribe");
                          }}
                        >
                          💎 Subscribe to Pro
                        </Button>
                      )}
                      
                      {user.role === "employer" && (
                        <>
                          <Link
                            to="/applications"
                            className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            Applications
                          </Link>
                          <Button
                            className="w-full mt-4 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              onPostJobClick();
                            }}
                          >
                            Post a Job
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="mt-6 pt-4 border-t">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Public Navigation */}
                    <nav className="space-y-1">
                      <Link
                        to="/"
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        Find Jobs
                      </Link>
                      <Link
                        to="/companies"
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Companies
                      </Link>
                      <Link
                        to="/about"
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        About
                      </Link>
                      <Link
                        to="/contact"
                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Contact
                      </Link>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="mt-8 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-center gap-2"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onSignInClick();
                        }}
                      >
                        <User className="h-4 w-4" />
                        Sign In
                      </Button>
                      <Button
                        className="w-full justify-center gap-2"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onSignUpClick();
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
