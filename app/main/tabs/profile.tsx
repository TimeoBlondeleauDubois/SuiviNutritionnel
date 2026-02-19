import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useUser } from '@clerk/clerk-expo'
import { SignOutButton } from '../../components/sign-out-button'

export default function ProfilePage() {
    const { user } = useUser()
    const email = user?.emailAddresses?.[0]?.emailAddress ?? '—'

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
            </View>

            <Text style={styles.email}>{email}</Text>

            <View style={styles.card}>
                <Text style={styles.title}>Compte</Text>

                <View style={{ height: 10 }} />

                <SignOutButton />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b1020',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontSize: 26 },
    email: { color: 'white', fontWeight: '800' },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: 'rgba(255,255,255,0.06)',
        padding: 14,
        borderRadius: 18,
    },
    title: { color: 'white', fontWeight: '800', fontSize: 16 },
})
