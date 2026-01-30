# ChainHire 🚀

> **Blockchain-Powered Freelance Escrow Platform**

ChainHire is a decentralized freelancing platform that leverages Solana blockchain for secure escrow payments, ensuring trust and transparency between clients and freelancers.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)
![Solana](https://img.shields.io/badge/Solana-Blockchain-purple)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 🔐 **Secure Blockchain Escrow**
- Solana-based smart contract escrow
- Funds released only after work completion
- Zero trust architecture

### 💼 **Complete Freelance Workflow**
- Job posting and bidding system
- Proposal management
- Multi-proposal comparison
- Automated bid rejection on acceptance

### 💬 **Real-Time Communication**
- Job-specific chat rooms
- File sharing (images, videos, documents)
- Read receipts and typing indicators
- Immutable message history

### ⭐ **Rating & Review System**
- Dual-sided ratings (client ↔ freelancer)
- Historical rating tracking
- Average rating calculations
- Reputation building

### 🔔 **Smart Notifications**
- Bid acceptance/rejection alerts
- Project milestone notifications
- Real-time updates
- Comprehensive notification history

### 📊 **Analytics Dashboard**
- Job statistics
- Project history
- Performance metrics
- Earnings tracking

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Database** | MongoDB with Mongoose |
| **Blockchain** | Solana Web3.js |
| **Authentication** | JWT (JSON Web Tokens) |
| **Real-time** | Socket.io |
| **Styling** | Tailwind CSS |
| **UI Components** | Radix UI, Framer Motion |
| **State Management** | React Hooks |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **MongoDB** (local or cloud)
- **Solana Wallet** (Phantom, Solflare, etc.)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Varun9490/ChainHire.git
   cd ChainHire
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/chainhire
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Solana
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 API Documentation

ChainHire provides comprehensive API documentation for testing and integration.

### Interactive Documentation UI
Visit the beautiful, interactive testing guide:
```
http://localhost:3000/docs/test-guide
```

### API Endpoints Overview
```bash
# Get API structure and metadata
GET http://localhost:3000/api/docs/api-info

# Get comprehensive testing guide (JSON)
GET http://localhost:3000/api/docs/test-guide
```

### Complete Testing Guide
See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for:
- ✅ Full API endpoint documentation
- ✅ Step-by-step testing workflow
- ✅ cURL examples
- ✅ Test accounts
- ✅ Troubleshooting tips
- ✅ Quick test scripts

---

## 🧪 Testing the Application

### Quick Test with Test Accounts

1. **Register Client Account**
   ```bash
   POST /api/auth/register
   {
     "name": "Test Client",
     "email": "client@test.com",
     "password": "password123",
     "userType": "client"
   }
   ```

2. **Register Freelancer Account**
   ```bash
   POST /api/auth/register
   {
     "name": "Test Freelancer",
     "email": "freelancer@test.com",
     "password": "password123",
     "userType": "freelancer"
   }
   ```

3. **Follow the workflow**
   - Client creates a job
   - Freelancer submits proposals
   - Client accepts a proposal
   - Client funds escrow
   - Work is completed
   - Client releases payment
   - Both parties rate each other

For detailed testing steps, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## 📁 Project Structure

```
ChainHire/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication
│   │   │   ├── jobs/         # Job management
│   │   │   ├── proposals/    # Proposal handling
│   │   │   ├── projects/     # Project completion
│   │   │   ├── chat/         # Real-time messaging
│   │   │   ├── rating/       # Rating system
│   │   │   ├── notifications/# Notifications
│   │   │   └── docs/         # API documentation
│   │   ├── auth/             # Auth pages
│   │   ├── dashboard/        # User dashboard
│   │   ├── jobs/             # Job pages
│   │   ├── chat/             # Chat interface
│   │   └── docs/             # Documentation UI
│   ├── components/           # React components
│   ├── models/               # MongoDB models
│   ├── lib/                  # Utility functions
│   └── utils/                # Helper functions
├── public/                   # Static assets
├── TESTING_GUIDE.md         # Complete testing documentation
└── README.md                # This file
```

---

## 🔑 Key Features Explained

### Escrow System
ChainHire uses Solana blockchain to create secure escrow accounts:
1. Client accepts a proposal
2. Client funds escrow with SOL (locked in smart contract)
3. Freelancer completes work
4. Client verifies and releases funds
5. Funds transferred to freelancer's wallet

### Notification System
Automated notifications for:
- ✅ Bid accepted
- ❌ Bid rejected
- 💰 Escrow funded
- 📝 Project completion requests
- ⭐ New ratings received

### Chat System
- **Job-scoped:** Each job has its own chat room
- **File support:** Share images, videos, PDFs
- **Real-time:** Powered by Socket.io
- **Read receipts:** Know when messages are read

---

## 🔒 Security Features

- **JWT Authentication:** Secure token-based auth
- **Password Hashing:** bcrypt encryption
- **Blockchain Escrow:** Trustless payments
- **Input Validation:** All API inputs validated
- **Authorization Checks:** Role-based access control

---

## 🌟 API Highlights

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Authentication** | 4 | Register, login, verify, link wallet |
| **Jobs** | 7 | Create, list, edit, delete, fund, release |
| **Proposals** | 5 | Submit, view, accept, track |
| **Projects** | 3 | Mark complete, verify completion |
| **Chat** | 2 | Send & receive messages |
| **Rating** | 5 | Submit, view, calculate averages |
| **Notifications** | 1 | Get user notifications |
| **History** | 2 | Client & freelancer history |
| **Documentation** | 2 | API info & testing guide |

**Total:** 31 production-ready endpoints

---

## 🗑️ Cleaned Up Endpoints

The following redundant endpoints have been removed for better code organization:

- ❌ `/api/jobs/[id]/update-escrow` - Consolidated into fund flow
- ❌ `/api/proposals/[id]/update-escrow` - Merged into accept endpoint
- ❌ `/api/jobs/[id]/freelancer` - Data available via populated queries
- ❌ `/api/socket` - Socket.io handled via Next.js server

---

## 🎨 UI/UX Features

- **Dark Mode:** Modern dark theme throughout
- **Responsive Design:** Works on all devices
- **Smooth Animations:** Framer Motion transitions
- **Interactive Components:** Radix UI primitives
- **Real-time Updates:** Live data without refresh
- **Copy-to-Clipboard:** Easy code copying in docs

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Solana Foundation** - Blockchain infrastructure
- **Vercel** - Hosting platform
- **MongoDB** - Database solution

---

## 📞 Support & Contact

For questions, issues, or feature requests:
- 📧 Email: support@chainhire.com
- 🐛 Issues: [GitHub Issues](https://github.com/Varun9490/ChainHire/issues)
- 📖 Documentation: [Testing Guide](./TESTING_GUIDE.md)

---

<div align="center">

**Built with ❤️ using Next.js, MongoDB & Solana**

[Website](http://localhost:3000) • [API Docs](http://localhost:3000/docs/test-guide) • [Testing Guide](./TESTING_GUIDE.md)

</div>
