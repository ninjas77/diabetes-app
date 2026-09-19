import type { Food, GroupId, MealId, Units, When } from '../types'
import { MEAL_GROUP_ORDER } from '../data/groups'

/**
 * Pravila o tome što ide zajedno u obroku.
 *
 * Svaki obrok je ili "jutarnji" (hladni, lagani: zajutrak, doručak, užina, noćni obrok)
 * ili "topli" (kuhani: ručak, večera). Svaka namirnica ima profil: kada se jede i koju
 * ulogu ima na tanjuru. Kombinacije se boduju, one s tvrdim sukobom (npr. riža za
 * doručak, margarin bez kruha) izbacuju se ako postoji ijedna bolja.
 */

export type Context = 'jutro' | 'topli'

export type Role =
  | 'kruh' // kruh, pecivo, dvopek – ide uz namaze i hladno meso
  | 'prilog' // riža, krumpir, tjestenina… – uz kuhano jelo
  | 'slatko' // keksi, pahuljice, džem, voćni jogurt
  | 'namaz' // treba kruh
  | 'ulje' // za kuhanje i salatu
  | 'orasasto' // orašasti plodovi i sjemenke
  | 'hladno' // šunka, sir, jaje, tuna – za sendvič
  | 'meso' // meso i riba za kuhanje
  | 'salata' // povrće koje se jede i sirovo

export interface Profile {
  when: When
  roles: Role[]
}

export const MEAL_CONTEXT: Record<MealId, Context> = {
  zajutrak: 'jutro',
  dorucak: 'jutro',
  rucak: 'topli',
  uzina: 'jutro',
  vecera: 'topli',
  nocni: 'jutro',
}

const p = (when: When, ...roles: Role[]): Profile => ({ when, roles })

