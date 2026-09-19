import { describe, expect, it } from 'vitest'
import { planDay } from './day'
import { MEAL_CONTEXT, score } from './pairing'
import { compare, totals } from './meal'
import { BUILTIN_FOODS } from '../data/foods'
import { PLANS } from '../data/plans'

const byName = new Map(BUILTIN_FOODS.map((f) => [f.name, f]))
const byId = new Map(BUILTIN_FOODS.map((f) => [f.id, f]))
const home = [
  'Jaje', 'Piletina bez kože', 'Riba morska, riječna', 'Šunka prešana', 'Kruh raženi', 'Riža (bijela ili integralna)',
  'Krumpir kuhani (bez kore)', 'Zobene pahuljice', 'Brokula', 'Mrkva', 'Maslinovo ulje', 'Margarin mekani',
  'Jabuka', 'Banana', 'Kivi', 'Jogurt', 'Mlijeko (do 1,5% m.m.)',
].map((n) => byName.get(n)!)
const plan = PLANS.find((p) => p.kcal === 1900 && p.mealsPerDay === 6)!

describe('planDay', () => {
  it('fills all six meals according to the plan', () => {
    const day = planDay(plan, home, 0)
    expect(day.map((d) => d.meal)).toEqual(['zajutrak', 'dorucak', 'rucak', 'uzina', 'vecera', 'nocni'])
    for (const d of day) {
      expect(compare(plan.meals[d.meal]!, totals(d.alloc, byId)).every((s) => s.diff === 0)).toBe(true)
    }
  })

  it('does not repeat the main protein or side dish at lunch and dinner when there is a choice', () => {
    const day = planDay(plan, home, 0)
    const lunch = day.find((d) => d.meal === 'rucak')!.picks
    const dinner = day.find((d) => d.meal === 'vecera')!.picks
    const main = (picks: typeof lunch, g: string) => picks.find((f) => f.group === g)?.name
    expect(main(lunch, 'meso')).not.toBe(main(dinner, 'meso'))
    expect(main(lunch, 'kruh')).not.toBe(main(dinner, 'kruh'))
  })

  it('gives the same day for the same seed and a different one for another seed', () => {
    const names = (seed: number) => planDay(plan, home, seed).map((d) => d.picks.map((f) => f.name).join('+')).join(' | ')
    expect(names(3)).toBe(names(3))
    expect(new Set([1, 2, 3, 4, 5].map(names)).size).toBeGreaterThan(1)
  })

  it('swaps a single meal with skip', () => {
    const a = planDay(plan, home, 0)
    const b = planDay(plan, home, 0, { rucak: 1 })
    expect(b[2].picks).not.toEqual(a[2].picks)
    expect(b.filter((_, i) => i !== 2).map((d) => d.picks)).toEqual(a.filter((_, i) => i !== 2).map((d) => d.picks))
  })
})

it('a swapped lunch still avoids repeating dinner', () => {
  for (let k = 1; k <= 3; k++) {
    const day = planDay(plan, home, 0, { rucak: k })
    const main = (m: string) => day.find((d) => d.meal === m)!.picks.find((f) => f.group === 'meso')?.name
    expect(main('rucak')).not.toBe(main('vecera'))
  }
})

it('plans a 3-meal day with dairy and fruit at dinner, without breaking pairing rules', () => {
  const three = PLANS.find((p) => p.kcal === 2100 && p.mealsPerDay === 3)!
  const day = planDay(three, home, 0)
  expect(day.map((d) => d.meal)).toEqual(['zajutrak', 'rucak', 'vecera'])
  for (const d of day) {
    expect(compare(three.meals[d.meal]!, totals(d.alloc, byId)).every((s) => s.diff === 0)).toBe(true)
    expect(score(d.picks, MEAL_CONTEXT[d.meal])).toBeGreaterThan(-50)
  }
})

it('does not repeat the lunch protein at a 3-meal dinner', () => {
  const three = PLANS.find((p) => p.kcal === 1900 && p.mealsPerDay === 3)!
  for (const seed of [0, 1, 2, 3]) {
    const day = planDay(three, home, seed)
    const main = (m: string) => day.find((d) => d.meal === m)!.picks.find((f) => f.group === 'meso')?.name
    expect(main('rucak')).not.toBe(main('vecera'))
  }
})

it('spreads fruit across the day when there is enough choice', () => {
  const day = planDay(plan, home, 0)
  const fruit = day.flatMap((d) => d.picks.filter((f) => f.group === 'voce').map((f) => f.name))
  expect(new Set(fruit).size).toBe(Math.min(fruit.length, 3))
})
