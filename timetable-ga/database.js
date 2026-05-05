// ============================================
// DATABASE LAYER - SQLite Setup & Helper Queries
// ============================================
// Uses sql.js (pure JavaScript SQLite - no native compilation needed)
// Auto-creates timetable.db and all required tables on startup

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Vercel serverless functions have read-only filesystems, so we must write to /tmp
const isVercel = process.env.VERCEL === '1';
const DB_PATH = isVercel ? '/tmp/timetable.db' : path.join(__dirname, 'timetable.db');
let db = null;

// ============================================
// INITIALIZE DATABASE
// ============================================
async function initializeDatabase() {
    const SQL = await initSqlJs();

    // Load existing DB or create new one
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        credit_hours INTEGER DEFAULT 3,
        file_url TEXT DEFAULT ''
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT DEFAULT '',
        image_url TEXT DEFAULT ''
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        capacity INTEGER DEFAULT 30
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS timeslots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS timetables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        fitness REAL NOT NULL,
        clashes INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    )`);

    saveToFile();
    console.log('[OK] Database initialized successfully');
    return db;
}

// Save in-memory DB to disk
function saveToFile() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// Helper: run query and return all rows as array of objects
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

// Helper: run insert/update/delete
function runSQL(sql, params = []) {
    db.run(sql, params);
    saveToFile();
    const res = db.exec("SELECT last_insert_rowid()");
    const rowid = (res && res[0] && res[0].values && res[0].values[0]) ? res[0].values[0][0] : null;
    return { lastInsertRowid: rowid };
}

// ============================================
// COURSES CRUD
// ============================================
function getAllCourses() { return queryAll('SELECT * FROM courses ORDER BY id'); }
function addCourse(name, code, creditHours, fileUrl = '') { return runSQL('INSERT INTO courses (name, code, credit_hours, file_url) VALUES (?, ?, ?, ?)', [name, code, creditHours, fileUrl]); }
function deleteCourse(id) { return runSQL('DELETE FROM courses WHERE id = ?', [id]); }

// ============================================
// TEACHERS CRUD
// ============================================
function getAllTeachers() { return queryAll('SELECT * FROM teachers ORDER BY id'); }
function addTeacher(name, department, imageUrl = '') { return runSQL('INSERT INTO teachers (name, department, image_url) VALUES (?, ?, ?)', [name, department, imageUrl]); }
function deleteTeacher(id) { return runSQL('DELETE FROM teachers WHERE id = ?', [id]); }

// ============================================
// ROOMS CRUD
// ============================================
function getAllRooms() { return queryAll('SELECT * FROM rooms ORDER BY id'); }
function addRoom(name, capacity) { return runSQL('INSERT INTO rooms (name, capacity) VALUES (?, ?)', [name, capacity]); }
function deleteRoom(id) { return runSQL('DELETE FROM rooms WHERE id = ?', [id]); }

// ============================================
// TIMESLOTS CRUD
// ============================================
function getAllTimeslots() { return queryAll('SELECT * FROM timeslots ORDER BY id'); }
function addTimeslot(day, startTime, endTime) { return runSQL('INSERT INTO timeslots (day, start_time, end_time) VALUES (?, ?, ?)', [day, startTime, endTime]); }
function deleteTimeslot(id) { return runSQL('DELETE FROM timeslots WHERE id = ?', [id]); }

// ============================================
// TIMETABLES
// ============================================
function saveTimetable(data, fitness, clashes) { return runSQL('INSERT INTO timetables (data, fitness, clashes) VALUES (?, ?, ?)', [JSON.stringify(data), fitness, clashes]); }
function getLatestTimetable() { return queryAll('SELECT * FROM timetables ORDER BY id DESC LIMIT 1')[0] || null; }

// ============================================
// SEED SAMPLE DATA
// ============================================
function seedSampleData() {
    const count = queryAll('SELECT COUNT(*) as count FROM courses')[0].count;
    if (count > 0) return;

    console.log('[INFO] Seeding sample data...');

    const courses = [
        ['Introduction to Programming', 'CS101', 3],
        ['Data Structures', 'CS102', 3],
        ['Database Systems', 'CS103', 3],
        ['Web Development', 'CS104', 3],
        ['Operating Systems', 'CS105', 3],
        ['Computer Networks', 'CS106', 3],
    ];
    courses.forEach(([n, c, h]) => addCourse(n, c, h));

    const teachers = [
        ['Dr. Alan Turing', 'Computer Science', 'https://ui-avatars.com/api/?name=Alan+Turing&background=6366f1&color=fff'],
        ['Dr. Sara Ali', 'Computer Science', 'https://ui-avatars.com/api/?name=Sara+Ali&background=ec4899&color=fff'],
        ['Prof. Usman Tariq', 'Software Engineering', 'https://ui-avatars.com/api/?name=Usman+Tariq&background=3b82f6&color=fff'],
        ['Dr. Fatima Noor', 'Information Technology', 'https://ui-avatars.com/api/?name=Fatima+Noor&background=10b981&color=fff'],
    ];
    teachers.forEach(([n, d, i]) => addTeacher(n, d, i));

    const rooms = [
        ['Room A-101', 40], ['Room A-102', 35],
        ['Lab B-201', 30], ['Room C-301', 50],
    ];
    rooms.forEach(([n, c]) => addRoom(n, c));

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = [['09:00', '10:00'], ['10:00', '11:00'], ['11:00', '12:00'], ['14:00', '15:00']];
    days.forEach(day => times.forEach(([s, e]) => addTimeslot(day, s, e)));

    console.log('[OK] Sample data seeded successfully');
}

function clearAllData() {
    db.run('DELETE FROM courses');
    db.run('DELETE FROM teachers');
    db.run('DELETE FROM rooms');
    db.run('DELETE FROM timeslots');
    db.run('DELETE FROM timetables');
    db.run('DELETE FROM sqlite_sequence WHERE name IN ("courses", "teachers", "rooms", "timeslots", "timetables")');
    saveToFile();
    console.log('[OK] All data cleared');
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    initializeDatabase, seedSampleData, clearAllData,
    getAllCourses, addCourse, deleteCourse,
    getAllTeachers, addTeacher, deleteTeacher,
    getAllRooms, addRoom, deleteRoom,
    getAllTimeslots, addTimeslot, deleteTimeslot,
    saveTimetable, getLatestTimetable,
};
