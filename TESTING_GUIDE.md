# ChainHire API Testing Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Test Accounts](#test-accounts)
- [API Endpoints](#api-endpoints)
- [Complete Testing Workflow](#complete-testing-workflow)
- [Testing in Chat](#testing-in-chat)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide provides comprehensive testing instructions for all ChainHire API endpoints. ChainHire is a blockchain-powered freelance escrow platform built with Next.js 15, MongoDB, and Solana.

**Base URL:** `http://localhost:3000/api`

**Interactive Documentation:** Visit `/docs/test-guide` for an interactive UI version of this guide.

---

## 🚀 Getting Started

### Prerequisites

1. **MongoDB** - Ensure MongoDB is running locally or you have a connection string
2. **Node.js** - Version 18+ recommended
3. **Solana Wallet** (Optional) - For escrow testing

### Environment Setup

Create a `.env.local` file with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_very_secret_jwt_key
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### Start the Development Server

```bash
npm install
npm run dev
```

The API will be available at `http://localhost:3000/api`

---

## 👥 Test Accounts

### Client Account
- **Email:** `client@test.com`
- **Password:** `password123`
- **Purpose:** Post jobs, accept proposals, fund/release escrow

### Freelancer Account
- **Email:** `freelancer@test.com`
- **Password:** `password123`
- **Purpose:** Submit proposals, complete work, receive payments

> **Note:** These accounts should be created using the `/api/auth/register` endpoint before testing.

---

## 📡 API Endpoints

### 1. Authentication Endpoints (`/api/auth`)

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "client"  // or "freelancer"
}

# Response
{
  "message": "User registered",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "client"
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Response
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Link Wallet
```bash
POST /api/auth/link-wallet
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "walletAddress": "SOLANA_WALLET_ADDRESS"
}
```

#### Verify Token
```bash
GET /api/auth/verify
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 2. Job Management (`/api/jobs`)

#### Create Job (Client Only)
```bash
POST /api/jobs/create
Authorization: Bearer YOUR_CLIENT_JWT_TOKEN
Content-Type: application/json

{
  "title": "Build a Next.js Website",
  "description": "Need a responsive website built with Next.js",
  "budget": 50000,
  "skills": ["React", "Next.js", "Tailwind"],
  "priority": "high",
  "deadline": "2026-02-15"
}
```

#### List All Jobs
```bash
GET /api/jobs/list
```

#### Get Client's Jobs
```bash
GET /api/jobs/client/[clientId]
```

#### Edit Job (Client Only)
```bash
PUT /api/jobs/edit/[jobId]
Authorization: Bearer YOUR_CLIENT_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "budget": 60000
}
```

#### Delete Job (Client Only)
```bash
DELETE /api/jobs/delete/[jobId]
Authorization: Bearer YOUR_CLIENT_JWT_TOKEN
```

#### Fund Escrow (Client Only)
```bash
POST /api/jobs/fund/[jobId]
Authorization: Bearer YOUR_CLIENT_JWT_TOKEN
Content-Type: application/json

{
  "txSignature": "SOLANA_TX_SIGNATURE",
  "escrowPubkey": "ESCROW_ACCOUNT_PUBKEY"
}
```

#### Release Escrow (Client Only)
```bash
POST /api/jobs/release/[jobId]
Authorization: Bearer YOUR_CLIENT_JWT_TOKEN
Content-Type: application/json

{
  "txSignature": "SOLANA_TX_SIGNATURE"
}
```

---

### 3. Proposal Management (`/api/proposals`)

#### Submit Proposal (Freelancer Only)
```bash
POST /api/proposals/submit
Authorization: Bearer YOUR_FREELANCER_JWT_TOKEN
Content-Type: application/json

{
  "jobId": "job_id_here",
  "coverLetter": "I am experienced in Next.js development...",
  "proposedAmount": 45000
}
```

#### Get Job Proposals (Client Only)
```bash
GET /api/proposals/job/[jobId]
Authorization: Bearer YOUR_CLIENT_JWT_TOKEN
```

#### Accept Proposal (Client Only)
```bash
PATCH /api/proposals/accept/[proposalId]
Authorization: Bearer YOUR_CLIENT_JWT_TOKEN

# Response includes escrow payment instructions
{
  "message": "Proposal accepted successfully",
  "requiresEscrowPayment": true,
  "escrowDetails": {
    "amount": 45000,
    "freelancerId": "...",
    "jobId": "..."
  },
  "notificationsSent": {
    "accepted": 1,
    "rejected": 2
  }
}
```

#### Get Freelancer's Applications
```bash
GET /api/proposals/applied/freelancer/[freelancerId]
```

#### Get Accepted Proposals
```bash
GET /api/proposals/accepted/freelancer/[freelancerId]
```

---

### 4. Project Completion (`/api/projects`)

#### Mark Complete - Client
```bash
POST /api/projects/complete/[jobId]
Authorization: Bearer YOUR_CLIENT_JWT_TOKEN
```

#### Mark Complete - Freelancer
```bash
POST /api/projects/complete-freelancer/[proposalId]
Authorization: Bearer YOUR_FREELANCER_JWT_TOKEN
```

#### Verify Completion
```bash
POST /api/projects/verify-completion/[jobId]
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 5. Chat & Messaging (`/api/chat`)

#### Get Chat Messages
```bash
GET /api/chat/[jobId]
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Send Message
```bash
POST /api/chat
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "jobId": "job_id_here",
  "content": "Hello! When can you start?",
  "fileUrl": null,
  "fileType": null
}
```

---

### 6. Ratings & Reviews (`/api/rating`)

#### Submit Rating
```bash
POST /api/rating/submit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "projectId": "job_id_here",
  "ratedUserId": "user_to_rate_id",
  "rating": 5,
  "review": "Excellent work! Highly recommended."
}
```

#### Get Project Rating
```bash
GET /api/rating/[projectId]
```

#### Get User Ratings
```bash
GET /api/rating/freelancer/[freelancerId]
GET /api/rating/client/[clientId]
```

#### Get Average Rating
```bash
GET /api/rating/average/[userId]
```

---

### 7. Notifications (`/api/notifications`)

#### Get User Notifications
```bash
GET /api/notifications
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 8. History (`/api/history`)

