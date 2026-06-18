# TimetablePSO: University Timetable Scheduling System

TimetablePSO is a professional-grade University Timetable Scheduling System powered by **Particle Swarm Optimization (PSO)**. It automates the complex task of generating clash-free schedules for courses, teachers, and rooms, ensuring optimization through swarm intelligence.

---

## What is Particle Swarm Optimization (PSO)?

The core of this project is based on **Kennedy and Eberhart's Particle Swarm Optimization (1995)**, inspired by the social behavior of bird flocking. Instead of testing millions of combinations one by one, the system uses a swarm intelligence approach:

1.  **Swarm & Particles:** The system creates 30 random timetables (called "Particles").
2.  **Fitness Function:** Each timetable is scored. If a teacher has two classes at once, or a room is double-booked, the score (Fitness) goes down.
3.  **Personal Best (pBest):** Each particle remembers the best solution it has found.
4.  **Global Best (gBest):** The entire swarm tracks the single best solution found by any particle.
5.  **Velocity & Position Update:** Particles adjust their solutions by moving toward their pBest and gBest using a sigmoid-based discrete PSO approach.
6.  **Convergence:** After about 15-40 iterations, the system converges on a **perfect, clash-free schedule**.

---

## Technical Architecture

### Backend (The Engine)
- **Node.js & Express:** Handles the API and serves the frontend.
- **PSO Engine (`psoEngine.js`):** The custom-built brain of the project that handles the swarm intelligence logic.
- **SQLite Database:** A high-performance, local database used to store all university data (Teachers, Courses, Rooms).

### Frontend (The Dashboard)
- **GSAP (GreenSock):** Used for cinematic, high-end animations and 3D card effects.
- **Chart.js:** Visualizes the convergence of fitness so you can see the algorithm optimizing in real-time.
- **Glassmorphism UI:** A modern, premium design aesthetic focused on user experience.

---

## Key Features

### 1. Smart Data Importer
- **Magic Paste:** Copy data directly from Excel or ChatGPT and paste it into the dashboard for instant processing.
- **CSV Support:** Bulk-upload your entire university database with a single click.

### 2. Faculty-Friendly Results
- **Dynamic Calendar View:** A beautiful 5-day grid that includes teacher avatars, making it easy for staff to identify their slots.
- **Real-Time Filtering:** Instantly filter the final timetable by teacher name or room number.

### 3. Optimization Analytics
- Shows a "Before vs. After" comparison (Random Schedule vs. PSO-Optimized Schedule).
- Displays a real-time graph of the fitness score improvement across iterations.

---

## How to Run Locally

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Start the Server:**
    ```bash
    node server.js
    ```
3.  **Open in Browser:**
    Go to `http://localhost:3000`

---

## Deployment to Vercel/GitHub
This project is built to be production ready.
- **GitHub:** Push the code to a repo.
- **Vercel:** Connect your GitHub repo. (Note: Since this uses a local SQLite file, data resets on each new deployment. For permanent cloud storage, link a PostgreSQL database).

---

**Developed for the University Timetable PSO Project - Combining AI and Design.**
