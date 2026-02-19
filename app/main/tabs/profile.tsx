import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { SignOutButton } from '../../components/sign-out-button'

function initialsFromEmail(email: string) {
    const base = (email.split('@')[0] ?? '').trim()
    if (!base) return 'U'
    const parts = base.split(/[._-]+/).filter(Boolean)
    const a = (parts[0]?.[0] ?? base[0] ?? 'U').toUpperCase()
    const b = (parts[1]?.[0] ?? '').toUpperCase()
    return (a + b).slice(0, 2)
}

export default function ProfilePage() {
    const { user } = useUser()
    const email = user?.emailAddresses?.[0]?.emailAddress ?? '—'
    const initials = email !== '—' ? initialsFromEmail(email) : 'U'

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.screen}>
                <View style={styles.card}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>

                    <Text style={styles.email} numberOfLines={1}>
                        {email}
                    </Text>

                    <View style={styles.divider} />

                    <SignOutButton />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f6f7fb' },

    screen: {
        flex: 1,
        backgroundColor: '#f6f7fb',
        paddingHorizontal: 16,
        paddingTop: 18,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
    },

    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#eef2f7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    avatarText: { color: '#111827', fontWeight: '900', fontSize: 16 },

    email: {
        marginTop: 10,
        color: '#111827',
        fontWeight: '800',
        fontSize: 13,
        maxWidth: '100%',
    },

    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#eef2f7',
        marginVertical: 14,
    },
})
