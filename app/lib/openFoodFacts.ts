export type OffProduct = {
    code: string
    product_name?: string
    product_name_fr?: string
    product_name_en?: string
    brands?: string
    image_url?: string
    nutriscore_grade?: string
    nutriments?: {
        'energy-kcal_100g'?: number
        proteins_100g?: number
        carbohydrates_100g?: number
        fat_100g?: number
    }
}

const USER_AGENT = 'SuiviNutritionnel/1.0 (expo)'

function pickName(p: OffProduct) {
    return (
        p.product_name?.trim() ||
        p.product_name_fr?.trim() ||
        p.product_name_en?.trim() ||
        'Produit sans nom'
    )
}

export type ProductSummary = {
    code: string
    name: string
    brands?: string
    imageUrl?: string
    nutriscore?: string
    nutriments100g: {
        kcal: number
        proteins: number
        carbs: number
        fat: number
    }
}

export function mapProduct(p: OffProduct): ProductSummary {
    const n = p.nutriments ?? {}
    return {
        code: String(p.code ?? '').trim(),
        name: pickName(p),
        brands: p.brands?.trim(),
        imageUrl: p.image_url?.trim(),
        nutriscore: p.nutriscore_grade?.trim()?.toUpperCase(),
        nutriments100g: {
            kcal: Number(n['energy-kcal_100g'] ?? 0),
            proteins: Number(n.proteins_100g ?? 0),
            carbs: Number(n.carbohydrates_100g ?? 0),
            fat: Number(n.fat_100g ?? 0),
        },
    }
}

function normalize(s: string) {
    return s
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

function expandMealKeyword(query: string): string {
    const q = normalize(query)

    if (q.includes('petit') || q.includes('dejeun'))
        return 'breakfast petit-dejeuner'
    if (q.includes('dej') && !q.includes('petit')) return 'lunch dejeuner'
    if (q.includes('din')) return 'dinner diner'
    if (q.includes('snack') || q.includes('gouter')) return 'snack'

    return query.trim()
}

export async function searchProducts(query: string, pageSize = 10) {
    const base = query.trim()
    if (!base) return []

    const expanded = expandMealKeyword(base)

    const fields =
        'code,product_name,product_name_fr,product_name_en,brands,nutriments,image_url,nutriscore_grade'

    const url =
        `https://fr.openfoodfacts.org/cgi/search.pl?` +
        `search_terms=${encodeURIComponent(expanded)}` +
        `&search_simple=1&action=process&json=1` +
        `&json=1` +
        `&fields=${encodeURIComponent(fields)}` +
        `&page_size=${pageSize}`

    const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
    })

    if (!res.ok) throw new Error('Erreur OpenFoodFacts (search)')
    const data = await res.json()

    const products: OffProduct[] = Array.isArray(data?.products)
        ? data.products
        : []
    return products.filter((p) => p && p.code).map(mapProduct)
}

export async function getProductByBarcode(code: string) {
    const c = code.trim()
    if (!c) return null

    const fields =
        'code,product_name,product_name_fr,product_name_en,brands,nutriments,image_url,nutriscore_grade'

    const url =
        `https://fr.openfoodfacts.org/api/v2/product/${encodeURIComponent(c)}.json?` +
        `fields=${encodeURIComponent(fields)}`

    const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
    })
    if (!res.ok) throw new Error('Erreur OpenFoodFacts (barcode)')
    const data = await res.json()

    if (data?.status !== 1 || !data?.product) return null
    return mapProduct(data.product as OffProduct)
}
