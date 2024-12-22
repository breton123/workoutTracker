import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
	collection,
	getDocs,
	onSnapshot,
	query,
	where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebaseConfig";
import { WorkoutProgram } from "../../types/workout";

export default function WorkoutSelectionScreen() {
	const { user } = useAuth();
	const router = useRouter();
	const [workouts, setWorkouts] = useState<WorkoutProgram | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (user) {
			const programRef = collection(db, "workoutPrograms");
			const unsubscribe = onSnapshot(
				query(programRef, where("userId", "==", user.uid)),
				(querySnapshot) => {
					if (!querySnapshot.empty) {
						setWorkouts(
							querySnapshot.docs[0].data() as WorkoutProgram
						);
					} else {
						setWorkouts(null);
					}
					setLoading(false);
				},
				(error) => {
					console.error("Error loading workouts:", error);
					setLoading(false);
				}
			);

			return () => unsubscribe();
		} else {
			setWorkouts(null);
			setLoading(false);
		}
	}, [user]);

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#2ecc71" />
			</View>
		);
	}

	if (!workouts || !workouts.days.length) {
		return (
			<View style={styles.container}>
				<FontAwesome5
					name="dumbbell"
					size={50}
					color="#95a5a6"
					style={styles.icon}
				/>
				<Text style={styles.noWorkoutsText}>No workouts found</Text>
				<Text style={styles.subText}>
					Add some workouts in the dashboard to get started
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Select Workout</Text>
			<ScrollView style={styles.scrollView}>
				{workouts.days.map((day) => (
					<Pressable
						key={day.id}
						style={styles.workoutCard}
						onPress={() =>
							router.push({
								pathname: "/workout/[type]",
								params: { type: day.id },
							})
						}>
						<View style={styles.cardHeader}>
							<Text style={styles.workoutName}>{day.name}</Text>
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
									: `Day ${day.order! + 1} of rotation`}
							</Text>
						</View>
						<Text style={styles.exerciseCount}>
							{day.exercises.length} exercises
						</Text>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1e272e",
		padding: 16,
		justifyContent: "center",
		paddingTop: "20%",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 20,
		textAlign: "center",
	},
	scrollView: {
		flex: 1,
	},
	workoutCard: {
		backgroundColor: "#2d3436",
		borderRadius: 10,
		padding: 16,
		marginBottom: 16,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	workoutName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#fff",
	},
	scheduleInfo: {
		color: "#95a5a6",
		fontSize: 14,
	},
	exerciseCount: {
		color: "#2ecc71",
		fontSize: 14,
	},
	icon: {
		alignSelf: "center",
		marginBottom: 16,
		opacity: 0.5,
	},
	noWorkoutsText: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 8,
	},
	subText: {
		color: "#95a5a6",
		fontSize: 16,
		textAlign: "center",
	},
});
