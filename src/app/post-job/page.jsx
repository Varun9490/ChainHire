"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { depositToEscrow } from "@/utils/solana-escrow";

// UI Components from Shadcn
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Icons from Lucide-React
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  Tag,
  Calendar,
  BarChartHorizontal,
  Wallet,
} from "lucide-react";

export default function PostJobPage() {
  // State for form fields, including new fields for deadline and priority
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    skills: "",
    deadline: "",
    priority: "medium", // Default priority
    fundEscrow: false, // Whether to fund escrow with Solana
  });
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [escrowFunded, setEscrowFunded] = useState(false);
  const router = useRouter();
  const wallet = useWallet();

  // Handles changes for all input types
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // Handles changes for the Select component
  const handleSelectChange = (value) => {
    setForm({ ...form, priority: value });
  };

  // Handles switch toggle for escrow funding
  const handleSwitchChange = (checked) => {
    setForm({ ...form, fundEscrow: checked });
  };

  // Function to handle escrow funding with Solana
  const handleFundEscrow = async (jobId) => {
    if (!wallet.connected) {
      toast.error("Please connect your Solana wallet first");
      return false;
    }

    try {
      // Convert INR to SOL (simplified conversion for demo)
      // In production, you would use an oracle or exchange rate API
      const solAmount = Number(form.budget) / 6000; // Example rate: 1 SOL = ₹6000
      
      const result = await depositToEscrow(
        wallet,
        solAmount * LAMPORTS_PER_SOL,
        jobId
      );

      if (result.success) {
        setTxSignature(result.signature);
        setEscrowFunded(true);
        toast.success("Escrow funded successfully!");
        return true;
      } else {
        toast.error("Failed to fund escrow: " + result.error);
        return false;
      }
    } catch (error) {
      console.error("Escrow funding error:", error);
      toast.error("Error funding escrow: " + error.message);
      return false;
    }
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.budget || !form.deadline) {
      toast.error("Please fill out all required fields.");
      return;
    }

    if (form.fundEscrow && !wallet.connected) {
      toast.error("Please connect your Solana wallet to fund escrow");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Posting your job...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication error. Please log in again.", {
          id: toastId,
        });
        router.push("/auth");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Prepare the request body, converting skills string to an array
      const body = {
        ...form,
        budget: Number(form.budget), // Ensure budget is a number
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s), // Filter out empty strings
      };

      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Job posted successfully!", { id: toastId });
        
        // If escrow funding is enabled, fund the escrow
        if (form.fundEscrow) {
          toast.loading("Funding escrow with Solana...", { id: toastId });
          const escrowFunded = await handleFundEscrow(data.job._id);
          
          if (escrowFunded) {
            // Update the job with escrow information
            await fetch(`/api/jobs/${data.job._id}/update-escrow`, {
              method: "PUT",
              headers,
              body: JSON.stringify({ 
                escrowFunded: true,
                txSignature
              }),
            });
          }
        }
        
        router.push("/dashboard");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to post job");
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use theme-aware background and text colors
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Card component will adapt to the theme automatically */}
        <Card className="shadow-2xl border-border/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Create a New Job
                </CardTitle>
                <CardDescription>
                  Fill in the details below to find the perfect freelancer.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {/* Input component will adapt to the theme */}
                  <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., E-commerce Website Development"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {/* Textarea component will adapt to the theme */}
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe the project, scope, deliverables, and any specific requirements."
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (₹)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      value={form.budget}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 50000"
                      className="pl-10"
                    />
                  </div>
                </div>
                {/* Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={handleChange}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills */}
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="skills"
                      name="skills"
                      value={form.skills}
                      onChange={handleChange}
                      placeholder="e.g., React, Node.js, Figma"
                      className="pl-10"
                    />
                  </div>
                </div>
                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  {/* Select component will adapt to the theme */}
                  <Select
                    name="priority"
                    value={form.priority}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <div className="flex items-center">
                        <BarChartHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select priority" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Escrow Funding Option */}
              <div className="flex items-center space-x-2 pt-4 border-t border-border/30">
                <Switch
                  id="fundEscrow"
                  name="fundEscrow"
                  checked={form.fundEscrow}
                  onCheckedChange={handleSwitchChange}
                />
                <div className="space-y-1">
                  <Label htmlFor="fundEscrow" className="text-base font-medium flex items-center">
                    <Wallet className="mr-2 h-4 w-4 text-purple-500" />
                    Fund Escrow with Solana
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Secure payment by funding escrow with SOL (~{(Number(form.budget) / 6000).toFixed(3)} SOL)
                  </p>
                </div>
              </div>

              {/* Transaction Status */}
              {txSignature && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Escrow funded successfully! Transaction: {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
                  </p>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity text-white"
            >
              {loading ? "Posting..." : "Post Job & Find Talent"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
