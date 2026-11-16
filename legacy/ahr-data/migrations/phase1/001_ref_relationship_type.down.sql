-- Rollback of 001. Single statement (atomic). No CASCADE on purpose: fails if anything (e.g. 002) still depends on it -> roll back 002 first.
drop table if exists public.ref_relationship_type;
