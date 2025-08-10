"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("ChainHire_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const userData = {
        id: "1",
        email,
        name: email === "demo@ChainHire.com" ? "John Doe" : "User",
        role: "freelancer",
        avatar: "/placeholder.svg?height=40&width=40",
        skills: ["React", "Node.js", "Solana"],
        hourlyRate: 0.5,
        completedJobs: 127,
        rating: 4.9,
        bio: "Full-stack developer with 5+ years of experience",
        walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      };
      setUser(userData);
      localStorage.setItem("ChainHire_user", JSON.stringify(userData));
    } catch (error) {
      throw new Error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name, role) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const userData = {
        id: Date.now().toString(),
        email,
        name,
        role,
        avatar: "/placeholder.svg?height=40&width=40",
        skills: role === "freelancer" ? [] : undefined,
        hourlyRate: role === "freelancer" ? 0 : undefined,
        completedJobs: 0,
        rating: 0,
        bio: "",
        walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      };
      setUser(userData);
      localStorage.setItem("ChainHire_user", JSON.stringify(userData));
    } catch (error) {
      throw new Error("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    if (!user) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("ChainHire_user", JSON.stringify(updatedUser));
    } catch (error) {
      throw new Error("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ChainHire_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, updateProfile, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
