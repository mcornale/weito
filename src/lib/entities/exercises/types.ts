export type Exercise = {
	id: string;
	order: number;
	name: string;
	setsAndReps: { sets: number; reps: string }[];
	restTime: { minutes: number; seconds: number };
	createdAt: string;
};
