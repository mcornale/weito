export type LogSet = {
	weight: number;
	reps: number;
};

export type Log = {
	id: string;
	sets: LogSet[];
	createdAt: string;
	note?: string;
};
