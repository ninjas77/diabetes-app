import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { GROUP_BY_ID, MEAL_GROUP_ORDER } from '../data/groups'
import { MEALS } from '../data/plans'
import { useStored } from '../lib/storage'
import { autoFill, compare, formatAmount, formatNumber, roundHalf, totals } from '../lib/meal'
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
          shuffle={seed > 0}
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
  shuffle: boolean
  note?: string
  onReshuffle: () => void
  onGoToFoods: () => void
}

function shuffled<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function MealBuilder({ targets, foods, pantry, shuffle, note, onReshuffle, onGoToFoods }: BuilderProps) {
  const byId = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods])
  const atHome = useMemo(() => foods.filter((f) => pantry.has(f.id)), [foods, pantry])
  const [alloc, setAlloc] = useState<Allocation>(() => autoFill(targets, shuffle ? shuffled(atHome) : atHome))
  const [showFree, setShowFree] = useStored('showFreeVeg', true)

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

  return (
    <>
      <div className={`summary ${allOk ? 'ok' : ''}`}>
        <div className="status-row">
          {status.map((s) => (
            <span key={s.group} className={`pill ${s.diff === 0 ? 'ok' : s.diff < 0 ? 'short' : 'over'}`} style={{ '--c': GROUP_BY_ID[s.group].color } as CSSProperties}>
              {GROUP_BY_ID[s.group].short} {formatNumber(s.actual)}/{formatNumber(s.target)}
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

      {freeVeg.length > 0 && (
        <div className="card free">
          <div className="card-head">
            <h3>Povrće po želji</h3>
            <label className="toggle">
              <input type="checkbox" checked={showFree} onChange={(e) => setShowFree(e.target.checked)} /> prikaži
            </label>
          </div>
          <p className="hint">Ne računa se u dnevni unos – do 100 g, najviše u 3 obroka dnevno.</p>
          {showFree && (
            <ul className="items">
              {freeVeg.map((f) => (
                <li key={f.id}><span>{f.name}</span><span className="amount">do 100 g</span></li>
              ))}
            </ul>
          )}
        </div>
      )}

      {note && <p className="hint center">{note}</p>}

      <div className="actions">
        <button onClick={onReshuffle}>🔀 Druga kombinacija</button>
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
