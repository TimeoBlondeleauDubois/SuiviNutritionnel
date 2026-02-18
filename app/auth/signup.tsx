import { ThemedView } from '../components/themed-view'
import { ThemedText } from '../components/themed-text'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

export default function Page() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')

    const onSignUpPress = async () => {
        if (!isLoaded) return

        try {
            await signUp.create({
                emailAddress,
                password,
            })

            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code',
            })

            setPendingVerification(true)
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    const onVerifyPress = async () => {
        if (!isLoaded) return

        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })
            if (signUpAttempt.status === 'complete') {
                await setActive({
                    session: signUpAttempt.createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            console.log(session?.currentTask)
                            return
                        }

                        router.replace('/main/tabs/home')
                    },
                })
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    if (pendingVerification) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText type="title" style={styles.title}>
                    Verify your email
                </ThemedText>
                <ThemedText style={styles.description}>
                    A verification code has been sent to your email.
                </ThemedText>
                <TextInput
                    style={styles.input}
                    value={code}
                    placeholder="Enter your verification code"
                    placeholderTextColor="#666666"
                    onChangeText={(code) => setCode(code)}
                    keyboardType="numeric"
                />
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={onVerifyPress}
                >
                    <ThemedText style={styles.buttonText}>Verify</ThemedText>
                </Pressable>
            </ThemedView>
        )
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
                Sign up
            </ThemedText>
            <ThemedText style={styles.label}>Email address</ThemedText>
            <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                placeholderTextColor="#666666"
                onChangeText={(email) => setEmailAddress(email)}
                keyboardType="email-address"
            />
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
                style={styles.input}
                value={password}
                placeholder="Enter password"
                placeholderTextColor="#666666"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
            />
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    (!emailAddress || !password) && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                ]}
                onPress={onSignUpPress}
                disabled={!emailAddress || !password}
            >
                <ThemedText style={styles.buttonText}>Continue</ThemedText>
            </Pressable>
            <View style={styles.linkContainer}>
                <ThemedText>Have an account? </ThemedText>
                <Link href="./signin">
                    <ThemedText type="link">Sign in</ThemedText>
                </Link>
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 12,
    },
    title: {
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.8,
    },
    label: {
        fontWeight: '600',
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    linkContainer: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 12,
        alignItems: 'center',
    },
})
