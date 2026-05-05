# ⚡ TimetableGA: Evolutionary University Scheduling

TimetableGA is a professional-grade University Timetable Scheduling System powered by a **Genetic Algorithm (GA)**. It automates the complex task of generating clash-free schedules for courses, teachers, and rooms, ensuring 100% optimization through evolutionary computing.

---

## 🧬 What is the Genetic Algorithm (GA)?

The core of this project is based on **Charles Darwin's Theory of Evolution**. Instead of testing millions of combinations one by one (which would take years), the system uses an "Evolutionary" approach:

1.  **Population & Chromosomes:** The system creates 30 random timetables (called "Chromosomes").
2.  **Fitness Function:** Each timetable is "scored." If a teacher has two classes at once, or a room is double-booked, the score (Fitness) goes down.
3.  **Natural Selection:** The system keeps the "strongest" timetables and discards the "weak" ones.
4.  **Crossover & Mutation:** The best timetables "breed" to create children. We also add random "Mutations" (like swapping a room) to find even better solutions.
5.  **Convergence:** After about 10–20 generations, the system converges on a **perfect, clash-free schedule**.

---

## 🛠️ Technical Architecture

### **Backend (The Engine)**
- **Node.js & Express:** Handles the API and serves the frontend.
- **Genetic Algorithm Engine (`gaEngine.js`):** The custom-built brain of the project that handles the evolutionary logic.
- **SQLite Database:** A high-performance, local database used to store all university data (Teachers, Courses, Rooms).

### **Frontend (The Dashboard)**
- **GSAP (GreenSock):** Used for cinematic, high-end animations and 3D card effects.
- **Chart.js:** Visualizes the "Evolution of Fitness" so you can see the AI thinking in real-time.
- **Glassmorphism UI:** A modern, premium design aesthetic focused on user experience.

---

## ✨ Key Features & Automation

### **1. Magic Data Importer**
To solve the friction of manual data entry, we implemented two "SaaS-style" features:
- **Magic Paste:** Copy data directly from Excel or ChatGPT and paste it into the dashboard for instant processing.
- **CSV Support:** Bulk-upload your entire university database with a single click.

### **2. Faculty-Friendly Results**
- **Dynamic Calendar View:** A beautiful 5-day grid that includes **Teacher Avatars**, making it easy for staff to identify their slots.
- **Real-Time Filtering:** Instantly filter the final timetable by Teacher name or Room number.

### **3. Evolutionary Analytics**
- Shows a "Before vs. After" comparison (Random Schedule vs. GA-Optimized Schedule).
- Displays a real-time graph of the fitness score improvement across generations.

---

## 🚀 How to Run Locally

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

## 🌐 Deployment to Vercel/GitHub
This project is built to be "Production Ready." 
- **GitHub:** Push the code to a repo.
- **Vercel:** Connect your GitHub repo. (Note: Since this uses a local SQLite file, data resets on each new deployment. For permanent cloud storage, link a PostgreSQL database).

---

**Developed for the University Timetable GA Project — Combining AI and Design.**
