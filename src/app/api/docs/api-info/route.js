import { NextResponse } from "next/server";

export async function GET() {
    const apiStructure = {
        name: "ChainHire API",
        version: "1.0.0",
        description: "Blockchain-powered freelance escrow platform API",
        endpoints: {
            total: 35,
            activeEndpoints: 35,
            deprecatedEndpoints: 0
        },
        structure: [
            {
                category: "Authentication",
                path: "/api/auth",
                description: "User authentication and authorization",
                endpoints: [
                    { method: "POST", path: "/auth/register", description: "Register new user" },
                    { method: "POST", path: "/auth/login", description: "Login user" },
                    { method: "POST", path: "/auth/link-wallet", description: "Link Solana wallet" },
                    { method: "GET", path: "/auth/verify", description: "Verify JWT token" }
                ]
            },
            {
                category: "Jobs",
                path: "/api/jobs",
                description: "Job posting management",
                endpoints: [
                    { method: "POST", path: "/jobs/create", description: "Create new job" },
                    { method: "GET", path: "/jobs/list", description: "List all jobs" },
                    { method: "GET", path: "/jobs/client/[clientId]", description: "Get client's jobs" },
                    { method: "PUT", path: "/jobs/edit/[id]", description: "Edit job" },
                    { method: "DELETE", path: "/jobs/delete/[id]", description: "Delete job" },
                    { method: "POST", path: "/jobs/fund/[id]", description: "Fund escrow" },
                    { method: "POST", path: "/jobs/release/[id]", description: "Release escrow" }
                ]
            },
            {
                category: "Proposals",
                path: "/api/proposals",
                description: "Freelancer proposal management",
                endpoints: [
                    { method: "POST", path: "/proposals/submit", description: "Submit proposal" },
                    { method: "GET", path: "/proposals/job/[id]", description: "Get job proposals" },
                    { method: "PATCH", path: "/proposals/accept/[id]", description: "Accept proposal" },
                    { method: "GET", path: "/proposals/applied/freelancer/[id]", description: "Get freelancer's applications" },
                    { method: "GET", path: "/proposals/accepted/freelancer/[id]", description: "Get accepted proposals" }
                ]
            },
            {
                category: "Projects",
                path: "/api/projects",
                description: "Project completion workflow",
                endpoints: [
                    { method: "POST", path: "/projects/complete/[id]", description: "Mark complete (client)" },
                    { method: "POST", path: "/projects/complete-freelancer/[proposalId]", description: "Mark complete (freelancer)" },
                    { method: "POST", path: "/projects/verify-completion/[id]", description: "Verify completion" }
                ]
            },
            {
                category: "Chat",
                path: "/api/chat",
                description: "Real-time messaging between parties",
                endpoints: [
                    { method: "GET", path: "/chat/[id]", description: "Get chat messages" },
                    { method: "POST", path: "/chat", description: "Send message" }
                ]
            },
            {
                category: "Ratings",
                path: "/api/rating",
                description: "User rating and review system",
                endpoints: [
                    { method: "POST", path: "/rating/submit", description: "Submit rating" },
                    { method: "GET", path: "/rating/[projectId]", description: "Get project rating" },
                    { method: "GET", path: "/rating/freelancer/[id]", description: "Get freelancer ratings" },
                    { method: "GET", path: "/rating/client/[id]", description: "Get client ratings" },
                    { method: "GET", path: "/rating/average/[id]", description: "Get average rating" }
                ]
            },
            {
                category: "Notifications",
                path: "/api/notifications",
                description: "User notification system",
                endpoints: [
                    { method: "GET", path: "/notifications", description: "Get user notifications" }
                ]
            },
            {
                category: "History",
                path: "/api/history",
                description: "Project history tracking",
                endpoints: [
                    { method: "GET", path: "/history/client/[id]", description: "Get client history" },
                    { method: "GET", path: "/history/freelancer/[id]", description: "Get freelancer history" }
                ]
            },
            {
                category: "Client Stats",
                path: "/api/client",
                description: "Client-specific statistics",
                endpoints: [
                    { method: "GET", path: "/client/job-stats/[id]", description: "Get job statistics" }
                ]
            },
            {
                category: "Documentation",
                path: "/api/docs",
                description: "API documentation and testing guides",
                endpoints: [
                    { method: "GET", path: "/docs/test-guide", description: "Get comprehensive testing guide" },
                    { method: "GET", path: "/docs/api-info", description: "Get API structure information" }
                ]
            }
        ],
        features: [
            "JWT-based authentication",
            "Solana blockchain integration for escrow",
            "Real-time chat messaging",
            "Automated notification system",
            "Rating and review system",
            "Project history tracking",
            "Secure escrow fund management"
        ],
        removedEndpoints: [
            {
                path: "/api/jobs/[id]/update-escrow",
                reason: "Redundant - escrow updates handled in accept/fund flow"
            },
            {
                path: "/api/proposals/[id]/update-escrow",
                reason: "Consolidated into proposal acceptance endpoint"
            },
            {
                path: "/api/jobs/[id]/freelancer",
                reason: "Data available through populated job queries"
            },
            {
                path: "/api/socket",
                reason: "Socket.io handled differently in Next.js 15"
            }
        ],
        techStack: {
            framework: "Next.js 15",
            database: "MongoDB with Mongoose",
            blockchain: "Solana",
            authentication: "JWT",
            realtime: "Socket.io",
            styling: "Tailwind CSS"
        }
    };

    return NextResponse.json(apiStructure);
}
