"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Browse Jobs
        </h1>
        {loading && (
          <div className="text-center text-white">Loading jobs...</div>
        )}
        {error && <div className="text-center text-red-400">{error}</div>}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center text-white/60">No jobs found.</div>
        )}
        <div className="grid gap-6">
          {jobs.map((job) => {
            let solBudget = null;
            if (job.budget && !isNaN(job.budget)) {
              solBudget = (parseFloat(job.budget) / INR_TO_SOL).toFixed(4);
            }
            return (
              <Card
                key={job._id}
                className="bg-white/5 border border-white/10 text-white"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">
                    {job.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white">
                  <div className="mb-2 text-white">{job.description}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {job.skills &&
                      job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-white/10 rounded-full text-xs font-medium text-white"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white">
                    <span>
                      Budget:{" "}
                      {job.budget
                        ? `₹${job.budget} (${
                            solBudget ? solBudget + " SOL" : "N/A"
                          })`
                        : "N/A"}
                    </span>
                    <span>
                      Posted:{" "}
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link href={`/jobs/${job._id}`}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
