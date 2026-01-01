// DASHBOARD FIXES - Apply these changes to src/app/dashboard/page.jsx

// FIX 1: Import useSearchParams
// Add to imports at the top (around line 11):
import { useRouter, useSearchParams } from "next/navigation";

// FIX 2: Replace activeTab state initialization (around line 912)
// FROM:
// const [activeTab, setActiveTab] = useState("overview");

// TO:
const searchParams = useSearchParams();
const router2 = useRouter(); // Don't conflict with existing router
const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");

// Add this useEffect to sync URL changes
useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
        setActiveTab(tab);
    }
}, [searchParams]);

// FIX 3: Update Sidebar's setActiveTab handler
// Find the Sidebar component (around line 550) and update the button onClick:
// FROM:
onClick = {() => setActiveTab(item.id)}

// TO:
onClick = {() => {
    setActiveTab(item.id);
    router.push(`/dashboard?tab=${item.id}`);
}}

// FIX 4: Add better error handling to handleReleaseEscrow
// Find handleReleaseEscrow function (around line 1102-1125) and wrap in better try-catch:
const handleReleaseEscrow = async (job) => {
    if (!sendTransaction) {
        toast.error("Wallet is not ready. Please try again.");
        return;
    }
    if (!connected) {
        toast.error("Connect wallet first.");
        return;
    }

    const t = toast.loading("Releasing funds…");
    try {
        const [escrowPDA] = await deriveEscrowPDA(job._id);
        const testWalletAddress = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";
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
        console.error("Release escrow error:", e);

        // Better error messages
        if (e.message?.includes("0x1")) {
            toast.error("Smart contract not found. Using mock wallet for development.", { id: t });
        } else if (e.message?.includes("Transaction")) {
            toast.error("Transaction failed. Please check your wallet and try again.", { id: t });
        } else {
            toast.error(`Failed to release funds: ${e.message || "Unknown error"}`, { id: t });
        }
    }
};

// FIX 5: Add missing tabs rendering
// After line 1520 (after settings tab), add these missing tabs:

{
    activeTab === "available" && user?.userType === "freelancer" && (
        <motion.div
            key="available"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
        >
            <h1 className="text-3xl font-bold tracking-tight">Available Jobs</h1>
            <p className="text-muted-foreground">Browse and apply for new opportunities</p>
            <Link href="/jobs">
                <Button size="lg" className="w-full md:w-auto">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Browse All Jobs
                </Button>
            </Link>
        </motion.div>
    )
}

{
    activeTab === "applications" && user?.userType === "freelancer" && (
        <motion.div
            key="applications"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
        >
            <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
            <p className="text-muted-foreground">Track your submitted proposals</p>
            {/* TODO: Add proposals list here */}
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No applications yet</p>
                    <Link href="/jobs" className="mt-4">
                        <Button variant="outline">Browse Jobs</Button>
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    )
}

{
    activeTab === "earnings" && user?.userType === "freelancer" && (
        <motion.div
            key="earnings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
        >
            <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <StatsCard
                    icon={DollarSign}
                    title="Total Earned"
                    value={earnings.reduce((sum, e) => sum + e.amount, 0)}
                    isCurrency
                />
                <StatsCard
                    icon={TrendingUp}
                    title="This Month"
                    value={earnings[earnings.length - 1]?.amount || 0}
                    isCurrency
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Earnings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={earnings}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Earned"]} />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.6}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    )
}
