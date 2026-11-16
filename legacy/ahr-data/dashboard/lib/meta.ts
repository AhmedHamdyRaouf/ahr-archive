// Shared display facts about each table (which column is the title / subtitle, the CSV file name) and a title helper.
import { SCHEMA } from './schema'
import type { Lang } from './i18n'

export type Row = Record<string, string | number | boolean | null>
export type Data = Record<string, Row[]>

export const TITLE: Record<string, string> = {
  works: 'title_ar', credits: 'person_as_stated', person: 'name_ar', events: 'name', awards: 'name', press: 'title_or_topic',
  sources: 'source_name', media_assets: 'platform_or_asset', life_story: 'topic', training_choir: 'item', roles_education: 'item',
  press_links: 'item', review_queue: 'item', audience_voices: 'comment_text', youtube_videos: 'title', project_items: 'title', site_texts: 'title', contact_channels: 'label',
  work_relationship: 'relationship_id', ref_relationship_type: 'label_ar',
}
export const SUB: Record<string, string> = {
  works: 'category', credits: 'role', person: 'type', events: 'event_type', awards: 'type', press: 'outlet', sources: 'type',
  media_assets: 'category', life_story: 'period', training_choir: 'period', roles_education: 'period', press_links: 'period',
  review_queue: 'status', audience_voices: 'platform', youtube_videos: 'channel', project_items: 'project', site_texts: 'kind', contact_channels: 'kind',
  work_relationship: 'relationship_type', ref_relationship_type: 'code',
}
export const FILE: Record<string, string> = {
  works: 'Works', credits: 'Credits', person: 'Person', events: 'Events', awards: 'Awards', press: 'Press', sources: 'Sources',
  media_assets: 'Media_Assets', life_story: 'Life_Story', training_choir: 'Training_Choir', roles_education: 'Roles_Education',
  press_links: 'Press_Links', review_queue: 'Review_Queue', audience_voices: 'Audience_Voices', youtube_videos: 'YouTube_Videos', project_items: 'Project_Items', site_texts: 'Site_Texts', contact_channels: 'Contact_Channels', work_relationship: 'Work_Relationship', ref_relationship_type: 'Ref_Relationship_Type',
}

export const s = (v: unknown) => (v === null || v === undefined ? '' : String(v))

export function titleOf(table: string, row: Row | undefined, lang: Lang): string {
  if (!row) return ''
  const def = SCHEMA.find((x) => x.t === table)
  const c = TITLE[table]
  const f = def?.fields.find((x) => x.c === c)
  const v = lang === 'en' && f?.e ? s(row[f.e]) || s(row[c]) : s(row[c])
  return v.length > 70 ? v.slice(0, 70) + '…' : v
}

export const tableLabel = (table: string, lang: Lang) => {
  const d = SCHEMA.find((x) => x.t === table)
  return d ? `${d.icon} ${lang === 'ar' ? d.ar : d.en}` : table
}

// privacy values are sometimes composite ("عام (رقم العضوية: أقصى خصوصية)"): the level is the word the value starts with
export type Level = 'pub' | 'int' | 'max' | 'none'
export const levelOf = (v: unknown): Level => {
  const x = s(v).trim()
  if (x.startsWith('أقصى')) return 'max'
  if (x.startsWith('داخلي')) return 'int'
  if (x.startsWith('عام')) return 'pub'
  return 'none'
}
export const LEVELS: Level[] = ['pub', 'int', 'max', 'none']

// Columns that behave like a pick-list: few distinct values repeated across many rows (privacy, status, category, type ...).
// The list is read from the data itself, so a value added once appears in the list from then on.
const FORCE = new Set(['project', 'privacy', 'status', 'category', 'type', 'confidence', 'evidence_status', 'trust_level', 'event_type', 'publish', 'featured'])
const NOT_LIST = /(^|_)(id|year|date|link|url|note|notes|desc|description|title|name|source|comment|text|context|summary|quote|address|phone|email|handle|lyricist|composer|arranger|writer|director|place|count|role)(_|$)/
export type ListOpts = { vals: string[]; en: Map<string, string> }

// projects the owner already runs: offered in the list even before the first row exists
const YESNO = [{ ar: 'نعم', en: 'Yes' }, { ar: 'لا', en: 'No' }]
const KNOWN: Record<string, Record<string, { ar: string; en: string }[]>> = {
  works: {
    category: [
      { ar: 'أغنية', en: 'Song' }, { ar: 'عمل مسرحي', en: 'Stage Production' }, { ar: 'مسلسل تلفزيوني', en: 'TV Series' },
      { ar: 'فيلم سينمائي', en: 'Feature Film' }, { ar: 'فيلم وثائقي', en: 'Documentary Film' }, { ar: 'إعلان (أغنية أو موسيقى)', en: 'Advertising Music' },
      { ar: 'موسيقى تصويرية', en: 'Original Score' }, { ar: 'موسيقى برنامج', en: 'Program Music' }, { ar: 'مشروع فيديو', en: 'Video Project' },
    ],
  },
  project_items: { project: [{ ar: 'دندنة', en: 'Dandana' }, { ar: 'حكايات', en: 'Hekayat' }, { ar: 'فين قلبي', en: 'Feen Albi' }] },
}

export function listColumns(def: { t?: string; pk: string; fields: { c: string; e: string | null }[] }, rows: Row[]): Map<string, ListOpts> {
  const out = new Map<string, ListOpts>()
  for (const f of def.fields) {
    if (f.c === def.pk) continue
    const cnt = new Map<string, number>()
    const en = new Map<string, string>()
    let nonEmpty = 0
    for (const r of rows) {
      const v = s(r[f.c]).trim()
      if (!v) continue
      nonEmpty++
      cnt.set(v, (cnt.get(v) || 0) + 1)
      if (f.e && s(r[f.e]).trim() && !en.has(v)) en.set(v, s(r[f.e]).trim())
    }
    for (const k of (def.t && (KNOWN[def.t]?.[f.c] || ((f.c === 'publish' || f.c === 'featured') && YESNO))) || []) { if (!cnt.has(k.ar)) cnt.set(k.ar, 0); if (!en.has(k.ar)) en.set(k.ar, k.en) }
    const d = cnt.size
    if (!d) continue
    const longest = Math.max(...Array.from(cnt.keys()).map((k) => k.length))
    const forced = FORCE.has(f.c) && d <= 40
    const auto = !NOT_LIST.test(f.c) && nonEmpty >= 8 && d <= 30 && d * 2.5 <= nonEmpty && longest <= 80
    if (forced || auto) out.set(f.c, { vals: Array.from(cnt.entries()).sort((a, b) => b[1] - a[1]).map(([k]) => k), en })
  }
  return out
}

// Columns that are not text in the database. The editor works with strings; these are turned into real numbers / booleans before saving
// (a blank number falls back to the column default, a blank flag to true).
export const TYPED: Record<string, Record<string, 'int' | 'bool'>> = {
  work_relationship: { sort_order: 'int' },
  ref_relationship_type: { sort_order: 'int', active: 'bool' },
}
export function coerceRow(table: string, row: Row): Row {
  const spec = TYPED[table]
  if (!spec) return row
  const out: Row = { ...row }
  for (const [c, k] of Object.entries(spec)) {
    const v = out[c]
    if (k === 'int') out[c] = v === '' || v === null || v === undefined ? 0 : Number(v)
    else out[c] = v === '' || v === null || v === undefined ? true : typeof v === 'boolean' ? v : String(v).trim().toLowerCase() !== 'false'
  }
  return out
}
