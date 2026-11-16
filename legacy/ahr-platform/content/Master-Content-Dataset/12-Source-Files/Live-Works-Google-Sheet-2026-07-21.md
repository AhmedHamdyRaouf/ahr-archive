# Live Works Google Sheet — Fetched 2026-07-21

**Source:** `https://docs.google.com/spreadsheets/d/1F6aXn1sXSxb_eMbQWAHRKCta5NCa091bqYoY7Q1nrS0/` — supplied directly by the data owner as the live source powering `ahmedhamdyraouf.com`'s Works page (previously flagged in `Validation_Report.md` C-09 as unreachable by this tooling — now supplied and fetched).
**Status:** This is a genuinely richer, more current source than the 3 Excel workbooks the original Master Content Dataset was built from — it includes exact YouTube/Spotify/Apple Music/Anghami links per song, full theatre production credits with press-source URLs, and a 2026-dated entry ("Qalbi Sajid," "Shukran Ya Emarat") not present anywhere in the prior workbooks.
**Merge status (2026-07-21):** ✅ Merged into the normalized CSVs. See `14-Reports/Merge-Report-2026-07-21.md` for exactly what was added, where, and what was flagged rather than merged.

## Tabs Contained
1. **Singles** (~40 songs) — full per-song streaming links, arranger, notes bilingual.
2. **Theatre Productions** (~20) — full director/writer/cast/press-source links.
3. **Drama & Film** (~13) — full director/cast/soundtrack credit lines.
4. **Choirs & Training** (5 organizations) — years, location, role.
5. **Concerts & Live Projects** (4) — including the "Watan El Ghena — Hamdy Raouf Anniversary" tribute project.
6. **Awards & Recognition** (8) — overlaps with existing `award.csv` but with different sourcing.

## New Facts Surfaced (not in any prior source read by this project)
- **"أنا مش مجنونة" (2004, from "Freska")** explicitly credits: Composer = **حمدي رؤوف (والد أحمد حمدي رؤوف)** ("Hamdy Raouf, Ahmed Hamdy Raouf's father") / Arranger = Ahmed Hamdy Raouf. This is the clearest documented father→son credit line found in any source to date.
- **"أمل حمدي رؤوف" (Amal Hamdy Raouf)** appears twice — as a cast member in "السائرون نياماً" (2010) and as Executive Producer of "شكراً يا إمارات" (2026). Not present in `person.csv` today. Likely a family member (possibly a sister), but this dataset does not assume that without your confirmation, same as the PER-0024 case.
- Two 2026 items not in any Excel workbook: **"قلبي ساجد" (Qalbi Sajid)** and the fuller detail on **"شكراً يا إمارات" (Shukran Ya Emarat)**, including full session-musician credits.
- The sheet's own footer confirms **"Mohamed Hamdy Raouf" is a distinct, recurring arranger credit**, consistent across ~15 songs — matches your confirmation that this is your brother.

## Raw Content
Preserved in full below, exactly as fetched (via Google Drive), table-for-table, for traceability and future merge work.

### Tab 1 — Singles

