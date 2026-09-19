import type { MealId, Plan, Units } from '../types'

export const MEALS: { id: MealId; name: string; time: string }[] = [
  { id: 'zajutrak', name: 'Zajutrak', time: '8h' },
  { id: 'dorucak', name: 'Doručak', time: '10h' },
  { id: 'rucak', name: 'Ručak', time: '13h' },
  { id: 'uzina', name: 'Užina', time: '16h' },
  { id: 'vecera', name: 'Večera', time: '18h' },
  { id: 'nocni', name: 'Noćni obrok', time: '21h' },
]

const SOURCE_KBC = 'KBC Sestre milosrdnice, Zavod za endokrinologiju, dijabetes i bolesti metabolizma „Mladen Sekso”, Služba za dijetetiku i prehranu'
const SOURCE_PLIVA = 'PLIVAzdravlje – Dijabetička dijeta (izvor: Hrvatsko društvo za dijabetes; prim. dr. sc. V. Altabas, V. Škoro, mag. nutr.)'
const SOUP = 'Uz ručak se može dodati 1 tanjur obrane juhe bez tjestenine.'
const SOUP_PASTA = 'Uz ručak se može dodati 1 tanjur obrane juhe; tjestenina za juhu (20 g sirove) uračunava se u jedinice kruha.'

// 6 obroka dnevno: planovi "Dijabetička dijeta" (KBC Sestre milosrdnice, Zavod "Mladen Sekso").
// 3 obroka dnevno: plivazdravlje.hr/dijabeticka-dijeta/<kcal>kcal-3obroka.html
export const PLANS: Plan[] = [
  {
    kcal: 1500, kj: 6300, mealsPerDay: 6, source: SOURCE_KBC, notes: { rucak: SOUP },
    meals: {
      zajutrak: { mlijeko: 1, kruh: 2, meso: 1 },
      dorucak: { kruh: 1, voce: 1 },
      rucak: { meso: 2, kruh: 2, povrce: 2, masnoce: 2, voce: 1 },
      uzina: { voce: 1 },
      vecera: { meso: 2, kruh: 2, povrce: 1, masnoce: 2 },
      nocni: { mlijeko: 1 },
    },
  },
  {
    kcal: 1700, kj: 7140, mealsPerDay: 6, source: SOURCE_KBC, notes: { rucak: SOUP },
    meals: {
      zajutrak: { mlijeko: 1, kruh: 2, meso: 1 },
      dorucak: { kruh: 1, voce: 1 },
      rucak: { meso: 2, kruh: 2, povrce: 2, masnoce: 2, voce: 1 },
      uzina: { kruh: 1, meso: 1, voce: 1 },
      vecera: { meso: 2, kruh: 2, povrce: 1, masnoce: 2 },
      nocni: { mlijeko: 1 },
    },
  },
  {
    kcal: 1900, kj: 7980, mealsPerDay: 6, source: SOURCE_KBC, notes: { rucak: SOUP },
    meals: {
      zajutrak: { mlijeko: 1, kruh: 2, meso: 2, masnoce: 1 },
      dorucak: { kruh: 1, voce: 2 },
      rucak: { meso: 2, kruh: 2, povrce: 2, masnoce: 2, voce: 1 },
      uzina: { kruh: 1, meso: 1, voce: 2 },
      vecera: { meso: 2, kruh: 2, povrce: 1, masnoce: 2 },
      nocni: { mlijeko: 1 },
    },
  },
  {
    kcal: 2100, kj: 8820, mealsPerDay: 6, source: SOURCE_KBC, notes: { rucak: SOUP },
    meals: {
      zajutrak: { mlijeko: 1, kruh: 2, meso: 2, masnoce: 1 },
      dorucak: { kruh: 1, meso: 1, voce: 2 },
      rucak: { meso: 2, kruh: 2, povrce: 2, masnoce: 2, voce: 1 },
      uzina: { kruh: 1, meso: 1, masnoce: 1, voce: 2 },
      vecera: { meso: 2, kruh: 2, povrce: 2, masnoce: 2 },
      nocni: { mlijeko: 1, kruh: 1 },
    },
  },
  {
    kcal: 2700, kj: 11340, mealsPerDay: 6, source: SOURCE_KBC, notes: { rucak: SOUP },
    meals: {
      zajutrak: { mlijeko: 1, kruh: 2, meso: 2, masnoce: 2 },
      dorucak: { kruh: 2, meso: 1, masnoce: 1, voce: 2 },
      rucak: { meso: 2, kruh: 3, povrce: 2, masnoce: 2, voce: 2 },
      uzina: { kruh: 2, meso: 2, masnoce: 1, voce: 2 },
      vecera: { meso: 2, kruh: 3, povrce: 2, masnoce: 2 },
      nocni: { mlijeko: 1, kruh: 1, meso: 1 },
    },
  },
  {
    kcal: 1900, kj: 7980, mealsPerDay: 3, source: SOURCE_PLIVA, notes: { rucak: SOUP_PASTA },
    meals: {
      zajutrak: { mlijeko: 1, meso: 2, kruh: 3, masnoce: 1, voce: 2 },
      rucak: { meso: 3, kruh: 3, povrce: 2, masnoce: 2, voce: 2 },
      vecera: { mlijeko: 1, meso: 2, kruh: 2, povrce: 1, masnoce: 2, voce: 1 },
    },
  },
  {
    kcal: 2100, kj: 8820, mealsPerDay: 3, source: SOURCE_PLIVA, notes: { rucak: SOUP_PASTA },
    meals: {
      zajutrak: { mlijeko: 1, meso: 2, kruh: 3, voce: 2 },
      rucak: { meso: 3, kruh: 3, povrce: 2, masnoce: 3, voce: 2 },
      vecera: { mlijeko: 1, meso: 3, kruh: 3, povrce: 2, masnoce: 3, voce: 1 },
    },
  },
]

/** Obroci koje plan ima, redom kroz dan. */
export const planMeals = (plan: Plan) => MEALS.filter((m) => plan.meals[m.id])

/** Jedinice koje plan traži za obrok (prazno ako plan nema taj obrok). */
export const targetsFor = (plan: Plan, meal: MealId): Units => plan.meals[meal] ?? {}

/** Plan za odabrane kcal i broj obroka; ako te kombinacije nema, plan sa 6 obroka. */
export const findPlan = (kcal: number | null, mealsPerDay: number) =>
  PLANS.find((p) => p.kcal === kcal && p.mealsPerDay === mealsPerDay) ?? PLANS.find((p) => p.kcal === kcal && p.mealsPerDay === 6) ?? null
