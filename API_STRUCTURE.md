# ChainHire API Structure

## 📊 API Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ChainHire Platform                       │
│                   (Next.js 15 App Router)                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌─────▼─────┐        ┌─────▼─────┐
   │  Client │          │   API     │        │ Database  │
   │   App   │          │  Routes   │        │ (MongoDB) │
   └─────────┘          └───────────┘        └───────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼──────┐ ┌───▼────┐ ┌──────▼──────┐
         │     REST    │ │ Socket │ │  Blockchain │
         │   Endpoints │ │  .io   │ │   (Solana)  │
         └─────────────┘ └────────┘ └─────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────┐                 ┌──────────┐                ┌──────────┐
│  Client  │────Register────▶│   API    │───Create────▶  │ Database │
│          │                 │          │                │          │
└──────────┘                 └──────────┘                └──────────┘
     │                            │                           │
     │                            │◀──────User Data───────────┤
     │                            │                           │
     │◀────JWT Token──────────────┤                           │
     │                            │                           │
     ├────────Login──────────────▶│                           │
     │                            ├───Verify Password────────▶│
     │                            │◀──────User Data───────────┤
     │◀────JWT Token──────────────┤                           │
     │                            │                           │
     ├──Auth Request (w/ Token)──▶│                           │
     │                            ├───Verify JWT─────────────▶│
     │                            │◀──────Authorized──────────┤
     │◀────Protected Resource─────┤                           │
```

---

## 💼 Job Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                       Job Lifecycle                          │
└─────────────────────────────────────────────────────────────┘

1. CREATE JOB (Client)
   POST /api/jobs/create
   │
   ├─▶ Job Status: "active"
   │
2. FREELANCERS SUBMIT PROPOSALS
   POST /api/proposals/submit
   │
   ├─▶ Multiple proposals created
   │
3. CLIENT VIEWS PROPOSALS
   GET /api/proposals/job/[id]
   │
   ├─▶ Compare and select best fit
   │
4. CLIENT ACCEPTS PROPOSAL
   PATCH /api/proposals/accept/[id]
   │
   ├─▶ Accepted: isAccepted = true
   ├─▶ Others: status = "rejected"
   ├─▶ Job Status: "in-progress"
   ├─▶ Notifications sent to all
   │
5. CLIENT FUNDS ESCROW
   POST /api/jobs/fund/[id]
   │
   ├─▶ Solana transaction
   ├─▶ escrowFunded = true
   ├─▶ Funds locked in smart contract
   │
6. WORK & COMMUNICATION
   POST /api/chat
   GET /api/chat/[id]
   │
   ├─▶ Real-time messaging
   ├─▶ File sharing
   │
7. FREELANCER COMPLETES WORK
   POST /api/projects/complete-freelancer/[proposalId]
   │
   ├─▶ Notify client for review
   │
8. CLIENT VERIFIES & COMPLETES
   POST /api/projects/complete/[id]
   │
   ├─▶ Job Status: "completed"
   │
9. CLIENT RELEASES ESCROW
   POST /api/jobs/release/[id]
   │
   ├─▶ Solana transaction
   ├─▶ escrowReleased = true
   ├─▶ Funds transferred to freelancer
   │
10. BOTH PARTIES RATE EACH OTHER
    POST /api/rating/submit
    │
    ├─▶ Update reputation scores
    └─▶ Complete!
```

---

## 📡 API Endpoint Categories

### 🔐 Authentication (`/api/auth`)
```
POST   /auth/register          Create new user account
POST   /auth/login             Authenticate user
POST   /auth/link-wallet       Link Solana wallet
GET    /auth/verify            Verify JWT token
```

### 💼 Jobs (`/api/jobs`)
```
POST   /jobs/create            Create job posting
GET    /jobs/list              Get all jobs
GET    /jobs/client/[id]       Get client's jobs
PUT    /jobs/edit/[id]         Update job details
DELETE /jobs/delete/[id]       Remove job posting
POST   /jobs/fund/[id]         Fund escrow account
POST   /jobs/release/[id]      Release escrow funds
```

