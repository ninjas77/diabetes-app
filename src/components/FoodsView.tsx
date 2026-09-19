import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { GROUPS } from '../data/groups'
import { FREE_FOODS, NOT_RECOMMENDED } from '../data/info'
import { formatAmount } from '../lib/meal'
import type { Food } from '../types'
import FoodForm from './FoodForm'

interface Props {
  foods: Food[]
  pantry: Set<string>
  onToggle: (id: string) => void
  onClearPantry: () => void
  onSave: (food: Food) => void
  onDelete: (id: string) => void
  editing: Food | null
  setEditing: (food: Food | null) => void
  onNext: () => void
}

/** Hrvatski oblik riječi uz broj: 1 namirnica, 2 namirnice, 5 namirnica. */
function namirnica(n: number): string {
  const d = n % 10, dd = n % 100
  if (d === 1 && dd !== 11) return 'namirnica'
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return 'namirnice'
  return 'namirnica'
}

type Filter = 'sve' | 'kod-kuce' | 'moje'

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')

export default function FoodsView({ foods, pantry, onToggle, onClearPantry, onSave, onDelete, editing, setEditing, onNext }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('sve')
  const [adding, setAdding] = useState(false)

  const visible = useMemo(() => {
    const q = normalize(query.trim())
    return foods.filter((f) => {
      if (filter === 'kod-kuce' && !pantry.has(f.id)) return false
      if (filter === 'moje' && !f.custom) return false
      return !q || normalize(f.name).includes(q)
    })
  }, [foods, pantry, query, filter])

  const formOpen = adding || editing !== null
  const closeForm = () => {
    setAdding(false)
    setEditing(null)
  }

  return (
    <section>
      <p className="hint">Označite namirnice koje imate kod kuće – od njih se slažu obroci.</p>

      <div className="toolbar">
        <input type="search" placeholder="Traži namirnicu…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="primary" onClick={() => { setEditing(null); setAdding(true) }}>+ Nova</button>
      </div>

      <div className="filters">
        {([['sve', 'Sve'], ['kod-kuce', `Kod kuće (${pantry.size})`], ['moje', 'Moje']] as [Filter, string][]).map(([id, label]) => (
          <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>
        ))}
        {pantry.size > 0 && (
          <button className="link" onClick={() => confirm('Poništiti sve oznake "kod kuće"?') && onClearPantry()}>Poništi oznake</button>
        )}
      </div>

      {formOpen && (
        <FoodForm
          key={editing?.id ?? "new"}
          initial={editing}
          existingNames={foods.filter((f) => f.id !== editing?.id).map((f) => f.name)}
          onSave={(food) => { onSave(food); closeForm() }}
          onCancel={closeForm}
        />
      )}

      {GROUPS.map((g) => {
        const items = visible.filter((f) => f.group === g.id)
        if (items.length === 0) return null
        const have = items.filter((f) => pantry.has(f.id)).length
        return (
          <details key={g.id} className="card group" style={{ '--c': g.color } as CSSProperties} open={query !== '' || filter !== 'sve'}>
            <summary>
              <span>
                <strong>{g.name}</strong>
                <small className="hint"> {g.description}</small>
              </span>
              {have > 0 && <span className="count">{have}</span>}
            </summary>
            <p className="hint">
              1 jedinica: {g.carbs} g UH, {g.protein} g bjelančevina, {g.fat} g masti – {g.kcal} kcal
            </p>
            <ul className="food-list">
              {items.map((f) => (
                <li key={f.id} className={pantry.has(f.id) ? 'have' : ''}>
                  <label>
                    <input type="checkbox" checked={pantry.has(f.id)} onChange={() => onToggle(f.id)} />
                    <span className="food-name">
                      {f.name}
                      {f.free && <em className="tag">ne računa se</em>}
                      {f.sub && <em className="tag">{f.sub}</em>}
                      {f.custom && <em className="tag mine">moja</em>}
                    </span>
                    <span className="amount">{formatAmount(f, 1)}</span>
                  </label>
                  {f.custom && (
                    <span className="row-actions">
                      <button className="link" onClick={() => { setAdding(false); setEditing(f) }}>Uredi</button>
                      <button className="link danger" onClick={() => confirm(`Obrisati "${f.name}"?`) && onDelete(f.id)}>Obriši</button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )
      })}

      {visible.length === 0 && <p className="empty">Nema namirnica za ovaj upit.</p>}

      <details className="card info">
        <summary><strong>Ne računa se u dnevni unos</strong></summary>
        <p className="hint">Energetska vrijednost do 20 kcal.</p>
        {FREE_FOODS.map((x) => (
          <p key={x.title}><strong>{x.title}:</strong> {x.items}</p>
        ))}
      </details>

      {pantry.size > 0 && (
        <button className="primary next sticky" onClick={onNext}>Dalje ({pantry.size} {namirnica(pantry.size)}) →</button>
      )}

      <details className="card info warn">
        <summary><strong>Ne preporučuje se</strong></summary>
        <ul>
          {NOT_RECOMMENDED.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </details>
    </section>
  )
}
