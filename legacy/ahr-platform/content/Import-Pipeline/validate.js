#!/usr/bin/env node
/**
 * AHR Platform v1.0 — Content Import Validation Pipeline
 *
 * Validates a filled-in CSV against the exact rules documented in
 * 03-Content-Standards.md and 04-Validation-Rules.md — every rule here is
 * copied from an actual database constraint or business rule already
 * enforced by the codebase (packages/database/migrations/,
 * packages/content/src/definitions/*.ts). This script does NOT connect to
 * any database, does NOT perform any import, and does NOT require any
 * credentials — it is a pure, local, dry-run validator.
 *
 * Usage:
 *   node validate.js <entity-type> <path-to-csv>
 *
 * Example:
 *   node validate.js person ../Import-Templates/person.csv
 *
 * Exit code 0 = zero validation errors. Exit code 1 = one or more errors
 * (details written to stdout and to a JSON report file next to the input).
 */

const fs = require("fs");
const path = require("path");

// --- Minimal CSV parser (no external dependency) -----------------------
// Handles quoted fields containing commas; does not attempt to handle
// every RFC 4180 edge case (embedded newlines inside quoted fields) —
// sufficient for the flat, single-line-per-record templates this
// framework ships. If your real data needs more, use a proper CSV
// library (e.g. `papaparse`, already an approved dependency elsewhere
// in this monorepo) instead of extending this parser ad hoc.
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  function parseLine(line) {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current);
    return fields;
  }

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

// --- Entity schemas ------------------------------------------------------
// Copied verbatim from 03-Content-Standards.md, which was itself copied
// verbatim from packages/content/src/definitions/*.ts and the database
// migrations. If the approved schema ever changes, update both
// 03-Content-Standards.md and this object together — they must never
// drift apart.

const STATUS_VALUES = ["draft", "review", "verified", "published", "archived"];
const VERIFICATION_VALUES = ["pending", "self_reported", "verified", "archived"];
const VISIBILITY_VALUES = ["public", "restricted", "hidden"];

const SCHEMAS = {
  person: {
    required: ["name_ar", "name_en"],
    enums: {},
    booleans: ["is_featured"],
  },
  organization: {
    required: ["name_ar", "name_en"],
    enums: {},
    booleans: [],
  },
  work: {
    required: ["title_ar", "title_en", "work_type"],
    enums: {
      work_type: [
        "song",
        "album",
        "theatre",
        "tv_series",
        "film",
        "soundtrack",
        "arrangement",
        "choir",
        "concert",
      ],
      work_relationship: ["contains", "part_of", "derived_from", "live_version"],
    },
    booleans: ["is_featured"],
  },
  project: {
    required: ["title_ar", "title_en", "project_type"],
    enums: {
      project_type: ["training", "jury", "cultural", "educational", "choir_direction", "initiative"],
    },
    booleans: [],
  },
  event: {
    required: ["title_ar", "title_en"],
    enums: {},
    booleans: [],
  },
  award: {
    required: ["title_ar", "title_en", "organization_id"],
    enums: {},
    booleans: [],
  },
  contribution: {
    required: ["person_id", "role"],
    enums: {
      role: [
        "composer",
        "arranger",
        "producer",
        "lyricist",
        "singer",
        "director",
        "music_director",
        "conductor",
        "performer",
      ],
    },
    booleans: [],
    custom: (row, errors) => {
      if (!row.work_id && !row.project_id && !row.event_id) {
        errors.push(
          "At least one of work_id/project_id/event_id must be set (chk_contribution_target_present).",
        );
      }
    },
  },
  "press-mention": {
    required: ["publication_name"],
    enums: {},
    booleans: [],
    custom: (row, errors) => {
      const count = ["person_id", "work_id", "event_id", "organization_id"].filter(
        (f) => row[f],
      ).length;
      if (count !== 1) {
        errors.push(
          `Exactly one of person_id/work_id/event_id/organization_id must be set (chk_press_mention_subject_present) — found ${count}.`,
        );
      }
    },
  },
  category: {
    required: ["domain", "name_ar", "name_en"],
    enums: { domain: ["work_type", "project_type"] },
    booleans: [],
  },
  tag: {
    required: ["name_ar", "name_en"],
    enums: {},
    booleans: [],
  },
  "media-manifest": {
    required: ["file_path", "owner_type", "owner_id"],
    enums: { owner_type: ["person", "work", "project", "event"] },
    booleans: [],
    custom: (row, errors) => {
      if (!fs.existsSync(path.resolve(path.dirname(process.argv[3] ?? "."), row.file_path))) {
        errors.push(
          `file_path "${row.file_path}" does not exist relative to the manifest's own folder — check the path.`,
        );
      }
    },
  },
};

