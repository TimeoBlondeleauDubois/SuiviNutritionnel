import { Tabs } from 'expo-router'

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
            <Tabs.Screen name="add" options={{ title: 'Ajouter' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
        </Tabs>
    )
}
