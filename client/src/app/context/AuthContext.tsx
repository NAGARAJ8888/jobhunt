"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: "job_seeker" | "employer") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "jobportal_current_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error checking user session:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    role: "job_seeker" | "employer"
  ) {
    setLoading(true);
    try {
      // Validate inputs
      if (!email || !password || !name || !role) {
        throw new Error("All fields are required");
      }

      if (!["job_seeker", "employer"].includes(role)) {
        throw new Error("Invalid role");
      }

      // Call Node.js API to create user
      const response = await fetch(
        "http://localhost:5000/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name,
            role,
          }),
        }
      ).catch(() => {
        throw new Error("Unable to connect to the server. Please ensure the backend is running on port 5000.");
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Set current session
      const newUser: User = data.user;
      setUser(newUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));

      console.log("User signed up successfully:", email);
    } catch (error) {
      console.error("Signup error in AuthContext:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Call Node.js API to sign in
      const response = await fetch(
        "http://localhost:5000/api/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      ).catch(() => {
        throw new Error("Unable to connect to the server. Please ensure the backend is running on port 5000.");
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      // Set current session
      const loggedInUser: User = data.user;
      setUser(loggedInUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(loggedInUser));

      console.log("User signed in successfully:", email);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}