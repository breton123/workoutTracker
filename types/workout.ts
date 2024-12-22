export type Exercise = {
	id: string;
	name: string;
	type: "push" | "pull" | "legs" | "other";
	sets: number;
	reps: string;
	weight: number;
	videoUri: string;
	completed: boolean[];
};

export type WorkoutDay = {
	id: string;
	name: string;
	exercises: Exercise[];
	scheduleType: "weekly" | "rotation";
	weekDay?: number; // 0-6 for weekly schedule
	order?: number; // for rotation order
};

export type WorkoutProgram = {
	id: string;
	userId: string;
	days: WorkoutDay[];
};
