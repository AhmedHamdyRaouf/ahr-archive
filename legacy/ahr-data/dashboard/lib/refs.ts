// Finds archive codes (P-0007, W-0012, MA-0210 ...) written inside any text and builds the links between records:
// which codes a record mentions, which records mention it, and which written codes point at nothing.
import { SCHEMA } from './schema'
import type { Data } from './meta'

const prefixes = SCHEMA.map((x) => x.prefix.replace(/-$/, '')).filter(Boolean).sort((a, b) => b.length - a.length)
const RE = new RegExp(`\\b(?:${prefixes.join('|')})-\\d{4}(?!\\d)`, 'g')

export const codesIn = (text: string): string[] => Array.from(new Set(text.match(RE) || []))

export type Ref = { t: string; pk: string }
export type Dangling = { t: string; pk: string; col: string; code: string }
export type Graph = { exists: Map<string, Ref>; inn: Map<string, Ref[]>; dangling: Dangling[] }

export function buildGraph(data: Data): Graph {
  const exists = new Map<string, Ref>()
  for (const x of SCHEMA) {
    if (!x.prefix) continue
    for (const r of data[x.t] || []) exists.set(String(r[x.pk]), { t: x.t, pk: String(r[x.pk]) })
  }
  const inn = new Map<string, Ref[]>()
  const seen = new Set<string>()
  const dangling: Dangling[] = []
  for (const x of SCHEMA) {
    for (const r of data[x.t] || []) {
      const own = String(r[x.pk])
      for (const col of x.cols) {
        if (col === x.pk) continue
        const v = r[col]
        if (v === null || v === undefined || v === '') continue
        for (const code of codesIn(String(v))) {
          if (code === own) continue
          if (exists.has(code)) {
            const k = `${code}>${x.t}:${own}`
            if (!seen.has(k)) { seen.add(k); inn.set(code, [...(inn.get(code) || []), { t: x.t, pk: own }]) }
          } else dangling.push({ t: x.t, pk: own, col, code })
        }
      }
    }
  }
  return { exists, inn, dangling }
}
