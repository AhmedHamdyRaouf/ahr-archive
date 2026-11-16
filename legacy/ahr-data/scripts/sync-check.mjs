#!/usr/bin/env node
// Checks that Supabase (master), data/csv/*.csv and data/AHR_Data_v10.5.xlsx hold the same rows, and with --fix rewrites the CSV and Excel copies from Supabase.
//
//   node scripts/sync-check.mjs            report only (exit code 1 if anything differs)
//   node scripts/sync-check.mjs --fix      rewrite CSV + Excel from Supabase
//   node scripts/sync-check.mjs --source json:dump.json   read {table: rows} from a file instead of Supabase (offline test)
//
// Supabase access (never stored in the repo): SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY,
// or SUPABASE_URL + SUPABASE_ANON_KEY + SUPABASE_USER_JWT (the owner's access token).
// Excel is read and written through scripts/xlsx_io.py (python3 + `pip install openpyxl`), which keeps emoji, styles and untouched sheets intact.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const TABLES = {
  works: 'Works', credits: 'Credits', person: 'Person', events: 'Events', awards: 'Awards', press: 'Press', sources: 'Sources',
  media_assets: 'Media_Assets', life_story: 'Life_Story', training_choir: 'Training_Choir', roles_education: 'Roles_Education',
  press_links: 'Press_Links', review_queue: 'Review_Queue', audience_voices: 'Audience_Voices', youtube_videos: 'YouTube_Videos',
  project_items: 'Project_Items', site_texts: 'Site_Texts', contact_channels: 'Contact_Channels', work_relationship: 'Work_Relationship',
  ref_relationship_type: 'Ref_Relationship_Type',
}
const XLSX_PATH = path.join(root, 'data', 'AHR_Data_v10.5.xlsx')
const args = process.argv.slice(2)
const FIX = args.includes('--fix')
const src = (args.find((a) => a === '--source') && args[args.indexOf('--source') + 1]) || ''

const str = (v) => (v === null || v === undefined ? '' : String(v))
const cell = (v) => (/[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v)

function parseCsv(text) {
  const t = text.replace(/^﻿/, '')
  const rows = []; let row = [], cur = '', q = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\r') { /* skip */ }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' }
    else cur += c
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row) }
  return rows
}
const toCsv = (rows) => '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'

async function fetchAll(table) {
  if (src.startsWith('json:')) {
    const j = JSON.parse(fs.readFileSync(src.slice(5), 'utf8'))
    return j[table] || []
  }
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY + SUPABASE_USER_JWT)')
  const bearer = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_USER_JWT || key
  const out = []
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${url}/rest/v1/${table}?select=*`, { headers: { apikey: key, Authorization: `Bearer ${bearer}`, Range: `${from}-${from + 999}` } })
    if (!r.ok) throw new Error(`${table}: HTTP ${r.status} ${await r.text()}`)
    const part = await r.json()
    out.push(...part)
    if (part.length < 1000) break
  }
  return out
}

const PY = path.join(root, 'scripts', 'xlsx_io.py')
const xl = JSON.parse(execFileSync('python3', [PY, 'read', XLSX_PATH], { maxBuffer: 256 * 1024 * 1024 }).toString('utf8'))
const xlFix = {}
let problems = 0, fixed = 0
const diffLines = []

for (const [table, file] of Object.entries(TABLES)) {
  const csvPath = path.join(root, 'data', 'csv', `${file}.csv`)
  const csvRows = parseCsv(fs.readFileSync(csvPath, 'utf8'))
  const cols = csvRows[0]
  const pk = table === 'review_queue' ? 'row_id' : cols[0]
  const db = await fetchAll(table)
  // the Ref table follows its own sort_order (also used by the dashboard copy); the others follow their key
  if (table === 'ref_relationship_type') db.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
  else db.sort((a, b) => (pk === 'row_id' ? Number(a.row_id) - Number(b.row_id) : str(a[pk]) < str(b[pk]) ? -1 : str(a[pk]) > str(b[pk]) ? 1 : 0))
  const want = [cols, ...db.map((r) => cols.map((c) => str(r[c])))]

  const compare = (label, have) => {
    const n = Math.max(have.length, want.length)
    const bad = []
    for (let i = 0; i < n; i++) {
      const a = (have[i] || []).slice(0, cols.length).map(str), b = want[i] || []
      if (a.length !== b.length || a.some((v, k) => v !== b[k])) bad.push(i)
    }
    if (bad.length) {
      problems++
      const ids = bad.slice(0, 5).map((i) => str((want[i] || have[i] || [])[0])).join(', ')
      diffLines.push(`${table} ${label}: ${bad.length} differing rows (e.g. ${ids}); DB ${want.length - 1} rows, ${label} ${have.length - 1} rows`)
    }
    return bad.length
  }

  const badCsv = compare('CSV', csvRows)
  const badX = compare('Excel', xl[file] || [])

  if (FIX) {
    if (badCsv) { fs.writeFileSync(csvPath, toCsv(want)); fixed++ }
    if (badX) { xlFix[file] = want; fixed++ }
  }
}

if (FIX && Object.keys(xlFix).length) {
  const tmp = path.join(root, 'scripts', '.xlsx_fix.json')
  fs.writeFileSync(tmp, JSON.stringify(xlFix))
  try { execFileSync('python3', [PY, 'write', XLSX_PATH, tmp]) } finally { fs.unlinkSync(tmp) }
}
if (diffLines.length) console.log(diffLines.join('\n'))
console.log(problems === 0 ? `OK: Supabase, CSV and Excel match (${Object.keys(TABLES).length} tables)` : FIX ? `Fixed ${fixed} file(s); run again to confirm.` : `${problems} difference(s). Run with --fix to rewrite CSV and Excel from Supabase.`)
process.exit(problems && !FIX ? 1 : 0)
