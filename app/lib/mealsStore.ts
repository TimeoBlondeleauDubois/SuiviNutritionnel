import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ProductSummary } from './openFoodFacts'

const KEY = 'meals:v1'

export type MealItem = {
    id: string
    createdAt: number
    grams: number
    product: ProductSummary
}

export async function loadMeals(): Promise<MealItem[]> {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return []

    try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export async function saveMeals(meals: MealItem[]) {
    await AsyncStorage.setItem(KEY, JSON.stringify(meals))
}

export async function addMeal(product: ProductSummary, grams = 100) {
    const meals = await loadMeals()

    const item: MealItem = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        createdAt: Date.now(),
        grams,
        product,
    }

    const next = [item, ...meals]
    await saveMeals(next)

    return item
}

export async function getMealById(id: string): Promise<MealItem | null> {
    const meals = await loadMeals()
    return meals.find((m) => m.id === id) ?? null
}

export async function updateMealQuantity(id: string, grams: number) {
    const meals = await loadMeals()

    const updated = meals.map((m) => (m.id === id ? { ...m, grams } : m))

    await saveMeals(updated)
}

export async function deleteMeal(id: string) {
    const meals = await loadMeals()

    const filtered = meals.filter((m) => m.id !== id)

    await saveMeals(filtered)
}
