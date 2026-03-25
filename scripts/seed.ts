/**
 * Firestore seed script — Push/Pull/Legs program with 8 weeks of log history.
 *
 * Requirements:
 *   - A Firebase service account JSON (Firebase Console → Project Settings → Service accounts)
 *
 * Usage:
 *   npm run seed -- --uid <firebase-uid> [--sa ./service-account.json]
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(): { uid: string; saPath: string } {
	const args = process.argv.slice(2);
	const uidIdx = args.indexOf('--uid');
	const saIdx = args.indexOf('--sa');

	if (uidIdx === -1 || !args[uidIdx + 1]) {
		console.error('Usage: npm run seed -- --uid <firebase-uid> [--sa ./service-account.json]');
		process.exit(1);
	}

	return {
		uid: args[uidIdx + 1],
		saPath: saIdx !== -1 && args[saIdx + 1] ? args[saIdx + 1] : './service-account.json'
	};
}

// ---------------------------------------------------------------------------
// Types (local to seed script — no $lib imports)
// ---------------------------------------------------------------------------

type SetsAndReps = { sets: number; reps: string };
type RestTime = { minutes: number; seconds: number };

type SeedExercise = {
	name: string;
	setsAndReps: SetsAndReps[];
	restTime: RestTime;
	baseWeight: number; // kg, used for log generation only
	weeklyIncrement: number; // kg/week, used for log generation only
};

type SeedRoutine = {
	name: string;
	exercises: SeedExercise[];
};

type LogSet = { weight: number; reps: number };

// ---------------------------------------------------------------------------
// PPL program data
// ---------------------------------------------------------------------------

const PPL_DATA: SeedRoutine[] = [
	{
		name: 'Push',
		exercises: [
			{
				name: 'Barbell Bench Press',
				setsAndReps: [{ sets: 4, reps: '5' }],
				restTime: { minutes: 3, seconds: 0 },
				baseWeight: 80,
				weeklyIncrement: 2.5
			},
			{
				name: 'Incline Dumbbell Press',
				setsAndReps: [{ sets: 3, reps: '10' }],
				restTime: { minutes: 2, seconds: 0 },
				baseWeight: 24,
				weeklyIncrement: 1
			},
			{
				name: 'Overhead Press',
				setsAndReps: [{ sets: 3, reps: '8' }],
				restTime: { minutes: 2, seconds: 30 },
				baseWeight: 50,
				weeklyIncrement: 1.25
			},
			{
				name: 'Cable Lateral Raise',
				setsAndReps: [{ sets: 3, reps: '15' }],
				restTime: { minutes: 1, seconds: 0 },
				baseWeight: 12,
				weeklyIncrement: 0.5
			},
			{
				name: 'Tricep Rope Pushdown',
				setsAndReps: [{ sets: 3, reps: '12' }],
				restTime: { minutes: 1, seconds: 30 },
				baseWeight: 20,
				weeklyIncrement: 1
			},
			{
				name: 'Overhead Tricep Extension',
				setsAndReps: [{ sets: 3, reps: '12' }],
				restTime: { minutes: 1, seconds: 30 },
				baseWeight: 18,
				weeklyIncrement: 1
			}
		]
	},
	{
		name: 'Pull',
		exercises: [
			{
				name: 'Deadlift',
				setsAndReps: [{ sets: 3, reps: '5' }],
				restTime: { minutes: 3, seconds: 30 },
				baseWeight: 100,
				weeklyIncrement: 2.5
			},
			{
				name: 'Barbell Row',
				setsAndReps: [{ sets: 4, reps: '8' }],
				restTime: { minutes: 2, seconds: 30 },
				baseWeight: 70,
				weeklyIncrement: 2.5
			},
			{
				name: 'Lat Pulldown',
				setsAndReps: [{ sets: 3, reps: '10' }],
				restTime: { minutes: 2, seconds: 0 },
				baseWeight: 60,
				weeklyIncrement: 1.5
			},
			{
				name: 'Seated Cable Row',
				setsAndReps: [{ sets: 3, reps: '12' }],
				restTime: { minutes: 2, seconds: 0 },
				baseWeight: 55,
				weeklyIncrement: 1.5
			},
			{
				name: 'Face Pull',
				setsAndReps: [{ sets: 3, reps: '15' }],
				restTime: { minutes: 1, seconds: 0 },
				baseWeight: 15,
				weeklyIncrement: 0.5
			},
			{
				name: 'Barbell Curl',
				setsAndReps: [{ sets: 3, reps: '10' }],
				restTime: { minutes: 1, seconds: 30 },
				baseWeight: 35,
				weeklyIncrement: 1.25
			}
		]
	},
	{
		name: 'Legs',
		exercises: [
			{
				name: 'Barbell Back Squat',
				setsAndReps: [{ sets: 4, reps: '5' }],
				restTime: { minutes: 3, seconds: 0 },
				baseWeight: 90,
				weeklyIncrement: 2.5
			},
			{
				name: 'Romanian Deadlift',
				setsAndReps: [{ sets: 3, reps: '10' }],
				restTime: { minutes: 2, seconds: 30 },
				baseWeight: 70,
				weeklyIncrement: 2.5
			},
			{
				name: 'Leg Press',
				setsAndReps: [{ sets: 3, reps: '12' }],
				restTime: { minutes: 2, seconds: 0 },
				baseWeight: 120,
				weeklyIncrement: 5
			},
			{
				name: 'Leg Curl',
				setsAndReps: [{ sets: 3, reps: '12' }],
				restTime: { minutes: 1, seconds: 30 },
				baseWeight: 40,
				weeklyIncrement: 1.25
			},
			{
				name: 'Walking Lunge',
				setsAndReps: [{ sets: 3, reps: '12' }],
				restTime: { minutes: 1, seconds: 30 },
				baseWeight: 20,
				weeklyIncrement: 1
			},
			{
				name: 'Standing Calf Raise',
				setsAndReps: [{ sets: 4, reps: '15' }],
				restTime: { minutes: 1, seconds: 0 },
				baseWeight: 50,
				weeklyIncrement: 2.5
			}
		]
	}
];

const WEEKS = 8;
const SESSIONS_PER_WEEK = 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTargetReps(reps: string): number {
	// e.g. "5" -> 5, "8-12" -> 8
	const match = reps.match(/\d+/);
	return match ? parseInt(match[0], 10) : 8;
}

/** ISO timestamp for a given week (1-indexed) and session (0 or 1). */
function sessionTimestamp(week: number, session: 0 | 1): string {
	const now = Date.now();
	const weekStartMs = now - (WEEKS - week + 1) * 7 * 24 * 60 * 60 * 1000;
	const dayOffset = session === 0 ? 0 : 3; // Mon / Thu
	return new Date(
		weekStartMs + dayOffset * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000
	).toISOString();
}