#### Get Client History
```bash
GET /api/history/client/[clientId]
```

#### Get Freelancer History
```bash
GET /api/history/freelancer/[freelancerId]
```

---

### 9. Documentation (`/api/docs`)

#### Get Testing Guide
```bash
GET /api/docs/test-guide
```

#### Get API Info
```bash
GET /api/docs/api-info
```

---

## 🧪 Complete Testing Workflow

Follow these steps to test the complete application flow:

### Step 1: Register Accounts ✅
```bash
# Register Client
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "email": "client@test.com",
    "password": "password123",
    "userType": "client"
  }'

# Register Freelancer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Freelancer",
    "email": "freelancer@test.com",
    "password": "password123",
    "userType": "freelancer"
  }'
```

**Expected:** Receive JWT tokens for both accounts. Save these!

---

### Step 2: Link Wallets (Optional) 🔗
```bash
curl -X POST http://localhost:3000/api/auth/link-wallet \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "YOUR_SOLANA_WALLET"}'
```

---

### Step 3: Create Job (Client) 📝
```bash
curl -X POST http://localhost:3000/api/jobs/create \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build Portfolio Website",
    "description": "Need a modern portfolio website with Next.js",
    "budget": 50000,
    "skills": ["Next.js", "React", "Tailwind"],
    "priority": "high",
    "deadline": "2026-02-28"
  }'
```

**Expected:** Job created successfully. Save the job ID!

---

### Step 4: List Jobs 📋
```bash
curl http://localhost:3000/api/jobs/list
```

**Expected:** See the newly created job in the list.

---

### Step 5: Submit Proposals (Freelancer) 💼
```bash
# Proposal 1
curl -X POST http://localhost:3000/api/proposals/submit \
  -H "Authorization: Bearer YOUR_FREELANCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "YOUR_JOB_ID",
    "coverLetter": "I have 5 years experience with Next.js...",
    "proposedAmount": 45000
  }'

# Submit 2-3 more proposals with different freelancer accounts
```

**Expected:** Proposals submitted successfully.

---

### Step 6: View Proposals (Client) 👀
```bash
curl http://localhost:3000/api/proposals/job/YOUR_JOB_ID \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected:** See all submitted proposals.

---

### Step 7: Accept Proposal (Client) ✅
```bash
curl -X PATCH http://localhost:3000/api/proposals/accept/PROPOSAL_ID \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected:** 
- Proposal marked as accepted
- Other proposals automatically rejected
- Notifications sent to all freelancers
- Escrow payment instructions provided

---

### Step 8: Fund Escrow (Client) 💰
```bash
curl -X POST http://localhost:3000/api/jobs/fund/YOUR_JOB_ID \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "txSignature": "SOLANA_TX_SIGNATURE",
    "escrowPubkey": "ESCROW_ACCOUNT_PUBKEY"
  }'
```

**Expected:** Escrow marked as funded.

---

### Step 9: Chat Communication 💬
```bash
# Client sends message
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "YOUR_JOB_ID",
    "content": "When can you start the project?"
  }'

# Freelancer replies
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer YOUR_FREELANCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "YOUR_JOB_ID",
    "content": "I can start immediately!"
  }'

# Get all messages
curl http://localhost:3000/api/chat/YOUR_JOB_ID \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected:** Messages sent and received successfully.

---

### Step 10: Mark Complete (Freelancer) ✅
```bash
curl -X POST http://localhost:3000/api/projects/complete-freelancer/PROPOSAL_ID \
  -H "Authorization: Bearer YOUR_FREELANCER_TOKEN"
```

**Expected:** Completion request sent to client.

---

### Step 11: Verify & Complete (Client) ✅
```bash
curl -X POST http://localhost:3000/api/projects/complete/YOUR_JOB_ID \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected:** Project marked as complete.