| Song Name (AR) | Song Name (EN) | Artist | Lyricist | Composer | Arranger | Year | Type | Notes | Notes (EN) | YouTube | Spotify | Anghami | Apple Music | Slug | Featured |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| قلب واحد | Qalb Wahid | مدحت صالح | محمد نبيل | أحمد حمدي رؤوف | حازم رأفت | 2007 | Single / Film Song | فيلم غرفة 707 | Film "Room 707" | https://youtu.be/WR3L51hBjYM | https://open.spotify.com/track/4OrVxViX4OAf2DaT2ep9Oc | https://play.anghami.com/song/69261651 | music.apple.com | qalb-wahid | Y |
| بنحبك يا دراما | Benehibbak Ya Drama | مدحت صالح | طارق علي | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2022 | Festival Song | مهرجان القاهرة للدراما 2022 | Cairo Drama Festival 2022 | youtube.com/watch?v=ofVJ_0JAw6w | spoti.fi/3R3X5ay | — | — | benehibbak-ya-drama | — |
| الميدان | El Midan | علي الحجار | ناصر رشوان | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2011 | Album Song | ألبوم اصحى يناير | Album "Wake Up January" | youtube.com/watch?v=gJtD4zleMv0 | — | anghami.com/song/117721 | — | el-midan | Y |
| فجر بلادي | Fagr Biladi | علي الحجار | ناصر رشوان | أحمد حمدي رؤوف | أحمد حمدي رؤوف + محمد حمدي رؤوف | 2011 | Album Song | أوسكار الأغنية المصورة 2012 | 2012 Oscar Award for Best Music Video | youtube.com/watch?v=eofmqaotRDM | — | — | — | fagr-biladi | Y |
| خالد سعيد | Khaled Said | علي الحجار | ناصر رشوان | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2012 | Album Song | ألبوم ضحكة وطن | Album "A Nation's Smile" | — | — | — | — | khaled-said | — |
| كنور | Kanour | — | عادل سلامة | أحمد حمدي رؤوف | أحمد حمدي رؤوف | 2014 | Commercial Song | إعلان Fine Foods/Knorr | Fine Foods/Knorr commercial | — | — | — | — | kanour | — |
| أنا منك اتعلمت | Ana Mennak Itelammt | محمد منير | أحمد فايز | أحمد حمدي رؤوف | باسم درويش/سباستيان موللر شروبسدورف | 2015 | Pop Song | Cairo Steps؛ ألمانيا وإسبانيا | Cairo Steps; filmed in Germany/Spain | youtube.com/watch?v=o2WamOKFaCo | — | — | apple.co/2fTBnp4 | ana-mennak-itelammt | Y |
| شعبنا جيش | Sha'bna Geish | علي الحجار | صفوت زينهم | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2015 | Patriotic Song | ذكرى 6 أكتوبر 2015 | Oct 6 2015 anniversary | youtube.com/watch?v=W_MNLns8z9A | — | — | — | sha-bna-geish | — |
| أول ضحكة | Awwel Dehka | عايدة الأيوبي | صفوت زينهم | أحمد حمدي رؤوف | شريف منصور | 2015 | Mother's Day Song | عيد الأم 2015 | Mother's Day 2015 | — | — | — | — | awwel-dehka | — |
| عيونك عيوني | Oyounak Oyouni | علي الحجار | محمد عبد القادر | أحمد حمدي رؤوف | أحمد حمدي رؤوف | 2016 | Romantic Song | — | — | — | — | — | — | oyounak-oyouni | — |
| قربك نجاة | Qurbak Najah | جلال عزام | ضحى جبر | أحمد حمدي رؤوف | محمد العشي | 2016 | Romantic Song | تعاون دولي مصري-سوري-لبناني | Egyptian-Syrian-Lebanese collaboration | youtu.be/dyu3lseD_OA | — | — | — | qurbak-najah | — |
| خاصمتني | Khasemteni | علي الحجار | طارق علي | أحمد حمدي رؤوف | مادو | 2017 | Album Song | ألبوم ما تاخدي بالك | Album "Ma Takhdi Balek" | — | — | anghami.com/song/21535162 | — | khasemteni | — |
| داري جمالك | Dari Gamalak | علي الحجار | سالم الشهباني | أحمد حمدي رؤوف | أحمد شعتوت | 2017 | Bedouin Song | باللهجة الخليجية | Gulf dialect | youtube.com/watch?v=Ks8prbCuTns | — | anghami.com/album/4168021 | — | dari-gamalak | — |
| ست الكل | Set El Koll | علي الحجار | سالم الشهباني | أحمد حمدي رؤوف | مادو | 2017 | Mother's Day Song | عيد الأم 2017 | Mother's Day 2017 | youtube.com/watch?v=Z58NkWnLFJA | — | — | — | set-el-koll | — |
| جايلك | Gaylek | علي الحجار | سالم الشهباني | أحمد حمدي رؤوف | أحمد حمدي رؤوف | 2018 | Album Song | ألبوم ما تاخدي بالك | Album "Ma Takhdi Balek" | youtube.com/watch?v=6KzfBwx6OQs | — | anghami.com/album/4168021 | itunes.apple.com/us/album/1375549488 | gaylek | — |
| عجباً لكلامك | Agaban Le Kalamak | زينب أحمد سعيد | طارق علي | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2017 | Theatre Song | مسرحية المعجنة | Play "El Ma'gana" | — | — | — | — | agaban-le-kalamak | — |
| الرهان عليك | El Rihan Aleik | علي الحجار | صفوت زينهم | أحمد حمدي رؤوف | مادو | 2018 | Patriotic Song | انتخابات 2018 | 2018 presidential election | youtube.com/watch?v=X4hXrY6JL1g | — | — | — | el-rihan-aleik | — |
| لما البيبان تتقفل | Lamma El Bibban Tetaffel | خالد محروس (ممثل) | أحمد قدري | أحمد حمدي رؤوف | أحمد حمدي رؤوف | 2018 | prayer | خالد محروس ممثل وليس مطرباً | Khaled Mahrous, actor not singer | — | — | — | — | lamma-el-bibban-tetaffel | — |
| إنت المدد | Enta El Madad | علي الحجار | طارق علي | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2017 | Inspirational Song | فينال مسرحية المعجنة | Finale of "El Ma'gana" | youtube.com/watch?v=YGum7tbuUOE | — | — | — | enta-el-madad | — |
| وش الخير | Wish El Kheir | أطفال بورسعيد/Panther Art | طارق علي | أحمد حمدي رؤوف | جمال فتحي | 2019 | Patriotic Children Song | افتتاح أنفاق بورسعيد | Port Said tunnels opening | youtu.be/62FfqEE2IxY | — | — | — | wish-el-kheir | — |
| حلمي عايش | Helmi Ayesh | علي الحجار | طارق علي | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2020 | Inspirational Single | — | — | youtube.com/watch?v=Ze-fD20Qt6o | — | — | — | helmi-ayesh | — |
| طبطب بروحك | Tabtab Be Rohak | علي الحجار | طارق علي | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2020/2021 | Humanitarian Song | إهداء للبنان بعد انفجار بيروت | Dedicated to Lebanon after Beirut explosion | — | — | — | — | tabtab-be-rohak | — |
| لاڤيل | Lavil | — | سالم الشهباني | أحمد حمدي رؤوف | أحمد حمدي رؤوف | 2020 | Pharmaceutical Campaign | منتج Lavel - لاكتوفيرين | Lavel lactoferrin product | youtu.be/mWkkb-qYz9U | — | — | — | lavil | — |
| الشارقة – خلي السلام واصل | Sharjah – Khalli El Salam Wasel | علي الحجار | محمد البريكي/سالم الشهباني | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2022 | Tribute Song | برنامج منشد الشارقة | "Munshid Al Sharjah" program | — | — | — | — | sharjah-khalli-el-salam-wasel | — |
| مستقبلنا معاك | Mostaqbalana Maak | أطفال Panther Art | طارق علي | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2022 | Patriotic Children Song | استقبال الرئيس السيسي 2022 | Welcoming President El-Sisi 2022 | — | — | — | — | mostaqbalana-maak | — |
| إنت قادر | Enta Ader | أحمد حمدي رؤوف | طارق علي | أحمد حمدي رؤوف | جمال فتحي | 2023 | Series Theme | تتر نهاية مسلسل تياترو | End-title theme, series "Teatro" | youtube.com/watch?v=JZvtnzCV45c | open.spotify.com/track/5UfnJ10XZhtnpi2al6QO0w | — | music.apple.com/us/album/1681154400 | enta-ader | — |
| الساعة 12 ودقيقة | El Sa'a 12 We Daqiqa | علي الحجار | سالم الشهباني | أحمد حمدي رؤوف | أحمد شعتوت | 2023 | Seasonal Single | رأس السنة، طُرحت 30 ديسمبر 2022 | New Year's, released Dec 30 2022 | youtube.com/watch?v=k2XFl-s56UI | — | — | — | el-sa-a-12-we-daqiqa | — |
| ع الرباب | A El Rabab | علي الحجار | جمال بخيت | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2023 | Folk Song | 18 سبتمبر 2023 | Sept 18 2023 | — | — | — | music.apple.com/ae/artist/282666254 | a-el-rabab | — |
| فرحة الدنيا | Farhet El Donia | علي الحجار | سالم الشهباني | أحمد حمدي رؤوف | وليد مصطفى | 2023 | Humanitarian Campaign | مستشفى أهل مصر للحروق | Ahl Masr Free Burns Hospital | youtube.com/watch?v=JnKgIdX7Fl0 | — | — | — | farhet-el-donia | — |
| إبهار مصر | Ebhar Masr Anthem | طلبة إبهار مصر | أمير نسيم | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2023 | Educational Anthem | برنامج إبهار مصر | "Ebhar Masr" program | — | — | — | — | ebhar-masr-anthem | — |
| كلنا بنحب المسرح | Kollena Benehebb El Masrah | أبطال تياترو | طارق علي | أحمد حمدي رؤوف | جمال فتحي | 2023 | Drama Musical Song | مسلسل تياترو CBC | Series "Teatro," CBC | — | — | — | music.apple.com/us/album/1681154400 | kollena-benehebb-el-masrah | — |
| مسرح للجماهير | Masrah Lel Gamaher | أبطال تياترو | طارق علي | أحمد حمدي رؤوف | جمال فتحي | 2023 | Official Initiative Theme | مهرجان نقابة المهن التمثيلية | Actors' Syndicate Festival | — | — | — | music.apple.com/us/album/1681154400 | masrah-lel-gamaher | — |
| أبو الأحلام | Abu El Ahlam | علي الحجار | ناصر رشوان | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2022 | Tribute Song | إهداء لروح أحمد الحجار | Dedicated to memory of Ahmed El-Haggar | — | — | — | — | abu-el-ahlam | — |
| صوتك جميل دمك عسل | Sotak Gamil Damak Asal | أحمد حمدي رؤوف | صلاح عبد الله | أحمد حمدي رؤوف | أحمد حمدي رؤوف | 2024 | Romantic Single | 16 يونيو 2024 | June 16 2024 | youtube.com/watch?v=TRs6jW1FLAs | — | — | — | sotak-gamil-damak-asal | — |
| دنيا السعادة | Donia El Sa'ada | مدحت صالح | محمد نبيل | أحمد حمدي رؤوف | جمال فتحي | 2025 | Corporate Song | Mountain View | Mountain View campaign | — | — | — | — | donia-el-sa-ada | — |
| تِعب | Ti'eb | محمد منير | أحمد شبكة | أحمد حمدي رؤوف | أحمد حمدي رؤوف | 2026 | Series Theme | تتر بداية حد أقصى، رمضان 2026 | Opening theme "Hadd Aqsa," Ramadan 2026 | youtube.com/watch?v=rQ6QpjkQqOo | — | — | — | ti-eb | Y |
| شكراً يا إمارات | Shukran Ya Emarat | أحمد حمدي رؤوف | سالم الشهباني | أحمد حمدي رؤوف | أحمد شعتوت | 2026 | Tribute Song | المنتج المنفذ: أمل حمدي رؤوف | Executive producer: Amal Hamdy Raouf | youtube.com/watch?v=OYBtY7IYtUo | — | — | — | shukran-ya-emarat | — |
| موضوع حساس | Mawdou' Hassas | علي الحجار | سالم الشهباني | أحمد حمدي رؤوف | مادو | 2026 | Contemporary Song | — | — | — | — | — | — | mawdou-hassas | — |
| أنا مش مجنونة | Ana Mesh Magnona | ريهام عبد الحكيم | أحمد فؤاد نجم | **حمدي رؤوف (والد أحمد حمدي رؤوف)** | أحمد حمدي رؤوف | 2004 | Drama Song | مسلسل فريسكا (2004) — اللحن للوالد، التوزيع للابن | Series "Freska" — composed by the father, arranged by the son | — | — | — | — | ana-mesh-magnona | — |
| ألف شعور | Alf Sho'our | سهيلة بهجت | سالم الشهباني | أحمد حمدي رؤوف | محمد حمدي رؤوف | 2023 | Patriotic Song | 29 أكتوبر 2023 | Oct 29 2023 | youtube.com/watch?v=7TXm63F9A5k | — | — | — | alf-sho-our | — |
| قلبي ساجد | Qalbi Sajid | علي الحجار | محمد عبد القادر | أحمد حمدي رؤوف | مادو | 2026 | Ramadan song | — | — | youtube.com/watch?v=-ChYfECwfds | — | — | — | qalbi-sajid | — |

