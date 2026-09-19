import type { GroupId } from '../types'

export interface GroupInfo {
  id: GroupId
  name: string
  short: string
  description: string
  /** Sastav 1 jedinice. */
  carbs: number
  protein: number
  fat: string
  kcal: string
  /** Ključni nutrijent za izračun jedinice iz deklaracije (g na 1 jedinicu). */
  key: { nutrient: 'ugljikohidrati' | 'bjelančevine' | 'masti'; perUnit: number }
  color: string
}

export const GROUPS: GroupInfo[] = [
  {
    id: 'kruh',
    name: 'Kruh i zamjene',
    short: 'Kruh',
    description: 'žitarice, tjestenina, keksi, krumpir, grah i ostalo škrobno povrće',
    carbs: 15, protein: 3, fat: '0', kcal: '73',
    key: { nutrient: 'ugljikohidrati', perUnit: 15 },
    color: '#c99a2e',
  },
  {
    id: 'voce',
    name: 'Voće',
    short: 'Voće',
    description: 'svježe, sušeno, kompoti, sokovi',
    carbs: 15, protein: 0, fat: '0', kcal: '60',
    key: { nutrient: 'ugljikohidrati', perUnit: 15 },
    color: '#d9622b',
  },
  {
    id: 'povrce',
    name: 'Povrće',
    short: 'Povrće',
    description: 'svježe, smrznuto, ukiseljeno',
    carbs: 5, protein: 2, fat: '0', kcal: '25',
    key: { nutrient: 'ugljikohidrati', perUnit: 5 },
    color: '#3d8b3d',
  },
  {
    id: 'mlijeko',
    name: 'Mlijeko i zamjene',
    short: 'Mlijeko',
    description: 'svježe i fermentirano, do 1,5% m.m.',
    carbs: 12, protein: 8, fat: 'do 3,6', kcal: '115',
    key: { nutrient: 'ugljikohidrati', perUnit: 12 },
    color: '#3b7dc4',
  },
  {
    id: 'meso',
    name: 'Meso i zamjene',
    short: 'Meso',
    description: 'crveno meso, perad, riba, divljač, salama, sir, jaja',
    carbs: 0, protein: 7, fat: '1–5', kcal: '35–73',
    key: { nutrient: 'bjelančevine', perUnit: 7 },
    color: '#b8434e',
  },
  {
    id: 'masnoce',
    name: 'Masnoće i zamjene',
    short: 'Masnoće',
    description: 'ulje, margarin, maslac, sjemenke, orašasti plodovi, vrhnje, slanina',
    carbs: 0, protein: 0, fat: '5', kcal: '45',
    key: { nutrient: 'masti', perUnit: 5 },
    color: '#8a6fb0',
  },
]

export const GROUP_BY_ID = Object.fromEntries(GROUPS.map((g) => [g.id, g])) as Record<GroupId, GroupInfo>

/** Redoslijed prikaza skupina u obroku (kao na planovima prehrane). */
export const MEAL_GROUP_ORDER: GroupId[] = ['mlijeko', 'meso', 'kruh', 'povrce', 'masnoce', 'voce']
