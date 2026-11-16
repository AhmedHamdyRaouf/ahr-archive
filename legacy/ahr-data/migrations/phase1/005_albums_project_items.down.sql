do $migration$
begin
  delete from public.project_items where item_id in ('PI-0001','PI-0002','PI-0003','PI-0004','PI-0005','PI-0006');
  update public.works set context_notes='ألبوم ما تاخدي بالك 15 أبريل 2017؛ حفل ساقية الصاوي 29/4/2017', context_notes_en='Album Ma Takhdy Balek 15 April 2017; El Sawy Culturewheel concert 29/4/2017', source=replace(source,' | تاريخ الألبوم: الشروق واليوم السابع (اعتماد أحمد 2026-11-11)',''), source_en=replace(source_en,' | Album date: Al-Shorouk and Youm7 (Ahmed adoption 2026-11-11)','') where work_id='W-0013';
  update public.works set context_notes='ألبوم ما تاخدي بالك 19 أبريل 2018', context_notes_en='Album Ma Takhdy Balek 19 April 2018', source=replace(source,' | تاريخ الألبوم: الشروق واليوم السابع (اعتماد أحمد 2026-11-11)',''), source_en=replace(source_en,' | Album date: Al-Shorouk and Youm7 (Ahmed adoption 2026-11-11)','') where work_id='W-0015';
  update public.events set date_as_stated='15 أبريل 2017', date_en='15 April 2017', source=replace(source,' | الشروق واليوم السابع (اعتماد أحمد 2026-11-11)',''), source_en=replace(source_en,' | Al-Shorouk and Youm7 (Ahmed adoption 2026-11-11)','') where event_id='E-0007';
  update public.events set date_as_stated='19 أبريل 2018', date_en='19 April 2018', source=replace(source,' | الشروق واليوم السابع (اعتماد أحمد 2026-11-11)',''), source_en=replace(source_en,' | Al-Shorouk and Youm7 (Ahmed adoption 2026-11-11)','') where event_id='E-0010';
end $migration$;
