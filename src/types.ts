export type GroupId = 'kruh' | 'voce' | 'povrce' | 'mlijeko' | 'masnoce' | 'meso'

export type Units = Partial<Record<GroupId, number>>

/** Kada se namirnica jede: uz jutarnje/hladne obroke, uz kuhane obroke ili bilo kada. */
export type When = 'jutro' | 'topli' | 'oba'

export interface Food {
  id: string
  name: string
  /** Skupina u koju namirnica spada (za nju se računaju jedinice). */
  group: GroupId
  /** Grama (jestivog dijela) koji odgovaraju 1 jedinici. */
  grams: number
  /** Npr. 'kuhano', 'sirovo', 'pečeno'. */
  state?: string
  /** Alternativna količina za 1 jedinicu, npr. 20 g sirovo uz 60 g kuhano. */
  altGrams?: number
  altState?: string
  /** Ako je 1 jedinica = 1 komad (npr. jaje), prikazuje se u komadima. */
  piece?: boolean
  /** Podskupina, npr. 'nemasno' / 'srednje masno' za meso. */
  sub?: string
  /** Dodatne jedinice drugih skupina po 1 jedinici ove namirnice (soja). */
  extra?: Units
  /** Povrće koje se ne uračunava u dnevni unos (do 100 g po obroku). */
  free?: boolean
  note?: string
  /** Samo za vlastite namirnice; ugrađene imaju profil u lib/pairing.ts. */
  when?: When
  custom?: boolean
}

export type MealId = 'zajutrak' | 'dorucak' | 'rucak' | 'uzina' | 'vecera' | 'nocni'

export interface Plan {
  kcal: number
  kj: number
  mealsPerDay: 6 | 3
  /** Odakle su jedinice po obroku prepisane. */
  source: string
  /** Napomene uz pojedine obroke (npr. juha uz ručak). */
  notes?: Partial<Record<MealId, string>>
  meals: Partial<Record<MealId, Units>>
}
