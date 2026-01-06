# CodeNotify

![Version](https://img.shields.io/badge/version-0.1.0--beta-blue)

> **Smart Contest Alert System**  
> Never miss a competitive programming contest again. Get personalized notifications from Codeforces, LeetCode, CodeChef, and AtCoder.

![CodeNotify Banner](https://github.com/Celestial-0/CodeNotify/blob/main/client/web/assets/public/icon.png?raw=true)

## 📚 Documentation

Complete documentation is available in the [`docs`](./docs) directory.

- **[Quick StartGuide](./docs/guide/quick-start.md)**
- **[Server Documentation](./docs/server/modules/README.md)**
- **[Client Documentation](./docs/client/README.md)**
- **[API Reference](./docs/api/overview.md)**

## ✨ Features

- **Multi-Platform**: Support for Codeforces, LeetCode, CodeChef, and AtCoder.
- **Smart Notifications**: 
  - Personalized alerts based on your preferences.
  - Multi-channel delivery: **Email**, **WhatsApp**, and **Push**.
  - Customizable timing (e.g., "Notify me 2 hours before").
- **Secure Authentication**: 
  - JWT-based auth with refresh tokens.
  - **New**: Email OTP verification flow.
- **Robust Architecture**:
  - **Server**: NestJS, MongoDB, BullMQ (Scheduling).
  - **Client**: Next.js 15, Tailwind CSS, Zustand, React Query.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Celestial-0/CodeNotify.git
   cd CodeNotify
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Update .env with your credentials
   npm run start:dev
   ```

3. **Client Setup**
   ```bash
   cd ../client/web
   npm install
   cp .env.example .env.local
   npm run dev
   ```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/contributing.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
