// Generated from the Supabase schema. c = main (Arabic/source) column, e = its English counterpart.
export type Field={c:string;e:string|null}
export type Table={t:string;pk:string;prefix:string;ar:string;en:string;icon:string;fields:Field[];cols:string[]}
export const SCHEMA:Table[]=[
 {
  "t": "works",
  "pk": "work_id",
  "prefix": "W-",
  "ar": "الأعمال",
  "en": "Works",
  "fields": [
   {
    "c": "work_id",
    "e": null
   },
   {
    "c": "category",
    "e": "category_en"
   },
   {
    "c": "parent_work_id",
    "e": null
   },
   {
    "c": "title_ar",
    "e": "title_en"
   },
   {
    "c": "year_as_stated",
    "e": "year_en"
   },
   {
    "c": "performer_or_cast",
    "e": "performer_or_cast_en"
   },
   {
    "c": "lyricist",
    "e": "lyricist_en"
   },
   {
    "c": "composer",
    "e": "composer_en"
   },
   {
    "c": "arranger",
    "e": "arranger_en"
   },
   {
    "c": "director",
    "e": "director_en"
   },
   {
    "c": "writer",
    "e": "writer_en"
   },
   {
    "c": "ahmed_role",
    "e": "ahmed_role_en"
   },
   {
    "c": "soundtrack_as_stated",
    "e": "soundtrack_en"
   },
   {
    "c": "context_notes",
    "e": "context_notes_en"
   },
   {
    "c": "evidence_status",
    "e": "evidence_status_en"
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "story_notes",
    "e": "story_notes_en"
   },
   {
    "c": "link_youtube",
    "e": null
   },
   {
    "c": "link_youtube_2",
    "e": null
   },
   {
    "c": "link_spotify",
    "e": null
   },
   {
    "c": "link_apple_music",
    "e": null
   },
   {
    "c": "link_anghami",
    "e": null
   },
   {
    "c": "link_deezer",
    "e": null
   },
   {
    "c": "link_soundcloud",
    "e": null
   },
   {
    "c": "link_elcinema",
    "e": null
   },
   {
    "c": "link_imdb",
    "e": null
   },
   {
    "c": "link_other",
    "e": null
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "work_id",
   "category",
   "title_ar",
   "title_en",
   "year_as_stated",
   "performer_or_cast",
   "lyricist",
   "composer",
   "arranger",
   "director",
   "writer",
   "ahmed_role",
   "soundtrack_as_stated",
   "context_notes",
   "evidence_status",
   "confidence",
   "privacy",
   "source",
   "story_notes",
   "category_en",
   "year_en",
   "performer_or_cast_en",
   "lyricist_en",
   "composer_en",
   "arranger_en",
   "director_en",
   "writer_en",
   "ahmed_role_en",
   "soundtrack_en",
   "context_notes_en",
   "story_notes_en",
   "evidence_status_en",
   "privacy_en",
   "source_en",
   "parent_work_id",
   "publish",
   "featured",
   "sort_order",
   "link_youtube",
   "link_spotify",
   "link_apple_music",
   "link_anghami",
   "link_deezer",
   "link_soundcloud",
   "link_elcinema",
   "link_imdb",
   "link_other",
   "link_youtube_2"
  ],
  "icon": "🎵"
 },
 {
  "t": "credits",
  "pk": "credit_id",
  "prefix": "C-",
  "ar": "الكريديت",
  "en": "Credits",
  "fields": [
   {
    "c": "credit_id",
    "e": null
   },
   {
    "c": "work_id",
    "e": null
   },
   {
    "c": "person_as_stated",
    "e": "person_as_stated_en"
   },
   {
    "c": "role",
    "e": "role_en"
   },
   {
    "c": "source_field",
    "e": "source_field_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "notes",
    "e": "notes_en"
   },
   {
    "c": "person_id",
    "e": null
   }
  ],
  "cols": [
   "credit_id",
   "work_id",
   "person_as_stated",
   "role",
   "source_field",
   "evidence_status",
   "confidence",
   "notes",
   "person_id",
   "person_as_stated_en",
   "role_en",
   "notes_en",
   "source_field_en"
  ],
  "icon": "👥"
 },
 {
  "t": "person",
  "pk": "person_id",
  "prefix": "P-",
  "ar": "الأشخاص والجهات",
  "en": "People & Entities",
  "fields": [
   {
    "c": "person_id",
    "e": null
   },
   {
    "c": "name_ar",
    "e": "name_en_phonetic"
   },
   {
    "c": "type",
    "e": null
   },
   {
    "c": "roles_seen",
    "e": "roles_seen_en"
   },
   {
    "c": "credit_count",
    "e": null
   },
   {
    "c": "relation_to_ahmed",
    "e": "relation_to_ahmed_en"
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "needs_review",
    "e": "needs_review_en"
   },
   {
    "c": "notes",
    "e": "notes_en"
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   },
   {
    "c": "name_alt",
    "e": "name_alt_en"
   },
   {
    "c": "profession",
    "e": "profession_en"
   },
   {
    "c": "bio_short",
    "e": "bio_short_en"
   }
  ],
  "cols": [
   "person_id",
   "name_ar",
   "type",
   "roles_seen",
   "credit_count",
   "name_en_phonetic",
   "relation_to_ahmed",
   "privacy",
   "needs_review",
   "notes",
   "roles_seen_en",
   "relation_to_ahmed_en",
   "privacy_en",
   "needs_review_en",
   "notes_en",
   "publish",
   "featured",
   "sort_order",
   "name_alt",
   "name_alt_en",
   "profession",
   "profession_en",
   "bio_short",
   "bio_short_en"
  ],
  "icon": "🧑"
 },
 {
  "t": "events",
  "pk": "event_id",
  "prefix": "E-",
  "ar": "الأحداث",
  "en": "Events",
  "fields": [
   {
    "c": "event_id",
    "e": null
   },
   {
    "c": "event_type",
    "e": "event_type_en"
   },
   {
    "c": "name",
    "e": "name_en"
   },
   {
    "c": "date_as_stated",
    "e": "date_en"
   },
   {
    "c": "place_or_context",
    "e": "place_or_context_en"
   },
   {
    "c": "work_id",
    "e": null
   },
   {
    "c": "ahmed_role",
    "e": "ahmed_role_en"
   },
   {
    "c": "evidence_status",
    "e": "evidence_status_en"
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "event_id",
   "event_type",
   "name",
   "date_as_stated",
   "place_or_context",
   "work_id",
   "ahmed_role",
   "evidence_status",
   "confidence",
   "privacy",
   "source",
   "name_en",
   "event_type_en",
   "date_en",
   "place_or_context_en",
   "ahmed_role_en",
   "source_en",
   "evidence_status_en",
   "privacy_en",
   "publish",
   "featured",
   "sort_order"
  ],
  "icon": "📅"
 },
 {
  "t": "awards",
  "pk": "award_id",
  "prefix": "A-",
  "ar": "الجوائز والتكريمات",
  "en": "Awards",
  "fields": [
   {
    "c": "award_id",
    "e": null
   },
   {
    "c": "type",
    "e": "type_en"
   },
   {
    "c": "name",
    "e": "name_en"
   },
   {
    "c": "year",
    "e": null
   },
   {
    "c": "organization",
    "e": "organization_en"
   },
   {
    "c": "work_id",
    "e": null
   },
   {
    "c": "ahmed_role",
    "e": "ahmed_role_en"
   },
   {
    "c": "description",
    "e": "description_en"
   },
   {
    "c": "place",
    "e": "place_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "still_needed",
    "e": "still_needed_en"
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "award_id",
   "type",
   "name",
   "year",
   "organization",
   "work_id",
   "ahmed_role",
   "description",
   "place",
   "evidence_status",
   "confidence",
   "privacy",
   "still_needed",
   "source",
   "name_en",
   "organization_en",
   "place_en",
   "type_en",
   "ahmed_role_en",
   "description_en",
   "still_needed_en",
   "source_en",
   "privacy_en",
   "publish",
   "featured",
   "sort_order"
  ],
  "icon": "🏆"
 },
 {
  "t": "press",
  "pk": "press_id",
  "prefix": "PR-",
  "ar": "الصحافة",
  "en": "Press",
  "fields": [
   {
    "c": "press_id",
    "e": null
   },
   {
    "c": "outlet",
    "e": "outlet_en"
   },
   {
    "c": "title_or_topic",
    "e": "title_or_topic_en"
   },
   {
    "c": "date_as_stated",
    "e": "date_as_stated_en"
   },
   {
    "c": "url",
    "e": null
   },
   {
    "c": "related_work_id",
    "e": null
   },
   {
    "c": "type",
    "e": "type_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "related_work_id_2",
    "e": null
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "press_id",
   "outlet",
   "title_or_topic",
   "date_as_stated",
   "url",
   "related_work_id",
   "type",
   "evidence_status",
   "confidence",
   "privacy",
   "source",
   "related_work_id_2",
   "title_or_topic_en",
   "type_en",
   "date_as_stated_en",
   "source_en",
   "outlet_en",
   "privacy_en",
   "publish",
   "featured",
   "sort_order"
  ],
  "icon": "📰"
 },
 {
  "t": "sources",
  "pk": "source_id",
  "prefix": "SRC-",
  "ar": "المصادر",
  "en": "Sources",
  "fields": [
   {
    "c": "source_id",
    "e": null
   },
   {
    "c": "source_name",
    "e": "source_name_en"
   },
   {
    "c": "type",
    "e": "type_en"
   },
   {
    "c": "trust_level",
    "e": "trust_level_en"
   },
   {
    "c": "what_it_holds",
    "e": "what_it_holds_en"
   },
   {
    "c": "notes",
    "e": "notes_en"
   },
   {
    "c": "reliability",
    "e": "reliability_en"
   },
   {
    "c": "conflict_note",
    "e": "conflict_note_en"
   },
   {
    "c": "needs_review",
    "e": "needs_review_en"
   }
  ],
  "cols": [
   "source_id",
   "source_name",
   "type",
   "trust_level",
   "what_it_holds",
   "notes",
   "source_name_en",
   "type_en",
   "trust_level_en",
   "what_it_holds_en",
   "notes_en",
   "reliability",
   "reliability_en",
   "conflict_note",
   "conflict_note_en",
   "needs_review",
   "needs_review_en"
  ],
  "icon": "📚"
 },
 {
  "t": "media_assets",
  "pk": "media_id",
  "prefix": "MA-",
  "ar": "الصور والوسائط",
  "en": "Media",
  "fields": [
   {
    "c": "media_id",
    "e": null
   },
   {
    "c": "platform_or_asset",
    "e": "platform_or_asset_en"
   },
   {
    "c": "category",
    "e": "category_en"
   },
   {
    "c": "description",
    "e": "description_en"
   },
   {
    "c": "link",
    "e": null
   },
   {
    "c": "status",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   },
   {
    "c": "rights_holder",
    "e": "rights_holder_en"
   },
   {
    "c": "usage_rights",
    "e": "usage_rights_en"
   },
   {
    "c": "credit_line",
    "e": "credit_line_en"
   }
  ],
  "cols": [
   "media_id",
   "platform_or_asset",
   "category",
   "description",
   "link",
   "status",
   "privacy",
   "source",
   "platform_or_asset_en",
   "category_en",
   "description_en",
   "source_en",
   "privacy_en",
   "publish",
   "featured",
   "sort_order",
   "rights_holder",
   "rights_holder_en",
   "usage_rights",
   "usage_rights_en",
   "credit_line",
   "credit_line_en"
  ],
  "icon": "🖼️"
 },
 {
  "t": "life_story",
  "pk": "story_id",
  "prefix": "LS-",
  "ar": "قصص الحياة",
  "en": "Life Story",
  "fields": [
   {
    "c": "story_id",
    "e": null
   },
   {
    "c": "period",
    "e": "period_en"
   },
   {
    "c": "topic",
    "e": "topic_en"
   },
   {
    "c": "content",
    "e": "content_en"
   },
   {
    "c": "people",
    "e": "people_en"
   },
   {
    "c": "place",
    "e": "place_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "status",
    "e": "status_en"
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "story_id",
   "period",
   "topic",
   "content",
   "people",
   "place",
   "evidence_status",
   "source",
   "privacy",
   "status",
   "topic_en",
   "period_en",
   "place_en",
   "people_en",
   "content_en",
   "status_en",
   "privacy_en",
   "source_en",
   "publish",
   "featured",
   "sort_order"
  ],
  "icon": "📖"
 },
 {
  "t": "site_texts",
  "pk": "text_id",
  "prefix": "TX-",
  "ar": "النصوص المكتوبة",
  "en": "Written Texts",
  "fields": [
   {
    "c": "text_id",
    "e": null
   },
   {
    "c": "kind",
    "e": "kind_en"
   },
   {
    "c": "title",
    "e": "title_en"
   },
   {
    "c": "content",
    "e": "content_en"
   },
   {
    "c": "related_id",
    "e": null
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "status",
    "e": "status_en"
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "text_id",
   "kind",
   "title",
   "content",
   "related_id",
   "evidence_status",
   "source",
   "privacy",
   "status",
   "kind_en",
   "title_en",
   "content_en",
   "status_en",
   "privacy_en",
   "source_en",
   "publish",
   "featured",
   "sort_order"
  ],
  "icon": "✍️"
 },
 {
  "t": "training_choir",
  "pk": "id",
  "prefix": "TC-",
  "ar": "التدريب والكورال",
  "en": "Training & Choir",
  "fields": [
   {
    "c": "id",
    "e": null
   },
   {
    "c": "item",
    "e": "item_en"
   },
   {
    "c": "period",
    "e": "period_en"
   },
   {
    "c": "detail",
    "e": "detail_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": "source_en"
   }
  ],
  "cols": [
   "id",
   "item",
   "period",
   "detail",
   "evidence_status",
   "confidence",
   "privacy",
   "source",
   "item_en",
   "period_en",
   "detail_en",
   "privacy_en",
   "source_en"
  ],
  "icon": "🎤"
 },
 {
  "t": "roles_education",
  "pk": "id",
  "prefix": "RE-",
  "ar": "الأدوار والتعليم",
  "en": "Roles & Education",
  "fields": [
   {
    "c": "id",
    "e": null
   },
   {
    "c": "item",
    "e": "item_en"
   },
   {
    "c": "period",
    "e": "period_en"
   },
   {
    "c": "detail",
    "e": "detail_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": "source_en"
   }
  ],
  "cols": [
   "id",
   "item",
   "period",
   "detail",
   "evidence_status",
   "confidence",
   "privacy",
   "source",
   "item_en",
   "period_en",
   "detail_en",
   "privacy_en",
   "source_en"
  ],
  "icon": "🎓"
 },
 {
  "t": "press_links",
  "pk": "id",
  "prefix": "PL-",
  "ar": "روابط صحفية",
  "en": "Press Links",
  "fields": [
   {
    "c": "id",
    "e": null
   },
   {
    "c": "item",
    "e": "item_en"
   },
   {
    "c": "period",
    "e": null
   },
   {
    "c": "detail",
    "e": null
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": null
   }
  ],
  "cols": [
   "id",
   "item",
   "period",
   "detail",
   "evidence_status",
   "confidence",
   "privacy",
   "source",
   "item_en",
   "privacy_en"
  ],
  "icon": "🔗"
 },
 {
  "t": "review_queue",
  "pk": "row_id",
  "prefix": "",
  "ar": "قائمة المراجعة",
  "en": "Review Queue",
  "fields": [
   {
    "c": "row_id",
    "e": null
   },
   {
    "c": "item",
    "e": "item_en"
   },
   {
    "c": "status",
    "e": "status_en"
   },
   {
    "c": "note",
    "e": "note_en"
   }
  ],
  "cols": [
   "row_id",
   "item",
   "status",
   "note",
   "item_en",
   "status_en",
   "note_en"
  ],
  "icon": "✅"
 },
 {
  "t": "audience_voices",
  "pk": "voice_id",
  "prefix": "AV-",
  "ar": "آراء الجمهور",
  "en": "Audience Voices",
  "fields": [
   {
    "c": "voice_id",
    "e": null
   },
   {
    "c": "platform",
    "e": "platform_en"
   },
   {
    "c": "work_id",
    "e": null
   },
   {
    "c": "source_url",
    "e": null
   },
   {
    "c": "comment_text",
    "e": "comment_text_en"
   },
   {
    "c": "commenter_handle",
    "e": null
   },
   {
    "c": "date_as_stated",
    "e": "date_as_stated_en"
   },
   {
    "c": "votes",
    "e": null
   },
   {
    "c": "mentions_ahmed",
    "e": "mentions_ahmed_en"
   },
   {
    "c": "sentiment",
    "e": "sentiment_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": "source_en"
   }
  ],
  "cols": [
   "voice_id",
   "platform",
   "work_id",
   "source_url",
   "comment_text",
   "commenter_handle",
   "date_as_stated",
   "votes",
   "mentions_ahmed",
   "sentiment",
   "evidence_status",
   "confidence",
   "privacy",
   "source",
   "platform_en",
   "comment_text_en",
   "date_as_stated_en",
   "mentions_ahmed_en",
   "sentiment_en",
   "privacy_en",
   "source_en"
  ],
  "icon": "💬"
 },
 {
  "t": "youtube_videos",
  "pk": "video_id",
  "prefix": "YV-",
  "ar": "يوتيوب",
  "en": "YouTube",
  "fields": [
   {
    "c": "video_id",
    "e": null
   },
   {
    "c": "url",
    "e": null
   },
   {
    "c": "title",
    "e": "title_en"
   },
   {
    "c": "channel",
    "e": "channel_en"
   },
   {
    "c": "date_as_stated",
    "e": null
   },
   {
    "c": "video_kind",
    "e": "video_kind_en"
   },
   {
    "c": "work_id",
    "e": null
   },
   {
    "c": "work_link_basis",
    "e": "work_link_basis_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "work_id_2",
    "e": null
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "video_id",
   "url",
   "title",
   "channel",
   "date_as_stated",
   "video_kind",
   "work_id",
   "work_link_basis",
   "evidence_status",
   "confidence",
   "privacy",
   "source",
   "work_id_2",
   "title_en",
   "channel_en",
   "video_kind_en",
   "work_link_basis_en",
   "privacy_en",
   "source_en",
   "publish",
   "featured",
   "sort_order"
  ],
  "icon": "▶️"
 },
 {
  "t": "project_items",
  "pk": "item_id",
  "prefix": "PI-",
  "ar": "المشاريع الجارية",
  "en": "Ongoing Projects",
  "fields": [
   {
    "c": "item_id",
    "e": null
   },
   {
    "c": "project",
    "e": "project_en"
   },
   {
    "c": "title",
    "e": "title_en"
   },
   {
    "c": "date_as_stated",
    "e": "date_en"
   },
   {
    "c": "platform",
    "e": "platform_en"
   },
   {
    "c": "url",
    "e": null
   },
   {
    "c": "status",
    "e": "status_en"
   },
   {
    "c": "description",
    "e": "description_en"
   },
   {
    "c": "work_id",
    "e": null
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "item_id",
   "project",
   "title",
   "date_as_stated",
   "platform",
   "url",
   "status",
   "description",
   "work_id",
   "evidence_status",
   "confidence",
   "privacy",
   "source",
   "project_en",
   "title_en",
   "date_en",
   "platform_en",
   "status_en",
   "description_en",
   "privacy_en",
   "source_en",
   "publish",
   "featured",
   "sort_order"
  ],
  "icon": "🎬"
 },
 {
  "t": "contact_channels",
  "pk": "contact_id",
  "prefix": "CT-",
  "ar": "التواصل والحجز",
  "en": "Contact & Booking",
  "fields": [
   {
    "c": "contact_id",
    "e": null
   },
   {
    "c": "kind",
    "e": "kind_en"
   },
   {
    "c": "label",
    "e": "label_en"
   },
   {
    "c": "value",
    "e": null
   },
   {
    "c": "link",
    "e": "link_en"
   },
   {
    "c": "note",
    "e": "note_en"
   },
   {
    "c": "region",
    "e": "region_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "source",
    "e": "source_en"
   },
   {
    "c": "privacy",
    "e": "privacy_en"
   },
   {
    "c": "status",
    "e": "status_en"
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "featured",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "contact_id",
   "kind",
   "label",
   "value",
   "link",
   "note",
   "region",
   "evidence_status",
   "source",
   "privacy",
   "status",
   "kind_en",
   "label_en",
   "link_en",
   "note_en",
   "region_en",
   "status_en",
   "privacy_en",
   "source_en",
   "publish",
   "featured",
   "sort_order"
  ],
  "icon": "📞"
 },
 {
  "t": "work_relationship",
  "pk": "relationship_id",
  "prefix": "WR-",
  "ar": "العلاقات بين الأعمال",
  "en": "Work Relationships",
  "fields": [
   {
    "c": "relationship_id",
    "e": null
   },
   {
    "c": "source_work_id",
    "e": null
   },
   {
    "c": "target_work_id",
    "e": null
   },
   {
    "c": "relationship_type",
    "e": null
   },
   {
    "c": "qualifier",
    "e": "qualifier_en"
   },
   {
    "c": "notes",
    "e": "notes_en"
   },
   {
    "c": "evidence_status",
    "e": null
   },
   {
    "c": "confidence",
    "e": null
   },
   {
    "c": "privacy",
    "e": null
   },
   {
    "c": "publish",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   }
  ],
  "cols": [
   "relationship_id",
   "source_work_id",
   "target_work_id",
   "relationship_type",
   "qualifier",
   "qualifier_en",
   "notes",
   "notes_en",
   "evidence_status",
   "confidence",
   "privacy",
   "publish",
   "sort_order"
  ],
  "icon": "🧩"
 },
 {
  "t": "ref_relationship_type",
  "pk": "code",
  "prefix": "",
  "ar": "أنواع العلاقات",
  "en": "Relationship Types",
  "fields": [
   {
    "c": "code",
    "e": null
   },
   {
    "c": "label_ar",
    "e": "label_en"
   },
   {
    "c": "direction_note",
    "e": null
   },
   {
    "c": "sort_order",
    "e": null
   },
   {
    "c": "active",
    "e": null
   }
  ],
  "cols": [
   "code",
   "label_ar",
   "label_en",
   "direction_note",
   "sort_order",
   "active"
  ],
  "icon": "🏷️"
 }
]
export const LABELS_AR:Record<string,string>={
 "link_youtube_2": "رابط يوتيوب إضافي (مثلًا النهاية)",
 "link_youtube": "رابط يوتيوب",
 "link_spotify": "رابط سبوتيفاي",
 "link_apple_music": "رابط آبل ميوزيك",
 "link_anghami": "رابط أنغامي",
 "link_deezer": "رابط ديزر",
 "link_soundcloud": "رابط ساوند كلاود",
 "link_elcinema": "رابط السينما (elCinema)",
 "link_imdb": "رابط IMDb",
 "link_other": "رابط آخر",
 "text_id": "رقم النص",
 "kind": "نوع النص",
 "related_id": "مرتبط بالسجل (كود)",
 "work_id": "رقم العمل",
 "credit_id": "رقم الكريديت",
 "person_id": "رقم الشخص",
 "event_id": "رقم الحدث",
 "award_id": "رقم الجائزة",
 "press_id": "رقم الخبر",
 "source_id": "رقم المصدر",
 "media_id": "رقم الوسيط",
 "story_id": "رقم القصة",
 "voice_id": "رقم الرأي",
 "video_id": "رقم الفيديو",
 "id": "الرقم",
 "row_id": "الرقم",
 "category": "التصنيف",
 "title_ar": "العنوان",
 "year_as_stated": "السنة",
 "performer_or_cast": "المؤدي / الممثلون",
 "lyricist": "كلمات",
 "composer": "ألحان",
 "arranger": "توزيع",
 "director": "إخراج",
 "writer": "تأليف",
 "ahmed_role": "دور أحمد",
 "soundtrack_as_stated": "الموسيقى التصويرية",
 "parent_work_id": "العمل الأم",
 "context_notes": "ملاحظات السياق",
 "evidence_status": "حالة الإثبات",
 "confidence": "درجة الثقة",
 "privacy": "الخصوصية",
 "source": "المصدر",
 "story_notes": "ملاحظات القصة",
 "person_as_stated": "الاسم كما ورد",
 "role": "الدور",
 "source_field": "خانة المصدر",
 "notes": "ملاحظات",
 "name_ar": "الاسم",
 "type": "النوع",
 "roles_seen": "الأدوار",
 "credit_count": "عدد الكريديت",
 "relation_to_ahmed": "العلاقة بأحمد",
 "needs_review": "يحتاج مراجعة",
 "event_type": "نوع الحدث",
 "name": "الاسم",
 "date_as_stated": "التاريخ",
 "place_or_context": "المكان / السياق",
 "year": "السنة",
 "organization": "الجهة",
 "description": "الوصف",
 "place": "المكان",
 "still_needed": "الناقص",
 "outlet": "المنفذ",
 "title_or_topic": "العنوان / الموضوع",
 "url": "الرابط",
 "related_work_id": "العمل المرتبط",
 "related_work_id_2": "عمل مرتبط ثانٍ",
 "source_name": "اسم المصدر",
 "trust_level": "مستوى الثقة",
 "what_it_holds": "ما يحويه",
 "platform_or_asset": "المنصة / الأصل",
 "link": "ملف الصورة",
 "status": "الحالة",
 "period": "الفترة",
 "topic": "الموضوع",
 "content": "المحتوى",
 "people": "الأشخاص",
 "item": "البند",
 "detail": "التفاصيل",
 "note": "ملاحظة",
 "platform": "المنصة",
 "source_url": "رابط المصدر",
 "comment_text": "نص التعليق",
 "commenter_handle": "المعرّف العام",
 "votes": "الإعجابات",
 "mentions_ahmed": "يذكر أحمد",
 "sentiment": "الانطباع",
 "title": "العنوان",
 "channel": "القناة",
 "video_kind": "نوع الفيديو",
 "work_id_2": "عمل ثانٍ",
 "work_link_basis": "أساس الربط",
 "item_id": "رقم البند",
 "project": "المشروع",
 "publish": "يُنشر على الموقع",
 "featured": "مميّز",
 "sort_order": "ترتيب العرض",
 "reliability": "الموثوقية (مقياس موحّد)",
 "conflict_note": "تعارض مع مصدر آخر",
 "rights_holder": "صاحب الحقوق / المصوّر",
 "usage_rights": "حالة الإذن بالاستخدام",
 "credit_line": "سطر النسبة (Credit)",
 "name_alt": "أسماء بديلة",
 "profession": "المهنة / التخصص",
 "bio_short": "نبذة مهنية قصيرة",
 "relationship_id": "رقم العلاقة",
 "source_work_id": "العمل المصدر",
 "target_work_id": "العمل الهدف",
 "relationship_type": "نوع العلاقة",
 "qualifier": "توصيف إضافي",
 "label_ar": "الاسم",
 "label_en": "الاسم (EN)",
 "direction_note": "اتجاه العلاقة",
 "code": "الكود",
 "active": "فعّال (true/false)"
}
