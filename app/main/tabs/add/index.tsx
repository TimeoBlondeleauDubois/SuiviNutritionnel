import { useEffect, useMemo, useState } from 'react'
import {
    View,
    Text,
    TextInput,
    FlatList,
    Pressable,
    Image,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useDebounce } from '../../../hooks/useDebounce'
import { searchProducts, type ProductSummary } from '../../../lib/openFoodFacts'
import { addMeal, loadMeals, type MealItem } from '../../../lib/mealsStore'

const MEAL_TYPES = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Snack'] as const
type MealType = (typeof MEAL_TYPES)[number]

function safeNum(v: any) {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
}

function mealTypeToQuery(t: MealType) {
    switch (t) {
        case 'Petit-déjeuner':
            return 'petit déjeuner'
        case 'Déjeuner':
            return 'déjeuner'
        case 'Dîner':
            return 'dîner'
        case 'Snack':
        default:
            return 'snack'
    }
}

const BOTTOM_BAR_H = 74

export default function AddPage() {
    const router = useRouter()

    const [mealType, setMealType] = useState<MealType>('Snack')
    const [q, setQ] = useState('')
    const debounced = useDebounce(q, 600)

    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<ProductSummary[]>([])
    const [error, setError] = useState<string | null>(null)

    const [picked, setPicked] = useState<ProductSummary[]>([])
    const [recent, setRecent] = useState<MealItem[]>([])

    useEffect(() => {
        ;(async () => {
            const term = debounced.trim()
            if (!term) {
                setItems([])
                setError(null)
                return
            }
            setLoading(true)
            setError(null)
            try {
                const res = await searchProducts(term, 10)
                setItems(res)
            } catch (e: any) {
                setError(e?.message ?? 'Erreur recherche')
            } finally {
                setLoading(false)
            }
        })()
    }, [debounced])

    useEffect(() => {
        ;(async () => {
            const all = await loadMeals()
            setRecent(all.slice(0, 3))
        })()
    }, [])

    const pickedMap = useMemo(() => {
        const m = new Map<string, ProductSummary>()
        for (const p of picked) m.set(p.code, p)
        return m
    }, [picked])

    const onTogglePick = (p: ProductSummary) => {
        setPicked((prev) => {
            const exists = prev.some((x) => x.code === p.code)
            if (exists) return prev.filter((x) => x.code !== p.code)
            return [...prev, p]
        })
    }

    const onValidate = async () => {
        if (!picked.length) return

        let lastCreatedId: string | null = null
        for (const p of picked) {
            const created = await addMeal(p, 100)
            lastCreatedId = created.id
        }

        const all = await loadMeals()
        setRecent(all.slice(0, 3))
        setPicked([])

        if (lastCreatedId) {
            router.push({
                pathname: '/main/tabs/home/[id]',
                params: { id: lastCreatedId },
            })
        } else {
            router.push('/main/tabs/home')
        }
    }

    const Header = (
        <View style={styles.header}>
            <Text style={styles.title}>Nouveau repas</Text>

            <Text style={styles.sectionTitle}>Type de repas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipsRow}>
                    {MEAL_TYPES.map((t) => {
                        const active = t === mealType
                        return (
                            <Pressable
                                key={t}
                                onPress={() => {
                                    setMealType(t)
                                    setQ(mealTypeToQuery(t))
                                }}
                                style={({ pressed }) => [
                                    styles.chip,
                                    active && styles.chipActive,
                                    pressed && styles.chipPressed,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        active && styles.chipTextActive,
                                    ]}
                                >
                                    {t}
                                </Text>
                            </Pressable>
                        )
                    })}
                </View>
            </ScrollView>

            <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Rechercher un aliment</Text>

                <Pressable
                    style={({ pressed }) => [
                        styles.scanBtn,
                        pressed && styles.scanBtnPressed,
                    ]}
                    onPress={() => router.push('/main/tabs/add/camera')}
                >
                    <Text style={styles.scanBtnText}>Scanner</Text>
                </Pressable>
            </View>

            <View style={styles.searchRow}>
                <TextInput
                    value={q}
                    onChangeText={setQ}
                    placeholder="Rechercher un produit…"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                    autoCorrect={false}
                />
                <Pressable
                    style={styles.qrSquare}
                    onPress={() => router.push('/main/tabs/add/camera')}
                >
                    <Text style={styles.qrSquareText}>⌁</Text>
                </Pressable>
            </View>

            {loading && (
                <View style={styles.rowInfo}>
                    <ActivityIndicator />
                    <Text style={styles.muted}>Recherche…</Text>
                </View>
            )}

            {!!error && <Text style={styles.error}>{error}</Text>}

            {!!picked.length && (
                <View style={styles.pickedBox}>
                    <Text style={styles.sectionTitle}>
                        Aliments ajoutés ({picked.length})
                    </Text>

                    <View style={styles.pickedList}>
                        {picked.map((p) => (
                            <View key={p.code} style={styles.pickedRow}>
                                <Text
                                    style={styles.pickedName}
                                    numberOfLines={1}
                                >
                                    {p.name}
                                </Text>
                                <Pressable
                                    onPress={() => onTogglePick(p)}
                                    style={({ pressed }) => [
                                        styles.removeDot,
                                        pressed && { opacity: 0.8 },
                                    ]}
                                >
                                    <Text style={styles.removeDotText}>−</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    )

    const Footer = (
        <View style={{ paddingBottom: BOTTOM_BAR_H + 18 }}>
            {!!recent.length && (
                <View style={styles.recentBox}>
                    <Text style={styles.sectionTitle}>Ajoutés récemment</Text>
                    {recent.map((m: any) => (
                        <Text
                            key={String(m.id)}
                            style={styles.recentItem}
                            numberOfLines={1}
                        >
                            • {m.product?.name ?? 'Produit'}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    )

    return (
        <View style={styles.screen}>
            <FlatList
                data={items}
                keyExtractor={(it) => it.code}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={Header}
                ListFooterComponent={Footer}
                renderItem={({ item }) => {
                    const selected = pickedMap.has(item.code)
                    const kcal = safeNum(item.nutriments100g?.kcal)

                    return (
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,
                                pressed && styles.cardPressed,
                                selected && styles.cardSelected,
                            ]}
                            onPress={() => onTogglePick(item)}
                        >
                            <View style={styles.thumbWrap}>
                                {item.imageUrl ? (
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.thumb}
                                    />
                                ) : (
                                    <View
                                        style={[
                                            styles.thumb,
                                            styles.thumbFallback,
                                        ]}
                                    />
                                )}
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {item.name}
                                </Text>

                                {!!item.brands && (
                                    <Text
                                        style={styles.brand}
                                        numberOfLines={1}
                                    >
                                        {item.brands}
                                    </Text>
                                )}

                                <Text style={styles.meta} numberOfLines={1}>
                                    {kcal} kcal/100g
                                </Text>
                            </View>

                            <View style={styles.rightCol}>
                                <View
                                    style={[
                                        styles.plusBadge,
                                        selected && styles.plusBadgeSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.plusText,
                                            selected && styles.plusTextSelected,
                                        ]}
                                    >
                                        {selected ? '✓' : '+'}
                                    </Text>
                                </View>
                            </View>
                        </Pressable>
                    )
                }}
            />

            <View style={styles.bottomBar}>
                <Pressable
                    onPress={onValidate}
                    disabled={!picked.length}
                    style={({ pressed }) => [
                        styles.validateBtn,
                        picked.length === 0 ? styles.validateBtnDisabled : null,
                        pressed && picked.length > 0
                            ? styles.validateBtnPressed
                            : null,
                    ]}
                >
                    <Text style={styles.validateText}>Valider le repas</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f6f7fb' },

    header: {
        paddingHorizontal: 16,
        paddingTop: 18,
        gap: 10,
    },

    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 2,
    },

    sectionTitle: { color: '#111827', fontWeight: '800', fontSize: 13 },

    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 2,
    },

    chipsRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },

    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#eef2f7',
    },
    chipPressed: { opacity: 0.88 },
    chipActive: {
        backgroundColor: '#22c55e',
        borderColor: '#22c55e',
    },
    chipText: { color: '#6b7280', fontWeight: '800', fontSize: 12 },
    chipTextActive: { color: 'white' },

    scanBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#22c55e',
    },
    scanBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
    scanBtnText: { color: 'white', fontWeight: '900', fontSize: 12 },

    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

    input: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        color: '#111827',
        borderWidth: 1,
        borderColor: '#eef2f7',
    },

    qrSquare: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#22c55e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrSquareText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 18,
        marginTop: -2,
    },

    rowInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 4,
    },
    muted: { color: '#6b7280', fontWeight: '600' },
    error: { color: '#ef4444', fontWeight: '800', marginTop: 4 },

    pickedBox: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#eef2f7',
        gap: 10,
    },
    pickedList: { gap: 8 },
    pickedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#eef2f7',
    },
    pickedName: { flex: 1, color: '#111827', fontWeight: '700' },
    removeDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeDotText: { color: 'white', fontWeight: '900', marginTop: -1 },

    listContent: {
        paddingBottom: 0,
        gap: 10,
    },

    card: {
        marginHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#eef2f7',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
    cardSelected: { borderColor: '#86efac', backgroundColor: '#f0fdf4' },

    thumbWrap: { width: 44, height: 44, borderRadius: 12, overflow: 'hidden' },
    thumb: { width: '100%', height: '100%' },
    thumbFallback: { backgroundColor: '#f3f4f6' },

    cardBody: { flex: 1, gap: 2 },
    name: { color: '#111827', fontWeight: '800' },
    brand: { color: '#6b7280', fontWeight: '600', fontSize: 12 },
    meta: { color: '#6b7280', fontWeight: '700', fontSize: 12, marginTop: 2 },

    rightCol: { alignItems: 'flex-end' },
    plusBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    plusBadgeSelected: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
    plusText: {
        color: '#111827',
        fontWeight: '900',
        fontSize: 16,
        marginTop: -1,
    },
    plusTextSelected: { color: 'white' },

    recentBox: {
        marginTop: 10,
        marginHorizontal: 16,
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#eef2f7',
        gap: 6,
    },
    recentItem: { color: '#6b7280', fontWeight: '700' },

    bottomBar: {
        height: BOTTOM_BAR_H,
        paddingHorizontal: 16,
        paddingBottom: 14,
        paddingTop: 10,
        backgroundColor: '#f6f7fb',
        borderTopWidth: 1,
        borderTopColor: '#eef2f7',
    },

    validateBtn: {
        backgroundColor: '#22c55e',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    validateBtnPressed: { transform: [{ scale: 0.99 }], opacity: 0.95 },
    validateBtnDisabled: { backgroundColor: '#a7f3d0' },
    validateText: { color: 'white', fontWeight: '900' },
})
