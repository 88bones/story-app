import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

function RouteGuard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";
  const inTabsGroup = segments[0] === "(tabs)";

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else {
      if (!inTabsGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [user, segments, router, isLoading]);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard />
    </AuthProvider>
  );
}