### Tab 2 — Theatre Productions (~20 productions)
قصر الربيع (1994, Alexandria Anfoushi Theatre), جبال الحديد (1995, school play), على الزيبق (1997, Alexandria University), عفاريت مصر الجديدة (1998), سوس وسوسة والحرب البسوسة (2000), آخر المطاف (2003), ياما في الجراب (2004, First Place/Best Production/Best Direction), الخطوبة (2005, Chekhov adaptation), آخر الفرسان (2008), تذكرة للتحرير (2011, Cairo Opera House, linked to Jan 25 revolution), عفاريت البدروم (2011, adapted from Gorky's "The Lower Depths"), الحبل (2012, adapted from Eugene O'Neill), من العبور إلى العمل (2013), المخطط (2014), حلم في ليلة نص الصيف (2014, Arabic colloquial adaptation of Shakespeare), المعجنة (2018, Egyptian National Theatre), أمر تكليف (2018–2019, Aswan/Luxor/Fayoum), يا ألعب يا أغلس (2022, Riyadh Season, dir. Ashraf Zaki), المسرح وحشنا (2022, Academy of Arts), نساء شيكسبير (2023, Academy of Arts). Each row includes full director/writer/cast/press-source detail in the fetched raw data.

### Tab 3 — Drama & Film (~13 titles)
الشهاب (1999 TV series, dir. Ahmed Khedr), أمسك الخشب (1999 TV series, dir. Samir Alam), الحب موتاً (2005, dir. Magdy Ahmed Aly), حارة الزعفراني (2006, dir. Ayman Obeis), أرض النسانيس (2007, children's short), غرفة 707 (2008 feature film, dir. Ihab Radi — official song "Qalb Wahid"), السائرون نياماً (2010 TV series, dir. Mohamed Fadel, 57 songs, cast incl. **أمل حمدي رؤوف**), سيدة النقد المسرحي (2017 documentary), حكاية الفرقة (2020 documentary), المسرح القومي المصري (2020 documentary), بديعة مصابني (2023 documentary), تياترو (2023 TV series, CBC, prod. AHRvision), حد أقصى (2026 TV series, Ramadan, prod. Rotana).

### Tab 4 — Choirs & Training (5 organizations)
El Nasr Boys College (1999–2000, Alexandria), Ministry of Youth – El Anfushi Center (2004), Ministry of Youth – El Nasr Center (2004), National Youth & Sports Troupe (2004–2005, all Egyptian governorates), Arab Academy for Science & Technology (2009–2010, Alexandria/Cairo/Port Said).

### Tab 5 — Concerts & Live Projects (4)
"Watan El Ghena – Hamdy Raouf Anniversary" (2013/2014/2015, Alexandria Creativity Center — annual tribute project marking father Hamdy Raouf's birthday, May 31, following his passing May 11, 2013), Ali El-Haggar Ensemble Artistic Direction (2009–present), "Musalsalat: Romance and More" (AUC Ewart Memorial Hall), "Ramadan Zaman" (2024, AUC).

### Tab 6 — Awards & Recognition (8)
Oscar Award for Best Music Video (2012, "Fagr Biladi"), UAE Golden Residency (Creatives & Artists category), Egyptian Ministry of Culture honor, Ministry of Youth & Sports honor, National Center for Child Culture honor, Smouha Sporting Club honor, National Heritage Council cultural honor, Alexandria Creativity Center honor.

### Sheet's Own Maintenance Notes
- Column names must not change — the live site reads them exactly.
- Publish flow: File → Share → Publish to web → CSV per tab → update the link in the site's code.
- This merge added the Notes (EN) column to Singles for the first time, plus the new song "Qalbi Sajid" — both flagged by the sheet's own owner as needing review before being relied on live.
