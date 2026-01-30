import { NextResponse } from "next/server";

export async function GET() {
    const testGuide = {
        title: "ChainHire API Testing Guide",
        version: "1.0.0",
        description: "Comprehensive testing guide for all ChainHire endpoints",
        baseUrl: "http://localhost:3000/api",

        testAccounts: {
            client: {
                email: "client@test.com",
                password: "password123",
                note: "Use this account to post jobs and accept proposals"
            },
            freelancer: {
                email: "freelancer@test.com",
                password: "password123",
                note: "Use this account to submit proposals and chat"
            }
        },

        endpoints: {
            authentication: {
                title: "Authentication Endpoints",
                endpoints: [
                    {
                        name: "Register User",
                        method: "POST",
                        path: "/auth/register",
                        description: "Create a new user account (client or freelancer)",
                        body: {
                            name: "John Doe",
                            email: "john@example.com",
                            password: "password123",
                            userType: "client" // or "freelancer"
                        },
                        expectedResponse: {
                            message: "User registered",
                            token: "jwt_token_here",
                            user: {
                                _id: "user_id",
                                name: "John Doe",
                                email: "john@example.com",
                                userType: "client"
                            }
                        }
                    },
                    {
                        name: "Login",
                        method: "POST",
                        path: "/auth/login",
                        description: "Login with existing credentials",
                        body: {
                            email: "john@example.com",
                            password: "password123"
                        },
                        expectedResponse: {
                            message: "Login successful",
                            token: "jwt_token_here",
                            user: {
                                _id: "user_id",
                                name: "John Doe",
                                email: "john@example.com",
                                userType: "client",
                                walletAddress: null
                            }
                        }
                    },
                    {
                        name: "Link Wallet",
                        method: "POST",
                        path: "/auth/link-wallet",
                        description: "Link Solana wallet address to user account",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        body: {
                            walletAddress: "SOLANA_WALLET_ADDRESS"
                        },
                        expectedResponse: {
                            message: "Wallet linked successfully",
                            user: {
                                walletAddress: "SOLANA_WALLET_ADDRESS"
                            }
                        }
                    },
                    {
                        name: "Verify Token",
                        method: "GET",
                        path: "/auth/verify",
                        description: "Verify if JWT token is valid",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        expectedResponse: {
                            valid: true,
                            userId: "user_id"
                        }
                    }
                ]
            },

            jobs: {
                title: "Job Management Endpoints",
                endpoints: [
                    {
                        name: "Create Job",
                        method: "POST",
                        path: "/jobs/create",
                        description: "Create a new job posting (Client only)",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        body: {
                            title: "Build a Next.js Website",
                            description: "Need a responsive website built with Next.js",
                            budget: 50000,
                            skills: ["React", "Next.js", "Tailwind"],
                            priority: "high",
                            deadline: "2026-02-15"
                        },
                        expectedResponse: {
                            message: "Job created",
                            job: {
                                _id: "job_id",
                                title: "Build a Next.js Website",
                                status: "active",
                                clientId: "client_id"
                            }
                        }
                    },
                    {
                        name: "List All Jobs",
                        method: "GET",
                        path: "/jobs/list",
                        description: "Get all available jobs",
                        expectedResponse: {
                            jobs: []
                        }
                    },
                    {
                        name: "Get Client's Jobs",
                        method: "GET",
                        path: "/jobs/client/[clientId]",
                        description: "Get all jobs posted by a specific client",
                        expectedResponse: {
                            jobs: []
                        }
                    },
                    {
                        name: "Edit Job",
                        method: "PUT",
                        path: "/jobs/edit/[id]",
                        description: "Edit an existing job (Client only)",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        body: {
                            title: "Updated Title",
                            description: "Updated description",
                            budget: 60000
                        },
                        expectedResponse: {
                            message: "Job updated",
                            job: {}
                        }
                    },
                    {
                        name: "Delete Job",
                        method: "DELETE",
                        path: "/jobs/delete/[id]",
                        description: "Delete a job posting (Client only)",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        expectedResponse: {
                            message: "Job deleted"
                        }
                    },
                    {
                        name: "Fund Escrow",
                        method: "POST",
                        path: "/jobs/fund/[id]",
                        description: "Fund escrow for a job after accepting a proposal",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        body: {
                            txSignature: "SOLANA_TX_SIGNATURE",
                            escrowPubkey: "ESCROW_ACCOUNT_PUBKEY"
                        },
                        expectedResponse: {
                            message: "Escrow funded successfully",
                            job: {
                                escrowFunded: true,
                                escrowPubkey: "ESCROW_ACCOUNT_PUBKEY"
                            }
                        }
                    },
                    {
                        name: "Release Escrow",
                        method: "POST",
                        path: "/jobs/release/[id]",
                        description: "Release escrow funds to freelancer after job completion",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        body: {
                            txSignature: "SOLANA_TX_SIGNATURE"
                        },
                        expectedResponse: {
                            message: "Escrow released successfully",
                            job: {
                                escrowReleased: true
                            }
                        }
                    }
                ]
            },

            proposals: {
                title: "Proposal Management Endpoints",
                endpoints: [
                    {
                        name: "Submit Proposal",
                        method: "POST",
                        path: "/proposals/submit",
                        description: "Submit a proposal for a job (Freelancer only)",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        body: {
                            jobId: "job_id",
                            coverLetter: "I am experienced in Next.js development...",
                            proposedAmount: 45000,
                            fundEscrow: false
                        },
                        expectedResponse: {
                            message: "Proposal submitted",
                            proposal: {
                                _id: "proposal_id",
                                jobId: "job_id",
                                freelancerId: "freelancer_id",
                                status: "pending"
                            }
                        }
                    },
                    {
                        name: "Get Job Proposals",
                        method: "GET",
                        path: "/proposals/job/[id]",
                        description: "Get all proposals for a specific job",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        expectedResponse: {
                            proposals: []
                        }
                    },
                    {
                        name: "Accept Proposal",
                        method: "PATCH",
                        path: "/proposals/accept/[id]",
                        description: "Accept a proposal and reject others (Client only)",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        expectedResponse: {
                            message: "Proposal accepted successfully",
                            proposal: {
                                isAccepted: true,
                                status: "accepted"
                            },
                            requiresEscrowPayment: true,
                            notificationsSent: {
                                accepted: 1,
                                rejected: 2
                            }
                        }
                    },
                    {
                        name: "Get Freelancer's Applied Jobs",
                        method: "GET",
                        path: "/proposals/applied/freelancer/[id]",
                        description: "Get all jobs a freelancer has applied to",
                        expectedResponse: {
                            appliedJobs: []
                        }
                    },
                    {
                        name: "Get Freelancer's Accepted Proposals",
                        method: "GET",
                        path: "/proposals/accepted/freelancer/[id]",
                        description: "Get all accepted proposals for a freelancer",
                        expectedResponse: {
                            acceptedProposals: []
                        }
                    }
                ]
            },

            projects: {
                title: "Project Completion Endpoints",
                endpoints: [
                    {
                        name: "Mark Project Complete (Client)",
                        method: "POST",
                        path: "/projects/complete/[id]",
                        description: "Client marks project as complete",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        expectedResponse: {
                            message: "Project marked as complete"
                        }
                    },
                    {
                        name: "Mark Project Complete (Freelancer)",
                        method: "POST",
                        path: "/projects/complete-freelancer/[proposalId]",
                        description: "Freelancer marks project as complete",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        expectedResponse: {
                            message: "Project completion confirmation sent"
                        }
                    },
                    {
                        name: "Verify Completion",
                        method: "POST",
                        path: "/projects/verify-completion/[id]",
                        description: "Verify project completion status",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        expectedResponse: {
                            isComplete: true,
                            clientConfirmed: true,
                            freelancerConfirmed: true
                        }
                    }
                ]
            },

            chat: {
                title: "Chat & Messaging Endpoints",
                endpoints: [
                    {
                        name: "Get Chat Messages",
                        method: "GET",
                        path: "/chat/[id]",
                        description: "Get all chat messages for a job",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        expectedResponse: {
                            messages: []
                        }
                    },
                    {
                        name: "Send Message",
                        method: "POST",
                        path: "/chat",
                        description: "Send a chat message",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        body: {
                            jobId: "job_id",
                            content: "Hello! When can you start?",
                            fileUrl: null,
                            fileType: null
                        },
                        expectedResponse: {
                            message: "Message sent",
                            data: {
                                _id: "message_id",
                                jobId: "job_id",
                                senderId: "sender_id",
                                content: "Hello!",
                                isRead: false
                            }
                        }
                    }
                ]
            },

            ratings: {
                title: "Rating & Review Endpoints",
                endpoints: [
                    {
                        name: "Submit Rating",
                        method: "POST",
                        path: "/rating/submit",
                        description: "Submit rating and review after project completion",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        body: {
                            projectId: "job_id",
                            ratedUserId: "freelancer_or_client_id",
                            rating: 5,
                            review: "Excellent work! Highly recommended."
                        },
                        expectedResponse: {
                            message: "Rating submitted successfully"
                        }
                    },
                    {
                        name: "Get Project Rating",
                        method: "GET",
                        path: "/rating/[projectId]",
                        description: "Get rating for a specific project",
                        expectedResponse: {
                            rating: {
                                rating: 5,
                                review: "Excellent work!"
                            }
                        }
                    },
                    {
                        name: "Get Freelancer Ratings",
                        method: "GET",
                        path: "/rating/freelancer/[id]",
                        description: "Get all ratings received by a freelancer",
                        expectedResponse: {
                            ratings: []
                        }
                    },
                    {
                        name: "Get Client Ratings",
                        method: "GET",
                        path: "/rating/client/[id]",
                        description: "Get all ratings received by a client",
                        expectedResponse: {
                            ratings: []
                        }
                    },
                    {
                        name: "Get Average Rating",
                        method: "GET",
                        path: "/rating/average/[id]",
                        description: "Get average rating for a user",
                        expectedResponse: {
                            averageRating: 4.5,
                            totalRatings: 10
                        }
                    }
                ]
            },

            notifications: {
                title: "Notification Endpoints",
                endpoints: [
                    {
                        name: "Get User Notifications",
                        method: "GET",
                        path: "/notifications",
                        description: "Get all notifications for the logged-in user",
                        headers: {
                            Authorization: "Bearer YOUR_JWT_TOKEN"
                        },
                        expectedResponse: {
                            notifications: []
                        }
                    }
                ]
            },

            history: {
                title: "Project History Endpoints",
                endpoints: [
                    {
                        name: "Get Client History",
                        method: "GET",
                        path: "/history/client/[id]",
                        description: "Get project history for a client",
                        expectedResponse: {
                            projects: []
                        }
                    },
                    {
                        name: "Get Freelancer History",
                        method: "GET",
                        path: "/history/freelancer/[id]",
                        description: "Get project history for a freelancer",
                        expectedResponse: {
                            projects: []
                        }
                    }
                ]
            },

            client: {
                title: "Client-Specific Endpoints",
                endpoints: [
                    {
                        name: "Get Job Statistics",
                        method: "GET",
                        path: "/client/job-stats/[id]",
                        description: "Get statistics for client's jobs",
                        expectedResponse: {
                            totalJobs: 10,
                            activeJobs: 3,
                            completedJobs: 7
                        }
                    }
                ]
            }
        },

        testingWorkflow: {
            title: "Complete Testing Workflow",
            steps: [
                {
                    step: 1,
                    action: "Register Accounts",
                    description: "Create one client and one freelancer account",
                    endpoints: ["/auth/register"],
                    notes: "Save the JWT tokens returned for both accounts"
                },
                {
                    step: 2,
                    action: "Link Wallets (Optional)",
                    description: "Link Solana wallet addresses to both accounts",
                    endpoints: ["/auth/link-wallet"],
                    notes: "Required for escrow functionality"
                },
                {
                    step: 3,
                    action: "Create Job (Client)",
                    description: "Use client account to create a new job posting",
                    endpoints: ["/jobs/create"],
                    notes: "Save the job ID returned"
                },
                {
                    step: 4,
                    action: "List Jobs",
                    description: "Verify the job appears in the job list",
                    endpoints: ["/jobs/list"],
                    notes: "Should see the newly created job"
                },
                {
                    step: 5,
                    action: "Submit Proposal (Freelancer)",
                    description: "Use freelancer account to submit a proposal",
                    endpoints: ["/proposals/submit"],
                    notes: "Submit 2-3 proposals to test rejection flow"
                },
                {
                    step: 6,
                    action: "View Proposals (Client)",
                    description: "Client views all proposals for the job",
                    endpoints: ["/proposals/job/[id]"],
                    notes: "Should see all submitted proposals"
                },
                {
                    step: 7,
                    action: "Accept Proposal (Client)",
                    description: "Client accepts one proposal",
                    endpoints: ["/proposals/accept/[id]"],
                    notes: "Check notifications are sent to all freelancers"
                },
                {
                    step: 8,
                    action: "Fund Escrow (Client)",
                    description: "Client funds the escrow account on Solana",
                    endpoints: ["/jobs/fund/[id]"],
                    notes: "Requires Solana transaction signature"
                },
                {
                    step: 9,
                    action: "Chat Communication",
                    description: "Test chat between client and freelancer",
                    endpoints: ["/chat", "/chat/[id]"],
                    notes: "Test text messages, file uploads, read receipts"
                },
                {
                    step: 10,
                    action: "Mark Complete (Freelancer)",
                    description: "Freelancer marks work as complete",
                    endpoints: ["/projects/complete-freelancer/[proposalId]"],
                    notes: "Notifies client to review and confirm"
                },
                {
                    step: 11,
                    action: "Verify & Complete (Client)",
                    description: "Client verifies and marks project complete",
                    endpoints: ["/projects/complete/[id]"],
                    notes: "Unlocks escrow release"
                },
                {
                    step: 12,
                    action: "Release Escrow (Client)",
                    description: "Client releases escrow funds to freelancer",
                    endpoints: ["/jobs/release/[id]"],
                    notes: "Requires Solana transaction signature"
                },
                {
                    step: 13,
                    action: "Submit Ratings",
                    description: "Both parties rate each other",
                    endpoints: ["/rating/submit"],
                    notes: "Test rating visibility and averages"
                },
                {
                    step: 14,
                    action: "Check History",
                    description: "View project history for both accounts",
                    endpoints: ["/history/client/[id]", "/history/freelancer/[id]"],
                    notes: "Verify completed project appears"
                }
            ]
        },

        troubleshooting: {
            title: "Common Issues & Solutions",
            issues: [
                {
                    issue: "401 Unauthorized",
                    solution: "Ensure JWT token is included in Authorization header as 'Bearer YOUR_TOKEN'"
                },
                {
                    issue: "403 Forbidden",
                    solution: "User doesn't have permission (e.g., freelancer trying to accept proposal)"
                },
                {
                    issue: "404 Not Found",
                    solution: "Check that the resource ID exists in the database"
                },
                {
                    issue: "500 Server Error",
                    solution: "Check MongoDB connection and server logs for detailed error"
                },
                {
                    issue: "Escrow not funding",
                    solution: "Verify Solana wallet is connected and has sufficient SOL for transaction fees"
                },
                {
                    issue: "Notifications not appearing",
                    solution: "Check that notification service is running and user IDs are correct"
                }
            ]
        },

        notes: [
            "All endpoints requiring authentication must include 'Authorization: Bearer YOUR_JWT_TOKEN' header",
            "MongoDB must be running and connected",
            "For escrow functionality, ensure .env.local has correct Solana configuration",
            "Test accounts should be created fresh for each testing session",
            "Chat functionality works best with WebSocket connection (handled in frontend)",
            "File uploads in chat require proper multer configuration",
            "Rating can only be submitted after project completion",
            "Notifications are created automatically for key events (bid accepted, rejected, etc.)"
        ]
    };

    return NextResponse.json(testGuide, {
        headers: {
            'Content-Type': 'application/json',
            'X-API-Version': '1.0.0'
        }
    });
}
