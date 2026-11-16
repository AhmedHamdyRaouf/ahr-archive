# Import Pipeline — `validate.js`

A real, working, dependency-free Node.js script that validates a filled-in CSV against the exact rules in `../03-Content-Standards.md` and `../04-Validation-Rules.md`.

## What It Does

- Reads a CSV file.
- Checks every required field, enum value, and cross-field rule (e.g. "exactly one owner," "at least one target") against the actual database constraints those rules are copied from.
- Writes a JSON report next to the input file (`{name}.validation-report.json`) listing every row with an error and exactly what's wrong.
- Exits with code `0` if there are zero errors, `1` otherwise — safe to use in a script or CI step.

## What It Deliberately Does NOT Do

- **It never connects to a database.** No Supabase URL, no credentials, no network call of any kind. This is a pure, local, offline validator.
- **It never performs an import.** Passing validation means the file is *shaped* correctly — actually inserting the data still requires someone with real database credentials, using the already-tested CMS API or a direct, reviewed migration script.
- **It never checks factual accuracy.** It cannot know whether a date or title is true — only whether the data has the right shape.

## Usage

```bash
node validate.js <entity-type> <path-to-csv>

# Examples:
node validate.js person ../Import-Templates/person.csv
node validate.js work ../Import-Templates/work.csv
node validate.js media-manifest ../Import-Templates/media-manifest.csv
```

Known entity types: `person`, `organization`, `work`, `project`, `event`, `award`, `contribution`, `press-mention`, `category`, `tag`, `media-manifest`.

## Verified Working

Tested against every template in `../Import-Templates/` during this framework's own build — templates with intentionally incomplete placeholder data (e.g. `award.csv`, `contribution.csv`, `press-mention.csv`, `media-manifest.csv`, each missing a real relation id that can only be filled in once its target entity has actually been imported) correctly produce validation errors, proving the script catches real constraint violations rather than only ever reporting success.
