# 🎭 TrustTok – A Reputation-Based Social Media Platform

**TrustTok** is a next-generation social media platform where content visibility is governed by user trustworthiness. By leveraging blockchain technology and a decentralized reputation system, TrustTok aims to solve long-standing issues in social media such as spam, fake news, and lack of accountability.

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen) ![Web3](https://img.shields.io/badge/Web3-Enabled-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

---

## 🚀 Live Deployment

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Smart Contract Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

## 🎯 Core Concept

Unlike traditional platforms where all users are treated equally, **TrustTok** introduces a *reputation-first model*:

| Trust Score | User Level    | Reach Multiplier |
|-------------|---------------|------------------|
| ≤ 20        | Low Trust     | 1x               |
| 60          | Medium Trust  | 2x               |
| 80          | High Trust    | 3x               |
| 95+         | Premium Trust | 5x               |

> High-quality, trustworthy content receives greater visibility. Misinformation and spam are naturally de-ranked.

---

## 🛠️ Architecture Overview

```
Frontend (React + TypeScript) ◄──► Backend (Node.js + Express) ◄──► Graphite Network (Reputation Engine)
│                           │                              │
▼                           ▼                              ▼
MetaMask Wallet ◄──────────── Smart Contract (Solidity) ◄──── Local Blockchain (Hardhat)
```

---

## 🌟 Key Features

### 🔐 Trust-Based Moderation
- Auto-approval for high-trust users
- Community moderation for mid-level users
- Manual reviews for low-trust content

### ⛓️ Blockchain-Backed Platform
- On-chain content permanence
- MetaMask and Web3 integration
- Verifiable, transparent reputation scores

### 🎨 UX and Interface
- Modern glassmorphism UI
- Real-time trust indicators and reach multipliers
- Fully responsive layout

### 📊 Analytics Dashboard
- Live trust score sync with Graphite
- Boost multipliers visualized in real-time
- Trust growth tracking

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- Git
- MetaMask browser extension

### Installation

```bash
# Clone repository
git clone https://github.com/Raakshass/trusttok-hackathon.git
cd trusttok-hackathon

# Setup backend
cd backend
npm install
npm run dev

# Setup frontend (new terminal)
cd ../frontend
npm install
npm run dev

# Setup smart contracts (new terminal)
cd ../smart-contracts
npm install
npx hardhat node
npx hardhat ignition deploy ignition/modules/TrustTok.ts --network localhost
```

### Launching the App

1. Open [http://localhost:5173](http://localhost:5173)
2. Connect your MetaMask wallet
3. Start exploring the reputation-powered experience

---

## 📁 Project Structure

```
trusttok/
├── frontend/            # React + TS UI
│   └── src/
│       ├── App.tsx     # Core component
│       ├── App.css     # Glassmorphism design
│       └── contracts/  # Web3 interfaces
├── backend/             # Node.js API
│   └── server.ts        # RESTful endpoints
├── smart-contracts/     # Solidity contracts & Hardhat
│   ├── contracts/       # TrustTok.sol
│   └── ignition/        # Deployment modules
└── README.md
```

---

## 📡 API Endpoints

```http
GET    /api/trust-score/:address        # Get user's trust score  
GET    /api/content-boost/:address      # Get content multiplier  
POST   /api/content/submit              # Submit new content  
GET    /api/health                      # API health check  
```

---

## 📜 Smart Contract Interface

```solidity
function createPost(string memory content) external
function likePost(uint256 postId) external
function getUserProfile(address user) external view
function getContentBoost(address user) external view
```

---

## 🔍 Use Case Highlights

* **Decentralized Reputation**: All user actions contribute to a publicly verifiable trust score.
* **Fake News Mitigation**: Boosted reach for verified, high-trust users only.
* **Spam Resistance**: Content from low-trust sources is deprioritized.
* **Web3-Native**: Built with Solidity, React, and TypeScript from the ground up.

---

## 🧪 Demo Guide

For evaluators and stakeholders:

1. **Login with MetaMask**
2. **Check Dashboard Trust Score**
3. **Create a Blockchain Post**
4. **Show Content Boost Multiplier**
5. **Demonstrate Reputation-Ranked Feed**

---

## 🧭 Roadmap

* [ ] Native mobile app  
* [ ] Creator monetization tools  
* [ ] Advanced reputation scoring algorithms  
* [ ] DAO-based governance  
* [ ] Multi-chain support  

---

## 👨‍💻 Developer & Credits

**Author**: [Raakshass](https://github.com/Raakshass)  
**Tech Stack**: TypeScript, React, Node.js, Solidity, Hardhat  
**Initial Build Time**: ~6 hours (Hackathon Sprint)

---

## 📄 License

[MIT License](./LICENSE)

---

> *"Redefining social media for the Web3 era – where trust determines reach."* 🎭✨
