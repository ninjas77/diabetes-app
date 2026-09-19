import { planMeals } from '../data/plans'
import type { MealId, Plan } from '../types'

export type Mode = 'dan' | 'obrok'

interface Props {
  plan: Plan
  mode: Mode
  meal: MealId
  onMode: (mode: Mode) => void
  onMeal: (meal: MealId) => void
}

/** Odabir: cijeli dnevni jelovnik ili jedan obrok (i koji). */
export default function ModePicker({ plan, mode, meal, onMode, onMeal }: Props) {
  return (
    <>
      <div className="segmented" role="radiogroup" aria-label="Što složiti">
        <button role="radio" aria-checked={mode === 'dan'} className={mode === 'dan' ? 'active' : ''} onClick={() => onMode('dan')}>
          📅 Cijeli dan
        </button>
        <button role="radio" aria-checked={mode === 'obrok'} className={mode === 'obrok' ? 'active' : ''} onClick={() => onMode('obrok')}>
          🍽️ Jedan obrok
        </button>
      </div>

      {mode === 'obrok' && (
        <div className="meal-tabs" role="tablist">
          {planMeals(plan).map((m) => (
            <button key={m.id} role="tab" aria-selected={m.id === meal} className={m.id === meal ? 'active' : ''} onClick={() => onMeal(m.id)}>
              <strong>{m.name}</strong>
              <small>{m.time}</small>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
