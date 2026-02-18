import { useCallback, useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { loadMeals, type MealItem } from '../../../lib/mealsStore'

export default function HomePage() {
    const router = useRouter()
    const [meals, setMeals] = useState<MealItem[]>([])

    const refresh = useCallback(async () => {
        const data = await loadMeals()
        setMeals(data)
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
                keyExtractor={(m) => m.id}
                ListEmptyComponent={
                    <Text style={styles.muted}>Aucun repas enregistré.</Text>
                }
                contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
                renderItem={({ item }) => {
                    const kcal100 = item.product?.nutriments100g?.kcal ?? 0

                    return (
                        <Pressable
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: '/main/tabs/home/[id]',
                                    params: { id: item.id },
                                })
                            }
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {item.product?.name ?? 'Produit'}
                                </Text>
                                <Text style={styles.sub} numberOfLines={1}>
                                    {item.grams}g • {kcal100} kcal/100g
                                </Text>
                            </View>
                            <Text style={styles.chev}>›</Text>
                        </Pressable>
                    )
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b1020', padding: 14, gap: 12 },
    title: { color: 'white', fontSize: 22, fontWeight: '800' },
    muted: { color: 'rgba(255,255,255,0.65)' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    name: { color: 'white', fontWeight: '800' },
    sub: { color: 'rgba(255,255,255,0.65)' },
    chev: { color: 'white', fontSize: 22, fontWeight: '900', opacity: 0.85 },
})
