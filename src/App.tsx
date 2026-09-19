import { useMemo, useState } from 'react'
import { BUILTIN_FOODS } from './data/foods'
import { DEFAULT_KCAL, PLANS } from './data/plans'
import { useStored } from './lib/storage'
import type { Food } from './types'
import MealView from './components/MealView'
import FoodsView from './components/FoodsView'
import PlanView from './components/PlanView'

type Tab = 'obrok' | 'namirnice' | 'plan'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'obrok', label: 'Obrok', icon: '🍽️' },
  { id: 'namirnice', label: 'Namirnice', icon: '🧺' },
  { id: 'plan', label: 'Plan', icon: '📋' },
]

export default function App() {
  const [tab, setTab] = useStored<Tab>('tab', 'obrok')
  const [kcal, setKcal] = useStored<number>('kcal', DEFAULT_KCAL)
  const [customFoods, setCustomFoods] = useStored<Food[]>('customFoods', [])
  const [pantry, setPantry] = useStored<string[]>('pantry', [])
  const [welcomeSeen, setWelcomeSeen] = useStored('welcomeSeen', false)
  const [editing, setEditing] = useState<Food | null>(null)

  const plan = PLANS.find((p) => p.kcal === kcal) ?? PLANS[0]
  const foods = useMemo(() => [...BUILTIN_FOODS, ...customFoods], [customFoods])
  const pantrySet = useMemo(() => new Set(pantry), [pantry])

  const togglePantry = (id: string) =>
    setPantry((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const saveFood = (food: Food) => {
    setCustomFoods((list) => (list.some((f) => f.id === food.id) ? list.map((f) => (f.id === food.id ? food : f)) : [...list, food]))
    setPantry((p) => (p.includes(food.id) ? p : [...p, food.id]))
  }

  const deleteFood = (id: string) => {
    setCustomFoods((list) => list.filter((f) => f.id !== id))
    setPantry((p) => p.filter((x) => x !== id))
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Dijabetički obrok</h1>
        <button className="plan-chip" onClick={() => setTab('plan')}>
          {plan.kcal} kcal
        </button>
      </header>

      <main>
        {!welcomeSeen && (
          <div className="notice">
            <p>
              Aplikacija slaže obroke prema tablicama jedinica i planovima prehrane KBC Sestre milosrdnice.
              Ne zamjenjuje savjet liječnika ili nutricionista – dnevnu energetsku vrijednost odredite s njima.
            </p>
            <button onClick={() => setWelcomeSeen(true)}>U redu</button>
          </div>
        )}

        {tab === 'obrok' && (
          <MealView plan={plan} foods={foods} pantry={pantrySet} onGoToFoods={() => setTab('namirnice')} />
        )}
        {tab === 'namirnice' && (
          <FoodsView
            foods={foods}
            pantry={pantrySet}
            onToggle={togglePantry}
            onClearPantry={() => setPantry([])}
            onSave={saveFood}
            onDelete={deleteFood}
            editing={editing}
            setEditing={setEditing}
          />
        )}
        {tab === 'plan' && <PlanView kcal={kcal} onChange={setKcal} />}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
