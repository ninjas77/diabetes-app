import type { Food, GroupId } from '../types'

// Prepisano iz "Skupine namirnica po jedinicama" (KBC Sestre milosrdnice,
// Zavod "Mladen Sekso", Služba za dijetetiku i prehranu).

type Opts = Omit<Food, 'id' | 'name' | 'group' | 'grams'>

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function group(g: GroupId, defaults: Opts, items: [string, number, Opts?][]): Food[] {
  return items.map(([name, grams, opts]) => ({
    id: `${g}-${slug(name)}`,
    name,
    group: g,
    grams,
    ...defaults,
    ...opts,
  }))
}

const cooked = (raw: number): Opts => ({ state: 'kuhano', altGrams: raw, altState: 'sirovo' })

const kruh = group('kruh', {}, [
  ['Kruh polubijeli', 25],
  ['Kruh crni', 30],
  ['Kruh raženi', 30],
  ['Kruh graham', 35],
  ['Kruh kukuruzni', 35],
  ['Pecivo integralno', 30],
  ['Dvopek integralni', 20],
  ['Dijabetički keksi', 22],
  ['Tost, krekeri (integralni)', 30],
  ['Brašno pšenično, kukuruzno, raženo', 20, { state: 'sirovo', altGrams: 60, altState: 'kuhano' }],
  ['Krušne mrvice', 20],
  ['Krupica pšenična, kukuruzna (palenta)', 60, cooked(20)],
  ['Riža (bijela ili integralna)', 60, cooked(20)],
  ['Tjestenina (bijela ili integralna)', 60, cooked(20)],
  ['Zobene pahuljice', 20, { state: 'sirovo', altGrams: 60, altState: 'kuhano' }],
  ['Heljda', 60, cooked(20)],
  ['Proso', 60, cooked(20)],
  ['Ječmena kaša', 60, cooked(25)],
  ['Krumpir kuhani (bez kore)', 100, { state: 'kuhano' }],
  ['Krumpir pečeni (bez kore)', 80, { state: 'pečeno' }],
  ['Slatki krumpir, batat', 60],
  ['Grah (suho zrno)', 90, cooked(30)],
  ['Leća (suha)', 80, cooked(20)],
  ['Grašak (smrznuti)', 100],
  ['Čičoka', 100],
  ['Kesten (bez kore)', 45],
])

const voce = group('voce', {}, [
  ['Ananas', 120], ['Banana', 60], ['Breskva', 140], ['Borovnica', 100], ['Brusnica', 100],
  ['Dinja', 100], ['Grejp', 155], ['Grožđe', 90], ['Jabuka', 100], ['Jagoda', 190],
  ['Kivi', 100], ['Kruška', 100], ['Kupina', 100], ['Lubenica', 190], ['Nektarina', 120],
  ['Mandarina', 120], ['Naranča', 100], ['Ribiz', 200], ['Smokva (svježa)', 75], ['Marelica', 135],
  ['Šipak, nar', 80], ['Šljiva (svježa)', 100], ['Šljiva (suha)', 25], ['Trešnje', 80], ['Višnje', 100],
  ['Kompot gotovi (bez šećera)', 160], ['Voćni sok (bez šećera)', 120], ['Voćna salata', 100],
  ['Džem (bez šećera)', 40],
])

const povrce = group('povrce', {}, [
  ['Blitva', 100], ['Brokula', 100], ['Buča', 100], ['Cikla', 60], ['Mladi grah', 100],
  ['Hren', 100], ['Kelj', 100], ['Prokulica (kelj pupčar)', 100], ['Koraba', 100],
  ['Luk, bijeli ili crveni', 100], ['Mahune', 100], ['Mrkva', 60], ['Paprika', 100],
  ['Patlidžan', 100], ['Poriluk', 100], ['Crna rotkva', 100], ['Rajčica', 100], ['Repa', 100],
  ['Šparoga', 100], ['Špinat', 100], ['Tikva', 100], ['Ukiseljeno povrće (bez šećera)', 100],
  ['Pire od rajčice', 50], ['Smrznuto povrće', 100], ['Sok od povrća (bez šećera)', 140],
])

const slobodnoPovrce = group('povrce', { free: true }, [
  ['Celer', 100], ['Endivija', 100], ['Gljive, svježe ili sušene', 100], ['Karfiol (cvjetača)', 100],
  ['Krastavci svježi', 100], ['Krastavci kiseli', 100], ['Kupus svježi', 100], ['Kupus kiseli', 100],
  ['Luk mladi', 100], ['Matovilac', 100], ['List maslačka', 100], ['Peršin', 100], ['Radič', 100],
  ['Zelena salata', 100], ['Zelene tikvice', 100],
])

