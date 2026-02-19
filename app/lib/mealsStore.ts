import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ProductSummary } from './openFoodFacts'

const KEY = 'meals:v2'

export type MealType = 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Snack'

export type MealFoodItem = {
    id: string
    grams: number
    product: ProductSummary
}

export type Meal = {
    id: string
    createdAt: number
    type: MealType
    items: MealFoodItem[]
}

let _inc = 0
function newId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return (crypto as any).randomUUID()
    }
    _inc = (_inc + 1) % 1_000_000
    return `${Date.now()}_${_inc}_${Math.random().toString(16).slice(2)}`
}

function safeNum(v: any) {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
}

function normalizeLoaded(raw: any): Meal[] {
    if (!Array.isArray(raw)) return []

    return raw
        .map((x) => {
            if (!x) return null

            if (Array.isArray(x.items)) {
                const type: MealType =
                    x.type === 'Petit-déjeuner' ||
                    x.type === 'Déjeuner' ||
                    x.type === 'Dîner' ||
                    x.type === 'Snack'
                        ? x.type
                        : 'Snack'

                const items: MealFoodItem[] = x.items
                    .map((it: any) => {
                        if (!it?.product) return null
                        return {
                            id: String(it.id ?? newId()),
                            grams: safeNum(it.grams ?? 100),
                            product: it.product as ProductSummary,
                        }
                    })
                    .filter(Boolean) as MealFoodItem[]

                if (!items.length) return null

                return {
                    id: String(x.id ?? newId()),
                    createdAt: safeNum(x.createdAt ?? Date.now()),
                    type,
                    items,
                } satisfies Meal
            }

            if (x.product) {
                const single: Meal = {
                    id: String(x.id ?? newId()),
                    createdAt: safeNum(x.createdAt ?? Date.now()),
                    type: 'Snack',
                    items: [
                        {
                            id: newId(),
                            grams: safeNum(x.grams ?? 100),
                            product: x.product as ProductSummary,
                        },
                    ],
                }
                return single
            }

            return null
        })
        .filter(Boolean) as Meal[]
}

export async function loadMeals(): Promise<Meal[]> {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) {
        const oldRaw = await AsyncStorage.getItem('meals:v1')
        if (!oldRaw) return []
        try {
            const parsedOld = JSON.parse(oldRaw)
            const migrated = normalizeLoaded(parsedOld)
            await saveMeals(migrated)
            return migrated
        } catch {
            return []
        }
    }

    try {
        const parsed = JSON.parse(raw)
        return normalizeLoaded(parsed)
    } catch {
        return []
    }
}

export async function saveMeals(meals: Meal[]) {
    await AsyncStorage.setItem(KEY, JSON.stringify(meals))
}

export async function createMeal(type: MealType, products: ProductSummary[], gramsEach = 100) {
    const meals = await loadMeals()

    const meal: Meal = {
        id: newId(),
        createdAt: Date.now(),
        type,
        items: products.map((p) => ({
            id: newId(),
            grams: gramsEach,
            product: p,
        })),
    }

    const next = [meal, ...meals]
    await saveMeals(next)
    return meal
}

export async function getMealById(id: string): Promise<Meal | null> {
    const meals = await loadMeals()
    return meals.find((m) => m.id === id) ?? null
}

export async function deleteMeal(id: string) {
    const meals = await loadMeals()
    const filtered = meals.filter((m) => m.id !== id)
    await saveMeals(filtered)
}
