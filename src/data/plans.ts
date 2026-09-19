import type { MealId, Plan } from '../types'

export const MEALS: { id: MealId; name: string; time: string; note?: string }[] = [
  { id: 'zajutrak', name: 'Zajutrak', time: '8h' },
  { id: 'dorucak', name: 'Doručak', time: '10h' },
  { id: 'rucak', name: 'Ručak', time: '13h', note: 'Uz ručak se može dodati 1 tanjur obrane juhe bez tjestenine.' },
  { id: 'uzina', name: 'Užina', time: '16h' },
  { id: 'vecera', name: 'Večera', time: '18h' },
  { id: 'nocni', name: 'Noćni obrok', time: '21h' },
]

// Jedinice po obroku prepisane iz planova "Dijabetička dijeta, 6 obroka dnevno"
// (KBC Sestre milosrdnice, Zavod "Mladen Sekso").
export const PLANS: Plan[] = [
  {
    kcal: 1500, kj: 6300,
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
    kcal: 1700, kj: 7140,
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
    kcal: 1900, kj: 7980,
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
    kcal: 2100, kj: 8820,
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
    kcal: 2700, kj: 11340,
    meals: {
      zajutrak: { mlijeko: 1, kruh: 2, meso: 2, masnoce: 2 },
      dorucak: { kruh: 2, meso: 1, masnoce: 1, voce: 2 },
      rucak: { meso: 2, kruh: 3, povrce: 2, masnoce: 2, voce: 2 },
      uzina: { kruh: 2, meso: 2, masnoce: 1, voce: 2 },
      vecera: { meso: 2, kruh: 3, povrce: 2, masnoce: 2 },
      nocni: { mlijeko: 1, kruh: 1, meso: 1 },
    },
  },
]

export const DEFAULT_KCAL = 1900
