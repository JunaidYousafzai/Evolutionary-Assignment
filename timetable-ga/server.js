// ============================================
// EXPRESS SERVER - API Routes & Static File Serving
// ============================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { particleSwarmOptimization, generateRandomTimetable } = require('./psoEngine');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB for serverless environments (like Vercel) before handling routes
let isDbInitialized = false;
app.use(async (req, res, next) => {
    if (!isDbInitialized) {
        await db.initializeDatabase();
        db.seedSampleData();
        isDbInitialized = true;
    }
    next();
});

// ============================================
// COURSES API
// ============================================
app.get('/api/courses', (req, res) => {
    res.json(db.getAllCourses());
});

app.post('/api/courses', (req, res) => {
    const { name, code, credit_hours } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });
    const result = db.addCourse(name, code, credit_hours || 3);
    res.json({ id: result.lastInsertRowid, message: 'Course added' });
});

app.delete('/api/courses/:id', (req, res) => {
    db.deleteCourse(req.params.id);
    res.json({ message: 'Course deleted' });
});

// ============================================
// TEACHERS API
// ============================================
app.get('/api/teachers', (req, res) => {
    res.json(db.getAllTeachers());
});

app.post('/api/teachers', (req, res) => {
    const { name, department } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = db.addTeacher(name, department || '');
    res.json({ id: result.lastInsertRowid, message: 'Teacher added' });
});

app.delete('/api/teachers/:id', (req, res) => {
    db.deleteTeacher(req.params.id);
    res.json({ message: 'Teacher deleted' });
});

// ============================================
// ROOMS API
// ============================================
app.get('/api/rooms', (req, res) => {
    res.json(db.getAllRooms());
});

app.post('/api/rooms', (req, res) => {
    const { name, capacity } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = db.addRoom(name, capacity || 30);
    res.json({ id: result.lastInsertRowid, message: 'Room added' });
});

app.delete('/api/rooms/:id', (req, res) => {
    db.deleteRoom(req.params.id);
    res.json({ message: 'Room deleted' });
});

// ============================================
// TIMESLOTS API
// ============================================
app.get('/api/timeslots', (req, res) => {
    res.json(db.getAllTimeslots());
});

app.post('/api/timeslots', (req, res) => {
    const { day, start_time, end_time } = req.body;
    if (!day || !start_time || !end_time) return res.status(400).json({ error: 'Day, start_time, and end_time are required' });
    const result = db.addTimeslot(day, start_time, end_time);
    res.json({ id: result.lastInsertRowid, message: 'Timeslot added' });
});

app.delete('/api/timeslots/:id', (req, res) => {
    db.deleteTimeslot(req.params.id);
    res.json({ message: 'Timeslot deleted' });
});

// ============================================
// GENERATE TIMETABLE API (Core endpoint)
// ============================================
app.post('/api/generate', (req, res) => {
    const courses = db.getAllCourses();
    const teachers = db.getAllTeachers();
    const rooms = db.getAllRooms();
    const timeslots = db.getAllTimeslots();

    if (courses.length === 0 || teachers.length === 0 || rooms.length === 0 || timeslots.length === 0) {
        return res.status(400).json({ error: 'Please add at least one course, teacher, room, and timeslot before generating.' });
    }

    // Generate a random timetable for "before" comparison
    const randomResult = generateRandomTimetable(courses, teachers, rooms, timeslots);

    // Run Particle Swarm Optimization
    const psoResult = particleSwarmOptimization(courses, teachers, rooms, timeslots);

    // Save the full result to the database (for persistence across refresh)
    const fullResult = {
        optimized: psoResult,
        random: randomResult,
    };
    db.saveTimetable(fullResult, psoResult.fitness, psoResult.clashes);

    res.json(fullResult);
});

// ============================================
// GET LAST TIMETABLE (for page refresh persistence)
// ============================================
app.get('/api/last-timetable', (req, res) => {
    const last = db.getLatestTimetable();
    if (!last) return res.status(404).json({ error: 'No timetable generated yet' });
    try {
        const data = JSON.parse(last.data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Failed to parse saved timetable' });
    }
});

app.post('/api/clear-all', (req, res) => {
    db.clearAllData();
    res.json({ message: 'All data cleared' });
});

// ============================================
// START SERVER (Local Development) OR EXPORT APP (Vercel)
// ============================================
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    // Also initialize DB locally before listening
    db.initializeDatabase().then(() => {
        db.seedSampleData();
        app.listen(PORT, () => {
            console.log(`\n[SERVER] Timetable PSO running at http://localhost:${PORT}\n`);
        });
    });
}

module.exports = app;
