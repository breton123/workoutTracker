import { FontAwesome5 } from "@expo/vector-icons";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
	Alert,
	FlatList,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebaseConfig";
import { Exercise, WorkoutDay, WorkoutProgram } from "../../types/workout";

export default function WorkoutsScreen() {
	const { user } = useAuth();
	const [program, setProgram] = useState<WorkoutProgram | null>(null);
	const [showDayModal, setShowDayModal] = useState(false);
	const [showExerciseModal, setShowExerciseModal] = useState(false);
	const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
	const [newDayName, setNewDayName] = useState("");
	const [scheduleType, setScheduleType] = useState<"weekly" | "rotation">(
		"weekly"
	);
	const [weekDay, setWeekDay] = useState(0);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [dayToDelete, setDayToDelete] = useState<string | null>(null);

	// New exercise form state
	const [exerciseForm, setExerciseForm] = useState<Partial<Exercise>>({
		type: "push",
		sets: 3,
		reps: "8-12",
	});

	useEffect(() => {
		if (user) {
			loadProgram();
		}
	}, [user]);

	const loadProgram = async () => {
		if (!user) return;
		const programRef = doc(collection(db, "workoutPrograms"), user.uid);
		const programDoc = await getDoc(programRef);
		if (programDoc.exists()) {
			setProgram(programDoc.data() as WorkoutProgram);
		} else {
			// Create new program
			const newProgram: WorkoutProgram = {
				id: user.uid,
				userId: user.uid,
				days: [],
			};
			await setDoc(programRef, newProgram);
			setProgram(newProgram);
		}
	};

	const saveProgram = async (updatedProgram: WorkoutProgram) => {
		if (!user || !updatedProgram) return;
		console.log("Saving program:", updatedProgram);
		const programRef = doc(collection(db, "workoutPrograms"), user.uid);
		await setDoc(programRef, updatedProgram);
	};

	const addDay = async () => {
		if (!program) return;
		// Ensure newDay is created correctly before updating the program
		const newDay: WorkoutDay = {
			id: Date.now().toString(),
			name: newDayName,
			exercises: [],
			scheduleType,
			...(scheduleType === "weekly"
				? { weekDay }
				: { order: program.days.length }),
		};

		console.log("New Day to Add:", newDay);
		console.log("Current Program Before Update:", program);

		// Update the program state with the new day
		const updatedProgram = {
			...program,
			days: [...program.days, newDay],
		};
		console.log("Updated Program:", updatedProgram);
		await saveProgram(updatedProgram);
		setProgram(updatedProgram);

		setShowDayModal(false);
		setNewDayName("");
	};

	const addExercise = async () => {
		if (!selectedDay || !program) return;
		const newExercise: Exercise = {
			id: Date.now().toString(),
			name: exerciseForm.name || "",
			type: exerciseForm.type || "push",
			sets: exerciseForm.sets || 3,
			reps: exerciseForm.reps || "8-12",
			weight: exerciseForm.weight || 0,
			videoUri: exerciseForm.videoUri || "",
			completed: new Array(exerciseForm.sets || 3).fill(false),
		};

		const updatedDays = program.days.map((day) =>
			day.id === selectedDay.id
				? { ...day, exercises: [...day.exercises, newExercise] }
				: day
		);

		// Save the updated program after modifying the days
		const updatedProgram = {
			...program,
			days: updatedDays,
		};

		setProgram(updatedProgram); // Update the state with the new program
		await saveProgram(updatedProgram); // Save the updated program to Firestore
		setShowExerciseModal(false);
		setExerciseForm({});
	};

	const deleteDay = (dayId: string) => {
		setDayToDelete(dayId);
		setShowDeleteModal(true);
	};

	const renderDay = ({ item: day }: { item: WorkoutDay }) => (
		<View style={styles.dayCard}>
			<View style={styles.dayHeader}>
				<Text style={styles.dayName}>{day.name}</Text>
				<Text style={styles.scheduleInfo}>
					{day.scheduleType === "weekly"
						? `Every ${new Date(
								0,
								0,
								day.weekDay
						  ).toLocaleDateString("en-US", { weekday: "long" })}`
						: `Rotation #${day.order! + 1}`}
				</Text>
				<Pressable
					style={styles.deleteButton}
					onPress={() => deleteDay(day.id)}>
					<FontAwesome5 name="trash" size={16} color="#ff4757" />
				</Pressable>
			</View>
			<FlatList
				data={day.exercises}
				renderItem={({ item: exercise }) => (
					<View style={styles.exerciseItem}>
						<FontAwesome5
							name="dumbbell"
							size={16}
							color="#fff"
							style={styles.exerciseIcon}
						/>
						<Text style={styles.exerciseName}>{exercise.name}</Text>
						<Text style={styles.exerciseDetails}>
							{exercise.sets}×{exercise.reps} @ {exercise.weight}
							lbs
						</Text>
					</View>
				)}
				keyExtractor={(item) => item.id}
			/>
			<Pressable
				style={styles.addExerciseButton}
				onPress={() => {
					setSelectedDay(day);
					setShowExerciseModal(true);
				}}>
				<Text style={styles.addExerciseText}>Add Exercise</Text>
			</Pressable>
		</View>
	);

	return (
		<View style={styles.container}>
			<FlatList
				data={program?.days || []}
				renderItem={renderDay}
				keyExtractor={(item) => item.id}
				ListHeaderComponent={
					<Pressable
						style={styles.addDayButton}
						onPress={() => setShowDayModal(true)}>
						<Text style={styles.addDayText}>Add Workout Day</Text>
					</Pressable>
				}
			/>

			{/* Add Day Modal */}
			<Modal
				visible={showDayModal}
				animationType="slide"
				transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Add Workout Day</Text>
						<TextInput
							style={styles.input}
							placeholder="Day Name"
							value={newDayName}
							onChangeText={setNewDayName}
							placeholderTextColor="#666"
						/>
						<View style={styles.scheduleTypeContainer}>
							<Pressable
								style={[
									styles.scheduleTypeButton,
									scheduleType === "weekly" &&
										styles.selectedScheduleType,
								]}
								onPress={() => setScheduleType("weekly")}>
								<Text style={styles.scheduleTypeText}>
									Weekly
								</Text>
							</Pressable>
							<Pressable
								style={[
									styles.scheduleTypeButton,
									scheduleType === "rotation" &&
										styles.selectedScheduleType,
								]}
								onPress={() => setScheduleType("rotation")}>
								<Text style={styles.scheduleTypeText}>
									Rotation
								</Text>
							</Pressable>
						</View>
						{scheduleType === "weekly" && (
							<ScrollView horizontal style={styles.weekDayPicker}>
								{Array.from({ length: 7 }, (_, i) => (
									<Pressable
										key={i}
										style={[
											styles.weekDayButton,
											weekDay === i &&
												styles.selectedWeekDay,
										]}
										onPress={() => setWeekDay(i)}>
										<Text style={styles.weekDayText}>
											{new Date(
												0,
												0,
												i
											).toLocaleDateString("en-US", {
												weekday: "short",
											})}
										</Text>
									</Pressable>
								))}
							</ScrollView>
						)}
						<View style={styles.modalButtons}>
							<Pressable
								style={[
									styles.modalButton,
									styles.cancelButton,
								]}
								onPress={() => setShowDayModal(false)}>
								<Text style={styles.modalButtonText}>
									Cancel
								</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, styles.saveButton]}
								onPress={addDay}>
								<Text style={styles.modalButtonText}>Save</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* Add Exercise Modal */}
			<Modal
				visible={showExerciseModal}
				animationType="slide"
				transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Add Exercise</Text>
						<TextInput
							style={styles.input}
							placeholder="Exercise Name"
							value={exerciseForm.name}
							onChangeText={(text) =>
								setExerciseForm((prev: Partial<Exercise>) => ({
									...prev,
									name: text,
								}))
							}
							placeholderTextColor="#666"
						/>
						<TextInput
							style={styles.input}
							placeholder="Video URL"
							value={exerciseForm.videoUri}
							onChangeText={(text) =>
								setExerciseForm((prev: Partial<Exercise>) => ({
									...prev,
									videoUri: text,
								}))
							}
							placeholderTextColor="#666"
						/>
						<TextInput
							style={styles.input}
							placeholder="Sets"
							value={exerciseForm.sets?.toString()}
							onChangeText={(text) =>
								setExerciseForm((prev: Partial<Exercise>) => ({
									...prev,
									sets: parseInt(text) || 0,
								}))
							}
							keyboardType="number-pad"
							placeholderTextColor="#666"
						/>
						<TextInput
							style={styles.input}
							placeholder="Reps (e.g., 8-12)"
							value={exerciseForm.reps}
							onChangeText={(text) =>
								setExerciseForm((prev: Partial<Exercise>) => ({
									...prev,
									reps: text,
								}))
							}
							placeholderTextColor="#666"
						/>
						<TextInput
							style={styles.input}
							placeholder="Weight (lbs)"
							value={exerciseForm.weight?.toString()}
							onChangeText={(text) =>
								setExerciseForm((prev: Partial<Exercise>) => ({
									...prev,
									weight: parseInt(text) || 0,
								}))
							}
							keyboardType="number-pad"
							placeholderTextColor="#666"
						/>
						<View style={styles.modalButtons}>
							<Pressable
								style={[
									styles.modalButton,
									styles.cancelButton,
								]}
								onPress={() => setShowExerciseModal(false)}>
								<Text style={styles.modalButtonText}>
									Cancel
								</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, styles.saveButton]}
								onPress={addExercise}>
								<Text style={styles.modalButtonText}>Save</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* Delete Day Modal */}
			<Modal
				visible={showDeleteModal}
				animationType="slide"
				transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Delete Day</Text>
						<Text style={styles.modalMessage}>
							Are you sure you want to delete this workout day?
						</Text>
						<View style={styles.modalButtons}>
							<Pressable
								style={[
									styles.modalButton,
									styles.cancelButton,
								]}
								onPress={() => setShowDeleteModal(false)}>
								<Text style={styles.modalButtonText}>
									Cancel
								</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, styles.saveButton]}
								onPress={async () => {
									if (dayToDelete) {
										console.log(
											"Day to delete:",
											dayToDelete
										);
										setProgram((prev) => {
											console.log(
												"Current program days before deletion:",
												prev!.days
											);
											const updatedDays =
												prev!.days.filter(
													(d) => d.id !== dayToDelete
												);
											console.log(
												"Updated program days after deletion:",
												updatedDays
											);
											const updatedProgram = {
												...prev!,
												days: updatedDays,
											};
											saveProgram(updatedProgram);
											return updatedProgram;
										});
										console.log(
											"Program saved after deletion."
										);
									}
									setShowDeleteModal(false);
								}}>
								<Text style={styles.modalButtonText}>
									Delete
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1e272e",
		padding: 16,
		paddingTop: "20%",
	},
	addDayButton: {
		backgroundColor: "#2ecc71",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		marginBottom: 20,
	},
	addDayText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	dayCard: {
		backgroundColor: "#2d3436",
		borderRadius: 10,
		padding: 16,
		marginBottom: 16,
	},
	dayHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	dayName: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
		flex: 1,
	},
	scheduleInfo: {
		color: "#95a5a6",
		fontSize: 14,
		marginRight: 10,
	},
	deleteButton: {
		padding: 8,
	},
	exerciseItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#34495e",
	},
	exerciseIcon: {
		marginRight: 10,
	},
	exerciseName: {
		color: "#fff",
		flex: 1,
	},
	exerciseDetails: {
		color: "#95a5a6",
	},
	addExerciseButton: {
		backgroundColor: "#3498db",
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
		marginTop: 10,
	},
	addExerciseText: {
		color: "#fff",
		fontWeight: "500",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
		padding: 16,
	},
	modalContent: {
		backgroundColor: "#2d3436",
		borderRadius: 10,
		padding: 20,
	},
	modalTitle: {
		color: "#fff",
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		backgroundColor: "#34495e",
		padding: 12,
		borderRadius: 5,
		color: "#fff",
		marginBottom: 10,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	modalButton: {
		flex: 1,
		padding: 15,
		borderRadius: 5,
		alignItems: "center",
		marginHorizontal: 5,
	},
	cancelButton: {
		backgroundColor: "#95a5a6",
	},
	saveButton: {
		backgroundColor: "#2ecc71",
	},
	modalButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	scheduleTypeContainer: {
		flexDirection: "row",
		marginBottom: 10,
	},
	scheduleTypeButton: {
		flex: 1,
		padding: 10,
		alignItems: "center",
		backgroundColor: "#34495e",
		marginHorizontal: 5,
		borderRadius: 5,
	},
	selectedScheduleType: {
		backgroundColor: "#2ecc71",
	},
	scheduleTypeText: {
		color: "#fff",
	},
	weekDayPicker: {
		flexDirection: "row",
		marginBottom: 10,
	},
	weekDayButton: {
		padding: 10,
		marginRight: 5,
		backgroundColor: "#34495e",
		borderRadius: 5,
	},
	selectedWeekDay: {
		backgroundColor: "#2ecc71",
	},
	weekDayText: {
		color: "#fff",
	},
	modalMessage: {
		color: "#fff",
		marginBottom: 20,
	},
});