---

### Step 12: Release Escrow (Client) 💸
```bash
curl -X POST http://localhost:3000/api/jobs/release/YOUR_JOB_ID \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "txSignature": "RELEASE_TX_SIGNATURE"
  }'
```

**Expected:** Escrow funds released to freelancer.

---

### Step 13: Submit Ratings ⭐
```bash
# Client rates freelancer
curl -X POST http://localhost:3000/api/rating/submit \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "YOUR_JOB_ID",
    "ratedUserId": "FREELANCER_USER_ID",
    "rating": 5,
    "review": "Excellent work! Delivered on time."
  }'

# Freelancer rates client
curl -X POST http://localhost:3000/api/rating/submit \
  -H "Authorization: Bearer YOUR_FREELANCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "YOUR_JOB_ID",
    "ratedUserId": "CLIENT_USER_ID",
    "rating": 5,
    "review": "Great client! Clear communication."
  }'
```

**Expected:** Ratings submitted successfully.

---

### Step 14: Check History 📊
```bash
# Client history
curl http://localhost:3000/api/history/client/CLIENT_USER_ID

# Freelancer history
curl http://localhost:3000/api/history/freelancer/FREELANCER_USER_ID
```

**Expected:** Completed project appears in both histories.

---

## 💬 Testing in Chat (Quick Commands)

You can test using these quick commands in your terminal:

### Quick Test Script
```bash
# Set variables
export CLIENT_EMAIL="client@test.com"
export FREELANCER_EMAIL="freelancer@test.com"
export PASSWORD="password123"
export BASE_URL="http://localhost:3000/api"

# Register and login client
CLIENT_TOKEN=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Client\",\"email\":\"$CLIENT_EMAIL\",\"password\":\"$PASSWORD\",\"userType\":\"client\"}" \
  | jq -r '.token')

echo "Client Token: $CLIENT_TOKEN"

# Register and login freelancer
FREELANCER_TOKEN=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Freelancer\",\"email\":\"$FREELANCER_EMAIL\",\"password\":\"$PASSWORD\",\"userType\":\"freelancer\"}" \
  | jq -r '.token')

echo "Freelancer Token: $FREELANCER_TOKEN"

# Create job
JOB_RESPONSE=$(curl -s -X POST $BASE_URL/jobs/create \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job","description":"Test description","budget":50000}')

JOB_ID=$(echo $JOB_RESPONSE | jq -r '.job._id')
echo "Job ID: $JOB_ID"

# Submit proposal
PROPOSAL_RESPONSE=$(curl -s -X POST $BASE_URL/proposals/submit \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"jobId\":\"$JOB_ID\",\"coverLetter\":\"I can do this\",\"proposedAmount\":45000}")

PROPOSAL_ID=$(echo $PROPOSAL_RESPONSE | jq -r '.proposal._id')
echo "Proposal ID: $PROPOSAL_ID"

# Accept proposal
curl -X PATCH $BASE_URL/proposals/accept/$PROPOSAL_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN"

echo "✅ Testing complete!"
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **401 Unauthorized**
- **Cause:** Missing or invalid JWT token
- **Solution:** Ensure Authorization header includes: `Bearer YOUR_TOKEN`

#### 2. **403 Forbidden**
- **Cause:** User doesn't have permission
- **Solution:** Check user type (client vs freelancer) for the endpoint

#### 3. **404 Not Found**
- **Cause:** Resource doesn't exist
- **Solution:** Verify the ID exists in database

#### 4. **500 Server Error**
- **Cause:** Database connection or server issue
- **Solution:** Check MongoDB connection and server logs

#### 5. **Escrow Not Funding**
- **Cause:** Solana wallet issues
- **Solution:** 
  - Verify wallet is connected
  - Check sufficient SOL for transaction fees
  - Ensure correct network (devnet/mainnet)

#### 6. **Notifications Not Appearing**
- **Cause:** Notification service issue
- **Solution:** Check that user IDs are correct and notification service is running

---

## 📝 Important Notes

1. **Authentication Required:** Most endpoints require JWT authentication
2. **MongoDB Connection:** Ensure MongoDB is running before testing
3. **Test Accounts:** Create fresh accounts for each testing session
4. **Escrow Testing:** Requires Solana wallet setup and devnet SOL
5. **WebSocket:** Chat real-time features work best with WebSocket connection
6. **File Uploads:** Chat file uploads require proper multipart/form-data handling
7. **Rating Timing:** Ratings can only be submitted after project completion
8. **Auto-Notifications:** Key events automatically trigger notifications

---

## 🎨 Interactive UI

For a beautiful, interactive version of this guide with:
- Tabbed navigation
- Code blocks with copy buttons
- Live API calls
- Dark theme UI

Visit: **`http://localhost:3000/docs/test-guide`**

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review server logs for detailed errors
- Verify environment variables are set correctly
- Ensure all dependencies are installed

---

**Built with Next.js 15, MongoDB & Solana** 🚀
