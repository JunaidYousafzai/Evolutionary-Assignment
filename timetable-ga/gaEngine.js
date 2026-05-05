// ============================================
// GENETIC ALGORITHM ENGINE
// ============================================
// Core of the project - generates optimized, clash-free
// university timetables using evolutionary computation.

// SCHEDULE CLASS - Represents ONE possible timetable
class Schedule {
    constructor(courses, teachers, rooms, timeslots) {
        this.courses = courses;
        this.teachers = teachers;
        this.rooms = rooms;
        this.timeslots = timeslots;
        this.chromosome = [];
        this.fitness = 0;
        this.clashCount = 0;
    }

    // STEP 1: INITIALIZATION - Create a random timetable
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

    // FITNESS FUNCTION - Score the timetable
    // fitness = 1 / (1 + penalty)
    // Perfect = 1.0, Bad = close to 0
    calculateFitness() {
        let penalty = 0;
        let clashCount = 0;

        for (let i = 0; i < this.chromosome.length; i++) {
            for (let j = i + 1; j < this.chromosome.length; j++) {
                const a = this.chromosome[i];
                const b = this.chromosome[j];

                // HARD: Teacher clash (+10)
                if (a.teacher.id === b.teacher.id && a.timeslot.id === b.timeslot.id) {
                    penalty += 10;
                    clashCount++;
                }
                // HARD: Room clash (+10)
                if (a.room.id === b.room.id && a.timeslot.id === b.timeslot.id) {
                    penalty += 10;
                    clashCount++;
                }
            }
        }

        // SOFT: Back-to-back classes (+2)
        const teacherSlots = {};
        for (const gene of this.chromosome) {
            const tid = gene.teacher.id;
            if (!teacherSlots[tid]) teacherSlots[tid] = [];
            teacherSlots[tid].push(gene.timeslot);
        }
        for (const tid in teacherSlots) {
            const slots = teacherSlots[tid];
            for (let i = 0; i < slots.length; i++) {
                for (let j = i + 1; j < slots.length; j++) {
                    if (slots[i].day === slots[j].day) {
                        const diff = Math.abs(parseInt(slots[i].start_time) - parseInt(slots[j].start_time));
                        if (diff === 1) penalty += 2;
                    }
                }
            }
        }

        // SOFT: Uneven distribution (+1)
        const dayCounts = {};
        for (const gene of this.chromosome) {
            const day = gene.timeslot.day;
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        }
        const dayValues = Object.values(dayCounts);
        if (dayValues.length > 0) {
            const avg = dayValues.reduce((a, b) => a + b, 0) / dayValues.length;
            for (const count of dayValues) {
                if (Math.abs(count - avg) > 1) penalty += 1;
            }
        }

        this.fitness = 1 / (1 + penalty);
        this.clashCount = clashCount;
        return this.fitness;
    }
}

// MAIN GA FUNCTION
function geneticAlgorithm(courses, teachers, rooms, timeslots, generations = 100, popSize = 30) {
    const fitnessHistory = [];

    // Create random population
    let population = [];
    for (let i = 0; i < popSize; i++) {
        population.push(new Schedule(courses, teachers, rooms, timeslots).initialize());
    }

    for (let gen = 0; gen < generations; gen++) {
        population.forEach(s => s.calculateFitness());
        population.sort((a, b) => b.fitness - a.fitness);

        fitnessHistory.push({
            generation: gen + 1,
            bestFitness: population[0].fitness,
            avgFitness: population.reduce((sum, s) => sum + s.fitness, 0) / population.length,
            clashes: population[0].clashCount,
        });

        // Continue evolving for at least a few generations to show a stable graph
        if (population[0].fitness === 1.0 && gen > 20) break;

        // Elitism: keep top 2
        const newPopulation = [population[0], population[1]];

        while (newPopulation.length < popSize) {
            const parent1 = population[Math.floor(Math.random() * Math.floor(popSize / 2))];
            const parent2 = population[Math.floor(Math.random() * Math.floor(popSize / 2))];

            // Crossover
            const child = new Schedule(courses, teachers, rooms, timeslots);
            const cp = Math.floor(parent1.chromosome.length / 2);
            child.chromosome = [
                ...parent1.chromosome.slice(0, cp).map(g => ({ ...g })),
                ...parent2.chromosome.slice(cp).map(g => ({ ...g })),
            ];

            // Mutation: timeslot (10%)
            if (Math.random() < 0.1) {
                const idx = Math.floor(Math.random() * child.chromosome.length);
                child.chromosome[idx] = { ...child.chromosome[idx], timeslot: timeslots[Math.floor(Math.random() * timeslots.length)] };
            }
            // Mutation: room (5%)
            if (Math.random() < 0.05) {
                const idx = Math.floor(Math.random() * child.chromosome.length);
                child.chromosome[idx] = { ...child.chromosome[idx], room: rooms[Math.floor(Math.random() * rooms.length)] };
            }
            // Mutation: teacher (5%)
            if (Math.random() < 0.05) {
                const idx = Math.floor(Math.random() * child.chromosome.length);
                child.chromosome[idx] = { ...child.chromosome[idx], teacher: teachers[Math.floor(Math.random() * teachers.length)] };
            }

            newPopulation.push(child);
        }
        population = newPopulation;
    }

    population.forEach(s => s.calculateFitness());
    population.sort((a, b) => b.fitness - a.fitness);
    const best = population[0];

    return {
        timetable: best.chromosome.map(gene => ({
            course: gene.course.name, courseCode: gene.course.code,
            teacher: gene.teacher.name, room: gene.room.name,
            day: gene.timeslot.day, startTime: gene.timeslot.start_time, endTime: gene.timeslot.end_time,
        })),
        fitness: best.fitness,
        clashes: best.clashCount,
        fitnessHistory,
        generations: fitnessHistory.length,
    };
}

// Generate random (unoptimized) timetable for comparison
function generateRandomTimetable(courses, teachers, rooms, timeslots) {
    const schedule = new Schedule(courses, teachers, rooms, timeslots).initialize();
    schedule.calculateFitness();
    return {
        timetable: schedule.chromosome.map(gene => ({
            course: gene.course.name, courseCode: gene.course.code,
            teacher: gene.teacher.name, room: gene.room.name,
            day: gene.timeslot.day, startTime: gene.timeslot.start_time, endTime: gene.timeslot.end_time,
        })),
        fitness: schedule.fitness,
        clashes: schedule.clashCount,
    };
}

module.exports = { geneticAlgorithm, generateRandomTimetable };
