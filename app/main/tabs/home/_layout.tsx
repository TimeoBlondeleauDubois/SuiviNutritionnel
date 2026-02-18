import { Stack } from 'expo-router'

export default function HomeStack() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Mes repas' }} />
            <Stack.Screen name="[id]" options={{ title: 'Détail' }} />
        </Stack>
    )
}
