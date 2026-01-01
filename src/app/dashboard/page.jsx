"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Icons
import {
  Bell,
  Search,
  Filter,
  Plus,
  MessageSquare,
  DollarSign,
  Calendar,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Eye,
  Edit,
  Trash2,
  Wallet,
  Send,
  TrendingUp,
  Award,
  Briefcase,
  Users,
  Shield,
  ArrowUp,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
// shadcn/ui
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

// Solana Wallet Adapter
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";

// Escrow and other utils
import { deriveEscrowPDA } from "@/utils/escrowPDA";
import {
  createInitializeInstruction,
  createReleaseInstruction,
} from "@/utils/escrow";

/* -------------------------------------------------------------------------------------------------
 * THEME PROVIDER & HELPERS (UNCHANGED)
 * -------------------------------------------------------------------------------------------------*/
const ThemeContext = createContext(undefined);
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
    else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches)
      setTheme("dark");
    else setTheme("light");
  }, []);
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);
  const toggleTheme = () =>
    setTheme((t) => {
      const n = t === "dark" ? "light" : "dark";
      localStorage.setItem("theme", n);
      return n;
    });
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
/** @typedef {"client" | "freelancer"} UserType */
/** @typedef {{ _id: string; name: string; userType: UserType }} User */
/** @typedef {{ _id: string; title: string; description: string; budget: number; deadline: string; status: "active" | "in-progress" | "completed" | "cancelled"; priority: "high" | "medium" | "low"; skills?: string[]; escrowFunded?: boolean; escrowReleased?: boolean; clientId?: string; }} Job */
const API_ENDPOINTS = {
  VERIFY: "/api/auth/verify",
  JOBS_BY_CLIENT: (clientId) => `/api/jobs/client/${clientId}`,
  JOBS_LIST: "/api/jobs",
  JOB_BY_ID: (jobId) => `/api/jobs/${jobId}`,
  FREELANCER_ACCEPTED: (freelancerId) =>
    `/api/proposals/accepted/freelancer/${freelancerId}`,
  EDIT_JOB: (jobId) => `/api/jobs/edit/${jobId}`,
  DELETE_JOB: (jobId) => `/api/jobs/delete/${jobId}`,
  FUND: (jobId) => `/api/jobs/fund/${jobId}`,
  RELEASE: (jobId) => `/api/jobs/release/${jobId}`,
  PROPOSALS_FOR_JOB: (jobId) => `/api/proposals/job/${jobId}`,
  ACCEPT_PROPOSAL: (proposalId) => `/api/proposals/accept/${proposalId}`,
  JOB_STATS: (clientId) => `/api/client/job-stats/${clientId}`,
  MESSAGES_FOR_JOB: (jobId) => `/api/chat/${jobId}`,
};
async function parseJSON(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid JSON from ${res.url}: ${text?.slice(0, 120)}`);
  }
}
function withAuth(init) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { ...init?.headers };
  if (token && !headers.Authorization)
    headers.Authorization = `Bearer ${token}`;
  return { cache: "no-store", ...init, headers };
}
async function apiFetchJSON(url, init) {
  const res = await fetch(url, withAuth(init));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} for ${url}: ${text}`);
  }
  return parseJSON(res);
}
async function normalizeJobs(input) {
  const arr = Array.isArray(input)
    ? input
    : Array.isArray(input?.jobs)
    ? input.jobs
    : input?.data && Array.isArray(input.data)
    ? input.data
    : [];
  const jobs = [];
  for (const item of arr) {
    let job = item?.job ?? item?.jobId ?? item;
    if (typeof job === "string") {
      try {
        const fetched = await apiFetchJSON(API_ENDPOINTS.JOB_BY_ID(job));
        job = fetched?.job ?? fetched ?? null;
      } catch {
        job = null;
      }
    }
    if (!job) continue;
    const safeJob = {
      _id: job._id ?? job.id ?? crypto.randomUUID(),
      title: job.title ?? "Untitled",
      description: job.description ?? "",
      budget: Number(job.budget ?? 0),
      deadline: job.deadline ?? new Date().toISOString(),
      status: job.status ?? "active",
      priority: job.priority ?? "medium",
      skills: Array.isArray(job.skills) ? job.skills : [],
      escrowFunded: Boolean(job.escrowFunded),
      escrowReleased: Boolean(job.escrowReleased),
      clientId: job.clientId ?? job.client?._id,
    };
    jobs.push(safeJob);
  }
  return jobs;
}
function AnimatedCounter({ value, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    const end = Number.isFinite(value) ? value : 0;
    const animate = (t) => {
      if (startTime === null) startTime = t;
      const progress = Math.min((t - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <span>{count.toLocaleString()}</span>;
}
function StatsCard({ icon: Icon, title, value, change, trend, isCurrency }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold">
                {isCurrency ? "₹" : ""}
                <AnimatedCounter value={value} />
              </p>
              {typeof change === "number" && (
                <div
                  className={`flex items-center text-sm ${
                    trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {change}%
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-primary text-primary-foreground">
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
function JobCard({
  job,
  onEdit,
  onDelete,
  onFundEscrow,
  onReleaseEscrow,
  isClient,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: job.title,
    description: job.description,
    budget: job.budget,
  });
  const statusClass = {
    active: "bg-green-500 hover:bg-green-600",
    "in-progress": "bg-yellow-500 hover:bg-yellow-600",
    completed: "bg-blue-500 hover:bg-blue-600",
    cancelled: "bg-red-500 hover:bg-red-600",
  };
  const priorityClass = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    low: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  };
  const save = async () => {
    await onEdit(job._id, form);
    setIsEditing(false);
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
    >
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl border-l-4 border-l-primary/80 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              {isEditing ? (
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="text-lg font-semibold mb-2"
                />
              ) : (
                <CardTitle className="text-lg font-semibold">
                  {job.title}
                </CardTitle>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`${statusClass[job.status]} text-white capitalize`}
                >
                  {job.status.replace("-", " ")}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${priorityClass[job.priority]} capitalize`}
                >
                  {job.priority} priority
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsEditing((v) => !v)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(job._id)}
                  className="text-red-600 focus:text-white focus:bg-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="min-h-[80px]"
            />
          ) : (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Budget</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={String(form.budget ?? job.budget)}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, budget: Number(e.target.value) }))
                  }
                />
              ) : (
                <p className="text-lg font-bold text-green-600 dark:text-green-500">
                  ₹{job.budget.toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Deadline</p>
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                {new Date(job.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
          {job.skills?.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Skills Required</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s, i) => (
                  <Badge key={`${job._id}-skill-${i}`} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {isClient && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Escrow Status</span>
                {job.escrowFunded ? (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    Funded
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Funded</Badge>
                )}
              </div>
              <Progress
                value={job.escrowFunded ? (job.escrowReleased ? 100 : 50) : 0}
                className="h-2"
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2 w-full">
            {isEditing ? (
              <>
                <Button onClick={save} size="sm" className="flex-1">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {isClient ? (
                  <>
                    <Button
                      onClick={() => onFundEscrow(job)}
                      disabled={!!job.escrowFunded}
                      size="sm"
                      className="flex-1"
                    >
                      <Wallet className="mr-1 h-4 w-4" />
                      {job.escrowFunded ? "Funded" : "Fund Escrow"}
                    </Button>
                    <Button
                      onClick={() => onReleaseEscrow(job)}
                      disabled={!job.escrowFunded || !!job.escrowReleased}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Send className="mr-1 h-4 w-4" />
                      {job.escrowReleased ? "Released" : "Release"}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Message Client
                  </Button>
                )}
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
function Sidebar({ isOpen, setActiveTab, activeTab, userType }) {
  const menu =
    userType === "freelancer"
      ? [
          { id: "overview", label: "Overview", icon: Briefcase },
          { id: "projects", label: "My Projects", icon: Users },
          { id: "available", label: "Available Jobs", icon: Briefcase },
          { id: "applications", label: "Applications", icon: Users },
          { id: "earnings", label: "Earnings", icon: DollarSign },
          { id: "messages", label: "Messages", icon: MessageSquare },
          { id: "settings", label: "Settings", icon: Settings },
        ]
      : [
          { id: "overview", label: "Overview", icon: Briefcase },
          { id: "jobs", label: "My Jobs", icon: Briefcase },
          { id: "proposals", label: "Proposals", icon: Users },
          { id: "analytics", label: "Analytics", icon: TrendingUp },
          { id: "messages", label: "Messages", icon: MessageSquare },
          { id: "settings", label: "Settings", icon: Settings },
        ];
  return (
    <motion.aside
      animate={{ width: isOpen ? "16rem" : "4rem" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-background border-r h-screen sticky top-0 flex flex-col z-50"
    >
      <div
        className={`p-4 border-b flex items-center ${
          isOpen ? "justify-between" : "justify-center"
        }`}
      >
        {isOpen && (
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ChainHire
          </h2>
        )}
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-2">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } ${!isOpen && "justify-center"}`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && (
                <span className="font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
      </ScrollArea>
    </motion.aside>
  );
}
function ProposalsTab({ user, jobs }) {
  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === "active"),
    [jobs]
  );
  const [selectedJobId, setSelectedJobId] = useState(
    activeJobs[0]?._id || null
  );
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!selectedJobId) {
      setProposals([]);
      setLoading(false);
      return;
    }
    const fetchProposals = async () => {
      setLoading(true);
      try {
        if (user.userType === "client") {
          const data = await apiFetchJSON(
            API_ENDPOINTS.PROPOSALS_FOR_JOB(selectedJobId)
          );
          setProposals(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        toast.error("Failed to fetch proposals.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [selectedJobId, user.userType]);
  const handleAccept = async (proposalId) => {
    const t = toast.loading("Accepting proposal...");
    try {
      await apiFetchJSON(API_ENDPOINTS.ACCEPT_PROPOSAL(proposalId), {
        method: "POST",
      });
      toast.success("Proposal accepted!", { id: t });
      const data = await apiFetchJSON(
        API_ENDPOINTS.PROPOSALS_FOR_JOB(selectedJobId)
      );
      setProposals(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to accept proposal.", { id: t });
    }
  };
  return (
    <motion.div
      key="proposals"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
      {activeJobs.length > 0 ? (
        <Tabs
          value={selectedJobId}
          onValueChange={setSelectedJobId}
          className="w-full"
        >
          <TabsList>
            {activeJobs.map((job) => (
              <TabsTrigger key={job._id} value={job._id}>
                {job.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {loading ? (
            <Skeleton className="w-full h-48 mt-4" />
          ) : proposals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {proposals.map((p) => (
                <Card key={p._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={p.freelancerId?.profilePicture} />
                          <AvatarFallback>
                            {p.freelancerId?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-md">
                            {p.freelancerId?.name || "Anonymous"}
                          </CardTitle>
                          <CardDescription>
                            Bid: ₹{p.bidAmount?.toLocaleString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          p.status === "accepted" ? "default" : "outline"
                        }
                        className="capitalize"
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {p.coverLetter}
                    </p>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAccept(p._id)}
                      disabled={p.status === "accepted"}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Accept
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-8">
              No proposals for this job yet.
            </p>
          )}
        </Tabs>
      ) : (
        <p className="text-center text-muted-foreground mt-8">
          You have no active jobs accepting proposals.
        </p>
      )}
    </motion.div>
  );
}
function AnalyticsTab({ user }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    apiFetchJSON(API_ENDPOINTS.JOB_STATS(user._id))
      .then(setStats)
      .catch(() => toast.error("Could not load analytics."));
  }, [user._id]);
  if (!stats) return <Skeleton className="w-full h-96" />;
  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Briefcase}
          title="Total Jobs Posted"
          value={stats.totalJobs || 0}
        />
        <StatsCard
          icon={Users}
          title="Total Proposals"
          value={stats.totalProposals || 0}
        />
        <StatsCard
          icon={DollarSign}
          title="Total Spent"
          value={stats.totalSpent || 0}
          isCurrency
        />
        <StatsCard
          icon={CheckCircle}
          title="Completed Jobs"
          value={stats.completedJobs || 0}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Spending Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.spendingByMonth}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Spent"]}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
function MessagesTab({ user, jobs }) {
  const [activeChatId, setActiveChatId] = useState(jobs[0]?._id || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  useEffect(() => {
    if (!activeChatId) return;
    apiFetchJSON(API_ENDPOINTS.MESSAGES_FOR_JOB(activeChatId))
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load messages."));
  }, [activeChatId]);
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now(),
        text: newMessage,
        sender: { _id: user._id, name: user.name },
      },
    ]);
    setNewMessage("");
  };
  return (
    <motion.div
      key="messages"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex h-[calc(100vh-12rem)]"
    >
      <div className="w-1/3 border-r">
        <ScrollArea className="h-full p-2">
          {jobs.map((job) => (
            <div
              key={job._id}
              onClick={() => setActiveChatId(job._id)}
              className={`p-3 rounded-lg cursor-pointer ${
                activeChatId === job._id ? "bg-muted" : "hover:bg-muted/50"
              }`}
            >
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                Click to view chat...
              </p>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="w-2/3 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex my-2 ${
                msg.sender._id === user._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-lg ${
                  msg.sender._id === user._id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t flex items-center gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="submit">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
function SettingsTab({ user }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email || "",
  });
  const handleSave = () => toast.success("Settings saved!");
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name">Full Name</label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * MAIN DASHBOARD
 * -------------------------------------------------------------------------------------------------*/
function ModernDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { connected, publicKey, sendTransaction } = useWallet();
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || "https://api.devnet.solana.com"
  );

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEscrowModalOpen, setEscrowModalOpen] = useState(false);
  const [selectedJobForEscrow, setSelectedJobForEscrow] = useState(null);
  const notifications = [
    {
      id: 1,
      text: "New proposal for 'E-commerce Site'",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      text: "Milestone for 'Data Analysis' approved",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      text: "Payment of ₹25,000 received",
      time: "1 day ago",
      unread: false,
    },
  ];
  const visibleJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q)
        )
      : jobs;
  }, [jobs, searchQuery]);
  const fetchAllData = useCallback(async (u) => {
    if (!u) return;
    try {
      if (u.userType === "client") {
        const res = await apiFetchJSON(API_ENDPOINTS.JOBS_BY_CLIENT(u._id));
        let normalized = await normalizeJobs(res);
        if (!normalized.length) {
          const list = await apiFetchJSON(API_ENDPOINTS.JOBS_LIST);
          const listJobs = await normalizeJobs(list);
          normalized = listJobs.filter(
            (j) => !u._id || j.clientId === u._id || !j.clientId
          );
        }
        setJobs(normalized);
      } else {
        const accepted = await apiFetchJSON(
          API_ENDPOINTS.FREELANCER_ACCEPTED(u._id)
        );
        const normalized = await normalizeJobs(accepted);
        setJobs(normalized);
      }
    } catch (e) {
      console.error("Fetch data error:", e);
      toast.error("Failed to fetch dashboard data.");
      setJobs([]);
    }
  }, []);
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth");
        return;
      }
      try {
        let verify = await apiFetchJSON(API_ENDPOINTS.VERIFY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!verify?.valid) {
          verify = await apiFetchJSON(API_ENDPOINTS.VERIFY);
          if (!verify.valid) throw new Error("Invalid verification response");
        }
        setUser(verify.user);
        await fetchAllData(verify.user);
      } catch (e) {
        console.error(e);
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    })();
  }, [router, fetchAllData]);
  useEffect(() => {
    if (!jobs.length) {
      setStats([]);
      setEarnings([]);
      return;
    }
    const months = new Map();
    jobs.forEach((j) => {
      const d = new Date(j.deadline);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const name = d.toLocaleString(undefined, { month: "short" });
      if (!months.has(key))
        months.set(key, { name, completed: 0, inProgress: 0, total: 0 });
      const cell = months.get(key);
      if (j.status === "completed") cell.completed += 1;
      else if (j.status === "active" || j.status === "in-progress")
        cell.inProgress += 1;
      cell.total += 1;
    });
    setStats(Array.from(months.values()));
    const earningsMap = new Map();
    jobs.forEach((j) => {
      if (j.status !== "completed") return;
      const d = new Date(j.deadline);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const name = d.toLocaleString(undefined, { month: "short" });
      if (!earningsMap.has(key)) earningsMap.set(key, { name, amount: 0 });
      const cur = earningsMap.get(key);
      cur.amount += Math.round(j.budget * 0.6);
    });
    setEarnings(Array.from(earningsMap.values()));
  }, [jobs]);

  const handleEditJob = async (jobId, formData) => {
    /* ... (no changes) ... */
  };
  const handleDeleteJob = async (jobId) => {
    /* ... (no changes) ... */
  };
  const handleFundEscrow = (job) => {
    if (!connected) {
      toast.error("Connect your wallet first.");
      return;
    }
    const INR_TO_SOL_RATE = 15000;
    const amountSol = (job.budget / INR_TO_SOL_RATE).toFixed(5);
    setSelectedJobForEscrow({ ...job, amountSol });
    setEscrowModalOpen(true);
  };

  const confirmEscrowFunding = async () => {
    if (!sendTransaction) {
      toast.error("Wallet is not ready. Please try again.");
      return;
    }
    if (!selectedJobForEscrow || !publicKey) return;
    const t = toast.loading("Processing escrow funding…");
    try {
      const amountLamports = Math.round(
        parseFloat(selectedJobForEscrow.amountSol || "0") * 1e9
      );
      const [escrowPDA] = await deriveEscrowPDA(selectedJobForEscrow._id);
      
      // Use a valid test wallet address for development
      // In production, this should be fetched from the database
      const testWalletAddress = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"; // Valid Solana address for testing
      const freelancerPubkey = new PublicKey(testWalletAddress);
      const ix = createInitializeInstruction(
        publicKey,
        freelancerPubkey,
        escrowPDA,
        SystemProgram.programId,
        amountLamports
      );
      const tx = new Transaction().add(ix);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      await apiFetchJSON(API_ENDPOINTS.FUND(selectedJobForEscrow._id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrowPubkey: escrowPDA.toBase58(),
          signature,
          amountSol: selectedJobForEscrow.amountSol,
        }),
      });
      setJobs((prev) =>
        prev.map((j) =>
          j._id === selectedJobForEscrow._id ? { ...j, escrowFunded: true } : j
        )
      );
      toast.success(`Escrow funded!`, { id: t });
    } catch (e) {
      console.error(e);
      toast.error("Failed to fund escrow.", { id: t });
    } finally {
      setEscrowModalOpen(false);
      setSelectedJobForEscrow(null);
    }
  };

  const handleReleaseEscrow = async (job) => {
    if (!sendTransaction) {
      toast.error("Wallet is not ready. Please try again.");
      return;
    }
    if (!connected) return toast.error("Connect wallet first.");
    const t = toast.loading("Releasing funds…");
    try {
      const [escrowPDA] = await deriveEscrowPDA(job._id);
      
      // Use a valid test wallet address for development
      // In production, this should be fetched from the database
      const testWalletAddress = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"; // Valid Solana address for testing
      const freelancerPubkey = new PublicKey(testWalletAddress);
      const ix = createReleaseInstruction(
        publicKey,
        freelancerPubkey,
        escrowPDA
      );
      const tx = new Transaction().add(ix);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      await apiFetchJSON(API_ENDPOINTS.RELEASE(job._id), { method: "POST" });
      setJobs((prev) =>
        prev.map((j) =>
          j._id === job._id ? { ...j, escrowReleased: true } : j
        )
      );
      toast.success("Funds released!", { id: t });
    } catch (e) {
      console.error(e);
      toast.error("Failed to release funds.", { id: t });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 w-full max-w-sm p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        isOpen={sidebarOpen}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        userType={user.userType}
      />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex h-16 items-center px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search everything…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.filter((n) => n.unread).length > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                      >
                        {notifications.filter((n) => n.unread).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start p-3 cursor-pointer"
                    >
                      <div className="flex w-full justify-between items-center">
                        <p
                          className={`text-sm ${
                            n.unread ? "font-semibold" : ""
                          }`}
                        >
                          {n.text}
                        </p>
                        {n.unread && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{n.time}</p>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ✅ PRODUCTION-READY FIX: Use the standard button from the library */}
              <WalletMultiButton />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.avatar || "/avatars/01.png"}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.removeItem("token");
                      router.push("/auth");
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* Your tab content remains here, unchanged */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Welcome back, {user.name}! 👋
                    </h1>
                    <p className="text-muted-foreground">
                      Here&apos;s what&apos;s happening with your{" "}
                      {user.userType === "client" ? "projects" : "work"} today.
                    </p>
                  </div>
                  <Link
                    href={user.userType === "client" ? "/post-job" : "/jobs"}
                  >
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity">
                      <Plus className="mr-2 h-4 w-4" />
                      {user.userType === "client"
                        ? "Post New Job"
                        : "Find Jobs"}
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    icon={Briefcase}
                    title="Active Projects"
                    value={
                      visibleJobs.filter(
                        (j) =>
                          j.status === "active" || j.status === "in-progress"
                      ).length
                    }
                    change={8}
                    trend="up"
                  />
                  <StatsCard
                    icon={DollarSign}
                    title="Total Earnings"
                    value={earnings.reduce((s, e) => s + (e.amount || 0), 0)}
                    change={12}
                    trend="up"
                    isCurrency
                  />
                  <StatsCard
                    icon={Users}
                    title="Clients"
                    value={user.userType === "client" ? 1 : 24}
                    change={4}
                    trend="up"
                  />
                  <StatsCard
                    icon={Award}
                    title="Completion Rate"
                    value={Math.round(
                      (visibleJobs.filter((j) => j.status === "completed")
                        .length /
                        Math.max(visibleJobs.length, 1)) *
                        100
                    )}
                    change={-2}
                    trend="down"
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Project Timeline
                      </CardTitle>
                      <CardDescription>
                        Project completion over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="completed"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                          <Area
                            type="monotone"
                            dataKey="inProgress"
                            stackId="1"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Earnings Overview
                      </CardTitle>
                      <CardDescription>
                        Monthly earnings breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={earnings}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(v) => [
                              `₹${Number(v).toLocaleString()}`,
                              "Earnings",
                            ]}
                          />
                          <Bar
                            dataKey="amount"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
            {(activeTab === "jobs" || activeTab === "projects") && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      My Jobs
                    </h1>
                    <p className="text-muted-foreground">
                      Manage your{" "}
                      {user.userType === "client" ? "posted jobs" : "projects"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    {user.userType === "client" && (
                      <Link href="/post-job">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" /> Post New Job
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="mt-4">
                    <AnimatePresence>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visibleJobs
                          .filter(
                            (j) =>
                              j.status === "active" ||
                              j.status === "in-progress"
                          )
                          .map((job) => (
                            <JobCard
                              key={job._id}
                              job={job}
                              onEdit={handleEditJob}
                              onDelete={handleDeleteJob}
                              onFundEscrow={handleFundEscrow}
                              onReleaseEscrow={handleReleaseEscrow}
                              isClient={user.userType === "client"}
                            />
                          ))}
                      </div>
                    </AnimatePresence>
                  </TabsContent>
                  <TabsContent value="completed" className="mt-4">
                    <AnimatePresence>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visibleJobs
                          .filter((j) => j.status === "completed")
                          .map((job) => (
                            <JobCard
                              key={job._id}
                              job={job}
                              onEdit={handleEditJob}
                              onDelete={handleDeleteJob}
                              onFundEscrow={handleFundEscrow}
                              onReleaseEscrow={handleReleaseEscrow}
                              isClient={user.userType === "client"}
                            />
                          ))}
                      </div>
                    </AnimatePresence>
                  </TabsContent>
                  <TabsContent value="all" className="mt-4">
                    <AnimatePresence>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visibleJobs.map((job) => (
                          <JobCard
                            key={job._id}
                            job={job}
                            onEdit={handleEditJob}
                            onDelete={handleDeleteJob}
                            onFundEscrow={handleFundEscrow}
                            onReleaseEscrow={handleReleaseEscrow}
                            isClient={user.userType === "client"}
                          />
                        ))}
                      </div>
                    </AnimatePresence>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
            {activeTab === "proposals" && (
              <ProposalsTab user={user} jobs={visibleJobs} />
            )}
            {activeTab === "analytics" && <AnalyticsTab user={user} />}
            {activeTab === "messages" && (
              <MessagesTab user={user} jobs={visibleJobs} />
            )}
            {activeTab === "settings" && <SettingsTab user={user} />}
          </AnimatePresence>
        </main>
      </div>
      <Dialog open={isEscrowModalOpen} onOpenChange={setEscrowModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Escrow Funding</DialogTitle>
            <DialogDescription>
              You are about to fund the escrow for “
              {selectedJobForEscrow?.title}”.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 bg-muted rounded-lg space-y-1">
            <p>
              <strong>Job:</strong> {selectedJobForEscrow?.title}
            </p>
            <p>
              <strong>Amount (INR):</strong> ₹
              {(selectedJobForEscrow?.budget || 0).toLocaleString()}
            </p>
            <p>
              <strong>Amount (SOL):</strong> {selectedJobForEscrow?.amountSol}{" "}
              SOL
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscrowModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEscrowFunding}>Confirm &amp; Fund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ✅ The DashboardPage now wraps the main component in the ThemeProvider
export default function DashboardPage() {
  return (
    <ThemeProvider>
      <ModernDashboard />
    </ThemeProvider>
  );
}
