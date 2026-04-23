# 🛡️ TD Marketing Ecosystem
> A high-performance, automated CRM and Notification Engine for modern store management.

[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2015%20|%20Firebase%20|%20Resend-6366f1?style=for-the-badge)](https://nextjs.org)
[![Performance](https://img.shields.io/badge/Performance-Optimized-emerald?style=for-the-badge)](https://github.com/tdtransactions/tdmarketing)
[![Deployment](https://img.shields.io/badge/Deployment-Production--Ready-blue?style=for-the-badge)](https://github.com/tdtransactions/tdmarketing)

## ⚡ The Architecture
This isn't just another dashboard. It's a precisely engineered ecosystem designed to bridge the gap between **Sales Operations**, **Technical Execution**, and **Administrative Oversight**.

### 🛠️ Core Engineering
- **Reactive Workflow Engine**: Real-time status transitions (`Pending` → `Processing` → `Completed`) powered by Firebase Firestore with optimistic UI updates.
- **Dynamic Notification Layer**: Context-aware email delivery system utilizing the **Resend API**. It distinguishes between internal staff (Sales) and oversight (Admin), delivering tailored data payloads.
- **Intelligent Resource Allocation**: A "Staff Pool" architecture where website tasks are dynamically assigned from a pre-qualified pool of workers specific to each store.
- **Glassmorphism UI**: A premium, high-contrast dark-mode interface built for speed and visual clarity.

## 🚀 Key Features

### 📡 Smart Notifications
When a project moves from *Pending* to *Processing*, the system doesn't just send an email. It triggers a logic-heavy routine that:
- Identifies the specific workers assigned to the project.
- Generates a specialized manifest for the **Admin** with full audit details.
- Sends a streamlined, actionable brief to the **Sales Person**.

### 👥 Staff Orchestration
Managing human resources at scale is hard. We made it surgical.
- **Store-Level Context**: Only staff already assigned to a store appear as candidates for website work.
- **Granular Assignment**: Tracks specific "Phụ trách" (Responsible) roles to ensure accountability.

### 📊 Real-time Monitoring
Built on top of a serverless architecture with Next.js 15, ensuring sub-second latency for all data operations.

## 📦 Technical Implementation

```bash
# Clone the repository
git clone https://github.com/tdtransactions/tdmarketing.git

# Install dependencies with strict versioning
npm install

# Initialize development environment
npm run dev
```

## 🔐 Environment Configuration
The engine requires a precisely configured `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_CONFIG={...}
RESEND_API_KEY=re_***
RESEND_FROM_EMAIL=system@notification.tdtransactionsllc.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@mytdtransactions.com
```

---

## 🎨 Design Philosophy
Every pixel serves a purpose. We follow a **High-Utility, Low-Friction** design language:
- **Typography**: Inter / Roboto / Outfit for maximum legibility.
- **Color Theory**: Indigo / Emerald / Slate palette for a sophisticated "Terminal-Modern" aesthetic.
- **Micro-interactions**: Subtle pulse animations and glass-card layouts to provide immediate user feedback.

---

**Crafted with precision by the TD Transactions Engineering Team.**  
*Pushing the boundaries of administrative efficiency.*
