# Sejuk Sejuk Service Management System

This is a service management system built for aircond service companies. It helps manage daily operations like assigning jobs, tracking progress, and monitoring technician performance.

There are two main types of users:
- **Admin** (office team)
- **Technician** (field team)

---
### 🧑‍💼 Admin Portal
Admins can:
- Create and manage service jobs
- Assign jobs to technicians
- Monitor job status and progress
- View technician performance (KPI)
- Manage technician profiles and schedules

### 🧑‍🔧 Technician Portal
Technicians can:
- View jobs assigned to them
- Complete jobs using forms and photo uploads
- See their job history
- Handle rework jobs (if a job needs to be fixed again)

---

## ➕ Extra Modules

### 📊 KPI Dashboard (Assigned Task)
This dashboard helps track technician performance. It includes:
- Weekly and monthly comparisons
- Revenue tracking and percentage changes
- Total jobs, completed jobs, and more
- Easy-to-read charts and visual data

### 🔁 Rework Module (Self-Initiated)
While building the KPI dashboard, I realized we need rework data to make the KPI accurate.  
So I added a **Rework Module** that:
- Logs jobs that need to be redone
- Tracks reasons and history of rework
- Connects with the KPI dashboard
- Has a workflow for rework assignments

---

## 🧠 Assumptions

Some things were not clearly mentioned, so I made these decisions:

### 📅 Who Sets the Service Date?
- The **Admin** will decide the service date after talking to the customer
- **Technicians only follow the schedule**
- **Jobtime** based on technician availability and discussion between technician and customer

---

## ⚙️ Tech Stack

- **Next.js 14** – React-based web framework
- **TypeScript** – Adds safety and clarity to the code
- **Firebase** – Handles backend and database
- **Tailwind CSS** – For fast and clean styling
- **Shadcn/ui** – For ready-to-use UI components

---

### Admin Credentials
- **Email:** admin@sejuksejuk.com
- **Password:** admin123

### Technician Credentials
- **Ali:** ali@sejuksejuk.com / ali123
- **Bala:** bala@sejuksejuk.com / bala123
- **John:** john@sejuksejuk.com / john123
- **Yusoff:** yusoff@sejuksejuk.com / yusoff123

---