/**
 * Builds a weight progression for each week that mirrors how real training goes:
 * - Most weeks you add the increment (60%)
 * - Some weeks you repeat the same weight (25%)
 * - Occasionally you step back one increment after a hard week (10%)
 * - Rare planned deload at ~90% (5%), rounded to nearest 2.5 kg
 */
function buildWeightProgression(exercise: SeedExercise): number[] {
	const weights: number[] = [];
	let current = exercise.baseWeight;

	for (let week = 1; week <= WEEKS; week++) {
		const roll = Math.random();
		if (roll < 0.6) {
			current += exercise.weeklyIncrement;
		} else if (roll < 0.85) {
			// repeat same weight — stalled
		} else if (roll < 0.95) {
			// step back one increment
			current = Math.max(exercise.baseWeight, current - exercise.weeklyIncrement);
		} else {
			// deload: drop to ~90%, rounded to nearest 2.5 kg
			current = Math.round((current * 0.9) / 2.5) * 2.5;
		}
		weights.push(current);
	}

	return weights;
}

/**
 * Generates sets for one logged session.
 * - Weight comes from the pre-built progression for that week.
 * - Reps are realistic: mostly on target, last set occasionally drops by 1-2.
 */
function generateSets(exercise: SeedExercise, weightProgression: number[], week: number): LogSet[] {
	const weight = weightProgression[week - 1];
	const targetReps = parseTargetReps(exercise.setsAndReps[0].reps);
	const totalSets = exercise.setsAndReps.reduce((acc, sr) => acc + sr.sets, 0);

	return Array.from({ length: totalSets }, (_, i) => {
		const isLastSet = i === totalSets - 1;
		let reps = targetReps;

		if (isLastSet) {
			// Last set is often the hardest — 40% chance of missing 1-2 reps
			const missRoll = Math.random();
			if (missRoll < 0.25) reps = Math.max(1, targetReps - 1);
			else if (missRoll < 0.4) reps = Math.max(1, targetReps - 2);
		} else {
			// Intermediate sets: rare +1 easy rep or -1 grind
			const roll = Math.random();
			if (roll < 0.1) reps = targetReps + 1;
			else if (roll < 0.2) reps = Math.max(1, targetReps - 1);
		}

		return { weight, reps };
	});
}

