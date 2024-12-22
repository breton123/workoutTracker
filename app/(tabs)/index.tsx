import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import WorkoutTracker from "../../components/WorkoutTracker";
import { auth, db } from "../../firebaseConfig";

export default function Dashboard() {
	const router = useRouter();
	const [workoutData, setWorkoutData] = useState<
		Array<{
			id: string;
			date: string;
			isRestDay?: boolean;
			[key: string]: any;
		}>
	>([]);
	const [currentStreak, setCurrentStreak] = useState(0);

	const handleLogout = async () => {
		try {
			await auth.signOut();
			router.replace("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const calculateStreak = (
		workouts: Array<{ date: string; isRestDay?: boolean }>
	) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		let streak = 0;
		let currentDate = new Date(today);

		while (true) {
			const dateStr = currentDate.toISOString().split("T")[0];
			const workoutForDate = workouts.find((w) => w.date === dateStr);

			if (!workoutForDate) {
				// No workout found for this date
				break;
			}

			if (
				workoutForDate.isRestDay ||
				Object.keys(workoutForDate).length > 2
			) {
				// has more properties than just id and date
				streak++;
			} else {
				break;
			}

			currentDate.setDate(currentDate.getDate() - 1);
		}

		return streak;
	};

	useEffect(() => {
		const unsubscribe = onSnapshot(
			query(collection(db, "workouts"), orderBy("date", "desc")),
			(snapshot) => {
				const data = snapshot.docs.map((doc) => ({
					id: doc.id,
					date:
						doc.data().date ||
						new Date().toISOString().split("T")[0],
					isRestDay: doc.data().isRestDay || false,
					...doc.data(),
				}));
				setWorkoutData(data);
				setCurrentStreak(calculateStreak(data));
			}
		);

		return () => unsubscribe();
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.logoutButton}>
				<Button title="Logout" onPress={handleLogout} />
			</View>
			<WorkoutTracker data={workoutData} streak={currentStreak} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1e272e",
		paddingTop: "20%",
	},
	logoutButton: {
		position: "absolute",
		top: 45,
		right: 16,
		zIndex: 1,
	},
});
