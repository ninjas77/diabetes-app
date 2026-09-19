import { planMeals, targetsFor } from '../data/plans'
import type { Food, GroupId, MealId, Plan } from '../types'
import { autoFill } from './meal'
import type { Allocation } from './meal'
import { MEAL_CONTEXT, scoredSuggestions } from './pairing'

export interface DayMeal {
  meal: MealId
  picks: Food[]
  alloc: Allocation
  /** Koliko je različitih prijedloga za ovaj obrok. */
  count: number
}

/** Koliko smeta ponavljanje iste namirnice u danu (ulje i mlijeko dvaput dnevno je normalno). */
const REPEAT_COST: Record<GroupId, number> = { meso: 10, kruh: 8, povrce: 8, voce: 6, mlijeko: 2, masnoce: 0 }

/** Koliko je "vidljiva" zamjena namirnice iz pojedine skupine kad korisnik zamijeni obrok. */
const SWAP_WEIGHT: Record<GroupId, number> = { meso: 4, kruh: 3, povrce: 2, mlijeko: 2, voce: 1, masnoce: 0.5 }

/** Koliko najboljih prijedloga po obroku se razmatra pri slaganju dana. */
const CONSIDER = 2000

/** Mali deterministički generator slučajnih brojeva, da isti "seed" daje isti jelovnik. */
function random(seed: number) {
  let a = seed + 0x6d2b79f5
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Složi cijeli dan: obroke redom, svaki od najboljih prijedloga za tu vrstu obroka,
 * tako da se namirnice što manje ponavljaju kroz dan. `seed` daje drugi jelovnik.
 * `skip[meal]` zamjenjuje samo taj obrok (toliko sljedećih izbora), ostali ostaju isti.
 */
export function planDay(plan: Plan, available: Food[], seed: number, skip: Partial<Record<MealId, number>> = {}): DayMeal[] {
  const meals = planMeals(plan)
  const rand = random(seed)
  const noise = meals.map(() => Array.from({ length: CONSIDER }, () => (seed > 0 ? rand() * 6 : 0)))
  const scored = meals.map(({ id }) => scoredSuggestions(MEAL_CONTEXT[id], targetsFor(plan, id), available).slice(0, CONSIDER))
  const options = scored.map((list) => list.map((x) => x.picks))

  const repeats = (picks: Food[], used: Map<string, number>) =>
    picks.reduce((sum, f) => sum + (used.get(f.id) ?? 0) * REPEAT_COST[f.group], 0)

  const rank = (i: number, used: Map<string, number>) =>
    scored[i]
      .map(({ picks, score }, r) => {
        // Bolje ocijenjeni prijedlozi imaju prednost; šum iz seeda daje raznolikost.
        const best = scored[i][0].score
        return { picks, cost: repeats(picks, used) + (best - score) * 3 + noise[i][r] }
      })
      .sort((a, b) => a.cost - b.cost)
      .map((x) => x.picks)

  const count = (picks: Food[], used: Map<string, number>) => {
    for (const f of picks) used.set(f.id, (used.get(f.id) ?? 0) + 1)
    return used
  }

  // 1. Osnovni dan: pohlepno, obrok po obrok.
  const used = new Map<string, number>()
  const chosen = meals.map((_, i) => {
    const picks = rank(i, used)[0] ?? []
    count(picks, used)
    return picks
  })

  // 2. Zamjene: obrok se bira iznova s obzirom na sve ostale obroke, koji se ne mijenjaju.
  meals.forEach(({ id }, i) => {
    if (!skip[id]) return
    const others = new Map<string, number>()
    chosen.forEach((picks, j) => j !== i && count(picks, others))
    // Trenutni izbor je na mjestu 0, tako da svaka zamjena stvarno donosi drugi obrok.
    // Zamjene koje mijenjaju glavnu namirnicu i prilog idu prije onih koje mijenjaju samo voće.
    const base = chosen[i]
    const changed = (p: Food[]) =>
      p.reduce((sum, f) => sum + (base.includes(f) ? 0 : SWAP_WEIGHT[f.group]), 0)
    // Ručak i večera ne dijele glavnu namirnicu (meso/ribu) ako postoji ikakva druga mogućnost.
    const ctx = MEAL_CONTEXT[id]
    const otherMains = new Set(
      meals.flatMap((m, j) => (j !== i && MEAL_CONTEXT[m.id] === ctx ? chosen[j].filter((f) => f.group === 'meso') : [])),
    )
    const alternatives = rank(i, others)
      .filter((p) => p !== base)
      .map((p, r) => ({
        p,
        key: changed(p) - repeats(p, others) * 0.5 - r * 0.1 - (p.some((f) => otherMains.has(f)) ? 100 : 0),
      }))
      .sort((x, y) => y.key - x.key)
      .map((x) => x.p)
    const ranked = [base, ...alternatives]
    chosen[i] = ranked[skip[id]! % ranked.length]
  })

  return meals.map(({ id }, i) => ({
    meal: id,
    picks: chosen[i],
    alloc: autoFill(targetsFor(plan, id), [...chosen[i], ...available.filter((f) => !chosen[i].includes(f))]),
    count: options[i].length,
  }))
}
