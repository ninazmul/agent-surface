<div align="center">

<img src="public/logo.png" alt="AB Partner Portal Logo" width="100" />

# 🎓 AB Partner Portal

**A powerful Agent Management System for Academic Bridge English School**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Streamlining student recruitment, lead tracking, and agent operations for Ireland's leading English language school.*

[🚀 Live Demo](#) · [📖 Documentation](#getting-started) · [🐛 Report Bug](https://github.com/ninazmul/agent-surface/issues) · [✨ Request Feature](https://github.com/ninazmul/agent-surface/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Available Scripts](#-available-scripts)
- [Architecture](#-architecture)
- [API Routes](#-api-routes)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **AB Partner Portal** is a full-stack, enterprise-grade Agent Management System built exclusively for **Academic Bridge English School** — a premier English language institution based in **Ireland**. 

This portal serves as the central hub for educational agents worldwide, enabling them to manage student leads, generate professional quotations, track applications, and communicate efficiently — all from a single, secure, and intuitive interface.

> **Built for scale.** Designed for agents. Trusted by Academic Bridge.

---

## ✨ Key Features

### 👤 Role-Based Access Control (RBAC)
Granular permission system with multiple roles — **Administrators**, **Agents**, and **Staff** — ensuring every user sees exactly what they need and nothing more.

### 📊 Interactive Agent Dashboard
A real-time command center showing lead performance, conversion rates, revenue analytics, and activity logs. Powered by **Recharts** and **Chart.js** for stunning, interactive visualisations.

### 🧲 Lead Management System
Full lifecycle tracking of prospective students — from first inquiry through to enrollment:
- Capture and categorise new inquiries
- Track application status through a visual pipeline
- Add private notes and reminders
- Monitor agent-specific performance metrics

### 💰 Quotation Generator
Automated, branded quotation builder for tuition, accommodation, and ancillary services:
- Customisable pricing templates per course/package
- PDF export with school branding via **jsPDF** + **html2canvas**
- Excel export via **ExcelJS** for reporting
- QR code generation for quick sharing

### 📄 Application Processing
End-to-end student application management with streamlined submission, review, and approval workflows integrated directly with administrative teams.

### 🗂️ Document Management
Secure upload, storage, and verification of student documents (passports, visas, transcripts) powered by **UploadThing** cloud storage.

### ✉️ Messaging & Notifications
- In-app messaging system between agents and admins
- Automated email reminders via **Nodemailer**
- Promotion broadcast emails to agents
- Real-time notification feed

### 📅 Events & Promotions
School event announcements and promotional campaign management with agent-facing communication tools.

### 📚 Resources & Tutorial Centre
A dedicated knowledge base and tutorial playlist to onboard new agents and keep them up to date with school offerings.

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | `^16` |
| **UI Library** | [React](https://react.dev/) | `^19` |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5` |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) | `^3.4` |
| **Authentication** | [Clerk](https://clerk.com/) | `^6` |
| **Database** | [Mongoose](https://mongoosejs.com/) (MongoDB) | `^8` |
| **File Uploads** | [UploadThing](https://uploadthing.com/) | `^7` |
| **Rich Text Editor** | [Tiptap](https://tiptap.dev/) | `^3` |
| **Charts** | [Recharts](https://recharts.org/) + [Chart.js](https://www.chartjs.org/) | `^3` / `^4` |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | `^7` / `^3` |
| **PDF Export** | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) | `^2` / `^1` |
| **Excel Export** | [ExcelJS](https://github.com/exceljs/exceljs) | `^4` |
| **Email** | [Nodemailer](https://nodemailer.com/) | `^7` |
| **Dates** | [date-fns](https://date-fns.org/) | `^4` |
| **Icons** | [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/) | `^0.469` / `^5` |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) + [React Hot Toast](https://react-hot-toast.com/) | `^2` |
| **QR Codes** | [qrcode.react](https://github.com/zpao/qrcode.react) | `^4` |
| **Webhook** | [Svix](https://www.svix.com/) | `^1` |

---

## 📁 Project Structure

```
agent-surface/
│
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication pages (sign-in, sign-up)
│   ├── (public)/               # Public-facing pages
│   ├── (profile)/              # User profile management
│   ├── (quotation)/            # Quotation viewer & PDF generation
│   ├── (root)/                 # Protected portal pages
│   │   ├── page.tsx            # Dashboard home
│   │   ├── leads/              # Lead management
│   │   ├── quotations/         # Quotation management
│   │   ├── invoices/           # Invoice tracking
│   │   ├── finance/            # Financial overview
│   │   ├── users/              # User management (admin)
│   │   ├── admins/             # Admin panel
│   │   ├── courses/            # Course catalogue
│   │   ├── services/           # Services offered
│   │   ├── events/             # School events
│   │   ├── promotions/         # Promotional campaigns
│   │   ├── messages/           # Messaging centre
│   │   ├── notifications/      # Notification feed
│   │   ├── resources/          # Resource library
│   │   ├── tutorial/           # Tutorial playlist
│   │   ├── downloads/          # Downloadable assets
│   │   ├── settings/           # Portal settings
│   │   └── about/              # About page
│   │
│   └── api/                    # API Route Handlers
│       ├── leads/              # Lead CRUD endpoints
│       ├── notifications/      # Notification endpoints
│       ├── send-message/       # Messaging API
│       ├── send-promotion-email/  # Email broadcast API
│       ├── send-reminders/     # Reminder scheduler API
│       ├── help-email/         # Support email API
│       ├── playlist/           # Tutorial playlist API
│       ├── uploadthing/        # File upload handler
│       └── webhook/            # Clerk webhook handler
│
├── components/
│   ├── shared/                 # Shared layout & navigation components
│   └── ui/                     # Radix UI-based design system components
│
├── lib/                        # Utilities & service initializations
├── hooks/                      # Custom React hooks
├── constants/                  # App-wide constants & nav config
├── types/                      # TypeScript type definitions
└── public/                     # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** `v18.0+` — [Download](https://nodejs.org/)
- **npm** `v9+`, **yarn**, or **pnpm**
- A **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A **Clerk** account — [Sign up free](https://clerk.com/)
- An **UploadThing** account — [Sign up free](https://uploadthing.com/)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/ninazmul/agent-surface.git
cd agent-surface
```

**2. Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

**3. Configure environment variables**

Create a `.env.local` file in the project root (see [Environment Variables](#environment-variables) below).

**4. Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ── Clerk Authentication ───────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ── MongoDB Database ───────────────────────────────────────────
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/abpartnerportal

# ── UploadThing File Storage ───────────────────────────────────
UPLOADTHING_SECRET=sk_live_xxxxxxxxxxxx
UPLOADTHING_APP_ID=xxxxxxxxxxxx

# ── Email (Nodemailer) ─────────────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ── App Config ─────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **⚠️ Security Note:** Never commit your `.env.local` file to version control. It is already listed in `.gitignore`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with Webpack |
| `npm run build` | Build the production-optimised bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint to check for code issues |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│         Next.js App Router · React 19 · Tailwind     │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / Server Actions
┌────────────────────────▼────────────────────────────┐
│               Next.js Server (Node.js)               │
│      API Routes · Middleware · Clerk Auth Guard      │
└──────┬──────────────────────┬───────────────────────┘
       │                      │
┌──────▼──────┐    ┌──────────▼──────────┐
│  MongoDB    │    │   External Services  │
│ (Mongoose)  │    │  Clerk  UploadThing  │
│             │    │  Nodemailer  Svix    │
└─────────────┘    └─────────────────────┘
```

**Data flow:**
1. **Clerk** handles all authentication and session management via middleware
2. **Next.js API routes** serve as the backend, validated with **Zod**
3. **Mongoose** provides the ODM layer to a **MongoDB** database
4. **UploadThing** manages all file uploads/storage
5. **Nodemailer** handles transactional & broadcast emails
6. **Svix** processes Clerk webhook events (user creation, updates)

---

## 🔌 API Routes

| Route | Method | Description |
|---|---|---|
| `/api/leads` | `GET, POST, PATCH, DELETE` | Lead CRUD operations |
| `/api/notifications` | `GET, POST, PATCH` | Notification management |
| `/api/send-message` | `POST` | Send internal messages |
| `/api/send-promotion-email` | `POST` | Broadcast promotional emails |
| `/api/send-reminders` | `POST` | Send scheduled reminders |
| `/api/help-email` | `POST` | Submit support/help requests |
| `/api/playlist` | `GET, POST` | Tutorial playlist management |
| `/api/uploadthing` | `POST` | File upload handler |
| `/api/webhook` | `POST` | Clerk user sync webhook |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a new branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add some feature'`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please ensure your code follows the existing style, passes linting (`npm run lint`), and includes relevant TypeScript types.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by [**ninazmul**](https://github.com/ninazmul)

⭐ Star this repo if you found it useful!

</div>