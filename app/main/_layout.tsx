import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function MainLayout() {
    const { isLoaded, isSignedIn } = useAuth()
    if (!isLoaded) return null

    if (!isSignedIn) {
        return <Redirect href="/auth/signin" />
    }

    return <Stack screenOptions={{ headerShown: false }} />
}
