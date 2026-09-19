import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { GROUP_BY_ID, MEAL_GROUP_ORDER } from '../data/groups'
import { MEALS } from '../data/plans'
import { autoFill, compare, formatAmount, formatNumber, roundHalf, suggestionOrder, totals } from '../lib/meal'
import type { Allocation } from '../lib/meal'
import type { Food, GroupId, MealId, Plan, Units } from '../types'

interface Props {
  plan: Plan
  foods: Food[]
  pantry: Set<string>
  onGoToFoods: () => void
}

function currentMeal(): MealId {
  const h = new Date().getHours()
  if (h < 9) return 'zajutrak'
  if (h < 12) return 'dorucak'
  if (h < 15) return 'rucak'
  if (h < 17) return 'uzina'
  if (h < 20) return 'vecera'
  return 'nocni'
}

export default function MealView({ plan, foods, pantry, onGoToFoods }: Props) {
  const [meal, setMeal] = useState<MealId>(currentMeal)
  const [seed, setSeed] = useState(0)
  const targets = plan.meals[meal]
  const mealInfo = MEALS.find((m) => m.id === meal)!
  const pantryKey = [...pantry].sort().join(',')

  return (
    <section>
      <div className="meal-tabs" role="tablist">
        {MEALS.map((m) => (
          <button key={m.id} role="tab" aria-selected={m.id === meal} className={m.id === meal ? 'active' : ''} onClick={() => setMeal(m.id)}>
            <strong>{m.name}</strong>
            <small>{m.time}</small>
          </button>
        ))}
      </div>

      {pantry.size === 0 ? (
        <div className="empty">
          <p>Još niste označili što imate kod kuće.</p>
          <button className="primary" onClick={onGoToFoods}>Označi namirnice</button>
        </div>
      ) : (
        <MealBuilder
          key={`${plan.kcal}-${meal}-${pantryKey}-${seed}`}
          targets={targets}
          foods={foods}
          pantry={pantry}
          variant={seed}
          note={mealInfo.note}
          onReshuffle={() => setSeed((s) => s + 1)}
          onGoToFoods={onGoToFoods}
        />
      )}
    </section>
  )
}

interface BuilderProps {
  targets: Units
  foods: Food[]
  pantry: Set<string>
  variant: number
  note?: string
  onReshuffle: () => void
  onGoToFoods: () => void
}

function MealBuilder({ targets, foods, pantry, variant, note, onReshuffle, onGoToFoods }: BuilderProps) {
  const byId = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods])
  const atHome = useMemo(() => foods.filter((f) => pantry.has(f.id)), [foods, pantry])
  const { order, count } = useMemo(() => suggestionOrder(targets, atHome, variant), [targets, atHome, variant])
  const [alloc, setAlloc] = useState<Allocation>(() => autoFill(targets, order))
  const [editing, setEditing] = useState(false)

  const actual = totals(alloc, byId)
  const status = compare(targets, actual)
  const allOk = status.every((s) => s.diff === 0)
  const carbs = status.reduce((sum, s) => sum + s.actual * GROUP_BY_ID[s.group].carbs, 0)

  const setUnits = (id: string, units: number) =>
    setAlloc((a) => {
      const next = { ...a }
      if (units <= 0) delete next[id]
      else next[id] = roundHalf(units)
      return next
    })

  const groups = MEAL_GROUP_ORDER.filter((g) => (targets[g] ?? 0) > 0 || (actual[g] ?? 0) > 0)
  const freeVeg = atHome.filter((f) => f.free)

  if (!editing) {
    const missing = status.filter((st) => st.diff < 0)
    const items = MEAL_GROUP_ORDER.flatMap((g) =>
      foods.filter((f) => f.group === g && !f.free && alloc[f.id] > 0),
    )
    return (
      <>
        <div className={`card suggestion ${allOk ? 'ok' : ''}`}>
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
              Nedostaje:{' '}
              {missing.map((st) => `${GROUP_BY_ID[st.group].short.toLowerCase()} ${formatNumber(-st.diff)} j.`).join(', ')}
              {' '}– nemate ništa iz te skupine kod kuće.{' '}
              <button className="link" onClick={onGoToFoods}>Označi namirnice</button>
            </p>
          )}
        </div>

        {note && <p className="hint center">{note}</p>}

        <div className="actions">
          <button className="primary" onClick={onReshuffle} disabled={count <= 1}>🔀 Drugi prijedlog</button>
          <button onClick={() => setEditing(true)}>✏️ Prilagodi</button>
        </div>
        <p className="hint center">
          {count > 1
            ? `Prijedlog ${(variant % count) + 1} od ${count}`
            : 'Ovo je jedini obrok koji se može složiti od namirnica koje imate. Označite više namirnica za druge prijedloge.'}
        </p>
      </>
    )
  }

  return (
    <>
      <div className={`summary ${allOk ? 'ok' : ''}`}>
        <div className="status-row">
          {status.map((st) => (
            <span key={st.group} className={`pill ${st.diff === 0 ? 'ok' : st.diff < 0 ? 'short' : 'over'}`} style={{ '--c': GROUP_BY_ID[st.group].color } as CSSProperties}>
              {GROUP_BY_ID[st.group].short} {formatNumber(st.actual)}/{formatNumber(st.target)}
            </span>
          ))}
        </div>
        <p className="summary-text">
          {allOk ? '✓ Obrok je u skladu s planom.' : 'Obrok još nije u skladu s planom.'}{' '}
          Ugljikohidrati: <strong>{formatNumber(Math.round(carbs))} g</strong>
        </p>
      </div>

      {groups.map((g) => (
        <GroupCard
          key={g}
          group={g}
          target={targets[g] ?? 0}
          actual={actual[g] ?? 0}
          alloc={alloc}
          foods={foods}
          atHome={atHome}
          setUnits={setUnits}
          onGoToFoods={onGoToFoods}
        />
      ))}

      <div className="actions">
        <button className="primary" onClick={() => setEditing(false)}>✓ Gotovo</button>
      </div>
    </>
  )
}

