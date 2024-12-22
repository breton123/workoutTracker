import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#1e272e",
					borderTopWidth: 0,
					elevation: 0,
					height: 80,
					paddingBottom: 8,
					paddingTop: 0,
				},
				tabBarActiveTintColor: "#2ecc71",
				tabBarInactiveTintColor: "#95a5a6",
				tabBarShowLabel: false,
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Dashboard",
					tabBarIcon: ({ color, size }) => (
						<View
							style={{
								alignItems: "center",
								justifyContent: "center",
							}}>
							<FontAwesome5
								name="home"
								size={size}
								color={color}
							/>
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name="select"
				options={{
					title: "Workout",
					tabBarIcon: ({ color, size }) => (
						<View
							style={{
								alignItems: "center",
								justifyContent: "center",
							}}>
							<FontAwesome5
								name="play"
								size={size}
								color={color}
							/>
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name="workouts"
				options={{
					title: "Workouts",
					tabBarIcon: ({ color, size }) => (
						<View
							style={{
								alignItems: "center",
								justifyContent: "center",
							}}>
							<FontAwesome5
								name="dumbbell"
								size={size}
								color={color}
							/>
						</View>
					),
				}}
			/>
		</Tabs>
	);
}
