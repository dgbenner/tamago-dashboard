# Dashboard: CEFR explainer page

For the **dashboard agent** (`~/Sites/builder-trial`, tamago-dashboard repo). Written November 23, 2026.

## What this is

A new page called **CEFR**, added as the **last item in the left nav** (below Cost). It explains the CEFR language
levels and shows where Tamago's nine courses sit on that scale. It's mostly static reference content. The only
live data is the "Tamago today" strip, which reads from the existing snapshot.

Build it as **cards and labels, not paragraphs**. Use the existing dashboard components and tokens (the stat
cards, table and chips already on Content Health). Each section is a short heading, one line of intro text at
most, then visuals.

Put all the static content in one data file (`src/data/cefr.json` or the equivalent), so it can be edited without
touching the components.

---

## Section 1: What CEFR is (header)

- **Title:** CEFR
- **Subtitle (one line):** The Common European Framework of Reference for Languages: one scale for every
  language, from first words to mastery.
- **Three group chips in a row**, each colored and used again on the level cards below:
  - **Basic user**: A1, A2
  - **Independent user**: B1, B2
  - **Proficient user**: C1, C2
- **One small fact line under the chips:** Published by the Council of Europe in 2001. Levels are defined by
  "can-do" statements, not grammar lists. The 2020 Companion Volume added a Pre-A1 level.

## Section 2: The six levels (the core of the page)

Show the six levels as a **horizontal ladder of six cards** on desktop, stacked on mobile. Put a small, muted
**Pre-A1** chip before A1. Each card contains:

- **Code** (large): A1
- **Name** (small caps): the original CEFR name
- **Group chip**: Basic, Independent or Proficient, in the group color
- **Can-do line**: one sentence, in plain words
- **Hours chip**: approximate cumulative guided learning hours from zero

| Code | Name | Group | Can-do line (paraphrased, not quoted) | Hours from zero |
|---|---|---|---|---|
| Pre-A1 | — | Basic | A handful of words and set phrases for immediate needs. | — |
| A1 | Breakthrough | Basic | Introduce yourself and ask and answer simple personal questions, if the other person speaks slowly and helps. | ~90–100 |
| A2 | Waystage | Basic | Handle routine exchanges about familiar things like shopping, work, family and your area. | ~180–200 |
| B1 | Threshold | Independent | Get by in most travel situations, and talk about experiences, plans and opinions in simple connected speech. | ~350–400 |
| B2 | Vantage | Independent | Follow the main ideas of complex texts and talk with native speakers without strain on either side. | ~500–600 |
| C1 | Effective Operational Proficiency | Proficient | Understand long, demanding texts, including implied meaning, and speak fluently without searching for words. | ~700–800 |
| C2 | Mastery | Proficient | Understand virtually everything, summarize from several sources, and express fine shades of meaning. | ~1,000–1,200 |

- **Tamago marker:** on the **A1 card**, add a highlighted badge reading **"Tamago: all 9 courses"**. Use a
  chip in the accent color, and leave the other cards alone. When a course reaches A2, the badge moves (see
  Section 6).
- **Footnote under the ladder (small, muted):** The hours are Cambridge English's guided-learning estimates for
  learners of English, counted from zero. Alliance Française gives similar figures for French (A1 60–100 through
  C2 1,060–1,200). Real time varies by learner and by language. See Section 3.
- **Copy rule:** the Council of Europe holds copyright on the official descriptors. Keep the can-do lines
  paraphrased as written above, and link to the official global scale (Sources) for the full text. Don't paste
  the official descriptors in.

## Section 3: Same level, different distance

The point of this section: a level means the same thing in every language, but getting there takes longer in
some. Show it as a **single horizontal bar chart** with one bar per Tamago language, grouped by category.

Data from the US Foreign Service Institute (FSI): approximate class hours for an English speaker to reach
*professional working proficiency*. That is FSI's own scale, not a CEFR level, so label it that way.