interface GroupCardProps {
  group: GroupId
  target: number
  actual: number
  alloc: Allocation
  foods: Food[]
  atHome: Food[]
  setUnits: (id: string, units: number) => void
  onGoToFoods: () => void
}

function GroupCard({ group, target, actual, alloc, foods, atHome, setUnits, onGoToFoods }: GroupCardProps) {
  const info = GROUP_BY_ID[group]
  const inMeal = foods.filter((f) => f.group === group && !f.free && alloc[f.id] > 0)
  const homeOptions = atHome.filter((f) => f.group === group && !f.free && !alloc[f.id])
  const otherOptions = foods.filter((f) => f.group === group && !f.free && !alloc[f.id] && !homeOptions.includes(f))
  const diff = Math.round((actual - target) * 100) / 100
  const nothingAtHome = !atHome.some((f) => f.group === group && !f.free)

  return (
    <div className="card" style={{ '--c': info.color } as CSSProperties}>
      <div className="card-head">
        <h3>{info.name}</h3>
        <span className="target">
          {formatNumber(target)} {target === 1 ? 'jedinica' : 'jedinice'}
          {info.carbs > 0 && <small> · {formatNumber(target * info.carbs)} g UH</small>}
        </span>
      </div>

      {inMeal.length > 0 && (
        <ul className="items">
          {inMeal.map((f) => (
            <li key={f.id}>
              <div className="item-main">
                <span>{f.name}</span>
                <span className="amount">{formatAmount(f, alloc[f.id])}</span>
                {f.note && <small className="hint">{f.note}</small>}
              </div>
              <div className="stepper">
                <button aria-label="Manje" onClick={() => setUnits(f.id, alloc[f.id] - 0.5)}>−</button>
                <span>{formatNumber(alloc[f.id])} j.</span>
                <button aria-label="Više" onClick={() => setUnits(f.id, alloc[f.id] + 0.5)}>+</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {diff !== 0 && (
        <p className={`delta ${diff < 0 ? 'short' : 'over'}`}>
          {diff < 0 ? `Nedostaje ${formatNumber(-diff)} j.` : `Previše za ${formatNumber(diff)} j.`}
          {nothingAtHome && diff < 0 && (
            <>
              {' '}– nemate ništa iz ove skupine kod kuće.{' '}
              <button className="link" onClick={onGoToFoods}>Označi namirnice</button>
            </>
          )}
        </p>
      )}

      {(homeOptions.length > 0 || otherOptions.length > 0) && (
        <select
          className="add"
          value=""
          onChange={(e) => {
            const id = e.target.value
            if (id) setUnits(id, Math.max(0.5, roundHalf(target - actual)))
          }}
        >
          <option value="">+ Dodaj namirnicu…</option>
          {homeOptions.length > 0 && (
            <optgroup label="Kod kuće">
              {homeOptions.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </optgroup>
          )}
          <optgroup label="Ostale namirnice">
            {otherOptions.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </optgroup>
        </select>
      )}
    </div>
  )
}
