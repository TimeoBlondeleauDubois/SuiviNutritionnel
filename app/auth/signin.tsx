import { useSignIn } from '@clerk/clerk-expo'
import type { EmailCodeFactor } from '@clerk/types'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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

function normalizeEmail(s: string) {
    return s.trim().toLowerCase()
}

export default function Page() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [code, setCode] = React.useState('')
    const [showEmailCode, setShowEmailCode] = React.useState(false)

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const canSubmit = !!emailAddress.trim() && !!password && !submitting

    const onSignInPress = React.useCallback(async () => {
        if (!isLoaded || submitting) return
        setError(null)
        setSubmitting(true)

        try {
            const signInAttempt = await signIn.create({
                identifier: normalizeEmail(emailAddress),
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({
                    session: signInAttempt.createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) return
                        router.replace('/main/tabs/home')
                    },
                })
                return
            }

            if (signInAttempt.status === 'needs_second_factor') {
                const emailCodeFactor =
                    signInAttempt.supportedSecondFactors?.find(
                        (factor): factor is EmailCodeFactor =>
                            factor.strategy === 'email_code',
                    )

                if (!emailCodeFactor) {
                    setError('Second facteur non supporté.')
                    return
                }

                await signIn.prepareSecondFactor({
                    strategy: 'email_code',
                    emailAddressId: emailCodeFactor.emailAddressId,
                })
                setShowEmailCode(true)
                return
            }

            setError('Connexion impossible. Réessaie.')
        } catch (err) {
            setError(getClerkErrorMessage(err))
        } finally {
            setSubmitting(false)
        }
    }, [
        isLoaded,
        submitting,
        signIn,
        setActive,
        router,
        emailAddress,
        password,
    ])

    const onVerifyPress = React.useCallback(async () => {
        if (!isLoaded || submitting) return
        setError(null)
        setSubmitting(true)

        try {
            const signInAttempt = await signIn.attemptSecondFactor({
                strategy: 'email_code',
                code: code.trim(),
            })

            if (signInAttempt.status === 'complete') {
                await setActive({
                    session: signInAttempt.createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) return
                        router.replace('/main/tabs/home')
                    },
                })
                return
            }

            setError('Code invalide.')
        } catch (err) {
            setError(getClerkErrorMessage(err))
        } finally {
            setSubmitting(false)
        }
    }, [isLoaded, submitting, signIn, setActive, router, code])

    if (showEmailCode) {
        const canVerify = !!code.trim() && !submitting
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.screen}>
                    <View style={styles.card}>
                        <Text style={styles.brand}>NutriTrack</Text>
                        <Text style={styles.subtitle}>Connexion</Text>

                        <View style={styles.block}>
                            <Text style={styles.label}>
                                Code reçu par email
                            </Text>
                            <TextInput
                                value={code}
                                onChangeText={setCode}
                                placeholder="Ex: 123456"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        </View>

                        {!!error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <Pressable
                            onPress={onVerifyPress}
                            disabled={!canVerify}
                            style={({ pressed }) => [
                                styles.primaryBtn,
                                !canVerify && styles.primaryBtnDisabled,
                                pressed &&
                                    canVerify &&
                                    styles.primaryBtnPressed,
                            ]}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryText}>Vérifier</Text>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                setShowEmailCode(false)
                                setCode('')
                                setError(null)
                            }}
                            style={({ pressed }) => [
                                styles.ghostBtn,
                                pressed && styles.ghostBtnPressed,
                            ]}
                        >
                            <Text style={styles.ghostText}>Retour</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.screen}>
                <View style={styles.card}>
                    <Text style={styles.brand}>NutriTrack</Text>
                    <Text style={styles.subtitle}>Connexion</Text>

                    <View style={styles.block}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={emailAddress}
                            placeholder="Email"
                            placeholderTextColor="#9ca3af"
                            onChangeText={(v) => {
                                setEmailAddress(v)
                                if (error) setError(null)
                            }}
                            keyboardType="email-address"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.block}>
                        <Text style={styles.label}>Mot de passe</Text>
                        <TextInput
                            value={password}
                            placeholder="Mot de passe"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                            onChangeText={(v) => {
                                setPassword(v)
                                if (error) setError(null)
                            }}
                            style={styles.input}
                        />
                    </View>

                    {!!error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <Pressable
                        onPress={onSignInPress}
                        disabled={!canSubmit}
                        style={({ pressed }) => [
                            styles.primaryBtn,
                            !canSubmit && styles.primaryBtnDisabled,
                            pressed && canSubmit && styles.primaryBtnPressed,
                        ]}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryText}>Se connecter</Text>
                        )}
                    </Pressable>

                    <View style={styles.linkRow}>
                        <Text style={styles.linkMuted}>
                            Pas encore de compte ?
                        </Text>
                        <Link href="./signup" asChild>
                            <Pressable>
                                <Text style={styles.linkGreen}>S’inscrire</Text>
                            </Pressable>
                        </Link>
                    </View>
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
        justifyContent: 'center',
    },

    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#eef2f7',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
    },

    brand: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '900',
        color: '#22c55e',
        letterSpacing: 0.2,
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 14,
        color: '#6b7280',
        fontWeight: '700',
        fontSize: 12,
    },

    block: { gap: 6, marginBottom: 10 },
    label: { color: '#111827', fontWeight: '800', fontSize: 12 },

    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eef2f7',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#111827',
        fontWeight: '700',
    },

    errorBox: {
        marginTop: 4,
        marginBottom: 10,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    errorText: { color: '#dc2626', fontWeight: '800', fontSize: 12 },

    primaryBtn: {
        marginTop: 6,
        backgroundColor: '#22c55e',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    primaryBtnPressed: { transform: [{ scale: 0.99 }], opacity: 0.95 },
    primaryBtnDisabled: { backgroundColor: '#a7f3d0' },
    primaryText: { color: '#fff', fontWeight: '900', fontSize: 14 },

    ghostBtn: {
        marginTop: 10,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    ghostBtnPressed: { opacity: 0.9 },
    ghostText: { color: '#111827', fontWeight: '900' },

    linkRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        alignItems: 'center',
    },
    linkMuted: { color: '#6b7280', fontWeight: '700', fontSize: 12 },
    linkGreen: { color: '#22c55e', fontWeight: '900', fontSize: 12 },
})