// Profili ugrađenih namirnica koji odstupaju od zadanih za skupinu (po nazivu).
export const BY_NAME: Record<string, Profile> = {
  // Kruh i zamjene (zadano: prilog za topli obrok)
  'Kruh polubijeli': p('jutro', 'kruh'),
  'Kruh crni': p('jutro', 'kruh'),
  'Kruh raženi': p('jutro', 'kruh'),
  'Kruh graham': p('jutro', 'kruh'),
  'Kruh kukuruzni': p('jutro', 'kruh'),
  'Pecivo integralno': p('jutro', 'kruh'),
  'Dvopek integralni': p('jutro', 'kruh'),
  'Tost, krekeri (integralni)': p('jutro', 'kruh'),
  'Dijabetički keksi': p('jutro', 'slatko'),
  'Zobene pahuljice': p('jutro', 'slatko'),
  'Krupica pšenična, kukuruzna (palenta)': p('oba', 'prilog'),
  'Kesten (bez kore)': p('oba'),

  // Voće (zadano: bilo kada)
  'Džem (bez šećera)': p('jutro', 'slatko', 'namaz'),

  // Povrće koje se jede i sirovo – smije uz sendvič
  Rajčica: p('oba', 'salata'),
  Paprika: p('oba', 'salata'),
  Mrkva: p('oba', 'salata'),
  'Krastavci svježi': p('oba', 'salata'),
  'Krastavci kiseli': p('oba', 'salata'),
  'Zelena salata': p('oba', 'salata'),
  Matovilac: p('oba', 'salata'),
  'Luk mladi': p('oba', 'salata'),
  Radič: p('oba', 'salata'),
  Endivija: p('oba', 'salata'),
  Peršin: p('oba', 'salata'),
  'List maslačka': p('oba', 'salata'),
  'Sok od povrća (bez šećera)': p('oba'),

  // Mlijeko (zadano: bilo kada)
  'AB kultura s voćem': p('oba', 'slatko'),

  // Meso – hladni narezak, sir, jaja, riba iz konzerve (zadano: meso za kuhanje)
  'Riba konzervirana u salamuri': p('oba', 'hladno'),
  'Riba konzervirana, bez ulja': p('oba', 'hladno'),
  'Šunka prešana': p('jutro', 'hladno'),
  'Toast šunka': p('jutro', 'hladno'),
  'Pileća ili pureća prsa u ovitku': p('jutro', 'hladno'),
  'Hrenovka pileća ili pureća light': p('oba', 'hladno'),
  'Nemasna šunka': p('jutro', 'hladno'),
  'Posebna salama pileća, pureća, juneća': p('jutro', 'hladno'),
  'Svježi posni sir': p('oba', 'hladno'),
  'Toast sir u listićima light': p('jutro', 'hladno'),
  'Sir mozzarella 20% m.m.': p('oba', 'hladno'),
  'Polumasni, polutvrdi sir light': p('oba', 'hladno'),
  'Topljeni sir light': p('jutro', 'hladno', 'namaz'),
  'Topljeni sir': p('jutro', 'hladno', 'namaz'),
  'Sirni namaz light': p('jutro', 'hladno', 'namaz'),
  'Sirni namaz': p('jutro', 'hladno', 'namaz'),
  Jaje: p('oba', 'hladno'),

  // Masnoće (zadano: ulje za topli obrok)
  'Margarin mekani': p('jutro', 'namaz'),
  Maslac: p('jutro', 'namaz'),
  'Maslac od kikirikija': p('jutro', 'namaz'),
  Majoneza: p('oba', 'namaz'),
  'Sjemenke bundeve': p('oba', 'orasasto'),
  Sezam: p('oba', 'orasasto'),
  'Sjemenke suncokreta': p('oba', 'orasasto'),
  Bademi: p('jutro', 'orasasto'),
  Orasi: p('jutro', 'orasasto'),
  Lješnjak: p('jutro', 'orasasto'),
  'Kikiriki (neslan, nepržen)': p('jutro', 'orasasto'),
  'Pistacije (neslane, nepržene)': p('jutro', 'orasasto'),
  'Kokosovo brašno': p('jutro', 'orasasto'),
  Avokado: p('oba'),
  'Masline (neslane)': p('oba'),
  'Vrhnje kiselo 12% m.m.': p('oba'),
  'Slanina (sušena)': p('topli'),
}

const BY_GROUP: Record<GroupId, Profile> = {
  kruh: p('topli', 'prilog'),
  voce: p('oba'),
  povrce: p('topli'),
  mlijeko: p('oba'), // jogurt ili kefir uz večeru je u redu (planovi s 3 obroka)
  meso: p('topli', 'meso'),
  masnoce: p('topli', 'ulje'),
}

export function profile(food: Food): Profile {
  if (food.custom) {
    const when = food.when ?? 'oba'
    // Za vlastite namirnice iz skupine kruha: jutarnje = kruh, toplo = prilog.
    const roles: Role[] = food.group === 'kruh' ? [when === 'topli' ? 'prilog' : 'kruh'] : []
    return { when, roles }
  }
  if (food.sub === 'soja') return food.group === 'mlijeko' ? p('oba') : p('topli', food.group === 'meso' ? 'meso' : 'prilog')
  return BY_NAME[food.name] ?? BY_GROUP[food.group]
}

const HARD = -100

/** Koliko namirnica paše uz vrstu obroka. Kruh uz ručak je u redu, ali prilog je bolji. */
function fit(food: Food, ctx: Context): number {
  const { when, roles } = profile(food)
  if (when === 'oba') return 1
  if (when === ctx) return 2
  if (roles.includes('kruh')) return 0
  return HARD
}

