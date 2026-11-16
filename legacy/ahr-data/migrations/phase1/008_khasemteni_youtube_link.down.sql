UPDATE works SET link_youtube=NULL,
  source=replace(source,' | رابط يوتيوب: أحمد 2026-11-11',''),
  source_en=replace(source_en,' | YouTube link: Ahmed 2026-11-11','')
WHERE work_id='W-0012';
