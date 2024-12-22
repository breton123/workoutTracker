import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Link, Redirect } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebaseConfig";

export default function LoginScreen({
	navigation,
}: {
	navigation: NativeStackNavigationProp<any>;
}) {
	const { user } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	if (user) {
		return <Redirect href="/" />;
	}

	const handleLogin = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
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
			<Button title="Login" onPress={handleLogin} />
			<View style={styles.linkContainer}>
				<Text>Don't have an account? </Text>
				<Link href="/register" style={styles.link}>
					Register
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
