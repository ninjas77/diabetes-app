import { GROUP_BY_ID, MEAL_GROUP_ORDER } from '../data/groups'
import { MEALS, PLANS } from '../data/plans'
import type { GroupId } from '../types'

interface Props {
  kcal: number
  onChange: (kcal: number) => void
}

export default function PlanView({ kcal, onChange }: Props) {
  const plan = PLANS.find((p) => p.kcal === kcal) ?? PLANS[0]
  const daily = (g: GroupId) => MEALS.reduce((sum, m) => sum + (plan.meals[m.id][g] ?? 0), 0)

  return (
    <section>
      <h2>Dnevni energetski unos</h2>
      <p className="hint">Odaberite plan koji vam je preporučio liječnik ili nutricionist.</p>
      <div className="kcal-options">
        {PLANS.map((p) => (
          <button key={p.kcal} className={p.kcal === kcal ? 'active' : ''} onClick={() => onChange(p.kcal)}>
            <strong>{p.kcal} kcal</strong>
            <small>{p.kj} kJ</small>
          </button>
        ))}
      </div>

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
            {MEALS.map((m) => (
              <tr key={m.id}>
                <th>{m.name} <small>{m.time}</small></th>
                {MEAL_GROUP_ORDER.map((g) => <td key={g}>{plan.meals[m.id][g] ?? ''}</td>)}
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
      <p className="hint">
        Izvor: KBC Sestre milosrdnice, Zavod za endokrinologiju, dijabetes i bolesti metabolizma „Mladen Sekso”,
        Služba za dijetetiku i prehranu.
      </p>
    </section>
  )
}