// Status/verification_status/visibility columns, when present, are
// validated against the same fixed value sets for every entity.
function validateCommonColumns(row, errors) {
  if (row.status && !STATUS_VALUES.includes(row.status)) {
    errors.push(`status "${row.status}" is not one of: ${STATUS_VALUES.join(", ")}`);
  }
  if (row.verification_status && !VERIFICATION_VALUES.includes(row.verification_status)) {
    errors.push(
      `verification_status "${row.verification_status}" is not one of: ${VERIFICATION_VALUES.join(", ")}`,
    );
  }
  if (row.visibility && !VISIBILITY_VALUES.includes(row.visibility)) {
    errors.push(`visibility "${row.visibility}" is not one of: ${VISIBILITY_VALUES.join(", ")}`);
  }
}

function validateRow(entityType, row) {
  const schema = SCHEMAS[entityType];
  const errors = [];

  for (const field of schema.required) {
    if (!row[field] || row[field].trim() === "") {
      errors.push(`Missing required field: ${field}`);
    }
  }

  for (const [field, allowed] of Object.entries(schema.enums)) {
    const value = row[field];
    if (value && !allowed.includes(value)) {
      errors.push(`${field} "${value}" is not one of: ${allowed.join(", ")}`);
    }
  }

  for (const field of schema.booleans) {
    const value = row[field];
    if (value && value !== "true" && value !== "false") {
      errors.push(`${field} "${value}" must be exactly "true" or "false"`);
    }
  }

  if (schema.custom) schema.custom(row, errors);
  validateCommonColumns(row, errors);

  return errors;
}

function main() {
  const [, , entityType, csvPath] = process.argv;

  if (!entityType || !csvPath) {
    console.error("Usage: node validate.js <entity-type> <path-to-csv>");
    console.error(`Known entity types: ${Object.keys(SCHEMAS).join(", ")}`);
    process.exit(1);
  }

  if (!SCHEMAS[entityType]) {
    console.error(`Unknown entity type "${entityType}". Known: ${Object.keys(SCHEMAS).join(", ")}`);
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  const text = fs.readFileSync(csvPath, "utf-8");
  const { headers, rows } = parseCsv(text);

  const results = rows.map((fields, index) => {
    const row = Object.fromEntries(headers.map((h, i) => [h, fields[i] ?? ""]));
    const errors = validateRow(entityType, row);
    return { rowNumber: index + 2 /* +1 header, +1 to be 1-indexed for humans */, row, errors };
  });

  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const report = {
    entityType,
    file: csvPath,
    validatedAt: new Date().toISOString(),
    totalRows: rows.length,
    totalErrors,
    results: results.filter((r) => r.errors.length > 0),
  };

  const reportPath = csvPath.replace(/\.csv$/, "") + `.validation-report.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  if (totalErrors === 0) {
    console.log(`✅ ${rows.length} row(s) validated, 0 errors. Report: ${reportPath}`);
    process.exit(0);
  } else {
    console.log(`❌ ${totalErrors} error(s) found across ${rows.length} row(s).`);
    for (const result of report.results) {
      console.log(`  Row ${result.rowNumber}:`);
      for (const error of result.errors) {
        console.log(`    - ${error}`);
      }
    }
    console.log(`Full report: ${reportPath}`);
    process.exit(1);
  }
}

main();
