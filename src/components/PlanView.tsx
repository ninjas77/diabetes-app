import type { ReactNode } from 'react'
import { GROUP_BY_ID, MEAL_GROUP_ORDER } from '../data/groups'
import { PLANS, findPlan, planMeals, targetsFor } from '../data/plans'
import type { GroupId, Plan } from '../types'

interface Props {
  kcal: number | null
  mealsPerDay: number
  onChange: (kcal: number) => void
  onMealsPerDay: (n: 6 | 3) => void
  hasPantry: boolean
  onNext: () => void
  /** Odabir cijeli dan / jedan obrok. */
  children: ReactNode
}

/** Svaka energetska vrijednost jednom, s kJ iz plana. */
const KCAL_OPTIONS = PLANS.filter((p, i) => PLANS.findIndex((q) => q.kcal === p.kcal) === i)

export default function PlanView({ kcal, mealsPerDay, onChange, onMealsPerDay, hasPantry, onNext, children }: Props) {
  const plan = findPlan(kcal, mealsPerDay)
  const variants = PLANS.filter((p) => p.kcal === kcal).map((p) => p.mealsPerDay)

  return (
    <section>
      <h2>Dnevni energetski unos</h2>
      <p className="hint">Odaberite plan koji vam je preporučio liječnik ili nutricionist.</p>
      <div className="kcal-options">
        {KCAL_OPTIONS.map((p) => (
          <button key={p.kcal} className={p.kcal === kcal ? 'active' : ''} onClick={() => onChange(p.kcal)}>
            <strong>{p.kcal} kcal</strong>
            <small>{p.kj} kJ</small>
          </button>
        ))}
      </div>

      {plan && (
        <>
          {variants.length > 1 && (
            <>
              <h2>Broj obroka dnevno</h2>
              <div className="segmented" role="radiogroup" aria-label="Broj obroka dnevno">
                {([6, 3] as const).map((n) => (
                  <button key={n} role="radio" aria-checked={plan.mealsPerDay === n} className={plan.mealsPerDay === n ? 'active' : ''} onClick={() => onMealsPerDay(n)}>
                    {n} obroka
                  </button>
                ))}
              </div>
            </>
          )}

          <h2>Što želite složiti?</h2>
          {children}
          <button className="primary next" onClick={onNext}>
            {hasPantry ? 'Složi →' : 'Dalje: što imam kod kuće →'}
          </button>
          <PlanTable plan={plan} />
          <p className="hint">Izvor: {plan.source}.</p>
        </>
      )}
    </section>
  )
}

function PlanTable({ plan }: { plan: Plan }) {
  const meals = planMeals(plan)
  const daily = (g: GroupId) => meals.reduce((sum, m) => sum + (targetsFor(plan, m.id)[g] ?? 0), 0)

  return (
    <>
      <h2>Jedinice po obroku</h2>
      <div className="table-wrap">
        <table className="plan-table">
          <thead>
            <tr>
              <th />
              {MEAL_GROUP_ORDER.map((g) => (
                <th key={g} style={{ color: GROUP_BY_ID[g].color }}>{GROUP_BY_ID[g].short}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meals.map((m) => (
              <tr key={m.id}>
                <th>{m.name} <small>{m.time}</small></th>
                {MEAL_GROUP_ORDER.map((g) => <td key={g}>{targetsFor(plan, m.id)[g] ?? ''}</td>)}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Ukupno</th>
              {MEAL_GROUP_ORDER.map((g) => <td key={g}>{daily(g)}</td>)}
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}
