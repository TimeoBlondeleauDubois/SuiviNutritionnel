import { useEffect, useRef, useState } from 'react'
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from 'react-native'
import {
    CameraView,
    useCameraPermissions,
    BarcodeScanningResult,
} from 'expo-camera'
import { useRouter } from 'expo-router'
import { getProductByBarcode } from '../../../lib/openFoodFacts'
import { addMeal } from '../../../lib/mealsStore'

export default function CameraScreen() {
    const router = useRouter()
    const [permission, requestPermission] = useCameraPermissions()
    const [requesting, setRequesting] = useState(false)
    const [busy, setBusy] = useState(false)
    const [notFound, setNotFound] = useState<string | null>(null)
    const lastCodeRef = useRef<string | null>(null)

    useEffect(() => {
        ;(async () => {
            if (!permission) return
            if (permission.granted) return
            setRequesting(true)
            try {
                await requestPermission()
            } finally {
                setRequesting(false)
            }
        })()
    }, [permission, requestPermission])

    const onScanned = async (res: BarcodeScanningResult) => {
        if (busy) return

        const code = (res.data ?? '').trim()
        if (!code) return
        if (lastCodeRef.current === code) return
        lastCodeRef.current = code

        setBusy(true)
        setNotFound(null)

        try {
            const food = await getProductByBarcode(code)

            if (!food) {
                setNotFound(code)
                lastCodeRef.current = null
                setBusy(false)
                return
            }

            const created = await addMeal(food, 100)

            router.replace({
                pathname: '/main/tabs/home/[id]',
                params: { id: created.id },
            })
        } catch {
            lastCodeRef.current = null
            setBusy(false)
        }
    }

    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.text}>Initialisation…</Text>
            </View>
        )
    }

    if (requesting) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.text}>Demande d’autorisation caméra…</Text>
            </View>
        )
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={[styles.text, { textAlign: 'center' }]}>
                    Accès caméra refusé.{'\n'}Autorise la caméra pour scanner.
                </Text>

                <Pressable
                    style={styles.btn}
                    onPress={() => requestPermission()}
                >
                    <Text style={styles.btnText}>Autoriser</Text>
                </Pressable>

                <Pressable
                    style={[styles.btn, styles.btnGhost]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.btnText}>Retour</Text>
                </Pressable>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={busy ? undefined : onScanned}
            />

            <View style={styles.topBar}>
                <Pressable style={styles.back} onPress={() => router.back()}>
                    <Text style={styles.backText}>←</Text>
                </Pressable>
                <Text style={styles.title}>Scanner</Text>
            </View>

            <View style={styles.bottom}>
                <Text style={styles.hint}>
                    Vise le code-barres. Ajout auto à 100g.
                </Text>

                {busy && <Text style={styles.hint}>Recherche produit…</Text>}

                {!!notFound && (
                    <Text style={styles.error}>
                        Produit introuvable pour : {notFound}
                    </Text>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
        backgroundColor: '#0b1020',
    },
    text: { color: 'white', fontSize: 16, opacity: 0.9 },
    btn: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.14)',
    },
    btnGhost: { backgroundColor: 'rgba(255,255,255,0.08)' },
    btnText: { color: 'white', fontWeight: '700' },

    topBar: {
        position: 'absolute',
        top: 48,
        left: 14,
        right: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    back: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backText: { color: 'white', fontSize: 20, fontWeight: '800' },
    title: { color: 'white', fontSize: 18, fontWeight: '800' },

    bottom: { position: 'absolute', left: 14, right: 14, bottom: 30, gap: 6 },
    hint: {
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '700',
        textAlign: 'center',
    },
    error: { color: '#fb7185', fontWeight: '900', textAlign: 'center' },
})
