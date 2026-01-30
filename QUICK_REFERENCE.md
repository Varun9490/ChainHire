# ChainHire API Quick Reference Card

## 🚀 Quick Start
```bash
# 1. Start server (without Turbopack for stability)
npm run dev

# 2. Open testing UI
http://localhost:3000/docs/test-guide

# 3. Get API info
curl http://localhost:3000/api/docs/api-info
```

> **Note:** Turbopack removed from dev script to fix Google Fonts loading issues. See KNOWN_ISSUES.md for details.

---

## 🔑 Test Accounts
```
Client:     client@test.com     / password123
Freelancer: freelancer@test.com / password123
```

---

## 📡 Essential Endpoints

### Authentication
```bash
POST /api/auth/register        # Create account
POST /api/auth/login           # Get JWT token
POST /api/auth/link-wallet     # Link Solana wallet
GET  /api/auth/verify          # Verify token
```

### Jobs
```bash
POST   /api/jobs/create        # Create job
GET    /api/jobs/list          # List all jobs
PUT    /api/jobs/edit/[id]     # Edit job
POST   /api/jobs/fund/[id]     # Fund escrow
POST   /api/jobs/release/[id]  # Release payment
```

### Proposals
```bash
POST  /api/proposals/submit        # Submit bid
GET   /api/proposals/job/[id]      # View bids
PATCH /api/proposals/accept/[id]   # Accept bid
```

### Chat & Rating
```bash
POST /api/chat                 # Send message
GET  /api/chat/[id]            # Get messages
POST /api/rating/submit        # Submit rating
```

---

## 🧪 Quick Test Script

```bash
# Set base URL
export API="http://localhost:3000/api"

# 1. Register client
CLIENT_RES=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Client","email":"client@test.com","password":"password123","userType":"client"}')
CLIENT_TOKEN=$(echo $CLIENT_RES | jq -r '.token')

# 2. Register freelancer
FREELANCER_RES=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Freelancer","email":"freelancer@test.com","password":"password123","userType":"freelancer"}')
FREELANCER_TOKEN=$(echo $FREELANCER_RES | jq -r '.token')

# 3. Create job
JOB_RES=$(curl -s -X POST $API/jobs/create \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job","description":"Test","budget":50000}')
JOB_ID=$(echo $JOB_RES | jq -r '.job._id')

# 4. Submit proposal
PROPOSAL_RES=$(curl -s -X POST $API/proposals/submit \
  -H "Authorization: Bearer $FREELANCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"jobId\":\"$JOB_ID\",\"coverLetter\":\"I can help\",\"proposedAmount\":45000}")
PROPOSAL_ID=$(echo $PROPOSAL_RES | jq -r '.proposal._id')

# 5. Accept proposal
curl -X PATCH $API/proposals/accept/$PROPOSAL_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN"

echo "✅ Quick test complete!"
echo "Job ID: $JOB_ID"
echo "Proposal ID: $PROPOSAL_ID"
```

---

## 🔐 Authentication Headers

```bash
# Always include for authenticated endpoints:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized (no/invalid token) |
| 403  | Forbidden (wrong user type) |
| 404  | Not Found |
| 500  | Server Error |

---

## 🎯 Complete Workflow (7 Steps)

```
1. Register → POST /api/auth/register
2. Create Job → POST /api/jobs/create
3. Submit Proposal → POST /api/proposals/submit
4. Accept Proposal → PATCH /api/proposals/accept/[id]
5. Fund Escrow → POST /api/jobs/fund/[id]
6. Complete Work → POST /api/projects/complete/[id]
7. Submit Rating → POST /api/rating/submit
```

---

## 🗂️ Documentation Locations

| Resource | Location |
|----------|----------|
| Interactive UI | http://localhost:3000/docs/test-guide |
| Testing Guide | TESTING_GUIDE.md |
| API Structure | API_STRUCTURE.md |
| Quick Summary | CLEANUP_SUMMARY.md |
| Project README | README.md |

---

## 🛠️ Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check API info
curl http://localhost:3000/api/docs/api-info | jq

# Get testing guide (JSON)
curl http://localhost:3000/api/docs/test-guide | jq
```

---

## 🔧 Troubleshooting Quick Fixes

```bash
# Port 3000 in use?
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install

# Check MongoDB connection
# Verify MONGODB_URI in .env.local
```

---

## 📝 Request Examples

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "userType": "client"
  }'
```

### Create Job
```bash
curl -X POST http://localhost:3000/api/jobs/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build Website",
    "description": "Need Next.js site",
    "budget": 50000,
    "skills": ["Next.js", "React"]
  }'
```

### Submit Proposal
```bash
curl -X POST http://localhost:3000/api/proposals/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB_ID",
    "coverLetter": "I have 5 years experience...",
    "proposedAmount": 45000
  }'
```

### Send Chat Message
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB_ID",
    "content": "Hello! When can we start?"
  }'
```

---

## 🎓 Learning Path

1. **Start Here**: README.md
2. **Architecture**: API_STRUCTURE.md
3. **Testing**: TESTING_GUIDE.md
4. **Interactive**: /docs/test-guide
5. **Practice**: Run quick test script above

---

## 📞 Quick Help

**Issue**: 401 Unauthorized  
**Fix**: Add `Authorization: Bearer YOUR_TOKEN` header

**Issue**: 403 Forbidden  
**Fix**: Check user type (client/freelancer) for endpoint

**Issue**: 404 Not Found  
**Fix**: Verify endpoint path and resource ID

**Issue**: 500 Server Error  
**Fix**: Check MongoDB connection and server logs

---

## 📊 API Stats

- **Total Endpoints**: 31
- **Categories**: 9
- **Documentation Pages**: 5
- **Test Scripts**: Multiple
- **Example Requests**: 50+

---

## 🎯 Next Actions

1. ✅ Visit `/docs/test-guide`
2. ✅ Register test accounts
3. ✅ Run quick test script
4. ✅ Complete full workflow
5. ✅ Review all documentation

---

**Quick Access**: `http://localhost:3000/docs/test-guide`  
**Version**: 1.0.0  
**Last Updated**: January 2026
