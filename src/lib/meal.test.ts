import { describe, expect, it } from 'vitest'
import { autoFill, compare, formatAmount, suggestionOrder, totals } from './meal'
import { BUILTIN_FOODS } from '../data/foods'
import { PLANS } from '../data/plans'
import type { Food, GroupId } from '../types'

const byId = new Map(BUILTIN_FOODS.map((f) => [f.id, f]))
const food = (id: string) => {
  const f = byId.get(id)
  if (!f) throw new Error(`unknown food ${id}`)
  return f
}

describe('data', () => {
  it('has unique food ids', () => {
    expect(byId.size).toBe(BUILTIN_FOODS.length)
  })

  it('plan meals add up to the daily totals printed on each plan', () => {
    const expected: Record<number, Partial<Record<GroupId, number>>> = {
      1500: { kruh: 7, meso: 5, povrce: 3, voce: 3, mlijeko: 2, masnoce: 4 },
      1700: { kruh: 8, meso: 6, povrce: 3, voce: 3, mlijeko: 2, masnoce: 4 },
      1900: { kruh: 8, meso: 7, povrce: 3, voce: 5, mlijeko: 2, masnoce: 5 },
      2100: { kruh: 9, meso: 8, povrce: 4, voce: 5, mlijeko: 2, masnoce: 6 },
      2700: { kruh: 13, meso: 10, povrce: 4, voce: 6, mlijeko: 2, masnoce: 8 },
    }
    for (const plan of PLANS) {
      const sum: Partial<Record<GroupId, number>> = {}
      for (const meal of Object.values(plan.meals)) {
        for (const [g, n] of Object.entries(meal) as [GroupId, number][]) sum[g] = (sum[g] ?? 0) + n
      }
      expect(sum).toEqual(expected[plan.kcal])
    }
  })
})

describe('autoFill', () => {
  const lunch1900 = PLANS.find((p) => p.kcal === 1900)!.meals.rucak

  it('fills every group when an ingredient is available for each', () => {
    const available = ['meso-svinjetina-but', 'kruh-riza-bijela-ili-integralna', 'povrce-mrkva', 'masnoce-suncokretovo-ulje', 'voce-jabuka'].map(food)
    const alloc = autoFill(lunch1900, available)
    const status = compare(lunch1900, totals(alloc, byId))
    expect(status.every((s) => s.diff === 0)).toBe(true)
    expect(formatAmount(food('kruh-riza-bijela-ili-integralna'), alloc['kruh-riza-bijela-ili-integralna'])).toBe('120 g kuhano (40 g sirovo)')
  })

  it('uses one ingredient per group by default', () => {
    const veg = [food('povrce-mrkva'), food('povrce-rajcica'), food('povrce-paprika')]
    expect(autoFill({ povrce: 2 }, veg)).toEqual({ 'povrce-mrkva': 2 })
    expect(autoFill({ povrce: 2 }, veg, 2)).toEqual({ 'povrce-mrkva': 1, 'povrce-rajcica': 1 })
  })

  it('leaves a group short when nothing from it is at home', () => {
    const alloc = autoFill(lunch1900, [food('meso-svinjetina-but')])
    const status = compare(lunch1900, totals(alloc, byId))
    expect(status.find((s) => s.group === 'kruh')?.diff).toBe(-2)
    expect(status.find((s) => s.group === 'meso')?.diff).toBe(0)
  })

  it('ignores free vegetables when counting units', () => {
    const alloc = autoFill({ povrce: 1 }, [food('povrce-zelena-salata')])
    expect(alloc).toEqual({})
  })

  it('counts the bread contribution of soy flakes', () => {
    const alloc = autoFill({ meso: 2, kruh: 1 }, [food('soja-ljuspice'), food('kruh-kruh-crni')])
    expect(alloc).toEqual({ 'soja-ljuspice': 2, 'kruh-kruh-crni': 0.5 })
    expect(formatAmount(food('soja-ljuspice'), 2)).toBe('30 g')
  })

  it('shows eggs in pieces', () => {
    expect(formatAmount(food('meso-jaje') as Food, 2)).toBe('2 kom')
  })
})

describe('suggestionOrder', () => {
  const targets = { meso: 2, kruh: 2, voce: 1 }
  const home = ['meso-piletina-bez-koze', 'meso-jaje', 'kruh-kruh-razeni', 'kruh-riza-bijela-ili-integralna', 'kruh-heljda', 'voce-jabuka'].map(food)

  it('walks through every distinct combination, then wraps around', () => {
    const { count } = suggestionOrder(targets, home, 0)
    expect(count).toBe(6)
    const seen = new Set<string>()
    for (let n = 0; n < count; n++) {
      seen.add(JSON.stringify(autoFill(targets, suggestionOrder(targets, home, n).order)))
    }
    expect(seen.size).toBe(6)
    expect(autoFill(targets, suggestionOrder(targets, home, 6).order)).toEqual(autoFill(targets, suggestionOrder(targets, home, 0).order))
  })

  it('reports a single combination when each group has one food', () => {
    expect(suggestionOrder(targets, [food('meso-jaje'), food('kruh-kruh-razeni'), food('voce-jabuka')], 3).count).toBe(1)
  })

  it('ignores groups the meal does not need', () => {
    expect(suggestionOrder({ voce: 1 }, home, 0).count).toBe(1)
  })
})
