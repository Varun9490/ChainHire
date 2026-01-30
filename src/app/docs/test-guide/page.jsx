"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Code,
    Database,
    FileText,
    GitBranch,
    MessageSquare,
    Star,
    TrendingUp,
    User,
    Zap,
    AlertCircle,
    Copy,
    Check
} from "lucide-react";

const MethodBadge = ({ method }) => {
    const colors = {
        GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        POST: "bg-green-500/10 text-green-500 border-green-500/20",
        PUT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        PATCH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        DELETE: "bg-red-500/10 text-red-500 border-red-500/20"
    };

    return (
        <Badge className={`${colors[method]} border font-mono text-xs`}>
            {method}
        </Badge>
    );
};

const CodeBlock = ({ code, language = "json" }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(typeof code === 'string' ? code : JSON.stringify(code, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <button
                onClick={copyToClipboard}
                className="absolute right-2 top-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{typeof code === 'string' ? code : JSON.stringify(code, null, 2)}</code>
            </pre>
        </div>
    );
};

const EndpointCard = ({ endpoint }) => {
    return (
        <Card className="mb-4 border-gray-700 bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <MethodBadge method={endpoint.method} />
                            <code className="text-sm text-blue-400">{endpoint.path}</code>
                        </div>
                        <CardTitle className="text-lg text-white">{endpoint.name}</CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                            {endpoint.description}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {endpoint.headers && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-300">Headers</h4>
                        <CodeBlock code={endpoint.headers} />
                    </div>
                )}
                {endpoint.body && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-300">Request Body</h4>
                        <CodeBlock code={endpoint.body} />
                    </div>
                )}
                {endpoint.expectedResponse && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-300">Expected Response</h4>
                        <CodeBlock code={endpoint.expectedResponse} />
                    </div>
                )}
                {endpoint.note && (
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <AlertCircle size={16} className="text-blue-400 mt-0.5" />
                        <p className="text-sm text-gray-300">{endpoint.note}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const WorkflowStep = ({ step }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.step * 0.1 }}
            className="flex gap-4 mb-6"
        >
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                    {step.step}
                </div>
            </div>
            <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-1">{step.action}</h4>
                <p className="text-gray-400 mb-2">{step.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                    {step.endpoints.map((endpoint, i) => (
                        <code key={i} className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400">
                            {endpoint}
                        </code>
                    ))}
                </div>
                <div className="text-sm text-gray-500 italic">{step.notes}</div>
            </div>
        </motion.div>
    );
};

