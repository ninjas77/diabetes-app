import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { GROUP_BY_ID, MEAL_GROUP_ORDER } from '../data/groups'
import { planMeals, targetsFor } from '../data/plans'
import DayView from './DayView'
import ModePicker from './ModePicker'
import type { Mode } from './ModePicker'
import SuggestionCard from './SuggestionCard'
import { autoFill, compare, formatAmount, formatNumber, roundHalf, totals } from '../lib/meal'
import { MEAL_CONTEXT, freeVegFor, suggestions } from '../lib/pairing'
import type { Allocation } from '../lib/meal'
import type { Food, GroupId, MealId, Plan, Units } from '../types'

interface Props {
  plan: Plan
  foods: Food[]
  pantry: Set<string>
  mode: Mode
  meal: MealId
  onMode: (mode: Mode) => void
  onMeal: (meal: MealId) => void
  onGoToFoods: () => void
}

export default function MealView({ plan, foods, pantry, mode, meal: selectedMeal, onMode, onMeal, onGoToFoods }: Props) {
  const [seed, setSeed] = useState(0)
  // Obrok otvoren iz dnevnog jelovnika zadržava namirnice koje su tamo predložene.
  const [preset, setPreset] = useState<Food[] | undefined>()
  const atHome = useMemo(() => foods.filter((f) => pantry.has(f.id)), [foods, pantry])
  // Plan s 3 obroka nema npr. užinu – tada se prikazuje prvi obrok plana.
  const meal = plan.meals[selectedMeal] ? selectedMeal : planMeals(plan)[0].id
  const targets = targetsFor(plan, meal)
  const pantryKey = [...pantry].sort().join(',')

  const chooseMeal = (m: MealId) => {
    onMeal(m)
    setSeed(0)
    setPreset(undefined)
  }

  return (
    <section>
      <ModePicker plan={plan} mode={mode} meal={meal} onMode={onMode} onMeal={chooseMeal} />

      {pantry.size === 0 ? (
        <div className="empty">
          <p>Još niste označili što imate kod kuće.</p>
          <button className="primary" onClick={onGoToFoods}>Označi namirnice</button>
        </div>
      ) : mode === 'dan' ? (
        <DayView
          key={`${plan.kcal}-${pantryKey}`}
          plan={plan}
          foods={foods}
          atHome={atHome}
          onGoToFoods={onGoToFoods}
          onOpenMeal={(m, picks) => {
            chooseMeal(m)
            setPreset(picks)
            onMode('obrok')
          }}
        />
      ) : (
        <MealBuilder
          key={`${plan.kcal}-${meal}-${pantryKey}-${seed}`}
          meal={meal}
          targets={targets}
          foods={foods}
          atHome={atHome}
          variant={seed}
          preset={seed === 0 ? preset : undefined}
          note={plan.notes?.[meal]}
          onReshuffle={() => setSeed((s) => s + 1)}
          onGoToFoods={onGoToFoods}
        />
      )}
    </section>
  )
}

interface BuilderProps {
  meal: MealId
  targets: Units
  foods: Food[]
  atHome: Food[]
  variant: number
  preset?: Food[]
  note?: string
  onReshuffle: () => void
  onGoToFoods: () => void
}

function MealBuilder({ meal, targets, foods, atHome, variant, preset, note, onReshuffle, onGoToFoods }: BuilderProps) {
  const byId = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods])
  const ctx = MEAL_CONTEXT[meal]
  const options = useMemo(() => suggestions(ctx, targets, atHome), [ctx, targets, atHome])
  const count = options.length
  const picks = preset ?? (count > 0 ? options[variant % count] : [])
  // Odabrane namirnice idu prve, pa ih autoFill uzima za svoju skupinu.
  const [alloc, setAlloc] = useState<Allocation>(() => autoFill(targets, [...picks, ...atHome.filter((f) => !picks.includes(f))]))
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
  const freeVeg = freeVegFor(ctx, picks, atHome)

  if (!editing) {
    return (
      <>
        <SuggestionCard foods={foods} alloc={alloc} targets={targets} freeVeg={freeVeg} onGoToFoods={onGoToFoods} />

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
