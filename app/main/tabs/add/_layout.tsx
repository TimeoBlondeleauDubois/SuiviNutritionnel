import { Stack } from 'expo-router'

export default function AddStack() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Ajouter' }} />
            <Stack.Screen name="camera" options={{ title: 'Scanner' }} />
        </Stack>
    )
}
