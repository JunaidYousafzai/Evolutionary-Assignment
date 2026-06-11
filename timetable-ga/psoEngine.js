// ============================================
// PARTICLE SWARM OPTIMIZATION (PSO) ENGINE
// ============================================
// Core of the project - generates optimized, clash-free
// university timetables using swarm intelligence.
//
// PSO Concept:
//   - A swarm of particles explores the solution space
//   - Each particle = one complete timetable
//   - Particles adjust toward their personal best (pBest)
//     and the global best (gBest) found by any particle
//   - Uses Discrete PSO for combinatorial optimization

// PARTICLE CLASS - Represents ONE possible timetable
class Particle {
    constructor(courses, teachers, rooms, timeslots) {
        this.courses = courses;
        this.teachers = teachers;
        this.rooms = rooms;
        this.timeslots = timeslots;
        this.position = [];    // Current solution (array of gene objects)
        this.velocity = [];    // Probability of change for each gene dimension
        this.pBest = null;     // Personal best position
        this.pBestFitness = -Infinity;
        this.fitness = 0;
        this.clashCount = 0;
    }

    // STEP 1: INITIALIZATION - Create a random timetable (particle position)
    initialize() {
        this.position = [];
        this.velocity = [];

        for (const course of this.courses) {
            const gene = {
                course: course,
                teacher: this.teachers[Math.floor(Math.random() * this.teachers.length)],
                room: this.rooms[Math.floor(Math.random() * this.rooms.length)],
                timeslot: this.timeslots[Math.floor(Math.random() * this.timeslots.length)],
            };
            this.position.push(gene);

            // Initialize velocity as probability values [0, 1] for each dimension
            // Higher velocity = higher chance of changing that gene
            this.velocity.push({
                teacher: Math.random() * 0.5,
                room: Math.random() * 0.5,
                timeslot: Math.random() * 0.5,
            });
        }

        return this;
    }