const mlijeko = group('mlijeko', {}, [
  ['Mlijeko (do 1,5% m.m.)', 240], ['Jogurt', 240], ['Bioaktiv LGG', 240], ['Stepko', 240],
  ['Kiselo mlijeko', 240], ['Kefir', 240], ['AB kultura', 240], ['AB kultura s voćem', 240],
])

const masnoce = [
  ...group('masnoce', { sub: 'nezasićene' }, [
    ['Maslinovo ulje', 5], ['Suncokretovo ulje', 5], ['Bučino ulje', 5], ['Repičino ulje', 5],
    ['Sojino ulje', 5], ['Ulje od kukuruznih klica', 5], ['Sezamovo ulje', 5],
    ['Margarin mekani', 5], ['Sjemenke bundeve', 5], ['Sezam', 5], ['Sjemenke suncokreta', 7],
    ['Bademi', 8], ['Orasi', 8], ['Lješnjak', 10], ['Kikiriki (neslan, nepržen)', 10],
    ['Pistacije (neslane, nepržene)', 10], ['Maslac od kikirikija', 5], ['Kokosovo brašno', 15],
    ['Avokado', 30], ['Masline (neslane)', 30], ['Majoneza', 5],
  ]),
  ...group('masnoce', { sub: 'zasićene' }, [
    ['Vrhnje kiselo 12% m.m.', 30], ['Slanina (sušena)', 10], ['Maslac', 5],
  ]),
]

const MEAT_NOTE = 'Količina se odnosi na pripremljenu namirnicu; sirove uzeti oko 30% više.'

const meso = [
  ...group('meso', { sub: 'nemasno', note: MEAT_NOTE }, [
    ['Piletina bez kože', 30], ['Puretina bez kože', 30], ['Teletina – but', 30],
    ['Junetina – but, lopatica', 30], ['Svinjetina – but', 30], ['Jaretina – but', 30],
    ['Kozletina – but', 30], ['Meso kunića', 30], ['Meso noja', 30], ['Žablji kraci', 45],
    ['Divljač', 30], ['Riba morska, riječna', 30], ['Riba konzervirana u salamuri', 30],
    ['Kozice, škampi', 30], ['Potočni rakovi', 30], ['Dagnje', 60], ['Hobotnica, lignja, sipa', 30],
  ]),
  ...group('meso', { sub: 'nemasno' }, [
    ['Šunka prešana', 30], ['Toast šunka', 30], ['Pileća ili pureća prsa u ovitku', 30],
    ['Hrenovka pileća ili pureća light', 30], ['Svježi posni sir', 60],
    ['Toast sir u listićima light', 30], ['Topljeni sir light', 30], ['Sirni namaz light', 30],
    ['Sir mozzarella 20% m.m.', 30],
  ]),
  ...group('meso', { sub: 'srednje masno', note: MEAT_NOTE }, [
    ['Perad s kožom', 30], ['Teletina – kotleti', 30], ['Junetina – odresci, rebra', 30],
    ['Svinjetina – lopatica', 30], ['Janjetina – rebra, lopatica', 30],
  ]),
  ...group('meso', { sub: 'srednje masno' }, [
    ['Nemasna šunka', 30], ['Riba konzervirana, bez ulja', 30],
    ['Posebna salama pileća, pureća, juneća', 30], ['Jaje', 1, { piece: true }],
    ['Polumasni, polutvrdi sir light', 30], ['Sirni namaz', 30], ['Topljeni sir', 25],
  ]),
]

const soja: Food[] = [
  { id: 'soja-zrno', name: 'Soja zrno', group: 'kruh', grams: 60, ...cooked(20), sub: 'soja' },
  { id: 'soja-brasno', name: 'Sojino brašno', group: 'kruh', grams: 20, sub: 'soja' },
  {
    id: 'soja-ljuspice', name: 'Sojine ljuspice (bez masnoće)', group: 'meso', grams: 15, sub: 'soja',
    extra: { kruh: 0.25 }, note: '30 g = 2 jedinice mesa + ½ jedinice kruha.',
  },
  {
    id: 'soja-komadici', name: 'Sojini komadići (bez masnoće)', group: 'meso', grams: 15, sub: 'soja',
    extra: { kruh: 0.25 }, note: '30 g = 2 jedinice mesa + ½ jedinice kruha.',
  },
  { id: 'soja-tofu', name: 'Tofu', group: 'meso', grams: 120, sub: 'soja' },
  { id: 'soja-mlijeko', name: 'Sojino mlijeko (bez šećera)', group: 'mlijeko', grams: 240, sub: 'soja' },
]

export const BUILTIN_FOODS: Food[] = [...kruh, ...voce, ...povrce, ...slobodnoPovrce, ...mlijeko, ...meso, ...masnoce, ...soja]