/** Split an array into chunks of at most `size`. */
function chunk<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
	return chunks;
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seed() {
	const { uid, saPath } = parseArgs();

	// Initialize Firebase Admin
	const saAbsPath = resolve(saPath);
	const serviceAccount = JSON.parse(readFileSync(saAbsPath, 'utf-8'));
	initializeApp({ credential: cert(serviceAccount) });
	const db = getFirestore();

	const programCreatedAt = sessionTimestamp(1, 0); // 8 weeks ago

	// --- Build document refs & data ---

	const programRef = db.collection(`users/${uid}/programs`).doc();
	const programId = programRef.id;
	const programData = { id: programId, name: 'Push/Pull/Legs', createdAt: programCreatedAt };

	type RoutineEntry = {
		ref: FirebaseFirestore.DocumentReference;
		data: object;
		routineId: string;
		exercises: SeedExercise[];
	};

	const routineEntries: RoutineEntry[] = PPL_DATA.map((routine, i) => {
		const ref = db.collection(`users/${uid}/programs/${programId}/routines`).doc();
		return {
			ref,
			routineId: ref.id,
			data: {
				id: ref.id,
				order: i,
				name: routine.name,
				createdAt: programCreatedAt,
				programId
			},
			exercises: routine.exercises
		};
	});

	type ExerciseEntry = {
		ref: FirebaseFirestore.DocumentReference;
		exerciseId: string;
		data: object;
		seedExercise: SeedExercise;
		weightProgression: number[];
		routineId: string;
	};

	const exerciseEntries: ExerciseEntry[] = [];

	for (const routineEntry of routineEntries) {
		routineEntry.exercises.forEach((ex, j) => {
			const ref = db
				.collection(
					`users/${uid}/programs/${programId}/routines/${routineEntry.routineId}/exercises`
				)
				.doc();
			exerciseEntries.push({
				ref,
				exerciseId: ref.id,
				data: {
					id: ref.id,
					order: j,
					name: ex.name,
					setsAndReps: ex.setsAndReps,
					restTime: ex.restTime,
					createdAt: programCreatedAt
				},
				seedExercise: ex,
				weightProgression: buildWeightProgression(ex),
				routineId: routineEntry.routineId
			});
		});
	}

	type LogEntry = {
		ref: FirebaseFirestore.DocumentReference;
		data: object;
	};

	const logEntries: LogEntry[] = [];

	for (const exEntry of exerciseEntries) {
		for (let week = 1; week <= WEEKS; week++) {
			for (let session = 0; session < SESSIONS_PER_WEEK; session++) {
				const logRef = db
					.collection(
						`users/${uid}/programs/${programId}/routines/${exEntry.routineId}/exercises/${exEntry.exerciseId}/logs`
					)
					.doc();
				logEntries.push({
					ref: logRef,
					data: {
						id: logRef.id,
						sets: generateSets(exEntry.seedExercise, exEntry.weightProgression, week),
						createdAt: sessionTimestamp(week, session as 0 | 1)
					}
				});
			}
		}
	}

	// --- Write batch 1: program + routines + exercises ---

	const batch1 = db.batch();
	batch1.set(programRef, programData);
	for (const r of routineEntries) batch1.set(r.ref, r.data);
	for (const e of exerciseEntries) batch1.set(e.ref, e.data);
	await batch1.commit();

	// --- Write logs in chunks of 490 ---

	for (const logChunk of chunk(logEntries, 490)) {
		const batch = db.batch();
		for (const log of logChunk) batch.set(log.ref, log.data);
		await batch.commit();
	}

	// --- Summary ---

	const logsPerExercise = WEEKS * SESSIONS_PER_WEEK;
	console.log(`\n✓ Program: ${programData.name}`);
	for (const r of routineEntries) {
		const exCount = r.exercises.length;
		console.log(
			`  ✓ ${PPL_DATA.find((p) => p.name === (r.data as { name: string }).name)?.name} (${exCount} exercises, ${exCount * logsPerExercise} logs)`
		);
	}
	console.log(
		`\nSeeded ${1 + routineEntries.length + exerciseEntries.length + logEntries.length} documents for uid: ${uid}\n`
	);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
