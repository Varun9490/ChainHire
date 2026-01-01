"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";
import { deriveEscrowPDA } from "@/utils/escrowPDA";
import {
  createInitializeInstruction,
} from "@/utils/escrow";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Coins,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Send,
  Wallet as WalletIcon,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id;
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [escrowDialogOpen, setEscrowDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [fundingEscrow, setFundingEscrow] = useState(false);

  const wallet = useWallet();
  const router = useRouter();
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const INR_TO_SOL = 15000;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);

    const fetchJobAndProposals = async () => {
      try {
        const res = await fetch(`/api/jobs/list`);
        const jobs = await res.json();
        const found = jobs.find((j) => j._id === jobId);
        if (!found) {
          toast.error("Job not found");
          router.push("/jobs");
          return;
        }
        setJob(found);

        if (storedUser?.userType === "client") {
          const propRes = await fetch(`/api/proposals/job/${jobId}`);
          const data = await propRes.json();
          setProposals(data);
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndProposals();
  }, [jobId, router]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target);
    const coverLetter = formData.get("coverLetter");
    const proposedAmount = Number(formData.get("proposedAmount"));

    try {
      const res = await fetch("/api/proposals/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          jobId,
          coverLetter,
          proposedAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit proposal");
        return;
      }

      toast.success("Proposal submitted successfully!");
      e.target.reset();
    } catch (error) {
      console.error("Proposal submission error:", error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptProposal = async (proposal) => {
    try {
      const res = await fetch(`/api/proposals/accept/${proposal._id}`, {
        method: "PATCH",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to accept proposal");
        return;
      }

      // Update proposals state
      setProposals((prev) =>
        prev.map((p) =>
          p._id === proposal._id
            ? { ...p, isAccepted: true, status: "accepted" }
            : { ...p, isAccepted: false, status: "rejected" }
        )
      );

      // Show success message
      toast.success(`Proposal accepted! ${data.notificationsSent.accepted} accepted, ${data.notificationsSent.rejected} rejected`);

      // If escrow payment is required, open the escrow dialog
      if (data.requiresEscrowPayment) {
        setSelectedProposal({
          ...proposal,
          escrowDetails: data.escrowDetails,
        });
        setEscrowDialogOpen(true);
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      toast.error("Failed to accept proposal");
    }
  };

  const handleFundEscrow = async () => {
    if (!wallet.connected || !selectedProposal) {
      toast.error("Please connect your wallet first");
      return;
    }

    setFundingEscrow(true);

    try {
      const escrowAmount = selectedProposal.escrowDetails.amount;
      const amountLamports = Math.round((escrowAmount / INR_TO_SOL) * LAMPORTS_PER_SOL);

      // Derive escrow PDA
      const [escrowPDA] = await deriveEscrowPDA(jobId);

      // Create freelancer public key
      const freelancerPubkey = new PublicKey(
        selectedProposal.freelancerId?.walletAddress ||
        "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK" // Fallback test address
      );

      // Create initialize instruction
      const ix = createInitializeInstruction(
        wallet.publicKey,
        freelancerPubkey,
        escrowPDA,
        SystemProgram.programId,
        amountLamports
      );

      const tx = new Transaction().add(ix);

      toast.loading("Sending transaction to Solana...", { id: "escrow" });

      const signature = await wallet.sendTransaction(tx, connection);

      toast.loading("Confirming transaction...", { id: "escrow" });

      await connection.confirmTransaction(signature, "confirmed");

      // Update job with escrow info via API
      await fetch(`/api/jobs/fund/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrowPubkey: escrowPDA.toBase58(),
          signature,
          amountSol: (escrowAmount / INR_TO_SOL).toFixed(6),
        }),
      });

      toast.success("Escrow funded successfully!", { id: "escrow" });

      // Update job state
      setJob((prev) => ({ ...prev, escrowFunded: true, escrowPubkey: escrowPDA.toBase58() }));
      setEscrowDialogOpen(false);
      setSelectedProposal(null);
    } catch (error) {
      console.error("Error funding escrow:", error);
      toast.error("Failed to fund escrow: " + error.message, { id: "escrow" });
    } finally {
      setFundingEscrow(false);
    }
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0C] via-zinc-950 to-[#0A0A0C]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  const solBudget = job.budget ? (job.budget / INR_TO_SOL).toFixed(4) : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0C] via-zinc-950 to-[#0A0A0C] text-zinc-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-2">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                    {job.status || "Active"}
                  </Badge>
                  {job.priority && (
                    <Badge
                      className={`${job.priority === "high"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : job.priority === "medium"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                    >
                      {job.priority} priority
                    </Badge>
                  )}
                  {job.escrowFunded && (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      Escrow Funded
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                {job.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-zinc-300 leading-relaxed">{job.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-zinc-400">Budget (INR)</span>
                  </div>
                  <p className="text-2xl font-bold text-white">₹{job.budget?.toLocaleString()}</p>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-zinc-400">Budget (SOL)</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{solBudget} SOL</p>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-zinc-400">Posted</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="bg-purple-500/10 text-purple-300 border-purple-500/30"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* FREELANCER: Submit Proposal Form */}
        {user?.userType === "freelancer" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 border-zinc-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-400" />
                  Submit Your Proposal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Cover Letter</label>
                    <Textarea
                      name="coverLetter"
                      required
                      placeholder="Explain why you're the best fit for this job..."
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[150px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Proposed Amount (₹)</label>
                    <Input
                      name="proposedAmount"
                      type="number"
                      required
                      placeholder="Enter your bid amount"
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Proposal
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CLIENT: View Proposals */}
        {user?.userType === "client" && proposals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 border-zinc-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  Proposals Received ({proposals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal._id}
                      className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              {proposal.freelancerId?.name || "Freelancer"}
                            </h4>
                            <p className="text-sm text-zinc-400">
                              {proposal.freelancerId?.email}
                            </p>
                          </div>
                        </div>
                        {proposal.status === "accepted" ? (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accepted
                          </Badge>
                        ) : proposal.status === "rejected" ? (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/30">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                            Pending
                          </Badge>
                        )}
                      </div>

                      <p className="text-zinc-300 mb-3">{proposal.coverLetter}</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-zinc-500">Bid Amount</p>
                          <p className="text-xl font-bold text-green-400">
                            ₹{proposal.proposedAmount?.toLocaleString()}
                            <span className="text-sm text-blue-400 ml-2">
                              ({(proposal.proposedAmount / INR_TO_SOL).toFixed(4)} SOL)
                            </span>
                          </p>
                        </div>

                        {!proposal.isAccepted && proposal.status !== "rejected" && (
                          <Button
                            onClick={() => handleAcceptProposal(proposal)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept Bid
                          </Button>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 mt-3">
                        Submitted: {new Date(proposal.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {user?.userType === "client" && proposals.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500">No proposals received yet</p>
          </div>
        )}
      </div>

      {/* Escrow Funding Dialog */}
      <AnimatePresence>
        {escrowDialogOpen && selectedProposal && (
          <Dialog open={escrowDialogOpen} onOpenChange={setEscrowDialogOpen}>
            <DialogContent className="max-w-2xl bg-zinc-900/95 border-zinc-700 text-white backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <WalletIcon className="w-6 h-6 text-purple-400" />
                    Fund Escrow with Solana
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Secure the project by funding the escrow smart contract on Solana
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Coins className="w-5 h-5 text-purple-400" />
                      Escrow Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Amount (INR):</span>
                        <span className="font-bold text-white">
                          ₹{selectedProposal.escrowDetails?.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Amount (SOL):</span>
                        <span className="font-bold text-blue-400">
                          {(selectedProposal.escrowDetails?.amount / INR_TO_SOL).toFixed(6)} SOL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Freelancer:</span>
                        <span className="font-medium text-white">
                          {selectedProposal.freelancerId?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-300">
                      <strong>Note:</strong> The funds will be held securely in an escrow smart contract on Solana devnet. You can release the funds once the freelancer completes the work.
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <WalletMultiButton />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setEscrowDialogOpen(false)}
                      className="flex-1 border-zinc-600 text-white hover:bg-zinc-800"
                      disabled={fundingEscrow}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleFundEscrow}
                      disabled={!wallet.connected || fundingEscrow}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                    >
                      {fundingEscrow ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Funding...
                        </>
                      ) : (
                        <>
                          <WalletIcon className="w-4 h-4 mr-2" />
                          Fund Escrow
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
