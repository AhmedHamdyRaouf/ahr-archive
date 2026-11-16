-- 006: Ahmed's corrections 2026-11-11 — W-0015 (جايلك) year 2018 -> 2017;
-- Sawy Culturewheel concert (E-0008 + W-0013 notes) 29 Apr 2017 -> 11 Nov 2017.
DO $$
DECLARE n int;
BEGIN
  UPDATE works SET year_as_stated='2017', year_en='2017',
    source = source || ' | تصحيح أحمد 2026-11-11: السنة 2017',
    source_en = source_en || ' | Ahmed correction 2026-11-11: year 2017'
  WHERE work_id='W-0015' AND year_as_stated='2018';
  GET DIAGNOSTICS n = ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'W-0015 not updated'; END IF;

  UPDATE works SET
    context_notes='ألبوم ما تاخدي بالك 11 نوفمبر 2017؛ حفل ساقية الصاوي 11 نوفمبر 2017',
    context_notes_en='Album Ma Takhdy Balek 11 November 2017; El Sawy Culturewheel concert 11 November 2017'
  WHERE work_id='W-0013' AND context_notes like '%29/4/2017%';
  GET DIAGNOSTICS n = ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'W-0013 not updated'; END IF;

  UPDATE events SET date_as_stated='11 نوفمبر 2017', date_en='11 November 2017',
    source = source || ' | تصحيح أحمد 2026-11-11 (التاريخ السابق 29 أبريل 2017)',
    source_en = source_en || ' | Ahmed correction 2026-11-11 (previous date 29 April 2017)'
  WHERE event_id='E-0008' AND date_as_stated='29 أبريل 2017';
  GET DIAGNOSTICS n = ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'E-0008 not updated'; END IF;
END $$;
