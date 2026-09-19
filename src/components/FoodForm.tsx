import { useState } from 'react'
import type { FormEvent } from 'react'
import { GROUPS, GROUP_BY_ID } from '../data/groups'
import { formatNumber } from '../lib/meal'
import type { Food, GroupId, When } from '../types'

interface Props {
  initial: Food | null
  existingNames: string[]
  onSave: (food: Food) => void
  onCancel: () => void
}

const GENITIVE = { ugljikohidrati: 'ugljikohidrata', bjelančevine: 'bjelančevina', masti: 'masti' }

const SUBGROUPS: Partial<Record<GroupId, string[]>> = {
  meso: ['nemasno', 'srednje masno'],
  masnoce: ['nezasićene', 'zasićene'],
}

export default function FoodForm({ initial, existingNames, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [group, setGroup] = useState<GroupId>(initial?.group ?? 'kruh')
  const [sub, setSub] = useState(initial?.sub ?? '')
  const [grams, setGrams] = useState(initial ? String(initial.grams) : '')
  const [state, setState] = useState(initial?.state ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [when, setWhen] = useState<When>(initial?.when ?? 'oba')
  const [per100, setPer100] = useState('')

  const info = GROUP_BY_ID[group]
  const gramsNum = Number(grams.replace(',', '.'))
  const per100Num = Number(per100.replace(',', '.'))
  const computed = per100Num > 0 ? Math.round((info.key.perUnit / per100Num) * 100) : null
  const duplicate = existingNames.some((n) => n.trim().toLowerCase() === name.trim().toLowerCase())
  const valid = name.trim() !== '' && gramsNum > 0 && !duplicate

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    onSave({
      id: initial?.id ?? `moja-${Date.now().toString(36)}`,
      name: name.trim(),
      group,
      grams: gramsNum,
      state: state.trim() || undefined,
      sub: SUBGROUPS[group]?.includes(sub) ? sub : undefined,
      note: note.trim() || undefined,
      when,
      custom: true,
    })
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h3>{initial ? 'Uredi namirnicu' : 'Nova namirnica'}</h3>

      <label>
        Naziv
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="npr. Kruh sa sjemenkama" autoFocus />
      </label>
      {duplicate && <p className="delta over">Namirnica s tim nazivom već postoji.</p>}

      <label>
        Skupina
        <select value={group} onChange={(e) => { setGroup(e.target.value as GroupId); setSub('') }}>
          {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </label>

      {SUBGROUPS[group] && (
        <label>
          Vrsta
          <select value={sub} onChange={(e) => setSub(e.target.value)}>
            <option value="">—</option>
            {SUBGROUPS[group]!.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      )}

      <fieldset className="calc">
        <legend>Izračun iz deklaracije (neobavezno)</legend>
        <label>
          {info.key.nutrient[0].toUpperCase() + info.key.nutrient.slice(1)} na 100 g (g)
          <input inputMode="decimal" value={per100} onChange={(e) => setPer100(e.target.value)} placeholder="npr. 45" />
        </label>
        {computed !== null && (
          <p className="hint">
            1 jedinica = {info.key.perUnit} g {GENITIVE[info.key.nutrient]} ≈ <strong>{formatNumber(computed)} g</strong>{' '}
            <button type="button" className="link" onClick={() => setGrams(String(computed))}>Upiši</button>
          </p>
        )}
      </fieldset>

      <div className="row">
        <label>
          Grama za 1 jedinicu
          <input inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="npr. 30" required />
        </label>
        <label>
          Stanje
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">—</option>
            <option value="sirovo">sirovo</option>
            <option value="kuhano">kuhano</option>
            <option value="pečeno">pečeno</option>
          </select>
        </label>
      </div>

      <label>
        Kada se jede
        <select value={when} onChange={(e) => setWhen(e.target.value as When)}>
          <option value="oba">Bilo kada</option>
          <option value="jutro">Doručak, užina (hladni obroci)</option>
          <option value="topli">Ručak, večera (kuhani obroci)</option>
        </select>
      </label>

      <label>
        Napomena
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="neobavezno" />
      </label>

      <div className="actions">
        <button type="button" onClick={onCancel}>Odustani</button>
        <button type="submit" className="primary" disabled={!valid}>Spremi</button>
      </div>
    </form>
  )
}
