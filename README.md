# 🧩 AB Partner Portal
**Live Project:** https://www.abpartnerportal.com/

---

## Overview

AB Partner Portal is a full-stack education agency automation platform built to simplify and centralize the student recruitment workflow.

It helps education agencies manage leads, events, quotations, documents, finances, commissions, and analytics from one secure dashboard. The platform replaces scattered spreadsheets and manual processes with a streamlined digital system designed for speed, clarity, and growth.

---

## Live Demo

https://www.abpartnerportal.com/

---

## Technologies Used

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Shadcn UI / Radix UI
- Clerk
- MongoDB
- Mongoose
- Uploadthing
- Nodemailer
- Google Translate API
- Framer Motion
- Recharts / Chart.js

---

## Core Features

- Lead management system
- Quotation and commission tracking
- Event management system
- Document & resource hub
- Automation workflows
- Analytics dashboard
- Role-based access control
- Multi-language support

---

## Setup Guide

### 1. Clone repo
git clone https://github.com/your-username/agent-surface.git
cd ab-partner-portal

### 2. Install dependencies
npm install

### 3. Create .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=your_mongodb_uri
CLERK_SECRET_KEY=your_key
some are private

### 4. Run project
npm run dev

Open http://localhost:3000

---

## API Access

x-api-key: YOUR_SECRET_KEY

Example:
curl -H "x-api-key: supersecret123" http://localhost:3000/api/leads
