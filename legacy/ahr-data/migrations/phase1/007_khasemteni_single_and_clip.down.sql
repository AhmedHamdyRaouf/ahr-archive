DELETE FROM events WHERE event_id='E-0072';
UPDATE works SET context_notes='ألبوم ما تاخدي بالك؛ برومو 25 فبراير 2017',
  context_notes_en='Album Ma Takhdy Balek; promo 25 February 2017',
  source=replace(source,' | تأكيد أحمد 2026-11-11: كانت هتنزل في الألبوم لكن نزلت سنجل',''),
  source_en=replace(source_en,' | Ahmed confirmation 2026-11-11: planned for the album, released as a single','')
WHERE work_id='W-0012';
