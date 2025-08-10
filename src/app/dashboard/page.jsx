"use client";

// React and Next.js imports
import React, { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// UI Libraries
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Icons from lucide-react
import {
  Bell,
  Search,
  Filter,
  Plus,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Wallet,
  Send,
  Download,
  BarChart3,
  Activity,
  Briefcase,
  Users,
  Target,
  Award,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Shield,
} from "lucide-react";

// Shadcn UI Components
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Charting Library
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

// Solana Web3 and Wallet Integration
import { useWallet } from "@/components/wallet-provider"; // Assuming wallet-provider exists
import { deriveEscrowPDA } from "@/utils/escrowPDA"; // Assuming escrow PDA utility exists
import {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";
import {
  createInitializeInstruction,
  createReleaseInstruction,
} from "@/utils/escrow"; // Assuming escrow instructions exist

// --- THEME PROVIDER ---
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // Default to dark theme

  useEffect(() => {
    // On mount, set the theme based on localStorage or system preference
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  // Add 'dark' class to the root element for TailwindCSS to work
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// --- REUSABLE UI COMPONENTS ---

function AnimatedCounter({ value, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const endValue = typeof value === "number" ? value : 0;

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * endValue));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function StatsCard({
  icon: Icon,
  title,
  value,
  change,
  trend,
  color = "blue",
  isCurrency = false,
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold">
                {isCurrency && "₹"}
                <AnimatedCounter value={value} />
              </p>
              {change && (
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
            <div
              className={`p-3 rounded-full bg-gradient-to-r ${colors[color]}`}
            >
              <Icon className="h-6 w-6 text-white" />
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
  isClient = true,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    budget: job.budget,
  });

  const statusColors = {
    active: "bg-green-500 hover:bg-green-600",
    completed: "bg-blue-500 hover:bg-blue-600",
    "in-progress": "bg-yellow-500 hover:bg-yellow-600",
    cancelled: "bg-red-500 hover:bg-red-600",
  };

  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    low: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  };

  const handleSave = () => {
    onEdit(job._id, formData);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -3 }}
      className="group"
    >
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl border-l-4 border-l-primary/80 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="text-lg font-semibold mb-2"
                />
              ) : (
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {job.title}
                </CardTitle>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`${
                    statusColors[job.status]
                  } text-white capitalize`}
                >
                  {job.status.replace("-", " ")}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${priorityColors[job.priority]} capitalize`}
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
                <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
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
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
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
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
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
          {job.skills && (
            <div>
              <p className="text-sm font-medium mb-2">Skills Required</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {isClient && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Escrow Status</span>
                <div className="flex items-center gap-1">
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
                <Button onClick={handleSave} size="sm" className="flex-1">
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
                      disabled={job.escrowFunded}
                      size="sm"
                      className="flex-1"
                    >
                      <Wallet className="mr-1 h-4 w-4" />
                      {job.escrowFunded ? "Funded" : "Fund Escrow"}
                    </Button>
                    <Button
                      onClick={() => onReleaseEscrow(job)}
                      disabled={!job.escrowFunded || job.escrowReleased}
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

function Sidebar({ isOpen, setIsOpen, activeTab, setActiveTab, userType }) {
  const menuItems = {
    client: [
      { id: "overview", label: "Overview", icon: BarChart3 },
      { id: "jobs", label: "My Jobs", icon: Briefcase },
      { id: "proposals", label: "Proposals", icon: Users },
      { id: "analytics", label: "Analytics", icon: Activity },
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "settings", label: "Settings", icon: Settings },
    ],
    freelancer: [
      { id: "overview", label: "Overview", icon: BarChart3 },
      { id: "projects", label: "My Projects", icon: Target },
      { id: "available", label: "Available Jobs", icon: Briefcase },
      { id: "applications", label: "Applications", icon: Users },
      { id: "earnings", label: "Earnings", icon: DollarSign },
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  };
  const items = menuItems[userType] || menuItems.client;

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-full w-64 bg-background border-r transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:z-auto`}
    >
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ChainHire
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <nav className="p-4 space-y-2">
          {items.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-muted"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}

// --- MAIN DASHBOARD COMPONENT ---
function ModernDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Data states
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState([]);
  const [earnings, setEarnings] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEscrowModalOpen, setEscrowModalOpen] = useState(false);
  const [selectedJobForEscrow, setSelectedJobForEscrow] = useState(null);

  // Wallet and Connection
  const { connected, publicKey, sendTransaction, connect } = useWallet();
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || "https://api.devnet.solana.com"
  );

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

  // --- Data Fetching and Authentication ---
  useEffect(() => {
    const verifyAndFetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const { valid, user: userData } = await res.json();
        if (!valid) throw new Error("Invalid session");

        setUser(userData);
        await fetchData(userData._id, userData.userType);
      } catch (error) {
        toast.error("Session expired. Please log in.");
        localStorage.removeItem("token");
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchData();
  }, [router]);

  const fetchData = async (userId, userType) => {
    try {
      const endpoint =
        userType === "client"
          ? `/api/jobs/client/${userId}`
          : `/api/proposals/accepted/freelancer/${userId}`;
      const jobsRes = await fetch(endpoint);
      const jobsData = await jobsRes.json();

      // This structure is simplified. In a real app, you'd fetch stats, earnings, etc. from separate endpoints
      setJobs(
        userType === "client"
          ? jobsData.map((j) => j.job)
          : jobsData.map((p) => p.jobId)
      );
      setProposals(
        userType === "client" ? jobsData.flatMap((j) => j.proposals) : jobsData
      );

      // Mock stats and earnings for demonstration as backend logic wasn't fully provided for these
      setStats([
        { name: "Jan", completed: 4, inProgress: 2, total: 6 },
        { name: "Feb", completed: 6, inProgress: 3, total: 9 },
        { name: "Mar", completed: 8, inProgress: 1, total: 9 },
        { name: "Apr", completed: 5, inProgress: 4, total: 9 },
        { name: "May", completed: 7, inProgress: 2, total: 9 },
        { name: "Jun", completed: 9, inProgress: 3, total: 12 },
      ]);
      setEarnings([
        { name: "Jan", amount: 45000 },
        { name: "Feb", amount: 52000 },
        { name: "Mar", amount: 48000 },
        { name: "Apr", amount: 61000 },
        { name: "May", amount: 55000 },
        { name: "Jun", amount: 67000 },
      ]);
    } catch (error) {
      toast.error("Failed to fetch dashboard data.");
      console.error("Fetch Data Error:", error);
    }
  };

  // --- API Handlers ---
  const handleEditJob = async (jobId, formData) => {
    const toastId = toast.loading("Updating job...");
    try {
      const res = await fetch(`/api/jobs/edit/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Server error");

      setJobs(jobs.map((j) => (j._id === jobId ? { ...j, ...formData } : j)));
      toast.success("Job updated successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to update job.", { id: toastId });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (
      !confirm(
        "Are you sure you want to delete this job? This cannot be undone."
      )
    )
      return;

    const toastId = toast.loading("Deleting job...");
    try {
      const res = await fetch(`/api/jobs/delete/${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Server error");

      setJobs(jobs.filter((j) => j._id !== jobId));
      toast.success("Job deleted!", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete job.", { id: toastId });
    }
  };

  const handleFundEscrow = (job) => {
    if (!connected) {
      toast.error("Please connect your wallet first.");
      connect(); // Attempt to connect wallet
      return;
    }
    const INR_TO_SOL_RATE = 15000; // Example rate
    const amountSol = (job.budget / INR_TO_SOL_RATE).toFixed(5);
    setSelectedJobForEscrow({ ...job, amountSol });
    setEscrowModalOpen(true);
  };

  const confirmEscrowFunding = async () => {
    if (!publicKey || !selectedJobForEscrow) return;

    const toastId = toast.loading("Processing escrow funding...");
    try {
      const { _id: jobId, amountSol } = selectedJobForEscrow;
      const amountLamports = Math.round(parseFloat(amountSol) * 1e9);

      const [escrowPDA] = await deriveEscrowPDA(jobId);

      // NOTE: In a real scenario, freelancerPubkey should come from the accepted proposal
      const freelancerPubkey = new PublicKey(publicKey); // Using own key as placeholder

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

      await fetch(`/api/jobs/fund/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrowPubkey: escrowPDA.toBase58(),
          signature,
          amountSol,
        }),
      });

      setJobs(
        jobs.map((j) => (j._id === jobId ? { ...j, escrowFunded: true } : j))
      );
      toast.success(`Escrow funded with ${amountSol} SOL!`, { id: toastId });
    } catch (error) {
      toast.error("Failed to fund escrow.", { id: toastId });
      console.error("Escrow Funding Error:", error);
    } finally {
      setEscrowModalOpen(false);
      setSelectedJobForEscrow(null);
    }
  };

  const handleReleaseEscrow = async (job) => {
    if (!connected) return toast.error("Please connect your wallet first.");

    const toastId = toast.loading("Releasing funds...");
    try {
      const [escrowPDA] = await deriveEscrowPDA(job._id);
      const freelancerPubkey = new PublicKey(publicKey); // Placeholder

      const ix = createReleaseInstruction(
        publicKey,
        freelancerPubkey,
        escrowPDA
      );
      const tx = new Transaction().add(ix);

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");

      await fetch(`/api/jobs/release/${job._id}`, { method: "POST" });

      setJobs(
        jobs.map((j) =>
          j._id === job._id ? { ...j, escrowReleased: true } : j
        )
      );
      toast.success("Funds released successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to release funds.", { id: toastId });
      console.error("Release Escrow Error:", error);
    }
  };

  // --- POLLING FOR REAL TIME DATA UPDATE ---
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchData(user._id, user.userType);
      }, 30000); // refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4">
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

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userType={user.userType}
      />

      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex h-16 items-center px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/01.png" alt={user.name} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
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
                      Here's what's happening with your{" "}
                      {user.userType === "client" ? "projects" : "work"} today.
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity">
                    <Plus className="mr-2 h-4 w-4" />
                    {user.userType === "client" ? "Post New Job" : "Find Jobs"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    icon={Briefcase}
                    title="Active Projects"
                    value={
                      jobs.filter(
                        (j) =>
                          j.status === "active" || j.status === "in-progress"
                      ).length
                    }
                    change={8}
                    trend="up"
                    color="blue"
                  />
                  <StatsCard
                    icon={DollarSign}
                    title="Total Earnings"
                    value={328000}
                    change={12}
                    trend="up"
                    color="green"
                    isCurrency
                  />
                  <StatsCard
                    icon={Users}
                    title="Clients"
                    value={24}
                    change={4}
                    trend="up"
                    color="purple"
                  />
                  <StatsCard
                    icon={Award}
                    title="Completion Rate"
                    value={94}
                    change={-2}
                    trend="down"
                    color="orange"
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
                            formatter={(value) => [
                              `₹${value.toLocaleString()}`,
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
                      Manage your posted jobs and proposals
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Link href="/post-job">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Post New Job
                      </Button>
                    </Link>
                  </div>
                </div>
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="mt-4">
                    <AnimatePresence>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {jobs
                          .filter(
                            (job) =>
                              job.status === "active" ||
                              job.status === "in-progress"
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
                        {jobs
                          .filter((job) => job.status === "completed")
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
                        {jobs.map((job) => (
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

            {/* Add other tab content here following the same motion pattern */}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <Dialog open={isEscrowModalOpen} onOpenChange={setEscrowModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Escrow Funding</DialogTitle>
            <DialogDescription>
              You are about to fund the escrow for the project "
              {selectedJobForEscrow?.title}". This action will transfer funds to
              a secure contract.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 bg-muted rounded-lg">
            <p>
              <strong>Job:</strong> {selectedJobForEscrow?.title}
            </p>
            <p>
              <strong>Amount (INR):</strong> ₹
              {selectedJobForEscrow?.budget.toLocaleString()}
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
            <Button onClick={confirmEscrowFunding}>Confirm & Fund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
    </div>
  );
}

// The final export should wrap ModernDashboard in the ThemeProvider and other necessary contexts.
export default function DashboardPage() {
  return (
    <ThemeProvider>
      {/* Assuming WalletProvider is wrapping the app layout */}
      <ModernDashboard />
    </ThemeProvider>
  );
}