### 📝 Proposals (`/api/proposals`)
```
POST   /proposals/submit                      Submit new proposal
GET    /proposals/job/[id]                    Get job's proposals
PATCH  /proposals/accept/[id]                 Accept proposal
GET    /proposals/applied/freelancer/[id]     Get applications
GET    /proposals/accepted/freelancer/[id]    Get accepted bids
```

### ✅ Projects (`/api/projects`)
```
POST   /projects/complete/[id]                    Client marks complete
POST   /projects/complete-freelancer/[proposalId] Freelancer marks complete
POST   /projects/verify-completion/[id]           Verify completion status
```

### 💬 Chat (`/api/chat`)
```
GET    /chat/[id]              Get chat messages
POST   /chat                   Send new message
```

### ⭐ Rating (`/api/rating`)
```
POST   /rating/submit          Submit rating/review
GET    /rating/[projectId]     Get project rating
GET    /rating/freelancer/[id] Get freelancer ratings
GET    /rating/client/[id]     Get client ratings
GET    /rating/average/[id]    Get average rating
```

### 🔔 Notifications (`/api/notifications`)
```
GET    /notifications          Get user notifications
```

### 📊 History (`/api/history`)
```
GET    /history/client/[id]     Get client project history
GET    /history/freelancer/[id] Get freelancer project history
```

### 📚 Documentation (`/api/docs`)
```
GET    /docs/test-guide        Comprehensive testing guide
GET    /docs/api-info          API structure metadata
```

---

## 🔄 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      REQUEST FLOW                             │
└──────────────────────────────────────────────────────────────┘

Client Request
     │
     ▼
┌─────────────────┐
│  Next.js API    │
│  Route Handler  │
└────────┬────────┘
         │
         ├──▶ [1] Authenticate (JWT)
         │        │
         │        ├─✅ Valid → Continue
         │        └─❌ Invalid → 401 Error
         │
         ├──▶ [2] Authorize (Check permissions)
         │        │
         │        ├─✅ Authorized → Continue
         │        └─❌ Forbidden → 403 Error
         │
         ├──▶ [3] Validate Input
         │        │
         │        ├─✅ Valid → Continue
         │        └─❌ Invalid → 400 Error
         │
         ├──▶ [4] Database Operation (MongoDB)
         │        │
         │        ├─✅ Success → Continue
         │        └─❌ Error → 500 Error
         │
         ├──▶ [5] Side Effects (Optional)
         │        ├─ Send Notifications
         │        ├─ Update Related Records
         │        └─ Blockchain Transaction
         │
         └──▶ [6] Return Response
                  │
                  ├─ 200: Success
                  ├─ 201: Created
                  ├─ 400: Bad Request
                  ├─ 401: Unauthorized
                  ├─ 403: Forbidden
                  ├─ 404: Not Found
                  └─ 500: Server Error
```

---

## 🏗️ Database Schema Relationships

```
┌──────────┐        ┌──────────┐        ┌──────────┐
│   User   │        │   Job    │        │ Proposal │
└──────────┘        └──────────┘        └──────────┘
     │                   │                    │
     │ 1                 │ 1                  │
     │                   │                    │
     ├──────posts───────▶│                    │
     │                   │                    │
     │                   │◀────belongs to─────┤
     │                   │                   1│
     │                   │                    │
     │                   │ 1                  │
     │                   │                    │
     └─────submits──────▶│◀──────proposes────┤
     │                  N│                    │
     │                   │                    │
     │                   │                    │
┌────▼──────┐      ┌────▼────┐          ┌────▼────┐
│  Message  │      │ Rating  │          │  Chat   │
└───────────┘      └─────────┘          └─────────┘
    N:1                1:1                  N:1
     │                  │                    │
     └──────in──────────┤                    │
                        │                    │
                    belongs to               │
                        │                    │
                        └────────for─────────┘
