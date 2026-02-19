import { useLocalSearchParams, useRouter } from 'expo-router'
import {
    View,
    Text,
    Image,
    StyleSheet,
    Pressable,
    ScrollView,
} from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { getMealById, deleteMeal, type MealItem } from '../../../lib/mealsStore'

function safeNum(v: any) {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
}

function formatDate(ts?: number) {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export default function MealDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()

    const [meal, setMeal] = useState<MealItem | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let alive = true

        ;(async () => {
            try {
                setLoading(true)
                if (!id) return

                const data = await getMealById(String(id))
                if (!alive) return

                if (!data) {
                    router.back()
                    return
                }

                setMeal(data)
            } finally {
                if (alive) setLoading(false)
            }
        })()

        return () => {
            alive = false
        }
    }, [id, router])

    const vm = useMemo(() => {
        const anyMeal = meal as any
        const product = anyMeal?.product ?? null
        const n = product?.nutriments100g ?? null

        const grams = safeNum(anyMeal?.grams)
        const factor = grams / 100

        const calories = safeNum(n?.kcal) * factor
        const proteins = safeNum(n?.proteins) * factor
        const carbs = safeNum(n?.carbs) * factor
        const fat = safeNum(n?.fat) * factor

        return {
            title: product?.name ?? 'Repas',
            date: formatDate(safeNum(anyMeal?.createdAt)),
            product,
            grams,
            totals: {
                calories,
                proteins,
                carbs,
                fat,
            },
            nutriscore: product?.nutriscore
                ? String(product.nutriscore).toUpperCase()
                : null,
        }
    }, [meal])

    if (loading || !meal || !vm.product) {
        return (
            <View style={styles.center}>
                <Text style={styles.loading}>Chargement…</Text>
            </View>
        )
    }

    const onDelete = async () => {
        await deleteMeal((meal as any).id)
        router.back()
    }

    return (
        <View style={styles.screen}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerBlock}>
                    <Text style={styles.title}>{vm.title}</Text>
                    {!!vm.date && <Text style={styles.date}>{vm.date}</Text>}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Total nutritionnel</Text>

                    <View style={styles.chipsRow}>
                        <View style={[styles.chip, styles.chipGreen]}>
                            <Text
                                style={[styles.chipValue, styles.chipGreenText]}
                            >
                                {vm.totals.calories.toFixed(0)} kcal
                            </Text>
                            <Text style={styles.chipLabel}>Calories</Text>
                        </View>

                        <View style={[styles.chip, styles.chipBlue]}>
                            <Text
                                style={[styles.chipValue, styles.chipBlueText]}
                            >
                                {vm.totals.proteins.toFixed(1)} g
                            </Text>
                            <Text style={styles.chipLabel}>Protéines</Text>
                        </View>

                        <View style={[styles.chip, styles.chipOrange]}>
                            <Text
                                style={[
                                    styles.chipValue,
                                    styles.chipOrangeText,
                                ]}
                            >
                                {vm.totals.carbs.toFixed(1)} g
                            </Text>
                            <Text style={styles.chipLabel}>Glucides</Text>
                        </View>

                        <View style={[styles.chip, styles.chipRed]}>
                            <Text
                                style={[styles.chipValue, styles.chipRedText]}
                            >
                                {vm.totals.fat.toFixed(1)} g
                            </Text>
                            <Text style={styles.chipLabel}>Lipides</Text>
                        </View>
                    </View>

                    {!!vm.nutriscore && (
                        <Text style={styles.nutriscore}>
                            Nutri-Score : {vm.nutriscore}
                        </Text>
                    )}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeadRow}>
                        <Text style={styles.sectionTitle}>Aliments (1)</Text>
                    </View>

                    <View style={styles.foodCard}>
                        <View style={styles.foodTop}>
                            {vm.product.imageUrl ? (
                                <Image
                                    source={{ uri: vm.product.imageUrl }}
                                    style={styles.thumb}
                                />
                            ) : (
                                <View
                                    style={[styles.thumb, styles.thumbFallback]}
                                />
                            )}

                            <View style={styles.foodInfo}>
                                <Text style={styles.foodName} numberOfLines={1}>
                                    {vm.product.name}
                                </Text>
                                {!!vm.product.brands && (
                                    <Text
                                        style={styles.foodBrand}
                                        numberOfLines={1}
                                    >
                                        {vm.product.brands}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.foodRight}>
                                <Text style={styles.foodQty}>{vm.grams} g</Text>
                            </View>
                        </View>

                        <View style={styles.foodChipsRow}>
                            <View style={[styles.miniChip, styles.miniGreen]}>
                                <Text
                                    style={[
                                        styles.miniText,
                                        styles.miniGreenText,
                                    ]}
                                >
                                    {vm.totals.calories.toFixed(0)} kcal
                                </Text>
                            </View>
                            <View style={[styles.miniChip, styles.miniBlue]}>
                                <Text
                                    style={[
                                        styles.miniText,
                                        styles.miniBlueText,
                                    ]}
                                >
                                    {vm.totals.proteins.toFixed(1)} g
                                </Text>
                            </View>
                            <View style={[styles.miniChip, styles.miniOrange]}>
                                <Text
                                    style={[
                                        styles.miniText,
                                        styles.miniOrangeText,
                                    ]}
                                >
                                    {vm.totals.carbs.toFixed(1)} g
                                </Text>
                            </View>
                            <View style={[styles.miniChip, styles.miniRed]}>
                                <Text
                                    style={[
                                        styles.miniText,
                                        styles.miniRedText,
                                    ]}
                                >
                                    {vm.totals.fat.toFixed(1)} g
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <Pressable
                    style={({ pressed }) => [
                        styles.deleteBtn,
                        pressed && styles.deleteBtnPressed,
                    ]}
                    onPress={onDelete}
                >
                    <Text style={styles.deleteText}>Supprimer ce repas</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f6f7fb' },

    container: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 18,
        gap: 12,
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f6f7fb',
    },
    loading: { color: '#111827', fontSize: 16, fontWeight: '700' },

    headerBlock: { gap: 4, paddingTop: 6 },
    title: { fontSize: 22, fontWeight: '800', color: '#111827' },
    date: { fontSize: 12, color: '#6b7280', fontWeight: '600' },

    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 14,
        gap: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },

    sectionHeadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: { color: '#111827', fontWeight: '800', fontSize: 14 },

    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        flexGrow: 1,
        minWidth: 110,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderWidth: 1,
        backgroundColor: 'rgba(17,24,39,0.02)',
    },
    chipValue: { fontWeight: '900', fontSize: 13 },
    chipLabel: {
        marginTop: 2,
        fontSize: 11,
        color: '#6b7280',
        fontWeight: '700',
    },

    chipGreen: { borderColor: '#86efac', backgroundColor: '#f0fdf4' },
    chipGreenText: { color: '#16a34a' },

    chipBlue: { borderColor: '#93c5fd', backgroundColor: '#eff6ff' },
    chipBlueText: { color: '#2563eb' },

    chipOrange: { borderColor: '#fdba74', backgroundColor: '#fff7ed' },
    chipOrangeText: { color: '#ea580c' },

    chipRed: { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
    chipRedText: { color: '#dc2626' },

    nutriscore: { color: '#16a34a', fontWeight: '900', marginTop: 2 },

    foodCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eef2f7',
        backgroundColor: '#ffffff',
        padding: 12,
        gap: 10,
    },

    foodTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    thumb: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
    },
    thumbFallback: { backgroundColor: '#f3f4f6' },

    foodInfo: { flex: 1, gap: 2 },
    foodName: { color: '#111827', fontWeight: '800' },
    foodBrand: { color: '#6b7280', fontSize: 12, fontWeight: '600' },

    foodRight: { alignItems: 'flex-end' },
    foodQty: { color: '#111827', fontWeight: '900' },

    foodChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    miniChip: {
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
    },
    miniText: { fontWeight: '900', fontSize: 12 },

    miniGreen: { borderColor: '#86efac', backgroundColor: '#f0fdf4' },
    miniGreenText: { color: '#16a34a' },

    miniBlue: { borderColor: '#93c5fd', backgroundColor: '#eff6ff' },
    miniBlueText: { color: '#2563eb' },

    miniOrange: { borderColor: '#fdba74', backgroundColor: '#fff7ed' },
    miniOrangeText: { color: '#ea580c' },

    miniRed: { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
    miniRedText: { color: '#dc2626' },

    bottomBar: {
        paddingHorizontal: 16,
        paddingBottom: 14,
        paddingTop: 10,
        backgroundColor: '#f6f7fb',
        borderTopWidth: 1,
        borderTopColor: '#eef2f7',
    },

    deleteBtn: {
        backgroundColor: '#ef4444',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    deleteBtnPressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
    deleteText: { color: 'white', fontWeight: '900' },
})
