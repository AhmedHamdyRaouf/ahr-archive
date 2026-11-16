-- 008: Ahmed 2026-11-11 — YouTube link of the «خاصمتني» video clip (W-0012).
DO $$
DECLARE n int;
BEGIN
  UPDATE works SET link_youtube='https://www.youtube.com/watch?v=JGLb2hEoLvc',
    source = source || ' | رابط يوتيوب: أحمد 2026-11-11',
    source_en = source_en || ' | YouTube link: Ahmed 2026-11-11'
  WHERE work_id='W-0012' AND link_youtube IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'W-0012 link not set'; END IF;
END $$;
