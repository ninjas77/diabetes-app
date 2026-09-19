import { useMemo, useState } from 'react'
import { GROUP_BY_ID } from '../data/groups'
import { MEALS, targetsFor } from '../data/plans'
import { planDay } from '../lib/day'
import { compare, formatNumber, totals } from '../lib/meal'
import { MEAL_CONTEXT, freeVegFor } from '../lib/pairing'
import type { Food, MealId, Plan } from '../types'
import SuggestionCard from './SuggestionCard'

interface Props {
  plan: Plan
  foods: Food[]
  atHome: Food[]
  onGoToFoods: () => void
  onOpenMeal: (meal: MealId, picks: Food[]) => void
}

export default function DayView({ plan, foods, atHome, onGoToFoods, onOpenMeal }: Props) {
  const [seed, setSeed] = useState(0)
  const [skip, setSkip] = useState<Partial<Record<MealId, number>>>({})
  const day = useMemo(() => planDay(plan, atHome, seed, skip), [plan, atHome, seed, skip])
  const byId = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods])

  const statuses = day.map((d) => compare(targetsFor(plan, d.meal), totals(d.alloc, byId)))
  const complete = statuses.filter((s) => s.every((x) => x.diff === 0)).length
  const carbs = statuses.flat().reduce((sum, s) => sum + s.actual * GROUP_BY_ID[s.group].carbs, 0)

  return (
    <>
      <div className={`summary ${complete === day.length ? 'ok' : ''}`}>
        <p className="summary-text day-summary">
          {complete === day.length ? '✓ Cijeli dan je u skladu s planom.' : `${complete} od ${day.length} obroka u skladu s planom.`}{' '}
          Ugljikohidrati ukupno: <strong>{formatNumber(Math.round(carbs))} g</strong>
        </p>
      </div>

      {day.map((d) => {
        const info = MEALS.find((m) => m.id === d.meal)!
        return (
          <SuggestionCard
            key={d.meal}
            foods={foods}
            alloc={d.alloc}
            targets={targetsFor(plan, d.meal)}
            freeVeg={freeVegFor(MEAL_CONTEXT[d.meal], d.picks, atHome)}
            onGoToFoods={onGoToFoods}
            header={
              <div className="card-head day-head">
                <button className="link meal-title" onClick={() => onOpenMeal(d.meal, d.picks)}>
                  <h3>{info.name}</h3> <small className="hint">{info.time}</small>
                </button>
                <button
                  className="swap"
                  disabled={d.count <= 1}
                  aria-label={`Zamijeni ${info.name.toLowerCase()}`}
                  title="Zamijeni ovaj obrok"
                  onClick={() => setSkip((s) => ({ ...s, [d.meal]: (s[d.meal] ?? 0) + 1 }))}
                >
                  🔀
                </button>
              </div>
            }
          />
        )
      })}

      <div className="actions">
        <button className="primary" onClick={() => { setSeed((s) => s + 1); setSkip({}) }}>🔀 Novi jelovnik</button>
      </div>
      <p className="hint center">🔀 uz obrok mijenja samo taj obrok. Dodirnite naziv obroka za prilagodbu količina.</p>
    </>
  )
}
