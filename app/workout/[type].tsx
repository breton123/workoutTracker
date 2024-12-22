import { FontAwesome5 } from "@expo/vector-icons";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, onSnapshot } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import CircularTimer from "../../components/CircularTimer";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebaseConfig";
import { WorkoutProgram } from "../../types/workout";

type Exercise = {
	name: string;
	sets: number;
	reps: string;
	weight: number;
	videoUri?: string;
	completed: boolean[];
};

export default function WorkoutScreen() {
	const { user } = useAuth();
	const { type } = useLocalSearchParams<{ type: string }>();
	const router = useRouter();
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSetIndex, setCurrentSetIndex] = useState(0);
	const [exercises, setExercises] = useState<Exercise[]>([]);
	const [isResting, setIsResting] = useState(false);
	const [restTimer, setRestTimer] = useState<number>(90);
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
	const [showUpcoming, setShowUpcoming] = useState(false);
	const [showStopModal, setShowStopModal] = useState(false);

	useEffect(() => {
		if (!type || !user) return;

		// Subscribe to the specific workout day
		const unsubscribe = onSnapshot(
			doc(db, "workoutPrograms", user.uid),
			(snapshot) => {
				if (snapshot.exists()) {
					const programData = snapshot.data() as WorkoutProgram;
					const workoutDay = programData.days.find(
						(day) => day.id === type
					);
					if (workoutDay) {
						setExercises(
							workoutDay.exercises.map((exercise) => ({
								...exercise,
								completed: new Array(exercise.sets).fill(false),
							}))
						);
					}
				}
			}
		);

		return () => unsubscribe();
	}, [type, user]);

	const startRest = () => {
		setIsResting(true);
		setRestTimer(90);
		const interval = setInterval(() => {
			setRestTimer((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		setIntervalId(interval);
	};

	const skipRest = () => {
		if (intervalId) clearInterval(intervalId);
		setIsResting(false);
		progressWorkout();
	};

	const progressWorkout = () => {
		const currentExercise = exercises[currentExerciseIndex];
		if (currentSetIndex + 1 < currentExercise.sets) {
			setCurrentSetIndex((prev) => prev + 1);
		} else if (currentExerciseIndex + 1 < exercises.length) {
			setCurrentExerciseIndex((prev) => prev + 1);
			setCurrentSetIndex(0);
		} else {
			// Workout complete
			completeWorkout();
		}
	};

	const completeSet = () => {
		setExercises((prev) => {
			const newExercises = [...prev];
			newExercises[currentExerciseIndex].completed[currentSetIndex] =
				true;
			return newExercises;
		});
		startRest();
	};

	const handleStopWorkout = () => {
		if (intervalId) {
			clearInterval(intervalId);
			setIntervalId(null);
		}
		setExercises([]);
		setCurrentExerciseIndex(0);
		setCurrentSetIndex(0);
		setIsResting(false);
		setRestTimer(90);
		setShowUpcoming(false);
		setShowStopModal(false);
		router.push("/");
	};

	const uploadVideo = async () => {
		try {
			// Request permission
			const { status } =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== "granted") {
				alert(
					"Sorry, we need camera roll permissions to upload videos!"
				);
				return;
			}

			// Pick the video
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Videos,
				allowsEditing: true,
				quality: 1,
			});

			if (!result.canceled) {
				const { uri } = result.assets[0];
				const response = await fetch(uri);
				const blob = await response.blob();

				// Upload to Firebase Storage
				const storage = getStorage();
				const videoRef = ref(
					storage,
					`workout-videos/${Date.now()}.mp4`
				);
				await uploadBytes(videoRef, blob);

				// Get download URL
				const downloadURL = await getDownloadURL(videoRef);

				// Update exercise video URI
				setExercises((prev) => {
					const newExercises = [...prev];
					newExercises[currentExerciseIndex].videoUri = downloadURL;
					return newExercises;
				});
			}
		} catch (error) {
			console.error("Error uploading video:", error);
			alert("Failed to upload video");
		}
	};

	const completeWorkout = async () => {
		if (!user) return;

		try {
			// Add workout completion record
			await addDoc(collection(db, "workouts"), {
				date: new Date().toISOString().split("T")[0], // Store as YYYY-MM-DD
				userId: user.uid,
				workoutId: type,
				completed: true,
			});

			router.replace("/");
		} catch (error) {
			console.error("Error saving workout completion:", error);
		}
	};

	if (!exercises.length) return null;

	if (isResting) {
		return (
			<View style={styles.container}>
				<View style={styles.restContainer}>
					<Text style={styles.restTitle}>Rest Time</Text>
					<CircularTimer seconds={restTimer} totalSeconds={90} />
					<Pressable style={styles.skipButton} onPress={skipRest}>
						<Text style={styles.skipButtonText}>Skip Rest</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	const currentExercise = exercises[currentExerciseIndex];
	const remainingExercises = exercises.slice(currentExerciseIndex + 1);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Pressable
					style={styles.stopButton}
					onPress={() => setShowStopModal(true)}>
					<FontAwesome5 name="stop" size={20} color="#fff" />
				</Pressable>
				<Pressable
					style={styles.upcomingButton}
					onPress={() => setShowUpcoming(true)}>
					<FontAwesome5 name="list" size={20} color="#fff" />
				</Pressable>
			</View>

			<Text style={styles.title}>{currentExercise.name}</Text>

			<View style={styles.videoContainer}>
				{currentExercise.videoUri ? (
					<Video
						source={{ uri: currentExercise.videoUri }}
						style={styles.video}
						useNativeControls
						isLooping
						shouldPlay={false}
					/>
				) : (
					<View style={styles.noVideoContainer}>
						<FontAwesome5
							name="video-slash"
							size={24}
							color="#95a5a6"
						/>
						<Text style={styles.noVideoText}>
							No video available
						</Text>
						<Pressable
							style={styles.uploadButton}
							onPress={uploadVideo}>
							<Text style={styles.uploadText}>
								Upload Video (Optional)
							</Text>
						</Pressable>
					</View>
				)}
			</View>

			<View style={styles.detailsContainer}>
				<Text style={styles.details}>
					Weight: {currentExercise.weight}lbs
				</Text>
				<Text style={styles.details}>
					Target: {currentExercise.reps} reps
				</Text>
				<Text style={styles.details}>
					Set {currentSetIndex + 1} of {currentExercise.sets}
				</Text>
			</View>

			<Pressable style={styles.completeButton} onPress={completeSet}>
				<Text style={styles.completeButtonText}>Complete Set</Text>
			</Pressable>

			<Modal
				visible={showUpcoming}
				animationType="slide"
				transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							Upcoming Exercises
						</Text>
						<ScrollView style={styles.upcomingList}>
							{remainingExercises.map((exercise, index) => (
								<View
									key={index}
									style={styles.upcomingExercise}>
									<Text style={styles.upcomingName}>
										{exercise.name}
									</Text>
									<Text style={styles.upcomingDetails}>
										{exercise.sets}×{exercise.reps} @{" "}
										{exercise.weight}lbs
									</Text>
								</View>
							))}
						</ScrollView>
						<Pressable
							style={styles.closeButton}
							onPress={() => setShowUpcoming(false)}>
							<Text style={styles.closeButtonText}>Close</Text>
						</Pressable>
					</View>
				</View>
			</Modal>

			<Modal
				visible={showStopModal}
				animationType="fade"
				transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Stop Workout</Text>
						<Text style={styles.modalText}>
							Are you sure you want to end this workout?
						</Text>
						<View style={styles.modalButtons}>
							<Pressable
								style={[
									styles.modalButton,
									styles.cancelButton,
								]}
								onPress={() => setShowStopModal(false)}>
								<Text style={styles.modalButtonText}>
									Cancel
								</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, styles.stopButton]}
								onPress={handleStopWorkout}>
								<Text style={styles.modalButtonText}>Stop</Text>
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
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	stopButton: {
		backgroundColor: "#e74c3c",
		padding: 12,
		borderRadius: 8,
	},
	upcomingButton: {
		backgroundColor: "#3498db",
		padding: 12,
		borderRadius: 8,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		textAlign: "center",
		marginVertical: 20,
	},
	videoContainer: {
		height: 200,
		marginBottom: 20,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "#000",
	},
	video: {
		flex: 1,
	},
	detailsContainer: {
		backgroundColor: "#2d3436",
		padding: 20,
		borderRadius: 10,
		marginBottom: 20,
	},
	details: {
		color: "#fff",
		fontSize: 18,
		marginBottom: 10,
	},
	completeButton: {
		backgroundColor: "#2ecc71",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
	},
	completeButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	restContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 30,
	},
	restTitle: {
		color: "#fff",
		fontSize: 24,
		fontWeight: "bold",
	},
	skipButton: {
		backgroundColor: "#3498db",
		padding: 15,
		borderRadius: 10,
	},
	skipButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
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
		maxHeight: "80%",
	},
	modalTitle: {
		color: "#fff",
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	upcomingList: {
		marginVertical: 10,
	},
	upcomingExercise: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#34495e",
	},
	upcomingName: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	upcomingDetails: {
		color: "#95a5a6",
		marginTop: 4,
	},
	closeButton: {
		backgroundColor: "#95a5a6",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
	closeButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	modalButton: {
		flex: 1,
		padding: 15,
		borderRadius: 8,
		marginHorizontal: 8,
		alignItems: "center",
	},
	modalText: {
		color: "#fff",
		fontSize: 16,
		textAlign: "center",
		marginTop: 10,
	},
	noVideoContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#2d3436",
	},
	noVideoText: {
		color: "#95a5a6",
		fontSize: 16,
		marginTop: 8,
	},
	uploadButton: {
		backgroundColor: "#3498db",
		padding: 12,
		borderRadius: 8,
		marginTop: 16,
	},
	uploadText: {
		color: "#fff",
		fontSize: 14,
	},
	cancelButton: {
		backgroundColor: "#95a5a6",
	},
	modalButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});
