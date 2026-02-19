import { useEffect, useRef, useState } from 'react'
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Image,
} from 'react-native'
import {
    CameraView,
    useCameraPermissions,
    BarcodeScanningResult,
} from 'expo-camera'
import { useRouter } from 'expo-router'
import {
    getProductByBarcode,
    type ProductSummary,
} from '../../../lib/openFoodFacts'
import { createMeal, type MealType } from '../../../lib/mealsStore'

function safeTrim(s: any) {
    return String(s ?? '').trim()
}

export default function CameraScreen() {
    const router = useRouter()
    const [permission, requestPermission] = useCameraPermissions()
    const [requesting, setRequesting] = useState(false)
    const [busy, setBusy] = useState(false)
    const [notFound, setNotFound] = useState<string | null>(null)

    const [mealType, setMealType] = useState<MealType>('Snack')
    const [scanned, setScanned] = useState<ProductSummary[]>([])

    const lastCodeRef = useRef<string | null>(null)
    const codesRef = useRef<Set<string>>(new Set())

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

        const code = safeTrim(res.data)
        if (!code) return
        if (lastCodeRef.current === code) return
        if (codesRef.current.has(code)) return

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

            codesRef.current.add(code)
            setScanned((prev) => [food, ...prev])
        } finally {
            setTimeout(() => {
                lastCodeRef.current = null
                setBusy(false)
            }, 600)
        }
    }

    const onRemove = (code: string) => {
        codesRef.current.delete(code)
        setScanned((prev) => prev.filter((p) => p.code !== code))
    }

    const onValidate = async () => {
        if (!scanned.length) return
        const meal = await createMeal(mealType, scanned, 100)
        router.replace({
            pathname: '/main/tabs/home/[id]',
            params: { id: meal.id },
        })
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

            <View style={styles.sheet}>
                <View style={styles.sheetHead}>
                    {(
                        [
                            'Petit-déjeuner',
                            'Déjeuner',
                            'Dîner',
                            'Snack',
                        ] as const
                    ).map((t) => {
                        const active = t === mealType
                        return (
                            <Pressable
                                key={t}
                                onPress={() => setMealType(t)}
                                style={[
                                    styles.chip,
                                    active ? styles.chipActive : null,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        active ? styles.chipTextActive : null,
                                    ]}
                                >
                                    {t}
                                </Text>
                            </Pressable>
                        )
                    })}
                </View>

                <Text style={styles.hint}>
                    Scanne plusieurs produits puis valide le repas.
                </Text>

                {busy && <Text style={styles.hint}>Recherche produit…</Text>}

                {!!notFound && (
                    <Text style={styles.error}>
                        Produit introuvable : {notFound}
                    </Text>
                )}

                <FlatList
                    data={scanned}
                    keyExtractor={(it) => it.code}
                    style={{ maxHeight: 220, marginTop: 10 }}
                    contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            {item.imageUrl ? (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.thumb}
                                />
                            ) : (
                                <View
                                    style={[
                                        styles.thumb,
                                        { backgroundColor: '#e5e7eb' },
                                    ]}
                                />
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rowTitle} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                {!!item.brands && (
                                    <Text
                                        style={styles.rowSub}
                                        numberOfLines={1}
                                    >
                                        {item.brands}
                                    </Text>
                                )}
                            </View>
                            <Pressable
                                style={styles.remove}
                                onPress={() => onRemove(item.code)}
                            >
                                <Text style={styles.removeText}>×</Text>
                            </Pressable>
                        </View>
                    )}
                />

                <Pressable
                    onPress={onValidate}
                    disabled={!scanned.length}
                    style={[
                        styles.validate,
                        scanned.length === 0 ? styles.validateDisabled : null,
                    ]}
                >
                    <Text style={styles.validateText}>
                        Valider le repas ({scanned.length})
                    </Text>
                </Pressable>
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

    sheet: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 16,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.92)',
        padding: 12,
    },
    sheetHead: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    chipActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
    chipText: { color: '#6b7280', fontWeight: '900', fontSize: 12 },
    chipTextActive: { color: 'white' },

    hint: {
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '800',
        color: '#111827',
    },
    error: {
        marginTop: 6,
        textAlign: 'center',
        fontWeight: '900',
        color: '#ef4444',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    thumb: { width: 40, height: 40, borderRadius: 12 },
    rowTitle: { color: '#111827', fontWeight: '900' },
    rowSub: { color: '#6b7280', fontWeight: '700', fontSize: 12 },

    remove: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
    },
    removeText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 16,
        marginTop: -1,
    },

    validate: {
        marginTop: 10,
        backgroundColor: '#22c55e',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    validateDisabled: { backgroundColor: '#a7f3d0' },
    validateText: { color: 'white', fontWeight: '900' },
})
