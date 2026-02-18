import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthLayout() {
    const { isLoaded, isSignedIn } = useAuth()
    if (!isLoaded) return null

    if (isSignedIn) {
        return <Redirect href="/main/tabs/home" />
    }

    return <Stack screenOptions={{ headerShown: false }} />
}
