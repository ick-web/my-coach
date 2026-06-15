import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(modals)/checkin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modals)/reflection" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
