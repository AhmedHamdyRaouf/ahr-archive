-- Phase 1 / Migration 004: first data for work_relationship (9 relations) + clear parent_work_id after in-transaction verification + W-0072 year tag.
-- Decisions: Ahmed, 2026-11-11 (types, qualifiers, confidence, parent_work_id cleared after verification, year of W-0072 = 2017).
-- Direction rule: source_work_id = work that held parent_work_id (child/song); target_work_id = the parent work.
-- Atomic: everything is inside one DO block; any failed assertion rolls the whole migration back.
do $migration$
declare n int;
begin
  insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type,qualifier,qualifier_en,notes,notes_en,evidence_status,confidence,sort_order) values
  ('WR-0001','W-0001','W-0068','theme_song_for','الأغنية الرسمية للفيلم','Official film song','منقولة من parent_work_id. لُحنت 2005 قبل الفيلم وضُمّت إليه 2007؛ الإصدار وعرض الفيلم 2008 (الحدثان E-0001 وE-0056). تأكيد أحمد 2026-11-11.','Moved from parent_work_id. Composed 2005 before the film, added to it in 2007; release and film screening 2008 (events E-0001, E-0056). Ahmed confirmation 2026-11-11.','USER-CONFIRMED (تأكيد أحمد 2026-11-11)','HIGH',1),
  ('WR-0002','W-0016','W-0058','featured_in','أغنية ضمن المسرحية','Song within the play','منقولة من parent_work_id. مسرحية المعجنة، أول عرض 15 نوفمبر 2018. تأكيد أحمد 2026-11-11.','Moved from parent_work_id. The play''s first performance was 15 November 2018. Ahmed confirmation 2026-11-11.','USER-CONFIRMED (تأكيد أحمد 2026-11-11)','HIGH',2),
  ('WR-0003','W-0019','W-0058','theme_song_for','فينال','Finale','منقولة من parent_work_id. أغنية الفينال/الختام للمسرحية، مع اتفاق حقوق للمسرح القومي. تأكيد أحمد 2026-11-11.','Moved from parent_work_id. Finale/closing song of the play, with a rights agreement for the National Theatre. Ahmed confirmation 2026-11-11.','USER-CONFIRMED (تأكيد أحمد 2026-11-11)','HIGH',3),
  ('WR-0004','W-0026','W-0074','theme_song_for','تتر نهاية','End title','منقولة من parent_work_id. تتر نهاية المسلسل (YV-0025، LS-0035). ثقة العلاقة MEDIUM بقرار أحمد لأن سجل الأغنية PENDING. تأكيد أحمد 2026-11-11.','Moved from parent_work_id. End title of the series (YV-0025, LS-0035). Relationship confidence MEDIUM by Ahmed''s decision because the song record is PENDING. Ahmed confirmation 2026-11-11.','USER-CONFIRMED (تأكيد أحمد 2026-11-11)','MEDIUM',4),
  ('WR-0005','W-0031','W-0074','featured_in','حلقة CBC','CBC episode','منقولة من parent_work_id. مسلسل تياترو على CBC، 6 أبريل 2023 (الحدث E-0020). تأكيد أحمد 2026-11-11.','Moved from parent_work_id. Series on CBC, 6 April 2023 (event E-0020). Ahmed confirmation 2026-11-11.','USER-CONFIRMED (تأكيد أحمد 2026-11-11)','HIGH',5),
  ('WR-0006','W-0036','W-0075','theme_song_for','تتر بداية','Opening title','منقولة من parent_work_id. تتر بداية المسلسل، رمضان 2026 (YV-0029 إلى YV-0032، PR-0110). تأكيد أحمد 2026-11-09 و2026-11-11.','Moved from parent_work_id. Opening title of the series, Ramadan 2026 (YV-0029 to YV-0032, PR-0110). Ahmed confirmation 2026-11-09 and 2026-11-11.','USER-CONFIRMED (تأكيد أحمد 2026-11-11)','HIGH',6),
  ('WR-0007','W-0039','W-0076','featured_in','أغنية التتر','Title song','منقولة من parent_work_id. YV-0034 «من مسلسل فريسكا». ثقة العلاقة MEDIUM بقرار أحمد لأن سجل الأغنية PENDING. تأكيد أحمد 2026-11-11.','Moved from parent_work_id. YV-0034. Relationship confidence MEDIUM by Ahmed''s decision because the song record is PENDING. Ahmed confirmation 2026-11-11.','USER-CONFIRMED (تأكيد أحمد 2026-11-11)','MEDIUM',7),
  ('WR-0008','W-0077','W-0002','updates','تحديث بنفس المبدعين','Update with the same creators','تحديث لها بنفس المبدعين، وكل عمل يبقى مستقلاً (بند المراجعة 3). تأكيد أحمد 2026-11-08 و2026-11-11.','An update of it with the same creators; each remains a separate work (review item 3). Ahmed confirmation 2026-11-08 and 2026-11-11.','USER-CONFIRMED (تأكيد أحمد 2026-11-11)','HIGH',8),
  ('WR-0009','W-0032','W-0074','featured_in','مهرجان نقابة المهن التمثيلية (الدورة 7)','Actors Syndicate festival (7th edition)','الأغنية مرتبطة بالمسلسل وبمهرجان نقابة المهن التمثيلية معاً بحسب أحمد؛ المهرجان يبقى في الحدث لا عملاً. تأكيد أحمد 2026-11-11.','The song is linked to both the series and the Actors Syndicate festival per Ahmed; the festival stays in the event, not as a work. Ahmed confirmation 2026-11-11.','USER-CONFIRMED (تأكيد أحمد 2026-11-11)','HIGH',9);

  -- Verification: every parent_work_id row has a matching relation in the right direction (source = child, target = parent).
  select count(*) into n from public.works w join public.work_relationship r on r.source_work_id = w.work_id and r.target_work_id = w.parent_work_id where w.parent_work_id <> '';
  if n <> 7 then raise exception 'verification failed: % of 7 parent_work_id rows matched', n; end if;
  if (select count(*) from public.work_relationship) <> 9 then raise exception 'expected 9 relations'; end if;
  if exists (select 1 from public.work_relationship r join public.works w on w.work_id = r.target_work_id where w.parent_work_id = r.source_work_id) then raise exception 'direction check failed'; end if;

  -- Clear the old column only after the verification above passed.
  update public.works set parent_work_id = '' where parent_work_id <> '';
  if (select count(*) from public.works where parent_work_id <> '') <> 0 then raise exception 'parent_work_id not cleared'; end if;

  update public.works set source = coalesce(source,'') || ' | تأكيد أحمد 2026-11-11: السنة 2017', source_en = coalesce(source_en,'') || ' | Ahmed confirmation 2026-11-11: year 2017' where work_id = 'W-0072';
end $migration$;
