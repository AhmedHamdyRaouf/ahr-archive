UPDATE events SET date_as_stated='2017 (قبل صدور الألبوم)', date_en='2017 (before the album release)', confidence='MEDIUM',
  evidence_status='SOURCE-STATED + USER-CONFIRMED (إضافة أحمد 2026-11-11)',
  evidence_status_en='SOURCE-STATED + USER-CONFIRMED (Ahmed addition 2026-11-11)',
  source=replace(source,' | تاريخ النشر على يوتيوب: 20 مارس 2017 (أحمد 2026-11-11)',''),
  source_en=replace(source_en,' | YouTube publish date: 20 March 2017 (Ahmed 2026-11-11)','')
WHERE event_id='E-0072';
