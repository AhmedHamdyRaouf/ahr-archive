-- Implements: Phase 2 AI backlog item 4 (Similar/duplicate Work detection).
-- Approved by data owner 2026-07-22 — one additive column on `work`, per
-- Database-Architecture-Overview.md §14's own documented forward-
-- compatibility note ("a future pgvector-based search_embedding vector(n)
-- column is a pure additive column on any of the five [search-target]
-- tables... not built in v1"). No other table is touched.

create extension if not exists vector;

alter table work add column search_embedding vector(1536);

comment on column work.search_embedding is
  'OpenAI text-embedding-3-small (1536-dim) vector of title+description, generated only on explicit Administrator request (14-AI-Integration.md §7 — never automatic/background). Null until an Administrator has run "Check for similar Works" at least once for this row.';

-- Returns the match_count most similar OTHER works to query_embedding,
-- ordered by ascending cosine distance (0 = identical). Rows with no
-- embedding yet are excluded, never treated as a false match. Returns
-- public_id alongside id — Phase 2 item 5's public Work page links by
-- public_id (its route slug), while item 4's Dashboard panel links by id
-- (its route param); both are returned so either caller can use the one
-- it needs without a second lookup.
create or replace function match_similar_works(
  query_embedding vector(1536),
  exclude_work_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  public_id text,
  title_ar text,
  title_en text,
  status text,
  distance float8
)
language sql stable
as $$
  select w.id, w.public_id, w.title_ar, w.title_en, w.status,
         (w.search_embedding <=> query_embedding)::float8 as distance
  from work w
  where w.id <> exclude_work_id
    and w.search_embedding is not null
  order by w.search_embedding <=> query_embedding
  limit match_count;
$$;
