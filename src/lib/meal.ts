import type { Food, GroupId, Units } from '../types'
import { MEAL_GROUP_ORDER } from '../data/groups'

/** Jedinice po namirnici (id → broj jedinica njezine skupine). */
export type Allocation = Record<string, number>

export const roundHalf = (n: number) => Math.round(n * 2) / 2

/** Ukupne jedinice po skupini koje daje raspodjela, uključujući dodatne (npr. soja). */
export function totals(alloc: Allocation, foods: Map<string, Food>): Units {
  const out: Units = {}
  for (const [id, units] of Object.entries(alloc)) {
    const food = foods.get(id)
    if (!food || food.free || units <= 0) continue
    out[food.group] = (out[food.group] ?? 0) + units
    for (const [g, per] of Object.entries(food.extra ?? {}) as [GroupId, number][]) {
      out[g] = (out[g] ?? 0) + per * units
    }
  }
  return out
}

/**
 * Raspodijeli ciljne jedinice obroka na dostupne namirnice.
 * Kao na planovima prehrane, svaka skupina se puni jednom namirnicom (prvom dostupnom);
 * s maxPerGroup > 1 cijele jedinice se dijele redom na više namirnica.
 * Dodatne jedinice (npr. kruh iz sojinih ljuspica) oduzimaju se od cilja te skupine.
 */
export function autoFill(targets: Units, available: Food[], maxPerGroup = 1): Allocation {
  const alloc: Allocation = {}
  const counted = available.filter((f) => !f.free)
  // Skupine čije namirnice doprinose drugim skupinama pune se prve.
  const order = [...MEAL_GROUP_ORDER].sort(
    (a, b) => Number(counted.some((f) => f.group === b && f.extra)) - Number(counted.some((f) => f.group === a && f.extra)),
  )

  for (const g of order) {
    const already = totals(alloc, new Map(counted.map((f) => [f.id, f])))[g] ?? 0
    const need = roundHalf((targets[g] ?? 0) - already)
    if (need <= 0) continue
    const candidates = counted.filter((f) => f.group === g)
    if (candidates.length === 0) continue

    const whole = Math.floor(need)
    const used = candidates.slice(0, Math.max(1, Math.min(maxPerGroup, whole)))
    for (let i = 0; i < whole; i++) {
      const f = used[i % used.length]
      alloc[f.id] = (alloc[f.id] ?? 0) + 1
    }
    const rest = need - whole
    if (rest > 0) alloc[used[0].id] = (alloc[used[0].id] ?? 0) + rest
  }
  return alloc
}

export interface GroupStatus {
  group: GroupId
  target: number
  actual: number
  /** actual − target, zaokruženo na 0,01 */
  diff: number
}

export function compare(targets: Units, actual: Units): GroupStatus[] {
  const groups = MEAL_GROUP_ORDER.filter((g) => (targets[g] ?? 0) > 0 || (actual[g] ?? 0) > 0)
  return groups.map((g) => {
    const target = targets[g] ?? 0
    const a = actual[g] ?? 0
    return { group: g, target, actual: a, diff: Math.round((a - target) * 100) / 100 }
  })
}

export function formatNumber(n: number): string {
  return n.toLocaleString('hr-HR', { maximumFractionDigits: 2 })
}

/** Količina namirnice za zadani broj jedinica, npr. "120 g kuhano (40 g sirovo)". */
export function formatAmount(food: Food, units: number): string {
  if (food.piece) return `${formatNumber(units * food.grams)} kom`
  const main = `${formatNumber(Math.round(units * food.grams))} g${food.state ? ` ${food.state}` : ''}`
  if (!food.altGrams) return main
  return `${main} (${formatNumber(Math.round(units * food.altGrams))} g ${food.altState ?? ''})`.trim()
}

