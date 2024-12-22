import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Link } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../firebaseConfig";

export default function RegisterScreen({
	navigation,
}: {
	navigation: NativeStackNavigationProp<any>;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleRegister = async () => {
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			// Auth context will handle the navigation
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<View style={styles.container}>
			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				style={styles.input}
				autoCapitalize="none"
			/>
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				style={styles.input}
				secureTextEntry
			/>
			{error ? <Text style={styles.error}>{error}</Text> : null}
			<Button title="Register" onPress={handleRegister} />
			<View style={styles.linkContainer}>
				<Text>Already have an account? </Text>
				<Link href="/login" style={styles.link}>
					Login
				</Link>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", padding: 16 },
	input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
	error: { color: "red", textAlign: "center", marginVertical: 10 },
	linkContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 20,
	},
	link: {
		color: "blue",
	},
});
