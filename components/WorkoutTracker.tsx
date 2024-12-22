import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";
import { WorkoutProgram } from "../types/workout";

interface WorkoutTrackerProps {
	data: Array<{ id: string; [key: string]: any }>;
	streak: number;
}

export default function WorkoutTracker({ data, streak }: WorkoutTrackerProps) {
	const { user } = useAuth();
	const router = useRouter();
	const [workouts, setWorkouts] = useState<WorkoutProgram | null>(null);
	const [loading, setLoading] = useState(true);
	const today = new Date();

	useEffect(() => {
		loadWorkouts();
	}, [user]);

	const loadWorkouts = async () => {
		if (!user) return;
		setLoading(true);
		try {
			const programRef = collection(db, "workoutPrograms");
			const q = query(programRef, where("userId", "==", user.uid));
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				setWorkouts(querySnapshot.docs[0].data() as WorkoutProgram);
			} else {
				setWorkouts(null);
			}
		} catch (error) {
			console.error("Error loading workouts:", error);
		} finally {
			setLoading(false);
		}
	};

	const getTodaysWorkout = () => {
		if (!workouts?.days) return null;
		const dayOfWeek = today.getDay();
		const todaysWorkout = workouts.days.find(
			(day) => day.weekDay === dayOfWeek
		);

		if (todaysWorkout) {
			return todaysWorkout;
		}

		// If no workout found for today, look for rotation workouts
		const rotationWorkouts = workouts.days.filter(
			(day) => day.scheduleType === "rotation"
		);

		let dayIndex = dayOfWeek + 1;
		while (true) {
			if (dayIndex <= rotationWorkouts.length) {
				return rotationWorkouts[dayIndex - 1];
			} else {
				dayIndex -= rotationWorkouts.length;
			}
		}
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#2ecc71" />
			</View>
		);
	}

	const todaysWorkout = getTodaysWorkout();

	return (
		<View style={styles.container}>
			<Text style={styles.date}>
				{today.toLocaleDateString("en-US", {
					weekday: "long",
					month: "long",
					day: "numeric",
				})}
			</Text>

			<View style={styles.streakContainer}>
				<FontAwesome5 name="fire" size={24} color="#e74c3c" />
				<Text style={styles.streakText}>{streak} Day Streak!</Text>
			</View>

			{todaysWorkout ? (
				<View style={styles.todayWorkoutContainer}>
					<Text style={styles.todayTitle}>Today's Workout</Text>
					<Text style={styles.workoutName}>{todaysWorkout.name}</Text>
					<Pressable
						style={styles.startButton}
						onPress={() =>
							router.push({
								pathname: "/workout/[type]",
								params: { type: todaysWorkout.id },
							})
						}>
						<Text style={styles.startButtonText}>
							Start Workout
						</Text>
					</Pressable>
				</View>
			) : (
				<View style={styles.restDayContainer}>
					<Text style={styles.restDayText}>Rest Day</Text>
					<Text style={styles.restDaySubtext}>
						Take it easy and recover!
					</Text>
				</View>
			)}

			<Text style={styles.sectionTitle}>Your Workout Program</Text>
			<ScrollView style={styles.scrollView}>
				{workouts?.days.map((day) => (
					<View key={day.id} style={styles.workoutCard}>
						<View style={styles.cardHeader}>
							<Text style={styles.cardTitle}>{day.name}</Text>
							<Text style={styles.scheduleInfo}>
								{day.scheduleType === "weekly"
									? `Every ${
											[
												"Sunday",
												"Monday",
												"Tuesday",
												"Wednesday",
												"Thursday",
												"Friday",
												"Saturday",
											][day.weekDay || 0]
									  }`
									: `Day ${day.order! + 1}`}
							</Text>
						</View>
						<View style={styles.exerciseList}>
							{day.exercises.map((exercise, index) => (
								<Text key={index} style={styles.exerciseItem}>
									• {exercise.name}
								</Text>
							))}
						</View>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	date: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#fff",
		textAlign: "center",
		marginBottom: 16,
	},
	streakContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	streakText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
		marginLeft: 8,
	},
	todayWorkoutContainer: {
		backgroundColor: "#2d3436",
		borderRadius: 12,
		padding: 20,
		marginBottom: 24,
		alignItems: "center",
	},
	todayTitle: {
		color: "#95a5a6",
		fontSize: 16,
		marginBottom: 8,
	},
	workoutName: {
		color: "#fff",
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
	startButton: {
		backgroundColor: "#2ecc71",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		width: "100%",
	},
	startButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
	},
	restDayContainer: {
		backgroundColor: "#2d3436",
		borderRadius: 12,
		padding: 20,
		marginBottom: 24,
		alignItems: "center",
	},
	restDayText: {
		color: "#fff",
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
	},
	restDaySubtext: {
		color: "#95a5a6",
		fontSize: 16,
	},
	sectionTitle: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
	},
	scrollView: {
		flex: 1,
	},
	workoutCard: {
		backgroundColor: "#2d3436",
		borderRadius: 10,
		padding: 16,
		marginBottom: 12,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	cardTitle: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	scheduleInfo: {
		color: "#95a5a6",
		fontSize: 14,
	},
	exerciseList: {
		marginTop: 8,
	},
	exerciseItem: {
		color: "#bdc3c7",
		fontSize: 14,
		marginBottom: 4,
	},
});
