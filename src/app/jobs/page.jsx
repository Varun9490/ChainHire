"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Clock,
  DollarSign,
  MapPin,
  Star,
  TrendingUp,
  ArrowRight,
  Calendar,
  Coins,
  User,
  Shield
} from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const INR_TO_SOL = 15000;

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs/list");
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
  };

  const JobCardSkeleton = () => (
    <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4 bg-zinc-700" />
        <Skeleton className="h-4 w-1/2 bg-zinc-700 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full bg-zinc-700" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-16 bg-zinc-700" />
          <Skeleton className="h-6 w-20 bg-zinc-700" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0C] via-zinc-950 to-[#0A0A0C] text-zinc-100">
      {/* Header Section */}
      <div className="relative overflow-hidden border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 via-zinc-900/30 to-zinc-900/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-6">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Available Opportunities
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
              Browse Jobs
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Discover exciting opportunities and connect with top clients worldwide. Secure your next gig with blockchain-powered escrow.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-lg">{error}</p>
          </motion.div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-800/50 mb-6">
              <Briefcase className="w-10 h-10 text-zinc-500" />
            </div>
            <h3 className="text-2xl font-semibold text-zinc-300 mb-2">
              No jobs available
            </h3>
            <p className="text-zinc-500 mb-6">
              Check back later for new opportunities
            </p>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {jobs.map((job, index) => {
              const solBudget = job.budget
                ? (parseFloat(job.budget) / INR_TO_SOL).toFixed(4)
                : null;

              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group relative bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 border-zinc-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm overflow-hidden cursor-pointer h-full">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300" />

                    <CardHeader className="pb-3 relative">
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-400 border-green-500/30 font-medium"
                        >
                          Active
                        </Badge>
                        {job.priority && (
                          <Badge
                            variant="outline"
                            className={`${job.priority === "high"
                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                : job.priority === "medium"
                                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              }`}
                          >
                            {job.priority}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                        {job.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative space-y-4">
                      <p className="text-zinc-400 text-sm line-clamp-3">
                        {job.description}
                      </p>

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-medium text-purple-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-3 py-1 bg-zinc-700/50 rounded-full text-xs font-medium text-zinc-400">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Budget & Date */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Coins className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">Budget</p>
                            <p className="text-sm font-bold text-white">
                              ₹{job.budget?.toLocaleString() || "N/A"}
                            </p>
                            {solBudget && (
                              <p className="text-xs text-blue-400">
                                {solBudget} SOL
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                          <span className="text-xs text-zinc-500">
                            {job.createdAt
                              ? new Date(job.createdAt).toLocaleDateString()
                              : "Recent"}
                          </span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Button
                        onClick={() => handleViewDetails(job)}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300"
                        size="sm"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Job Details Dialog */}
      <AnimatePresence>
        {isDialogOpen && selectedJob && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl bg-zinc-900/95 border-zinc-700 text-white backdrop-blur-xl max-h-[90vh] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex gap-2">
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                          Active
                        </Badge>
                        {selectedJob.priority && (
                          <Badge
                            className={`${selectedJob.priority === "high"
                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                : selectedJob.priority === "medium"
                                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              }`}
                          >
                            {selectedJob.priority} priority
                          </Badge>
                        )}
                      </div>
                      <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        {selectedJob.title}
                      </DialogTitle>
                    </div>
                  </div>
                </DialogHeader>

                <DialogDescription asChild>
                  <div className="space-y-6 mt-6">
                    {/* Budget Section */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-green-500/20">
                            <DollarSign className="w-5 h-5 text-green-400" />
                          </div>
                          <span className="text-sm text-zinc-400">Budget (INR)</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          ₹{selectedJob.budget?.toLocaleString() || "N/A"}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <Coins className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="text-sm text-zinc-400">Budget (SOL)</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {selectedJob.budget
                            ? (parseFloat(selectedJob.budget) / INR_TO_SOL).toFixed(4)
                            : "N/A"}{" "}
                          SOL
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                        Job Description
                      </h3>
                      <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {selectedJob.description}
                      </p>
                    </div>

                    {/* Skills Required */}
                    {selectedJob.skills && selectedJob.skills.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Star className="w-5 h-5 text-purple-400" />
                          Skills Required
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills.map((skill, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-purple-500/10 text-purple-300 border-purple-500/30 px-3 py-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-700/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-800">
                          <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Posted</p>
                          <p className="text-sm font-medium text-white">
                            {selectedJob.createdAt
                              ? new Date(selectedJob.createdAt).toLocaleDateString()
                              : "Recently"}
                          </p>
                        </div>
                      </div>

                      {selectedJob.deadline && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-800">
                            <Clock className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">Deadline</p>
                            <p className="text-sm font-medium text-white">
                              {new Date(selectedJob.deadline).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <Link href={`/jobs/${selectedJob._id}`} className="block">
                        <Button className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:opacity-90 text-white font-semibold py-6 text-lg shadow-lg shadow-purple-500/20">
                          Apply for this Job
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </DialogDescription>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
