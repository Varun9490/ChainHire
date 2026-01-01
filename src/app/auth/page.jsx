"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, UserCircle, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState(null); // null = selection, 'login' = login form, 'signup' = signup form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "client",
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (userType) => {
    setFormData((prev) => ({ ...prev, userType }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    // Basic validation
    if (mode === "signup" && !formData.name) {
      setNotification({
        type: "error",
        message: "Please enter your full name.",
      });
      setLoading(false);
      return;
    }
    if (!formData.email || !formData.password) {
      setNotification({
        type: "error",
        message: "Email and password are required.",
      });
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === "login") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setNotification({
            type: "success",
            message: "Login successful! Redirecting...",
          });
          setTimeout(() => router.push("/dashboard"), 1000);
        } else {
          setNotification({
            type: "success",
            message: "Registered successfully! Please log in.",
          });
          setTimeout(() => setMode("login"), 1500);
        }
      } else {
        // Show more detailed error message if available
        const errorMsg = data.details
          ? `${data.error}: ${data.details}`
          : data.error || "An unknown error occurred.";
        setNotification({
          type: "error",
          message: errorMsg,
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      setNotification({
        type: "error",
        message: "Could not connect to the server. Please check if the database is configured properly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      userType: "client",
    });
    setNotification(null);
  };

  const handleModeChange = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0A0A0C] p-4 font-sans text-zinc-100">
      {/* Background parallax from landing page */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full blur-3xl bg-[radial-gradient(closest-side,rgba(34,211,238,0.08),rgba(147,51,234,0.06),transparent_70%)]" />
        <div className="absolute top-1/4 right-[-20%] h-[40rem] w-[40rem] rounded-full blur-3xl bg-[radial-gradient(closest-side,rgba(16,185,129,0.08),rgba(34,211,238,0.05),transparent_70%)]" />
      </motion.div>

      <AnimatePresence mode="wait">
        {mode === null ? (
          /* Selection View */
          <motion.div
            key="selection"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400 mb-4">
                Welcome to ChainHire
              </h1>
              <p className="text-zinc-400 text-lg">
                The decentralized platform connecting talent with opportunity
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <Card
                  className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm text-white cursor-pointer h-full hover:border-cyan-500/50 transition-colors"
                  onClick={() => handleModeChange("login")}
                >
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                      <UserCircle className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Sign In</h2>
                    <p className="text-zinc-400 mb-4">
                      Already have an account? Log in to access your dashboard and continue your journey.
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold"
                    >
                      Continue to Login
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: 0.1 }}
              >
                <Card
                  className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm text-white cursor-pointer h-full hover:border-emerald-500/50 transition-colors"
                  onClick={() => handleModeChange("signup")}
                >
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                      <Briefcase className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Create Account</h2>
                    <p className="text-zinc-400 mb-4">
                      New to ChainHire? Join our community and start connecting with clients or freelancers.
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold"
                    >
                      Get Started Free
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-zinc-500 mt-8"
            >
              <Link href="/" className="hover:text-cyan-400 transition-colors">
                ← Back to Home
              </Link>
            </motion.p>
          </motion.div>
        ) : (
          /* Form View */
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm text-white">
              <CardHeader>
                <button
                  onClick={() => handleModeChange(null)}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 transition-colors mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to options
                </button>
                <CardTitle className="text-3xl font-extrabold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {notification && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "flex items-center gap-3 rounded-md p-3 mb-4 text-sm",
                        notification.type === "error"
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      )}
                    >
                      {notification.type === "error" ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      <p>{notification.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {mode === "signup" && (
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="e.g., Ada Lovelace"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-zinc-950 border-zinc-800 h-11 focus:border-cyan-500/50"
                        required
                      />
                    </motion.div>
                  )}

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@studio.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-zinc-950 border-zinc-800 h-11 focus:border-cyan-500/50"
                      required
                    />
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-zinc-950 border-zinc-800 h-11 focus:border-cyan-500/50"
                      required
                    />
                  </motion.div>

                  {mode === "signup" && (
                    <motion.div className="space-y-3" variants={itemVariants}>
                      <Label>I am a...</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleUserTypeChange("client")}
                          className={cn(
                            "p-3 rounded-md text-center text-sm font-medium border transition-all duration-200",
                            formData.userType === "client"
                              ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                              : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                          )}
                        >
                          Client
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUserTypeChange("freelancer")}
                          className={cn(
                            "p-3 rounded-md text-center text-sm font-medium border transition-all duration-200",
                            formData.userType === "freelancer"
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                          )}
                        >
                          Freelancer
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400 text-zinc-950 hover:opacity-90 transition-opacity"
                      disabled={loading}
                    >
                      {loading
                        ? "Processing..."
                        : mode === "login"
                          ? "Log In"
                          : "Sign Up Free"}
                    </Button>
                  </motion.div>

                  <motion.p
                    variants={itemVariants}
                    className="text-center text-sm text-zinc-400"
                  >
                    {mode === "login"
                      ? "Don't have an account?"
                      : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange(mode === "login" ? "signup" : "login")}
                      className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {mode === "login" ? "Sign Up" : "Log In"}
                    </button>
                  </motion.p>
                </motion.form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
