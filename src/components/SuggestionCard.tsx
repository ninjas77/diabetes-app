import { useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { GROUP_BY_ID, MEAL_GROUP_ORDER } from '../data/groups'
import { compare, formatAmount, formatNumber, totals } from '../lib/meal'
import type { Allocation } from '../lib/meal'
import type { Food, Units } from '../types'

interface Props {
  foods: Food[]
  alloc: Allocation
  targets: Units
  freeVeg: Food[]
  onGoToFoods: () => void
  /** Naslov kartice (npr. naziv obroka u dnevnom jelovniku). */
  header?: ReactNode
}

/** Gotov prijedlog obroka: namirnice s gramima, stanje prema planu i što nedostaje. */
export default function SuggestionCard({ foods, alloc, targets, freeVeg, onGoToFoods, header }: Props) {
  const byId = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods])
  const status = compare(targets, totals(alloc, byId))
  const allOk = status.every((s) => s.diff === 0)
  const carbs = status.reduce((sum, s) => sum + s.actual * GROUP_BY_ID[s.group].carbs, 0)
  const missing = status.filter((s) => s.diff < 0)
  const items = MEAL_GROUP_ORDER.flatMap((g) => foods.filter((f) => f.group === g && !f.free && alloc[f.id] > 0))

  return (
    <div className={`card suggestion ${allOk ? 'ok' : ''}`}>
      {header}
      <ul className="items">
        {items.map((f) => (
          <li key={f.id} style={{ '--c': GROUP_BY_ID[f.group].color } as CSSProperties}>
            <span className="dot" aria-hidden />
            <span className="item-name">{f.name}</span>
            <span className="amount">{formatAmount(f, alloc[f.id])}</span>
          </li>
        ))}
        {freeVeg.map((f) => (
          <li key={f.id} className="free-item" style={{ '--c': GROUP_BY_ID.povrce.color } as CSSProperties}>
            <span className="dot" aria-hidden />
            <span className="item-name">{f.name} <small className="hint">po želji</small></span>
            <span className="amount">do 100 g</span>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="hint">Od namirnica koje imate kod kuće ne može se složiti ovaj obrok.</p>}
      <p className="summary-text">
        {allOk ? '✓ U skladu s planom' : 'Obrok nije potpun'} · ugljikohidrati <strong>{formatNumber(Math.round(carbs))} g</strong>
      </p>
      {missing.length > 0 && (
        <p className="delta short">
          Nedostaje: {missing.map((s) => `${GROUP_BY_ID[s.group].short.toLowerCase()} ${formatNumber(-s.diff)} j.`).join(', ')}
          {' '}– nemate ništa iz te skupine kod kuće.{' '}
          <button className="link" onClick={onGoToFoods}>Označi namirnice</button>
        </p>
      )}
    </div>
  )
}