| Group | Languages | Class hours |
|---|---|---|
| Category I | French, Spanish, Italian, Portuguese, Dutch, Swedish, Danish | ~600–750 |
| Category II | German | ~900 |
| Category III–IV (FSI's label depends on edition) | Polish | ~1,100 |

- **Caption (one line):** Polish takes almost twice as long as Spanish to reach the same point. Its grammar has
  seven cases.
- **Small note:** FSI measures time to professional proficiency for adult diplomats in full-time class. It's a
  way to compare languages, not a CEFR conversion.

## Section 4: How big is each level? (vocabulary)

Keep this light: **one card** with a simple visual, such as a growing word stack or a short bar from A1 to A2.

- **Headline:** A1 means hundreds of words; A2 means roughly a thousand.
- **Two facts:**
  - Official A2 ("Waystage") word lists for English and French each contain about 1,000 words (Milton).
  - Research suggests that learners who know only 500–800 words don't get past A1 (Milton, 2022).
- **Tamago tie-in (live):** "Tamago's A1 courses teach 934–1,568 words." Take the minimum and maximum of
  `words` from the snapshot.
- **Caveat line:** Vocabulary size is a guide, not a definition. CEFR levels are defined by what you can do.

## Section 5: The real exams, by language

A **grid table**: rows are the nine Tamago languages, columns are A1 through C2. Each cell holds the official
exam name. Empty cells show a muted "—". Cells that need a footnote get a small superscript marker. The row
order matches the Languages table on Content Health.

| Language | A1 | A2 | B1 | B2 | C1 | C2 |
|---|---|---|---|---|---|---|
| French | DELF A1 | DELF A2 | DELF B1 | DELF B2 | DALF C1 | DALF C2 |
| Spanish | DELE A1 | DELE A2 | DELE B1 | DELE B2 | DELE C1 | DELE C2 |
| German | Goethe-Zertifikat A1 (Start Deutsch 1) | Goethe A2 | Goethe B1 | Goethe B2 | Goethe C1 | Goethe C2 |
| Italian | CILS A1 | CILS A2 | CILS UNO-B1 | CILS DUE-B2 | CILS TRE-C1 | CILS QUATTRO-C2 |
| Portuguese | CAPLE ACESSO | CAPLE CIPLE | CAPLE DEPLE | CAPLE DIPLE | CAPLE DAPLE | CAPLE DUPLE |
| Dutch | Basisexamen inburgering buitenland¹ | Inburgeringsexamen A2 | Staatsexamen NT2 I | Staatsexamen NT2 II | — | — |
| Swedish | —² | Swedex A2B1 | Swedex A2B1 | Swedex B2C1 | Swedex B2C1 | — |
| Danish | Danskprøve A1³ | Danskprøve A2³ / Prøve i Dansk 1⁴ | Prøve i Dansk 2 | Prøve i Dansk 3 | Studieprøven | — |
| Polish | State certificate A1⁵ | State certificate A2 | State certificate B1 | State certificate B2 | State certificate C1 | State certificate C2 |

Footnotes (small, under the table):
1. Taken abroad, at a Dutch embassy, before moving to the Netherlands on a partner visa.
2. Swedex has no A1 test. A result just under A2 on the A2B1 test can earn an A1 certificate.
3. Tests for people joining family in Denmark.
4. Prøve i Dansk 1 is scored at mixed levels, roughly A2 written and B1 spoken. Sources differ on the exact split.
5. The adult state exams cover A1–C2. Most sessions are held at B1 and above, so A1 sittings are rare.

- **Above the table, one line:** Most languages have an official exam at every level. Dutch, Swedish and Danish
  exams are tied to residence and integration, so their ladders are uneven.
- **Tamago tie-in:** outline the A1 column with the accent color, and label it "Tamago's mock exams follow
  these".

## Section 6: Tamago today (live strip, at the bottom)

A row of **nine compact chips**, one per language. Each shows the language name, its current CEFR level
("A1 complete") and its circle count, all from the snapshot. Tapping a chip opens that language's row on
Content Health.

- If the snapshot ever shows a course with A2 parts, its chip reads "A1–A2", and the Section 2 badge appears on
  the highest level any course has completed.
- Add one muted line: "Every course is A1-complete. Some sentences in the four newest courses haven't had a
  native-speaker check yet." Link "native-speaker check" to the Awaiting Native Check card.

## Sources (footer, small, linked)

- Council of Europe, CEFR levels and the official global scale:
  https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions and
  https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale
- Council of Europe, CEFR Companion Volume (2020), including Pre-A1: https://rm.coe.int/16809ea0d4
- Cambridge English, guided learning hours:
  https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours
- FSI language difficulty categories (summary): https://en.wikibooks.org/wiki/Wikibooks:Language_Learning_Difficulty_for_English_Speakers
- Milton, *French as a foreign language and the CEFR*:
  https://web-archive.southampton.ac.uk/www.llas.ac.uk/resources/paper/2715
- Exams: France Éducation international (DELF A1), Instituto Cervantes (DELE), Goethe-Institut (Start Deutsch 1),
  Università per Stranieri di Siena (CILS), CAPLE, IND (basisexamen inburgering buitenland), Folkuniversitetet
  (Swedex), nyidanmark.dk (Danish tests), certyfikatpolski.pl (Polish state certificate)

## Build notes

- The page stays static. Don't fetch anything at runtime beyond the existing snapshot.
- Keep the text to what's above. If a section starts to look like a paragraph, turn it into a chip or a card.
- Check it in light and dark mode, and on mobile, where the ladder stacks vertically.
- Run the typecheck, push, and confirm the page is live on the dashboard. Then stop.
