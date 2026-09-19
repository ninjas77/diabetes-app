import { useEffect, useState } from 'react'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

/** useState koji se sprema u localStorage (podaci ostaju samo na ovom uređaju). */
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Spremanje nije dostupno (npr. privatni način rada) – aplikacija radi i bez njega.
    }
  }, [key, value])
  return [value, setValue] as const
}
