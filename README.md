# ♟️ ChessArena

A **real-time multiplayer chess game** with authentication, user profiles, and live WebSocket gameplay.  
Play against **real players** or challenge an **AI-powered bot using Stockfish**!

🌐 **Live Website:** [ChessArena](https://chessarena.chickenkiller.com/)

---

## 🚀 Features

- 🔥 **Real-time Multiplayer Chess** – WebSockets-powered live gameplay
- 🤖 **Play vs AI** – Challenge Stockfish-powered bots
- 🔐 **Secure Authentication** – OAuth (Google), JWT, and password-based login
- 👤 **User Profiles** – Personalized player accounts
- 🏆 **Lobby & Matchmaking** – Find and challenge players in real-time
- 🎨 **Modern UI** – Built with TailwindCSS & ShadCN
- ⚡ **Optimized Performance** – Vite for fast builds
- 📡 **Scalable Infrastructure** – Redis Pub/Sub, PostgreSQL, and Docker

---

## 🛠️ Tech Stack

### **Frontend**

- **React, TypeScript, Vite** – Fast and modular UI
- **React Router, Zustand** – Client-side routing and state management
- **Tailwind CSS, ShadCN** – Elegant and responsive styling

### **Backend**

- **FastAPI** – High-performance Python backend
- **PostgreSQL, SQLAlchemy** – Robust database management
- **Redis Pub/Sub** – Real-time event handling
- **Stockfish** – AI-powered chess bot

### **Authentication & Security**

- **OAuth (Google), JWT** – Secure login and authorization

### **Infrastructure & DevOps**

- **Docker & Docker Compose** – Containerized deployment
- **Caddy** – HTTPS and reverse proxy
- **Digital Ocean** – Cloud hosting
- **GitHub Actions** – CI/CD automation

---

## 🛠️ Setup & Installation

### **1️⃣ Clone the Repository**

```sh
git clone https://github.com/neevan0842/chess-arena.git
cd chess-arena
```

### **2️⃣ Set Up Environment Variables**

We provide **`.env.sample` files** in both the **frontend** and **backend** directories.

- For **local development**, create `.env` file using `.env.sample` (only works on linux).
- For **Docker Compose development**, create `.env.docker`file using `.env.sample`..

### **3️⃣ Run the Application (Docker Recommended)**

```sh
docker-compose up --build --watch
```

---

## 🎯 Contributing

Feel free to open issues or submit PRs to improve the project!

---

## 📜 License

MIT License

🔥 Built with ❤️ by [**Naveen Manoj**](https://github.com/neevan0842) 🚀♟️
