import { useLocalSearchParams, useRouter } from 'expo-router'
import {
    View,
    Text,
    Image,
    StyleSheet,
    Pressable,
    TextInput,
} from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import {
    getMealById,
    updateMealQuantity,
    deleteMeal,
    type MealItem,
} from '../../../lib/mealsStore'

export default function MealDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()

    const [meal, setMeal] = useState<MealItem | null>(null)
    const [qty, setQty] = useState('')

    useEffect(() => {
        if (!id) return
        ;(async () => {
            const data = await getMealById(id)
            if (!data) {
                router.back()
                return
            }
            setMeal(data)
            setQty(String(data.grams))
        })()
    }, [id, router])

    const product = meal?.product
    const n = product?.nutriments100g

    const totals = useMemo(() => {
        const grams = Number(qty) || 0
        const factor = grams / 100

        const kcal = Number(n?.kcal ?? 0) * factor
        const proteins = Number(n?.proteins ?? 0) * factor
        const carbs = Number(n?.carbs ?? 0) * factor
        const fat = Number(n?.fat ?? 0) * factor

        return {
            grams,
            kcal: kcal.toFixed(1),
            proteins: proteins.toFixed(1),
            carbs: carbs.toFixed(1),
            fat: fat.toFixed(1),
        }
    }, [qty, n])

    if (!meal || !product) {
        return (
            <View style={styles.center}>
                <Text style={styles.loading}>Chargement…</Text>
            </View>
        )
    }

    const onSaveQuantity = async () => {
        const g = Number(qty)
        if (!g || g <= 0) return

        await updateMealQuantity(meal.id, g)
        setMeal({ ...meal, grams: g })
    }

    const onDelete = async () => {
        await deleteMeal(meal.id)
        router.back()
    }

    return (
        <View style={styles.container}>
            {product.imageUrl ? (
                <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                />
            ) : (
                <View style={[styles.image, styles.imageFallback]} />
            )}

            <Text style={styles.name}>{product.name}</Text>
            {!!product.brands && (
                <Text style={styles.brand}>{product.brands}</Text>
            )}

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Quantité</Text>

                <View style={styles.row}>
                    <TextInput
                        value={qty}
                        onChangeText={setQty}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <Text style={styles.unit}>g</Text>

                    <Pressable style={styles.saveBtn} onPress={onSaveQuantity}>
                        <Text style={styles.saveText}>OK</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Valeurs nutritionnelles</Text>

                <Text style={styles.nutrient}>
                    🔥 Calories : {totals.kcal} kcal
                </Text>
                <Text style={styles.nutrient}>
                    💪 Protéines : {totals.proteins} g
                </Text>
                <Text style={styles.nutrient}>
                    🍞 Glucides : {totals.carbs} g
                </Text>
                <Text style={styles.nutrient}>🧈 Lipides : {totals.fat} g</Text>

                {!!product.nutriscore && (
                    <Text style={styles.nutriscore}>
                        Nutri-Score : {product.nutriscore.toUpperCase()}
                    </Text>
                )}
            </View>

            <Pressable style={styles.deleteBtn} onPress={onDelete}>
                <Text style={styles.deleteText}>Supprimer le repas</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1020', padding: 16, gap: 16 },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b1020',
    },
    loading: { color: 'white', fontSize: 16 },
    image: {
        width: '100%',
        height: 220,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    imageFallback: { backgroundColor: 'rgba(255,255,255,0.08)' },
    name: { color: 'white', fontSize: 22, fontWeight: '800' },
    brand: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
    card: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        padding: 14,
        borderRadius: 18,
        gap: 10,
    },
    sectionTitle: { color: 'white', fontWeight: '800', fontSize: 16 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        color: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        minWidth: 80,
        fontSize: 16,
    },
    unit: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
    saveBtn: {
        backgroundColor: '#0a7ea4',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    saveText: { color: 'white', fontWeight: '800' },
    nutrient: { color: 'white', fontSize: 15 },
    nutriscore: { marginTop: 6, color: '#22c55e', fontWeight: '800' },
    deleteBtn: {
        marginTop: 'auto',
        backgroundColor: '#ef4444',
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    deleteText: { color: 'white', fontWeight: '800' },
})