    // FITNESS FUNCTION - Score the timetable
    // fitness = 1 / (1 + penalty)
    // Perfect = 1.0, Bad = close to 0
    calculateFitness() {
        let penalty = 0;
        let clashCount = 0;

        for (let i = 0; i < this.position.length; i++) {
            for (let j = i + 1; j < this.position.length; j++) {
                const a = this.position[i];
                const b = this.position[j];

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
        for (const gene of this.position) {
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
        for (const gene of this.position) {
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

        // Update personal best
        if (this.fitness > this.pBestFitness) {
            this.pBestFitness = this.fitness;
            this.pBest = this.position.map(gene => ({
                course: gene.course,
                teacher: gene.teacher,
                room: gene.room,
                timeslot: gene.timeslot,
            }));
        }

        return this.fitness;
    }
}

// ============================================
// MAIN PSO FUNCTION
// ============================================
// PSO Parameters:
//   w  = inertia weight (keeps particle moving in same direction)
//   c1 = cognitive coefficient (pull toward personal best)
//   c2 = social coefficient (pull toward global best)
//
// Discrete PSO Update Rule:
//   For each gene dimension (teacher, room, timeslot):
//     velocity = w * velocity + c1*r1*(pBest - current) + c2*r2*(gBest - current)
//     if random() < sigmoid(velocity) → update that dimension
//
function particleSwarmOptimization(courses, teachers, rooms, timeslots, iterations = 100, swarmSize = 30) {
    const fitnessHistory = [];

    // PSO Hyperparameters
    const w = 0.7;    // Inertia weight
    const c1 = 1.5;   // Cognitive (personal best attraction)
    const c2 = 1.5;   // Social (global best attraction)

    // Sigmoid function to convert velocity to probability
    function sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    // STEP 1: Initialize swarm with random particles
    const swarm = [];
    for (let i = 0; i < swarmSize; i++) {
        swarm.push(new Particle(courses, teachers, rooms, timeslots).initialize());
    }

    // Evaluate initial fitness and set initial pBest
    swarm.forEach(p => p.calculateFitness());

    // Initialize global best (gBest)
    let gBest = null;
    let gBestFitness = -Infinity;

    function updateGlobalBest() {
        for (const particle of swarm) {
            if (particle.fitness > gBestFitness) {
                gBestFitness = particle.fitness;
                gBest = particle.position.map(gene => ({
                    course: gene.course,
                    teacher: gene.teacher,
                    room: gene.room,
                    timeslot: gene.timeslot,
                }));
            }
        }
    }

    updateGlobalBest();

    // STEP 2: PSO Iteration Loop
    for (let iter = 0; iter < iterations; iter++) {

        for (const particle of swarm) {
            // STEP 3: Update velocity and position for each gene
            for (let g = 0; g < particle.position.length; g++) {
                const r1 = Math.random();
                const r2 = Math.random();

                // For each dimension (teacher, room, timeslot):
                // Compute cognitive & social components
                // If pBest/gBest differs from current → that component is positive
                ['teacher', 'room', 'timeslot'].forEach(dim => {
                    const currentId = particle.position[g][dim].id;
                    const pBestId = particle.pBest[g][dim].id;
                    const gBestId = gBest[g][dim].id;

                    // Cognitive component: pull toward personal best
                    const cognitivePull = (pBestId !== currentId) ? 1 : 0;
                    // Social component: pull toward global best
                    const socialPull = (gBestId !== currentId) ? 1 : 0;

                    // Velocity update equation
                    particle.velocity[g][dim] =
                        w * particle.velocity[g][dim] +
                        c1 * r1 * cognitivePull +
                        c2 * r2 * socialPull;

                    // Clamp velocity to prevent explosion
                    particle.velocity[g][dim] = Math.max(-4, Math.min(4, particle.velocity[g][dim]));

                    // Position update: use sigmoid of velocity as probability
                    const prob = sigmoid(particle.velocity[g][dim]);

                    if (Math.random() < prob) {
                        // Decide whether to move toward pBest or gBest
                        const moveToGlobal = Math.random() < (c2 / (c1 + c2));

                        if (moveToGlobal && gBest[g]) {
                            // Move toward global best
                            particle.position[g] = {
                                ...particle.position[g],
                                [dim]: gBest[g][dim],
                            };
                        } else if (particle.pBest[g]) {
                            // Move toward personal best
                            particle.position[g] = {
                                ...particle.position[g],
                                [dim]: particle.pBest[g][dim],
                            };
                        }
                    }
                });

                // Small random exploration (prevents premature convergence)
                if (Math.random() < 0.05) {
                    const dim = ['teacher', 'room', 'timeslot'][Math.floor(Math.random() * 3)];
                    const pool = dim === 'teacher' ? teachers :
                                 dim === 'room' ? rooms : timeslots;
                    particle.position[g] = {
                        ...particle.position[g],
                        [dim]: pool[Math.floor(Math.random() * pool.length)],
                    };
                }
            }

            // STEP 4: Evaluate fitness (also updates pBest internally)
            particle.calculateFitness();
        }

        // STEP 5: Update global best
        updateGlobalBest();

        // Record iteration history
        fitnessHistory.push({
            generation: iter + 1,   // Keep key as 'generation' for chart compatibility
            bestFitness: gBestFitness,
            avgFitness: swarm.reduce((sum, p) => sum + p.fitness, 0) / swarm.length,
            clashes: swarm.reduce((best, p) => Math.min(best, p.clashCount), Infinity),
        });

        // Early stopping if perfect solution found (after enough iterations for a good chart)
        if (gBestFitness === 1.0 && iter > 20) break;
    }

    // Find the global best particle for output
    const bestParticle = swarm.reduce((best, p) => p.fitness > best.fitness ? p : best, swarm[0]);

    return {
        timetable: gBest.map(gene => ({
            course: gene.course.name, courseCode: gene.course.code,
            teacher: gene.teacher.name, room: gene.room.name,
            day: gene.timeslot.day, startTime: gene.timeslot.start_time, endTime: gene.timeslot.end_time,
        })),
        fitness: gBestFitness,
        clashes: bestParticle.clashCount,
        fitnessHistory,
        generations: fitnessHistory.length,
    };
}

// Generate random (unoptimized) timetable for comparison
function generateRandomTimetable(courses, teachers, rooms, timeslots) {
    const particle = new Particle(courses, teachers, rooms, timeslots).initialize();
    particle.calculateFitness();
    return {
        timetable: particle.position.map(gene => ({
            course: gene.course.name, courseCode: gene.course.code,
            teacher: gene.teacher.name, room: gene.room.name,
            day: gene.timeslot.day, startTime: gene.timeslot.start_time, endTime: gene.timeslot.end_time,
        })),
        fitness: particle.fitness,
        clashes: particle.clashCount,
    };
}

module.exports = { particleSwarmOptimization, generateRandomTimetable };
