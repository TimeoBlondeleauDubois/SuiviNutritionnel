import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useUser, useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

export default function ProfilePage() {
    const { user } = useUser()
    const { signOut } = useAuth()
    const router = useRouter()

    const onSignOut = async () => {
        await signOut()
        router.replace('/auth/signin')
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profil</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>
                    {user?.primaryEmailAddress?.emailAddress ?? '—'}
                </Text>
            </View>

            <Pressable style={styles.btn} onPress={onSignOut}>
                <Text style={styles.btnText}>Se déconnecter</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1020', padding: 14, gap: 12 },
    title: { color: 'white', fontSize: 22, fontWeight: '900' },
    card: {
        padding: 14,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    label: { color: 'rgba(255,255,255,0.65)', fontWeight: '700' },
    value: { color: 'white', fontWeight: '900', marginTop: 4 },
    btn: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
    },
    btnText: { color: 'white', fontWeight: '800' },
})