/** Bodovi za kombinaciju namirnica jednog obroka (veće = bolje, ≤ HARD = ne ide zajedno). */
export function score(picks: Food[], ctx: Context): number {
  const has = (role: Role) => picks.some((f) => profile(f).roles.includes(role))
  const savory = picks.some((f) => f.group === 'meso')
  const dairy = picks.some((f) => f.group === 'mlijeko')
  let s = picks.reduce((sum, f) => sum + fit(f, ctx), 0)

  if (has('namaz') && !has('kruh')) s += HARD
  if (savory && picks.some((f) => f.group !== 'voce' && profile(f).roles.includes('slatko'))) s += HARD
  if (has('orasasto') && savory) s -= 4
  if ((has('slatko') || has('orasasto')) && dairy) s += 2
  if (has('kruh') && has('hladno')) s += 1
  if (has('prilog') && has('meso')) s += 1
  // Uz kuhani obrok bolje paše jogurt ili kefir nego čaša mlijeka.
  if (ctx === 'topli' && picks.some((f) => f.group === 'mlijeko' && f.name.startsWith('Mlijeko'))) s -= 2
  return s
}

/** Skupine od one koja se među jednakim prijedlozima mijenja najprije do one koja se mijenja zadnja. */
const VARY_ORDER: GroupId[] = ['meso', 'kruh', 'povrce', 'voce', 'mlijeko', 'masnoce']

/** Najviše ovoliko kandidata po skupini ulazi u kombinacije (najbolje prema vrsti obroka). */
const PER_GROUP = 6

/**
 * Svi različiti prijedlozi za obrok, od najboljeg prema lošijem: u svakoj skupini koju
 * obrok treba odabrana je po jedna namirnica. Kombinacije s tvrdim sukobom izostavljaju
 * se ako postoji ijedna bez njega.
 */
export function suggestions(ctx: Context, targets: Units, available: Food[]): Food[][] {
  return scoredSuggestions(ctx, targets, available).map((x) => x.picks)
}

/** Kao suggestions, ali uz svaki prijedlog i njegove bodove. */
export function scoredSuggestions(ctx: Context, targets: Units, available: Food[]): { picks: Food[]; score: number }[] {
  const counted = available.filter((f) => !f.free)
  const groups = MEAL_GROUP_ORDER.filter((g) => (targets[g] ?? 0) > 0)
  const options = groups
    .map((g) =>
      counted
        .filter((f) => f.group === g)
        .map((f, i) => ({ f, i, fit: fit(f, ctx) }))
        .sort((a, b) => b.fit - a.fit || a.i - b.i)
        .slice(0, PER_GROUP)
        .map((x) => x.f),
    )
    .filter((list) => list.length > 0)

  // Među jednako dobrim prijedlozima najprije se mijenja glavna namirnica, pa prilog…, a masnoća zadnja.
  const byVariety = [...options].sort((a, b) => VARY_ORDER.indexOf(b[0].group) - VARY_ORDER.indexOf(a[0].group))
  let combos: Food[][] = [[]]
  for (const list of byVariety) combos = combos.flatMap((c) => list.map((f) => [...c, f]))

  const scored = combos.map((picks, i) => ({ picks, i, s: score(picks, ctx) }))
  const best = Math.max(...scored.map((x) => x.s))
  const cutoff = best > HARD / 2 ? HARD / 2 : -Infinity
  return scored
    .filter((x) => x.s > cutoff)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => ({
      picks: [...x.picks].sort((a, b) => MEAL_GROUP_ORDER.indexOf(a.group) - MEAL_GROUP_ORDER.indexOf(b.group)),
      score: x.s,
    }))
}

/** Povrće po želji koje paše uz obrok: uz kuhani obrok, ili sirovo uz sendvič. */
export function freeVegFor(ctx: Context, picks: Food[], available: Food[]): Food[] {
  const free = available.filter((f) => f.free)
  if (ctx === 'topli') return free.slice(0, 3)
  const sandwich = picks.some((f) => profile(f).roles.includes('kruh')) && picks.some((f) => f.group === 'meso')
  return sandwich ? free.filter((f) => profile(f).roles.includes('salata')).slice(0, 2) : []
}