```

### Model Details:

**User**
- _id, name, email, password
- userType: "client" | "freelancer"
- walletAddress (Solana)

**Job**
- _id, title, description, budget
- status: "active" | "in-progress" | "completed"
- clientId (ref: User)
- freelancerId (ref: User)
- escrowPubkey, escrowFunded, escrowReleased

**Proposal**
- _id, jobId (ref: Job)
- freelancerId (ref: User)
- coverLetter, proposedAmount
- isAccepted, status

**Message**
- _id, jobId, senderId
- content, fileUrl, fileType
- isRead

**Rating**
- _id, projectId (jobId)
- ratedUserId, raterUserId
- rating (1-5), review

**Notification**
- _id, userId
- type, title, message
- isRead, relatedJob, relatedProposal

---

## 🔒 Security Layers

```
┌────────────────────────────────────────────┐
│         SECURITY ARCHITECTURE               │
└────────────────────────────────────────────┘

Layer 1: Authentication
├─ JWT Token Verification
├─ Password Hashing (bcrypt)
└─ Session Management

Layer 2: Authorization
├─ Role-Based Access (Client/Freelancer)
├─ Resource Ownership Validation
└─ Permission Checks

Layer 3: Input Validation
├─ Request Body Validation
├─ Parameter Sanitization
└─ SQL/NoSQL Injection Prevention

Layer 4: Data Protection
├─ HTTPS Encryption
├─ Environment Variable Security
└─ Sensitive Data Masking

Layer 5: Blockchain Security
├─ Wallet Verification
├─ Transaction Signing
└─ Smart Contract Escrow
```

---

## 🚀 Deployment Architecture

```
                    ┌─────────────┐
                    │   Vercel    │
                    │  (Frontend) │
                    └──────┬──────┘
                           │
                ┌──────────┼──────────┐
                │                     │
         ┌──────▼──────┐       ┌──────▼──────┐
         │  MongoDB    │       │   Solana    │
         │   Atlas     │       │  Blockchain │
         └─────────────┘       └─────────────┘
```

### Production Setup:
1. **Frontend/API**: Vercel
2. **Database**: MongoDB Atlas
3. **Blockchain**: Solana Mainnet
4. **CDN**: Vercel Edge Network
5. **Monitoring**: Vercel Analytics

---

## 📈 Performance Optimizations

1. **API Routes**
   - Edge runtime where possible
   - Route caching
   - Response compression

2. **Database**
   - Indexed queries
   - Connection pooling
   - Aggregation pipelines

3. **Real-time Features**
   - Socket.io with rooms
   - Message batching
   - Connection management

4. **Blockchain**
   - Transaction batching
   - RPC endpoint optimization
   - Devnet for testing

---

## 🔄 State Management Flow

```
Component
    │
    ├─▶ API Call (fetch/axios)
    │        │
    │        ▼
    │   Next.js API Route
    │        │
    │        ├─▶ Auth Middleware
    │        ├─▶ Database Query
    │        └─▶ Response
    │             │
    │             ▼
    ├──◀ Update State (useState/Context)
    │
    └─▶ Re-render UI
```

---

## 🧪 Testing Strategy

```
Unit Tests
    ├─ API Route Handlers
    ├─ Database Models
    └─ Utility Functions

Integration Tests
    ├─ API Endpoint Flows
    ├─ Authentication Flow
    └─ Database Operations

E2E Tests
    ├─ Complete Job Lifecycle
    ├─ User Registration to Payment
    └─ Chat & Notifications

Manual Testing
    ├─ Test Guide (TESTING_GUIDE.md)
    ├─ Interactive UI (/docs/test-guide)
    └─ API Documentation Endpoints
```

---

## 📊 Metrics & Monitoring

**Tracked Metrics:**
- API Response Times
- Database Query Performance
- Blockchain Transaction Success Rate
- User Engagement (Jobs, Proposals)
- Error Rates by Endpoint
- Chat Message Delivery Rate

**Tools:**
- Vercel Analytics
- MongoDB Atlas Monitoring
- Custom Logging System

---

## 🔮 Future Enhancements

1. **Smart Contracts**: Custom Solana programs
2. **Multi-Currency**: Support multiple tokens
3. **Dispute Resolution**: Automated arbitration
4. **AI Matching**: ML-based job recommendations
5. **Mobile Apps**: React Native clients
6. **Advanced Analytics**: Dashboard insights
7. **Multi-language**: i18n support
8. **API Rate Limiting**: DDoS protection

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Maintained by:** ChainHire Team
