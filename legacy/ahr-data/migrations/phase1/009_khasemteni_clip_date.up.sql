-- 009: Ahmed 2026-11-11 — publish date of the «خاصمتني» clip on YouTube: 20 March 2017 (E-0072).
DO $$
DECLARE n int;
BEGIN
  UPDATE events SET date_as_stated='20 مارس 2017', date_en='20 March 2017', confidence='HIGH',
    evidence_status='USER-CONFIRMED (تأكيد أحمد 2026-11-11: تاريخ الفيديو على يوتيوب)',
    evidence_status_en='USER-CONFIRMED (Ahmed confirmation 2026-11-11: YouTube video date)',
    source = source || ' | تاريخ النشر على يوتيوب: 20 مارس 2017 (أحمد 2026-11-11)',
    source_en = source_en || ' | YouTube publish date: 20 March 2017 (Ahmed 2026-11-11)'
  WHERE event_id='E-0072' AND date_as_stated='2017 (قبل صدور الألبوم)';
  GET DIAGNOSTICS n = ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'E-0072 not updated'; END IF;
END $$;
