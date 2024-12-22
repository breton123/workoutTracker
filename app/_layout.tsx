import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

function RootLayoutNav() {
	const { user, loading } = useAuth();
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			const inAuthGroup = segments[0] === "(auth)";

			if (!user && !inAuthGroup) {
				router.replace("/login");
			} else if (user && inAuthGroup) {
				router.replace("/");
			}
		}
	}, [user, loading, segments]);

	return <Slot />;
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<RootLayoutNav />
		</AuthProvider>
	);
}
