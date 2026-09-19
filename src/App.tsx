import { useMemo, useState } from 'react'
import { BUILTIN_FOODS } from './data/foods'
import { findPlan, planMeals } from './data/plans'
import { useStored } from './lib/storage'
import type { Food, MealId } from './types'
import type { Mode } from './components/ModePicker'
import ModePicker from './components/ModePicker'
import MealView from './components/MealView'
import FoodsView from './components/FoodsView'
import PlanView from './components/PlanView'

type Tab = 'obrok' | 'namirnice' | 'plan'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'plan', label: '1. Plan', icon: '📋' },
  { id: 'namirnice', label: '2. Kod kuće', icon: '🧺' },
  { id: 'obrok', label: '3. Obrok', icon: '🍽️' },
]

function currentMeal(): MealId {
  const h = new Date().getHours()
  if (h < 9) return 'zajutrak'
  if (h < 12) return 'dorucak'
  if (h < 15) return 'rucak'
  if (h < 17) return 'uzina'
  if (h < 20) return 'vecera'
  return 'nocni'
}

export default function App() {
  // Bez odabranog plana aplikacija kreće od prvog koraka.
  const [kcal, setKcal] = useStored<number | null>('kcal', null)
  const [tab, setTab] = useStored<Tab>('tab', 'plan')
  const [customFoods, setCustomFoods] = useStored<Food[]>('customFoods', [])
  const [pantry, setPantry] = useStored<string[]>('pantry', [])
  const [welcomeSeen, setWelcomeSeen] = useStored('welcomeSeen', false)
  const [mode, setMode] = useStored<Mode>('mode', 'dan')
  const [storedMeal, setMeal] = useStored<MealId>('meal', currentMeal())
  const [mealsPerDay, setMealsPerDay] = useStored<6 | 3>('mealsPerDay', 6)
  const [editing, setEditing] = useState<Food | null>(null)

  const plan = findPlan(kcal, mealsPerDay)
  // Plan s 3 obroka nema užinu ni doručak u 10h – tada vrijedi prvi obrok plana.
  const meal = !plan || plan.meals[storedMeal] ? storedMeal : planMeals(plan)[0].id
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
          {plan ? `${plan.kcal} kcal · ${plan.mealsPerDay} obr.` : 'Odaberi plan'}
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
            <MealView
              plan={plan}
              foods={foods}
              pantry={pantrySet}
              mode={mode}
              meal={meal}
              onMode={setMode}
              onMeal={setMeal}
              onGoToFoods={() => setTab('namirnice')}
            />
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
          <PlanView
            kcal={kcal}
            mealsPerDay={mealsPerDay}
            onChange={setKcal}
            onMealsPerDay={setMealsPerDay}
            hasPantry={pantry.length > 0}
            onNext={() => setTab(pantry.length > 0 ? 'obrok' : 'namirnice')}
          >
            {plan && <ModePicker plan={plan} mode={mode} meal={meal} onMode={setMode} onMeal={setMeal} />}
          </PlanView>
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
