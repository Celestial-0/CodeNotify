# CodeNotify

![Version](https://img.shields.io/badge/version-1.0.0-blue)

> **Smart Contest Alert System**  
> Never miss a competitive programming contest again. Get personalized notifications from Codeforces, LeetCode, CodeChef, and AtCoder.

![CodeNotify Banner](https://github.com/Celestial-0/CodeNotify/blob/main/client/web/assets/public/icon.png?raw=true)

## 📚 Documentation

Complete documentation is available in the [`docs`](./docs) directory.

- **[Quick Start Guide](./docs/guide/quick-start.md)**
- **[Server Documentation](./docs/server/modules.md)**
- **[API Reference](./docs/api/overview.md)**
- **[Docker Deployment](./docs/server/deployment/docker.md)**

## ✨ Features

- **Multi-Platform**: Support for Codeforces, LeetCode, CodeChef, and AtCoder.
- **Smart Notifications**: 
  - Personalized alerts based on your preferences.
  - Multi-channel delivery: **Email**, **Telegram**, and **Discord**.
  - Customizable timing (e.g., "Notify me 2 hours before").
- **Secure Authentication**: 
  - JWT-based auth with refresh token hashing.
  - Email OTP verification flow.
- **Robust Architecture**:
  - **Server**: NestJS, MongoDB, Bun Runtime, ES Modules.
  - **Client**: Next.js 15, Tailwind CSS, Zustand, React Query.

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- MongoDB Atlas or Local MongoDB (v6+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Celestial-0/CodeNotify.git
   cd CodeNotify
   ```

2. **Server Setup**
   ```bash
   cd server
   bun install
   cp .env.example .env
   # Update .env with your credentials
   bun run start:dev
   ```

3. **Client Setup**
   ```bash
   cd ../client/web
   bun install
   cp .env.example .env.local
   bun run dev
   ```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/contributing.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
