import { useEffect, useState } from 'react'
import {
    View,
    Text,
    TextInput,
    FlatList,
    Pressable,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useDebounce } from '../../../hooks/useDebounce'
import { searchProducts, type ProductSummary } from '../../../lib/openFoodFacts'
import { addMeal } from '../../../lib/mealsStore'

export default function AddPage() {
    const router = useRouter()
    const [q, setQ] = useState('')
    const debounced = useDebounce(q, 600)
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<ProductSummary[]>([])
    const [error, setError] = useState<string | null>(null)

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

    const onAdd = async (p: ProductSummary) => {
        const created = await addMeal(p, 100)
        router.push({
            pathname: '/main/tabs/home/[id]',
            params: { id: created.id },
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Ajouter un aliment</Text>

                <Link href="/main/tabs/add/camera" asChild>
                    <Pressable style={styles.btn}>
                        <Text style={styles.btnText}>📷 Scanner</Text>
                    </Pressable>
                </Link>
            </View>

            <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Rechercher (ex: coca cola)…"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.input}
                autoCorrect={false}
            />

            {loading && (
                <View style={styles.rowInfo}>
                    <ActivityIndicator />
                    <Text style={styles.muted}>Recherche…</Text>
                </View>
            )}

            {!!error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={items}
                keyExtractor={(it) => it.code}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item }) => (
                    <Pressable style={styles.card} onPress={() => onAdd(item)}>
                        <View style={styles.cardLeft}>
                            {item.imageUrl ? (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.img}
                                />
                            ) : (
                                <View
                                    style={[styles.img, styles.imgFallback]}
                                />
                            )}
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.name} numberOfLines={1}>
                                {item.name}
                            </Text>
                            {!!item.brands && (
                                <Text style={styles.brand} numberOfLines={1}>
                                    {item.brands}
                                </Text>
                            )}
                            <Text style={styles.nutri} numberOfLines={1}>
                                {item.nutriments100g.kcal} kcal /100g • P{' '}
                                {item.nutriments100g.proteins} • G{' '}
                                {item.nutriments100g.carbs} • L{' '}
                                {item.nutriments100g.fat}
                                {!!item.nutriscore &&
                                    ` • Nutri ${item.nutriscore}`}
                            </Text>
                        </View>

                        <Text style={styles.plus}>＋</Text>
                    </Pressable>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1020', padding: 14, gap: 12 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: { color: 'white', fontSize: 22, fontWeight: '800' },
    btn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    btnText: { color: 'white', fontWeight: '700' },
    input: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        color: 'white',
    },
    rowInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    muted: { color: 'rgba(255,255,255,0.65)' },
    error: { color: '#fb7185', fontWeight: '700' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    cardLeft: { width: 54, height: 54, borderRadius: 12, overflow: 'hidden' },
    img: { width: '100%', height: '100%' },
    imgFallback: { backgroundColor: 'rgba(255,255,255,0.08)' },
    name: { color: 'white', fontWeight: '800' },
    brand: { color: 'rgba(255,255,255,0.7)' },
    nutri: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
    plus: {
        color: 'white',
        fontSize: 22,
        fontWeight: '900',
        marginLeft: 6,
        opacity: 0.9,
    },
})
