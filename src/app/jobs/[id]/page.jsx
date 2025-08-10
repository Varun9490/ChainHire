"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id;
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);

  const router = useRouter();

  // Conversion rate: 1 SOL = 15000 INR (example, update as needed)
  const INR_TO_SOL = 15000;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const fetchJobAndProposals = async () => {
      const res = await fetch(`/api/jobs/list`);
      const jobs = await res.json();
      const found = jobs.find((j) => j._id === jobId);
      if (!found) {
        toast.error("Job not found");
        router.push("/dashboard");
        return;
      }
      setJob(found);
      setLoading(false);

      if (storedUser?.userType === "client") {
        const propRes = await fetch(`/api/proposals/job/${jobId}`);
        const data = await propRes.json();
        setProposals(data);
      }
    };

    fetchJobAndProposals();
  }, [jobId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const form = e.target;
    const coverLetter = form.coverLetter.value;
    const proposedAmount = form.proposedAmount.value;

    const res = await fetch("/api/proposals/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jobId, coverLetter, proposedAmount }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Proposal submitted!");
      form.reset();
    } else {
      toast.error(data.error || "Submission failed");
    }
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading job...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-8">
      <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
      <p className="text-gray-300 text-lg mb-2">{job.description}</p>
      <p className="text-green-400 font-semibold mb-6">
        Budget: ₹{job.budget}
        {job.budget && !isNaN(job.budget) && (
          <span className="ml-2 text-blue-400">
            ({(parseFloat(job.budget) / INR_TO_SOL).toFixed(4)} SOL )
          </span>
        )}
      </p>

      {/* FREELANCER PROPOSAL FORM */}
      {user?.userType === "freelancer" && (
        <div className="bg-indigo-900/30 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Submit Your Proposal</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              name="coverLetter"
              required
              placeholder="Write your cover letter..."
              className="auth-input"
            />
            <input
              name="proposedAmount"
              type="number"
              placeholder="Proposed Amount"
              className="auth-input"
              required
            />
            <button type="submit" className="auth-btn">
              Submit Proposal
            </button>
          </form>
        </div>
      )}

      {/* CLIENT PROPOSAL LIST */}
      {user?.userType === "client" && proposals.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Proposals Received
          </h2>
          <ul className="space-y-4">
            {proposals.map((p) => (
              <li key={p._id} className="bg-purple-800/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-indigo-300">
                  {p.freelancerId?.name || "Freelancer"} (
                  {p.freelancerId?.email})
                </h3>
                <p className="mt-1">{p.coverLetter}</p>
                <p className="text-green-400 mt-2 font-semibold">
                  ₹ {p.proposedAmount}
                  {p.proposedAmount && !isNaN(p.proposedAmount) && (
                    <span className="ml-2 text-blue-400">
                      ({(parseFloat(p.proposedAmount) / INR_TO_SOL).toFixed(4)}{" "}
                      SOL )
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Submitted on: {new Date(p.createdAt).toLocaleString()}
                </p>

                {p.isAccepted ? (
                  <p className="text-green-400 font-bold mt-2">✅ Accepted</p>
                ) : (
                  <button
                    onClick={async () => {
                      const res = await fetch(
                        `/api/proposals/accept/${p._id}`,
                        {
                          method: "PATCH",
                        }
                      );
                      const data = await res.json();
                      if (res.ok) {
                        toast.success("Proposal accepted!");
                        setProposals((prev) =>
                          prev.map((prop) =>
                            prop._id === p._id
                              ? { ...prop, isAccepted: true }
                              : { ...prop, isAccepted: false }
                          )
                        );
                      } else {
                        toast.error(data.error || "Failed to accept proposal");
                      }
                    }}
                    className="mt-3 px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Accept Proposal
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {user?.userType === "client" && proposals.length === 0 && (
        <p className="mt-8 text-indigo-300 text-sm">
          No proposals yet. Check back later.
        </p>
      )}
    </div>
  );
}
