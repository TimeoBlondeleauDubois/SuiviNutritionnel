import { useCallback, useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { loadMeals, type MealItem } from '../../../lib/mealsStore'

function formatDate(ts?: number) {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

function safeNum(v: any) {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
}

export default function HomePage() {
    const router = useRouter()
    const [meals, setMeals] = useState<MealItem[]>([])

    const refresh = useCallback(async () => {
        const data = await loadMeals()
        setMeals(Array.isArray(data) ? data : [])
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    useFocusEffect(
        useCallback(() => {
            refresh()
        }, [refresh]),
    )

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mes repas</Text>

            <FlatList
                data={meals}
                keyExtractor={(m: any) => String(m.id)}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>
                            Aucun repas enregistré
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const anyItem = item as any
                    const product = anyItem.product
                    const n = product?.nutriments100g

                    const grams = safeNum(anyItem.grams)
                    const kcal100 = safeNum(n?.kcal)
                    const kcalTotal = Math.round(kcal100 * (grams / 100))

                    const createdAt = safeNum(anyItem.createdAt)
                    const dateLabel = formatDate(createdAt)

                    return (
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={() =>
                                router.push({
                                    pathname: '/main/tabs/home/[id]',
                                    params: { id: String(anyItem.id) },
                                })
                            }
                        >
                            <View style={styles.cardLeft}>
                                <Text style={styles.mealName} numberOfLines={1}>
                                    {product?.name ?? 'Repas'}
                                </Text>

                                <Text style={styles.mealMeta} numberOfLines={1}>
                                    {dateLabel ? `${dateLabel} • ` : ''}
                                    {grams} g
                                </Text>
                            </View>

                            <Text style={styles.kcal}>{kcalTotal} kcal</Text>
                        </Pressable>
                    )
                }}
            />

            <Pressable
                style={({ pressed }) => [
                    styles.fab,
                    pressed && styles.fabPressed,
                ]}
                onPress={() => router.push('/main/tabs/add')}
            >
                <Text style={styles.fabText}>＋</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f7fb',
        paddingHorizontal: 16,
        paddingTop: 18,
    },

    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
    },

    listContent: {
        paddingBottom: 80,
        gap: 10,
    },

    empty: {
        marginTop: 40,
        alignItems: 'center',
    },

    emptyText: {
        color: '#6b7280',
        fontSize: 14,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },

    cardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },

    cardLeft: {
        flex: 1,
        marginRight: 10,
    },

    mealName: {
        fontWeight: '700',
        color: '#111827',
        fontSize: 15,
    },

    mealMeta: {
        marginTop: 2,
        fontSize: 12,
        color: '#6b7280',
    },

    kcal: {
        fontWeight: '800',
        fontSize: 14,
        color: '#22c55e',
    },

    fab: {
        position: 'absolute',
        right: 18,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#22c55e',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    fabPressed: {
        transform: [{ scale: 0.95 }],
    },

    fabText: {
        color: 'white',
        fontSize: 28,
        fontWeight: '400',
        marginTop: -2,
    },
})
