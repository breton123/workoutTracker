import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CircularTimerProps = {
	seconds: number;
	totalSeconds: number;
};

export default function CircularTimer({
	seconds,
	totalSeconds,
}: CircularTimerProps) {
	const radius = 100;
	const circumference = 2 * Math.PI * radius;
	const progress = (seconds / totalSeconds) * circumference;

	const formatTime = (secs: number) => {
		const minutes = Math.floor(secs / 60);
		const remainingSeconds = secs % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	return (
		<View style={styles.container}>
			<Svg width={radius * 2.5} height={radius * 2.5} style={styles.svg}>
				{/* Background Circle */}
				<Circle
					cx={radius * 1.25}
					cy={radius * 1.25}
					r={radius}
					stroke="#2d3436"
					strokeWidth={15}
				/>
				{/* Progress Circle */}
				<Circle
					cx={radius * 1.25}
					cy={radius * 1.25}
					r={radius}
					stroke="#2ecc71"
					strokeWidth={15}
					strokeDasharray={circumference}
					strokeDashoffset={circumference - progress}
					strokeLinecap="round"
					transform={`rotate(-90 ${radius * 1.25} ${radius * 1.25})`}
				/>
			</Svg>
			<View style={styles.timeContainer}>
				<Text style={styles.timeText}>{formatTime(seconds)}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
	},
	svg: {
		transform: [{ rotateZ: "0deg" }],
	},
	timeContainer: {
		position: "absolute",
		alignItems: "center",
	},
	timeText: {
		color: "#fff",
		fontSize: 48,
		fontWeight: "bold",
	},
});
