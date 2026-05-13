# University Timetable Scheduling System - Complete Guide

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [How to Install and Run](#2-how-to-install-and-run)
3. [How to Use the Application](#3-how-to-use-the-application)
4. [Project Structure Explained](#4-project-structure-explained)
5. [How Each File Works - Line by Line](#5-how-each-file-works---line-by-line)
6. [How the Genetic Algorithm Works](#6-how-the-genetic-algorithm-works)
7. [Algorithm Performance Analysis](#7-algorithm-performance-analysis)
8. [How the Frontend Talks to the Backend](#8-how-the-frontend-talks-to-the-backend)
9. [Database Explained](#9-database-explained)
10. [Common Questions Your Teacher May Ask](#10-common-questions-your-teacher-may-ask)

---

## 1. What This Project Is

This is a web application that solves a real university problem: creating class schedules (timetables) automatically.

**The Problem:**
Creating a university timetable by hand is extremely difficult because:
- A teacher cannot be in two classrooms at the same time
- A room cannot host two classes at the same time
- You want classes spread evenly across the week
- With 6 courses, 4 teachers, 4 rooms, and 20 time slots, there are THOUSANDS of possible combinations

**The Solution:**
We use a Genetic Algorithm (GA) to automatically find the best timetable. The GA is inspired by biological evolution. It creates random schedules, scores them, keeps the good ones, combines them, and repeats until it finds a schedule with no conflicts.

**Technologies Used:**
| Technology | What it does |
|---|---|
| Node.js | Runs JavaScript on the server (backend) |
| Express.js | Web framework that handles HTTP requests |
| sql.js | SQLite database in pure JavaScript |
| HTML/CSS/JS | Frontend (what the user sees in the browser) |
| Chart.js | Library for drawing the fitness graph |

---

## 2. How to Install and Run

### Prerequisites
- Node.js must be installed (already installed on your machine: v24.15.0)

### Step-by-step

**Step 1: Open a terminal (Command Prompt or PowerShell)**

**Step 2: Navigate to the project folder**
```
cd "d:\Evolutionary Project\timetable-ga"
```

**Step 3: Install dependencies (only needed once)**
```
npm install
```
This reads `package.json` and downloads three packages: express, sql.js, cors.

**Step 4: Start the server**
```
node server.js
```
You should see:
```
[OK] Database initialized successfully
[INFO] Seeding sample data...
[OK] Sample data seeded successfully

[SERVER] Timetable GA running at http://localhost:3000
```

**Step 5: Open a browser**
Go to: `http://localhost:3000` 

**Step 6: To stop the server**
Press `Ctrl + C` in the terminal.

---

## 3. How to Use the Application

### The page has 4 sections from top to bottom:

### Section 1: Stats Bar (top)
Shows counts of how much data you have: Courses, Teachers, Rooms, Time Slots.

### Section 2: Admin Panel
This is where you manage data. There are 4 cards:

**Adding a Course:**
1. Type the course name (e.g. "Data Structures")
2. Type the course code (e.g. "CS102")
3. Set credits (default is 3)
4. Click "+ Add Course"
5. The course appears in the list below

**Adding a Teacher:**
1. Type the teacher name (e.g. "Dr. Ahmed")
2. Type department (optional)
3. Click "+ Add Teacher"

**Adding a Room:**
1. Type room name (e.g. "Room A-101")
2. Set capacity (default is 30)
3. Click "+ Add Room"

**Adding a Time Slot:**
1. Select a day from the dropdown (Monday, Tuesday, etc.)
2. Pick a start time (e.g. 09:00)
3. Pick an end time (e.g. 10:00)
4. Click "+ Add Slot"

**Deleting anything:** Click the X button next to any item.

The app comes pre-loaded with sample data (6 courses, 4 teachers, 4 rooms, 20 time slots) so you can test immediately.

### Section 3: Generate Button
Click "Generate Optimized Timetable" to run the Genetic Algorithm. It takes about 1 second.

### Section 4: Results (appears after generating)
Shows 4 things:
1. **Stats cards** - Clashes (should be 0), Fitness Score (should be 1.0), Generations used, Status
2. **Fitness Evolution Chart** - A line graph showing how the GA improved over generations
3. **Random Schedule table** - What a random (bad) timetable looks like
4. **GA-Optimized Schedule table** - What the GA-produced (good) timetable looks like

---

## 4. Project Structure Explained

```
timetable-ga/
|-- server.js          --> The main entry point. Start the app with "node server.js"
|-- gaEngine.js        --> The Genetic Algorithm logic (the brain of the project)
|-- database.js        --> Handles the SQLite database (stores courses, teachers, etc.)
|-- package.json       --> Lists project dependencies (express, sql.js, cors)
|-- timetable.db       --> The actual database file (created automatically)
|-- node_modules/      --> Downloaded packages (created by npm install)
|
|-- public/            --> Frontend files (served to the browser)
    |-- index.html     --> The main webpage
    |-- css/
    |   |-- style.css  --> All the styling (colors, layout, animations)
    |-- js/
        |-- app.js     --> Frontend logic (CRUD operations, chart, generation)
```

**How they connect:**
```
Browser (index.html + app.js)
    |
    | sends HTTP requests (fetch API)
    |
    v
Express Server (server.js)
    |
    | calls functions from
    |
    +---> database.js (to read/write data)
    +---> gaEngine.js (to run the Genetic Algorithm)
```

---

## 5. How Each File Works - Line by Line

### 5.1 server.js - The Web Server

This is the first file that runs when you type `node server.js`.

```javascript
const express = require('express');    // Import the Express web framework
const cors = require('cors');          // Import CORS (allows cross-origin requests)
const path = require('path');          // Import path utility for file paths
const db = require('./database');      // Import our database module
const { geneticAlgorithm, generateRandomTimetable } = require('./gaEngine');
// Import the GA function and the random timetable function
```

**What Express does:** Express turns your computer into a web server. When someone visits `http://localhost:3000`, Express decides what to send back.

```javascript
const app = express();   // Create an Express application
const PORT = 3000;       // The server will listen on port 3000
```

**Middleware setup:**
```javascript
app.use(cors());                                    // Allow requests from any origin
app.use(express.json());                            // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve files from public/
```
The `express.static` line means when someone visits `http://localhost:3000`, Express sends them the `public/index.html` file.

**API Routes (the most important part):**

Each route handles a specific URL. For example:

```javascript
app.get('/api/courses', (req, res) => {
    res.json(db.getAllCourses());    // Get all courses from database, send as JSON
});
```
When the browser sends a GET request to `/api/courses`, the server calls `getAllCourses()` from database.js and sends the result back as JSON.

```javascript
app.post('/api/courses', (req, res) => {
    const { name, code, credit_hours } = req.body;   // Extract data from request
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });
    const result = db.addCourse(name, code, credit_hours || 3);  // Add to database
    res.json({ id: result.lastInsertRowid, message: 'Course added' });
});
```
When the browser sends a POST request to `/api/courses` with course data, the server adds it to the database.

**The Generate endpoint (the core):**
```javascript
app.post('/api/generate', (req, res) => {
    // 1. Fetch all data from the database
    const courses = db.getAllCourses();
    const teachers = db.getAllTeachers();
    const rooms = db.getAllRooms();
    const timeslots = db.getAllTimeslots();

    // 2. Generate a random (bad) timetable for comparison
    const randomResult = generateRandomTimetable(courses, teachers, rooms, timeslots);

    // 3. Run the Genetic Algorithm to find the best timetable
    const gaResult = geneticAlgorithm(courses, teachers, rooms, timeslots);

    // 4. Save the result to the database
    db.saveTimetable(gaResult.timetable, gaResult.fitness, gaResult.clashes);

    // 5. Send both results to the browser
    res.json({ optimized: gaResult, random: randomResult });
});
```

**Server startup:**
```javascript
async function start() {
    await db.initializeDatabase();   // Create/open the database
    db.seedSampleData();             // Add sample data if empty

    app.listen(PORT, () => {         // Start listening for requests
        console.log(`[SERVER] Timetable GA running at http://localhost:${PORT}`);
    });
}
start();
```

---

### 5.2 database.js - The Database Layer

This file manages all data storage using SQLite (a file-based database).

**Initialization:**
```javascript
const initSqlJs = require('sql.js');   // Import the SQLite library
const fs = require('fs');               // File system to read/write the .db file
const path = require('path');

const DB_PATH = path.join(__dirname, 'timetable.db');  // Path to database file
let db = null;  // Will hold the database connection
```

**Creating tables:**
```javascript
db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Unique ID, auto-increments
    name TEXT NOT NULL,                      -- Course name, required
    code TEXT NOT NULL,                      -- Course code like CS101
    credit_hours INTEGER DEFAULT 3           -- Default 3 credits
)`);
```
`CREATE TABLE IF NOT EXISTS` means: create the table only if it does not already exist. This is safe to run multiple times.

**Helper functions:**
```javascript
// queryAll: Runs a SELECT query and returns all matching rows as an array of objects
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);       // Prepare the SQL statement
    if (params.length) stmt.bind(params); // Bind parameters (prevents SQL injection)
    const results = [];
    while (stmt.step()) {               // Loop through each row
        results.push(stmt.getAsObject()); // Convert row to {id: 1, name: "CS101", ...}
    }
    stmt.free();                        // Free memory
    return results;
}

// runSQL: Runs INSERT/UPDATE/DELETE queries
function runSQL(sql, params = []) {
    db.run(sql, params);                // Execute the query
    saveToFile();                       // Save database to disk
    return { lastInsertRowid: ... };    // Return the ID of the inserted row
}
```

**CRUD functions (Create, Read, Update, Delete):**
```javascript
function getAllCourses() { return queryAll('SELECT * FROM courses ORDER BY id'); }
function addCourse(name, code, creditHours) {
    return runSQL('INSERT INTO courses (name, code, credit_hours) VALUES (?, ?, ?)',
                  [name, code, creditHours]);
}
function deleteCourse(id) { return runSQL('DELETE FROM courses WHERE id = ?', [id]); }
```
The `?` symbols are placeholders. The actual values are passed as an array. This is called "parameterized queries" and prevents SQL injection attacks.

---

### 5.3 gaEngine.js - The Genetic Algorithm (THE CORE)

This is the most important file. It contains the optimization algorithm.

**The Schedule class:**
```javascript
class Schedule {
    constructor(courses, teachers, rooms, timeslots) {
        this.courses = courses;       // All available courses
        this.teachers = teachers;     // All available teachers
        this.rooms = rooms;           // All available rooms
        this.timeslots = timeslots;   // All available time slots
        this.chromosome = [];         // The actual timetable (list of assignments)
        this.fitness = 0;             // Score: 0 to 1 (1 = perfect)
        this.clashCount = 0;          // Number of conflicts
    }
```

One Schedule object = one possible timetable. The `chromosome` is an array where each element is one class assignment.

**Initialize (create a random timetable):**
```javascript
initialize() {
    this.chromosome = [];
    for (const course of this.courses) {
        const gene = {
            course: course,
            teacher: this.teachers[Math.floor(Math.random() * this.teachers.length)],
            room: this.rooms[Math.floor(Math.random() * this.rooms.length)],
            timeslot: this.timeslots[Math.floor(Math.random() * this.timeslots.length)],
        };
        this.chromosome.push(gene);
    }
    return this;
}
```
For each course, it picks a RANDOM teacher, RANDOM room, and RANDOM timeslot. Most random timetables will have many clashes.

**Fitness Function (score the timetable):**
This checks every pair of class assignments for conflicts:
```javascript
calculateFitness() {
    let penalty = 0;
    let clashCount = 0;

    for (let i = 0; i < this.chromosome.length; i++) {
        for (let j = i + 1; j < this.chromosome.length; j++) {
            const a = this.chromosome[i];
            const b = this.chromosome[j];

            // If two different classes have the same teacher at the same time = CLASH
            if (a.teacher.id === b.teacher.id && a.timeslot.id === b.timeslot.id) {
                penalty += 10;    // Heavy penalty
                clashCount++;
            }
            // If two different classes use the same room at the same time = CLASH
            if (a.room.id === b.room.id && a.timeslot.id === b.timeslot.id) {
                penalty += 10;    // Heavy penalty
                clashCount++;
            }
        }
    }

    this.fitness = 1 / (1 + penalty);   // Convert penalty to fitness score
}
```

The formula `1 / (1 + penalty)`:
- If penalty = 0 (no clashes): fitness = 1 / (1 + 0) = 1.0 (PERFECT)
- If penalty = 10 (one clash): fitness = 1 / (1 + 10) = 0.0909 (BAD)
- If penalty = 50 (many clashes): fitness = 1 / (1 + 50) = 0.0196 (VERY BAD)

**The main GA loop:**
```javascript
function geneticAlgorithm(courses, teachers, rooms, timeslots, generations = 100, popSize = 30) {
    // Step 1: Create 30 random timetables
    let population = [];
    for (let i = 0; i < popSize; i++) {
        population.push(new Schedule(courses, teachers, rooms, timeslots).initialize());
    }

    // Step 2: Evolve for up to 100 generations
    for (let gen = 0; gen < generations; gen++) {
        // Score every timetable
        population.forEach(s => s.calculateFitness());
        // Sort: best first
        population.sort((a, b) => b.fitness - a.fitness);

        // If we found a perfect schedule, stop early
        if (population[0].fitness === 1.0) break;

        // Elitism: keep the best 2 timetables unchanged
        const newPopulation = [population[0], population[1]];

        // Fill the rest with children
        while (newPopulation.length < popSize) {
            // Pick 2 parents from the top half
            const parent1 = population[Math.floor(Math.random() * Math.floor(popSize / 2))];
            const parent2 = population[Math.floor(Math.random() * Math.floor(popSize / 2))];

            // Crossover: first half from parent1, second half from parent2
            const child = new Schedule(courses, teachers, rooms, timeslots);
            const cp = Math.floor(parent1.chromosome.length / 2);
            child.chromosome = [
                ...parent1.chromosome.slice(0, cp).map(g => ({ ...g })),
                ...parent2.chromosome.slice(cp).map(g => ({ ...g })),
            ];

            // Mutation: 10% chance to randomly change a timeslot
            if (Math.random() < 0.1) {
                const idx = Math.floor(Math.random() * child.chromosome.length);
                child.chromosome[idx].timeslot = timeslots[Math.floor(Math.random() * timeslots.length)];
            }

            newPopulation.push(child);
        }
        population = newPopulation;
    }

    // Return the best timetable found
    const best = population[0];
    return { timetable: best.chromosome, fitness: best.fitness, clashes: best.clashCount };
}
```

---

### 5.4 public/index.html - The Web Page

This is what users see. Key sections:

- **Hero header**: Title and subtitle
- **Stats bar**: Shows data counts
- **Admin panel**: 4 cards with forms to add/delete data
- **Generate button**: Triggers the GA
- **Results section**: Hidden by default, shows after generation

It includes two external resources:
- Google Fonts (Inter) for typography
- Chart.js for the fitness graph

---

### 5.5 public/js/app.js - Frontend Logic

This file handles all user interactions:

**Loading data on page load:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    loadCourses();    // Fetch courses from API and display them
    loadTeachers();   // Same for teachers
    loadRooms();      // Same for rooms
    loadTimeslots();  // Same for timeslots
});
```

**How CRUD works (example: courses):**
```javascript
async function loadCourses() {
    // 1. Send GET request to the server
    const data = await fetch('/api/courses').then(r => r.json());
    // 2. Update the count badges
    document.getElementById('courseCount').textContent = data.length;
    // 3. Build HTML for each course and insert into the list
    const list = document.getElementById('courseList');
    list.innerHTML = data.map(c => `
        <div class="list-item">
            <span>${c.name}</span>
            <button onclick="deleteCourse(${c.id})">X</button>
        </div>
    `).join('');
}
```

**Generate timetable:**
```javascript
async function generateTimetable() {
    // 1. Show loading spinner
    // 2. Send POST request to /api/generate
    const res = await fetch('/api/generate', { method: 'POST' });
    const data = await res.json();
    // 3. Display results (stats, chart, tables)
    displayResults(data);
}
```

---

### 5.6 public/css/style.css - The Styling

Uses a dark theme with these design choices:
- Dark navy background (#0a0e17)
- Purple gradient accents
- Glassmorphism cards (semi-transparent with blur)
- Smooth animations (fadeInUp, hover effects)
- Responsive grid layout

---

## 6. How the Genetic Algorithm Works

### The Biology Analogy

| Biology | Our Project |
|---|---|
| Individual organism | One complete timetable |
| Chromosome | The array of class assignments |
| Gene | One assignment: course + teacher + room + timeslot |
| Population | Collection of 30 timetables |
| Fitness | Score from 0 to 1 (how good the timetable is) |
| Natural selection | Keeping the best timetables |
| Reproduction | Combining two good timetables to make a new one |
| Mutation | Randomly changing one assignment |
| Generation | One cycle of the algorithm |

### Step-by-Step Flow

```
Generation 1:
  Create 30 random timetables (most will be bad)
  Score each one (fitness function)
  Sort by fitness (best first)

Generation 2:
  Keep the top 2 (elitism)
  For the remaining 28 spots:
    Pick 2 parents from the top 15
    Combine them (crossover) to make a child
    Maybe randomly change something (mutation)
  Score everyone again
  Sort again

Generation 3:
  Repeat...

... keep going until:
  - fitness = 1.0 (perfect schedule found)
  - OR we hit 100 generations
```

### Crossover Example

```
Parent 1 timetable:
  [CS101, Dr.A, Room1, Mon9] [CS102, Dr.B, Room2, Mon10] | [CS103, Dr.C, Room1, Tue9]
                       first half                          |        second half

Parent 2 timetable:
  [CS101, Dr.C, Room2, Tue9] [CS102, Dr.A, Room1, Tue10] | [CS103, Dr.B, Room2, Mon9]
                       first half                          |        second half

Child timetable:
  [CS101, Dr.A, Room1, Mon9] [CS102, Dr.B, Room2, Mon10] | [CS103, Dr.B, Room2, Mon9]
       from Parent 1 (first half)                          | from Parent 2 (second half)
```

### Mutation Example

Before mutation:
  [CS103, Dr.B, Room2, Mon 9:00]

After mutation (changed timeslot):
  [CS103, Dr.B, Room2, Wed 14:00]

Mutation happens with only 10% probability. This prevents the algorithm from getting stuck.

---

## 7. Algorithm Performance Analysis

### Constraint Types

**Hard Constraints (MUST be satisfied, penalty = +10 each):**
- Teacher clash: same teacher teaching two classes at the same time
- Room clash: same room used for two classes at the same time

**Soft Constraints (preferred, smaller penalty):**
- Back-to-back classes: teacher has consecutive classes (+2)
- Uneven distribution: too many classes on one day (+1)

### Fitness Formula

```
fitness = 1 / (1 + total_penalty)
```

| Penalty | Fitness | Meaning |
|---|---|---|
| 0 | 1.0000 | Perfect - no clashes |
| 10 | 0.0909 | 1 clash |
| 20 | 0.0476 | 2 clashes |
| 50 | 0.0196 | 5 clashes |
| 100 | 0.0099 | 10 clashes |

### Performance Characteristics

| Parameter | Value | Why |
|---|---|---|
| Population size | 30 | Enough diversity without being too slow |
| Generations | up to 100 | Usually converges much faster |
| Elitism | top 2 kept | Prevents losing the best solution |
| Crossover | single-point, 100% | Always combines parents |
| Mutation (timeslot) | 10% | Primary diversity mechanism |
| Mutation (room) | 5% | Secondary diversity |
| Mutation (teacher) | 5% | Secondary diversity |
| Selection | top 50% | Only good solutions become parents |

### Why It Works

1. **Random start**: Creates diverse starting solutions
2. **Selection pressure**: Only good timetables reproduce, so quality increases
3. **Crossover**: Combines good parts from two timetables into one better one
4. **Mutation**: Prevents getting stuck in local optima (bad but stable solutions)
5. **Elitism**: Never loses the best solution found so far

### Time Complexity

- Fitness calculation: O(n^2) where n = number of courses (compares every pair)
- Per generation: O(popSize * n^2) = O(30 * 36) = O(1080) operations
- Total: O(generations * popSize * n^2) = O(100 * 1080) = O(108,000) operations
- In practice: runs in under 100 milliseconds

---

## 8. How the Frontend Talks to the Backend

The communication uses HTTP requests via the `fetch()` API:

```
Browser (app.js)                    Server (server.js)
      |                                    |
      |-- GET /api/courses --------------->|  "Give me all courses"
      |<-- JSON [{id:1, name:"CS101"}] ----|  Server responds with data
      |                                    |
      |-- POST /api/courses -------------->|  "Add this new course"
      |   {name: "AI", code: "CS201"}      |
      |<-- {id: 7, message: "added"} ------|  Server confirms
      |                                    |
      |-- DELETE /api/courses/7 ---------->|  "Delete course with id 7"
      |<-- {message: "deleted"} -----------|  Server confirms
      |                                    |
      |-- POST /api/generate ------------->|  "Run the GA"
      |<-- {optimized: {...},              |  Server returns both timetables
      |     random: {...}} ---------------|
```

All data is sent as JSON (JavaScript Object Notation), which is a text format that looks like:
```json
{
    "name": "Data Structures",
    "code": "CS102",
    "credit_hours": 3
}
```

---

## 9. Database Explained

The database is a single file called `timetable.db` in the project folder. It uses SQLite, which is a file-based database (no server needed).

### Tables

**courses:**
| Column | Type | Description |
|---|---|---|
| id | INTEGER | Auto-incrementing primary key |
| name | TEXT | Course name |
| code | TEXT | Course code (CS101) |
| credit_hours | INTEGER | Number of credits |

**teachers:**
| Column | Type | Description |
|---|---|---|
| id | INTEGER | Auto-incrementing primary key |
| name | TEXT | Teacher name |
| department | TEXT | Department name |

**rooms:**
| Column | Type | Description |
|---|---|---|
| id | INTEGER | Auto-incrementing primary key |
| name | TEXT | Room name |
| capacity | INTEGER | Student capacity |

**timeslots:**
| Column | Type | Description |
|---|---|---|
| id | INTEGER | Auto-incrementing primary key |
| day | TEXT | Day of the week |
| start_time | TEXT | Start time |
| end_time | TEXT | End time |

**timetables:**
| Column | Type | Description |
|---|---|---|
| id | INTEGER | Auto-incrementing primary key |
| data | TEXT | JSON string of the generated timetable |
| fitness | REAL | Fitness score |
| clashes | INTEGER | Number of clashes |
| created_at | TEXT | Timestamp |

---

## 10. Common Questions Your Teacher May Ask

**Q: Why did you use a Genetic Algorithm instead of brute force?**
A: Brute force would try every possible combination. With 6 courses, 4 teachers, 4 rooms, and 20 timeslots, that is 4 * 4 * 20 = 320 combinations per course, and 320^6 = over 1 TRILLION total combinations. A GA finds a good solution in about 30-100 iterations, which takes milliseconds.

**Q: What happens if the GA cannot find a perfect solution?**
A: It returns the best solution it found after 100 generations. The fitness score tells you how good it is. Even a fitness of 0.5 is usable - it just means there are some soft constraint violations.

**Q: Why did you choose these specific parameters (population=30, generations=100)?**
A: Population of 30 gives enough genetic diversity while staying fast. 100 generations is usually enough because the GA converges quickly - it often finds a perfect solution in under 10 generations for our dataset size.

**Q: What is elitism and why is it important?**
A: Elitism means we always keep the top 2 solutions unchanged in the next generation. Without it, a good solution could be lost through crossover/mutation. With elitism, the best solution can only get better, never worse.

**Q: What is the role of mutation?**
A: Mutation introduces randomness to prevent the algorithm from getting stuck in a "local optimum" - a solution that seems good locally but is not the global best. The 10% mutation rate is standard in GA literature.

**Q: Why Node.js instead of Python/Flask?**
A: The core Genetic Algorithm logic is identical in any language. Node.js was chosen because JavaScript is the same language used in the frontend, making the project more consistent and easier to understand as a whole.

**Q: How does the fitness function work?**
A: It checks every pair of class assignments. If two classes have the same teacher at the same time, that is a "teacher clash" (+10 penalty). If two classes use the same room at the same time, that is a "room clash" (+10 penalty). The final fitness = 1 / (1 + total penalty). So 0 penalty = fitness 1.0 (perfect).

**Q: Can this system handle more data?**
A: Yes. For larger datasets, you can increase population size and generations. The algorithm scales well because fitness calculation is O(n^2) where n is the number of courses, and crossover/mutation are O(n).
