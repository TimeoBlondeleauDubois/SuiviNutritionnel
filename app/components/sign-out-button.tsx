import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import * as React from 'react'
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

function getClerkErrorMessage(err: unknown): string {
    const e = err as any
    const first = e?.errors?.[0]
    return (
        first?.longMessage ||
        first?.message ||
        e?.message ||
        'Une erreur est survenue'
    )
}

export const SignOutButton = () => {
    const { signOut } = useClerk()
    const router = useRouter()

    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSignOut = async () => {
        if (loading) return
        setError(null)
        setLoading(true)
        try {
            await signOut()
            router.replace('/signin')
        } catch (err) {
            setError(getClerkErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={{ width: '100%' }}>
            {!!error && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <Pressable
                onPress={handleSignOut}
                disabled={loading}
                style={({ pressed }) => [
                    styles.btn,
                    loading && styles.btnDisabled,
                    pressed && !loading && styles.btnPressed,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color="#ef4444" />
                ) : (
                    <Text style={styles.text}>Se déconnecter</Text>
                )}
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    btn: {
        width: '100%',
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    btnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
    btnDisabled: { opacity: 0.7 },

    text: { color: '#ef4444', fontWeight: '900' },

    errorBox: {
        marginBottom: 10,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    errorText: { color: '#dc2626', fontWeight: '800', fontSize: 12 },
})
