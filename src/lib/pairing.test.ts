import { describe, expect, it } from 'vitest'
import { BY_NAME, freeVegFor, suggestions } from './pairing'
import { autoFill } from './meal'
import { BUILTIN_FOODS } from '../data/foods'
import { PLANS } from '../data/plans'
import type { MealId, Units } from '../types'

const byName = new Map(BUILTIN_FOODS.map((f) => [f.name, f]))
const food = (name: string) => {
  const f = byName.get(name)
  if (!f) throw new Error(`unknown food ${name}`)
  return f
}
const names = (picks: { name: string }[]) => picks.map((f) => f.name)
const plan = PLANS.find((p) => p.kcal === 1900 && p.mealsPerDay === 6)!.meals as Record<MealId, Units>

describe('pairing', () => {
  it('only profiles foods that exist', () => {
    expect(Object.keys(BY_NAME).filter((n) => !byName.has(n))).toEqual([])
  })

  it('does not offer zucchini with a glass of milk', () => {
    const home = [food('Jogurt'), food('Zelene tikvice')]
    const [picks] = suggestions('jutro', plan.nocni, home)
    expect(names(picks)).toEqual(['Jogurt'])
    expect(freeVegFor('jutro', picks, home)).toEqual([])
  })

  it('offers raw salad next to a sandwich, cooked vegetables only with lunch', () => {
    const home = [food('Kruh raženi'), food('Šunka prešana'), food('Krastavci svježi'), food('Zelene tikvice')]
    const [picks] = suggestions('jutro', { kruh: 2, meso: 1 }, home)
    expect(names(freeVegFor('jutro', picks, home))).toEqual(['Krastavci svježi'])
    expect(names(freeVegFor('topli', [], home))).toEqual(['Krastavci svježi', 'Zelene tikvice'])
  })

  it('puts rice with lunch and bread with breakfast', () => {
    const home = [food('Kruh raženi'), food('Riža (bijela ili integralna)'), food('Piletina bez kože'), food('Šunka prešana')]
    expect(names(suggestions('topli', { kruh: 2, meso: 2 }, home)[0])).toEqual(['Piletina bez kože', 'Riža (bijela ili integralna)'])
    expect(names(suggestions('jutro', { kruh: 2, meso: 2 }, home)[0])).toEqual(['Šunka prešana', 'Kruh raženi'])
  })

  it('never pairs a spread without bread, or oats with ham', () => {
    const home = [food('Zobene pahuljice'), food('Kruh raženi'), food('Šunka prešana'), food('Margarin mekani'), food('Jogurt')]
    const all = suggestions('jutro', plan.zajutrak, home)
    expect(all.length).toBeGreaterThan(0)
    for (const picks of all) {
      const n = names(picks)
      expect(n.includes('Margarin mekani') && !n.includes('Kruh raženi')).toBe(false)
      expect(n.includes('Zobene pahuljice') && n.includes('Šunka prešana')).toBe(false)
    }
  })

  it('pairs oats with yogurt when there is no meat in the meal', () => {
    const home = [food('Zobene pahuljice'), food('Kruh raženi'), food('Jogurt'), food('Bademi'), food('Maslac')]
    expect(names(suggestions('jutro', { mlijeko: 1, kruh: 2, masnoce: 1 }, home)[0])).toEqual(['Jogurt', 'Zobene pahuljice', 'Bademi'])
  })

  it('still suggests something when every option breaks a rule', () => {
    const home = [food('Riža (bijela ili integralna)')]
    expect(names(suggestions('jutro', { kruh: 1 }, home)[0])).toEqual(['Riža (bijela ili integralna)'])
  })

  it('gives distinct suggestions', () => {
    const home = [food('Kruh raženi'), food('Pecivo integralno'), food('Jabuka'), food('Kivi'), food('Banana')]
    const all = suggestions('jutro', plan.dorucak, home)
    expect(all.length).toBe(6)
    expect(new Set(all.map((p) => JSON.stringify(autoFill(plan.dorucak, p)))).size).toBe(6)
  })
})
