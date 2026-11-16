-- Reverts 006.
UPDATE works SET year_as_stated='2018', year_en='2018',
  source = replace(source,' | تصحيح أحمد 2026-11-11: السنة 2017',''),
  source_en = replace(source_en,' | Ahmed correction 2026-11-11: year 2017','')
WHERE work_id='W-0015';
UPDATE works SET
  context_notes='ألبوم ما تاخدي بالك 11 نوفمبر 2017؛ حفل ساقية الصاوي 29/4/2017',
  context_notes_en='Album Ma Takhdy Balek 11 November 2017; El Sawy Culturewheel concert 29/4/2017'
WHERE work_id='W-0013';
UPDATE events SET date_as_stated='29 أبريل 2017', date_en='29 April 2017',
  source = replace(source,' | تصحيح أحمد 2026-11-11 (التاريخ السابق 29 أبريل 2017)',''),
  source_en = replace(source_en,' | Ahmed correction 2026-11-11 (previous date 29 April 2017)','')
WHERE event_id='E-0008';
