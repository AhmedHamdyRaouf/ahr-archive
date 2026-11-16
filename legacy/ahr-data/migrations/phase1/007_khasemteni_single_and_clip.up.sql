-- 007: Ahmed 2026-11-11 — «خاصمتني» (W-0012) was planned for the album but released as a single; add its video clip as event E-0072.
DO $$
DECLARE n int;
BEGIN
  UPDATE works SET
    context_notes='كانت مخصصة لألبوم ما تاخدي بالك لكن صدرت كسنجل؛ برومو 25 فبراير 2017',
    context_notes_en='Was planned for the album Ma Takhdy Balek but was released as a single; promo 25 February 2017',
    source = source || ' | تأكيد أحمد 2026-11-11: كانت هتنزل في الألبوم لكن نزلت سنجل',
    source_en = source_en || ' | Ahmed confirmation 2026-11-11: planned for the album, released as a single'
  WHERE work_id='W-0012' AND context_notes='ألبوم ما تاخدي بالك؛ برومو 25 فبراير 2017';
  GET DIAGNOSTICS n = ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'W-0012 not updated'; END IF;

  INSERT INTO events (event_id,event_type,name,date_as_stated,place_or_context,work_id,ahmed_role,evidence_status,confidence,privacy,source,name_en,event_type_en,date_en,place_or_context_en,ahmed_role_en,source_en,evidence_status_en,privacy_en,publish,featured,sort_order)
  VALUES ('E-0072','إصدار','فيديو كليب «خاصمتني»','2017 (قبل صدور الألبوم)','يوتيوب','W-0012','ملحن',
   'SOURCE-STATED + USER-CONFIRMED (إضافة أحمد 2026-11-11)','MEDIUM','عام',
   'الشروق 2017-02-26؛ Arab Lifestyle (الفيديو كليب نزل على يوتيوب تمهيدًا للألبوم) | تأكيد أحمد 2026-11-11',
   'Video clip of "Khasemteni"','Release','2017 (before the album release)','YouTube','Composer',
   'Al-Shorouk 2017-02-26; Arab Lifestyle (the clip was released on YouTube ahead of the album) | Ahmed confirmation 2026-11-11',
   'SOURCE-STATED + USER-CONFIRMED (Ahmed addition 2026-11-11)','Public','نعم','','');
END $$;