export default function TestGuidePage() {
    const [guideData, setGuideData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/docs/test-guide")
            .then((res) => res.json())
            .then((data) => {
                setGuideData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load test guide:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading test guide...</p>
                </div>
            </div>
        );
    }

    if (!guideData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <Card className="max-w-md bg-red-500/10 border-red-500/20">
                    <CardHeader>
                        <CardTitle className="text-red-400">Error</CardTitle>
                        <CardDescription>Failed to load test guide</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const iconMap = {
        authentication: User,
        jobs: Zap,
        proposals: FileText,
        projects: CheckCircle2,
        chat: MessageSquare,
        ratings: Star,
        notifications: TrendingUp,
        history: Database,
        client: GitBranch
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 mb-4">
                            <Code size={32} className="text-white" />
                            <h1 className="text-4xl font-bold text-white">{guideData.title}</h1>
                        </div>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                            {guideData.description}
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <Badge className="bg-white/20 text-white border-white/30">
                                Version {guideData.version}
                            </Badge>
                            <Badge className="bg-white/20 text-white border-white/30">
                                Base URL: {guideData.baseUrl}
                            </Badge>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Tabs defaultValue="endpoints" className="space-y-8">
                    <TabsList className="bg-gray-800 border border-gray-700">
                        <TabsTrigger value="endpoints" className="data-[state=active]:bg-blue-600">
                            API Endpoints
                        </TabsTrigger>
                        <TabsTrigger value="workflow" className="data-[state=active]:bg-blue-600">
                            Testing Workflow
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="data-[state=active]:bg-blue-600">
                            Test Accounts
                        </TabsTrigger>
                        <TabsTrigger value="troubleshooting" className="data-[state=active]:bg-blue-600">
                            Troubleshooting
                        </TabsTrigger>
                    </TabsList>

                    {/* Endpoints Tab */}
                    <TabsContent value="endpoints">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <Card className="bg-gray-800/50 border-gray-700 sticky top-6">
                                    <CardHeader>
                                        <CardTitle className="text-white">Categories</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[600px]">
                                            <div className="space-y-2">
                                                {Object.entries(guideData.endpoints).map(([key, category]) => {
                                                    const Icon = iconMap[key] || Code;
                                                    return (
                                                        <a
                                                            key={key}
                                                            href={`#${key}`}
                                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors group"
                                                        >
                                                            <Icon size={20} className="text-blue-400" />
                                                            <div>
                                                                <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                                                    {category.title}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {category.endpoints.length} endpoints
                                                                </div>
                                                            </div>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Endpoint Details */}
                            <div className="lg:col-span-2">
                                <ScrollArea className="h-[800px]">
                                    {Object.entries(guideData.endpoints).map(([key, category]) => {
                                        const Icon = iconMap[key] || Code;
                                        return (
                                            <div key={key} id={key} className="mb-12">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                                                        <Icon size={24} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                                                        <p className="text-gray-400">{category.endpoints.length} endpoints available</p>
                                                    </div>
                                                </div>
                                                {category.endpoints.map((endpoint, i) => (
                                                    <EndpointCard key={i} endpoint={endpoint} />
                                                ))}
                                            </div>
                                        );
                                    })}
                                </ScrollArea>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Workflow Tab */}
                    <TabsContent value="workflow">
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white text-2xl">{guideData.testingWorkflow.title}</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Follow these steps to comprehensively test all ChainHire features
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[700px] pr-4">
                                    {guideData.testingWorkflow.steps.map((step) => (
                                        <WorkflowStep key={step.step} step={step} />
                                    ))}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Test Accounts Tab */}
                    <TabsContent value="accounts">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <User className="text-blue-400" />
                                        Client Account
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Email</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-gray-900 px-4 py-2 rounded text-blue-400">
                                                {guideData.testAccounts.client.email}
                                            </code>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(guideData.testAccounts.client.email)}
                                                className="p-2 hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Password</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-gray-900 px-4 py-2 rounded text-blue-400">
                                                {guideData.testAccounts.client.password}
                                            </code>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(guideData.testAccounts.client.password)}
                                                className="p-2 hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <p className="text-sm text-gray-300">{guideData.testAccounts.client.note}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <User className="text-purple-400" />
                                        Freelancer Account
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Email</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-gray-900 px-4 py-2 rounded text-purple-400">
                                                {guideData.testAccounts.freelancer.email}
                                            </code>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(guideData.testAccounts.freelancer.email)}
                                                className="p-2 hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Password</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-gray-900 px-4 py-2 rounded text-purple-400">
                                                {guideData.testAccounts.freelancer.password}
                                            </code>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(guideData.testAccounts.freelancer.password)}
                                                className="p-2 hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                        <p className="text-sm text-gray-300">{guideData.testAccounts.freelancer.note}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-6 bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">Important Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {guideData.notes.map((note, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-300">
                                            <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                            <span>{note}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Troubleshooting Tab */}
                    <TabsContent value="troubleshooting">
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white text-2xl">{guideData.troubleshooting.title}</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Common errors and how to resolve them
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {guideData.troubleshooting.issues.map((item, i) => (
                                        <Card key={i} className="bg-gray-900/50 border-gray-700">
                                            <CardHeader>
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="text-orange-400 mt-1" />
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg text-orange-400">{item.issue}</CardTitle>
                                                        <CardDescription className="text-gray-400 mt-2">
                                                            <strong className="text-green-400">Solution:</strong> {item.solution}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 border-t border-gray-800 py-8">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-gray-400">
                        ChainHire API Documentation • Built with Next.js 15 & MongoDB
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        For support, please contact the development team
                    </p>
                </div>
            </div>
        </div>
    );
}
