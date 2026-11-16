-- Extends ai_recommendation_log check constraints so translation-suggestion
-- (Phase 2 AI backlog item 1), article-summary-suggestion (item 2), and
-- contribution-role-suggestion (item 3) can be logged for any CMS entity
-- type. No new table or column — only widens allowed values on existing
-- checks.

alter table ai_recommendation_log
  drop constraint chk_ai_recommendation_log_kind;

alter table ai_recommendation_log
  add constraint chk_ai_recommendation_log_kind
    check (kind in (
      'category-tag-suggestion',
      'summary-suggestion',
      'translation-suggestion',
      'article-summary-suggestion',
      'contribution-role-suggestion'
    ));

alter table ai_recommendation_log
  drop constraint chk_ai_recommendation_log_entity_type;

alter table ai_recommendation_log
  add constraint chk_ai_recommendation_log_entity_type
    check (entity_type in (
      'work',
      'project',
      'persons',
      'organizations',
      'works',
      'projects',
      'events',
      'awards',
      'categories',
      'tags',
      'press-mentions',
      'contributions'
    ));
