import { useMemo, useState } from 'react'
import { BUILTIN_FOODS } from './data/foods'
import { PLANS } from './data/plans'
import { useStored } from './lib/storage'
import type { Food } from './types'
import MealView from './components/MealView'
import FoodsView from './components/FoodsView'
import PlanView from './components/PlanView'

type Tab = 'obrok' | 'namirnice' | 'plan'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'plan', label: '1. Plan', icon: '📋' },
  { id: 'namirnice', label: '2. Kod kuće', icon: '🧺' },
  { id: 'obrok', label: '3. Obrok', icon: '🍽️' },
]

export default function App() {
  // Bez odabranog plana aplikacija kreće od prvog koraka.
  const [kcal, setKcal] = useStored<number | null>('kcal', null)
  const [tab, setTab] = useStored<Tab>('tab', 'plan')
  const [customFoods, setCustomFoods] = useStored<Food[]>('customFoods', [])
  const [pantry, setPantry] = useStored<string[]>('pantry', [])
  const [welcomeSeen, setWelcomeSeen] = useStored('welcomeSeen', false)
  const [editing, setEditing] = useState<Food | null>(null)

  const plan = PLANS.find((p) => p.kcal === kcal) ?? null
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
          {plan ? `${plan.kcal} kcal` : 'Odaberi plan'}
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

        {tab === 'obrok' &&
          (plan ? (
            <MealView plan={plan} foods={foods} pantry={pantrySet} onGoToFoods={() => setTab('namirnice')} />
          ) : (
            <div className="empty">
              <p>Prvo odaberite svoj dnevni plan prehrane.</p>
              <button className="primary" onClick={() => setTab('plan')}>Odaberi plan</button>
            </div>
          ))}
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
            onNext={() => setTab('obrok')}
          />
        )}
        {tab === 'plan' && (
          <PlanView kcal={kcal} onChange={setKcal} hasPantry={pantry.length > 0} onNext={() => setTab(pantry.length > 0 ? 'obrok' : 'namirnice')} />
        )}
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
