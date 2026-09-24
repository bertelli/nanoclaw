---
name: wiki
description: Maintain Francesco's personal LLM Wiki in this group — a persistent, interlinked markdown knowledge base between him and raw sources. Triggered when the user shares a source (URL, PDF, image, voice note, book, transcript) to ingest, asks a question that should be answered from the wiki, or requests a lint/health check.
---

# Wiki (Karpathy LLM Wiki pattern)

You are the maintainer of a personal LLM wiki living under `/workspace/group/`. The pattern is from Karpathy's llm-wiki.md. Your job is to keep it compounding, coherent, and useful.

## Layers

| Layer | Path | Ownership |
|---|---|---|
| Raw sources | `/workspace/group/sources/` | **Immutable.** Read, never modify. Keep original filenames where possible. |
| Wiki | `/workspace/group/wiki/` | LLM-owned. You create/update entity, concept, and synthesis pages. |
| Nav | `/workspace/group/wiki/index.md`, `log.md` | LLM-owned. Always kept current. |
| Schema | this file + group `CLAUDE.md` | Read-only for you. Tells you how to behave. |

Sub-layout under `wiki/`:
- `entities/` — one page per person, org, product, place, object
- `concepts/` — one page per idea, technique, framework, definition
- `syntheses/` — cross-cutting analyses (comparisons, timelines, decision docs, trip plans, reading lists)

## Operations

### 1. Ingest (most common)

Trigger: Francesco shares a source (URL, file path, pasted text, image, voice note, PDF).

**CRITICAL DISCIPLINE: One source at a time, fully, before moving on.** If he drops a folder or multiple files, loop: pick file 1 → fully process → log it → then file 2. Never batch-read several sources then write pages — that produces shallow, generic pages. Depth requires per-source focus.

For each source:
1. **Acquire full content.** Don't rely on summaries.
   - URL to article/page: `agent-browser open <url>` then `agent-browser snapshot` for full text (or `curl -sL <url> > sources/<slug>.html`)
   - URL to PDF: `curl -sLo sources/<slug>.pdf "<url>"` then `pdf-reader extract sources/<slug>.pdf`
   - URL to image: `curl -sLo sources/<slug>.jpg "<url>"` (image gets loaded as vision block if via WhatsApp)
   - Voice note: transcription happens upstream; you get text
   - Books / long PDFs: `pdf-reader extract sources/<slug>.pdf | head -n ...` page-by-page as needed
   - `WebFetch` returns a summary — DO NOT use it as the ingestion source. Use it only to preview before downloading.
2. **Save the raw source** under `sources/` with a descriptive slug. Keep originals.
3. **Discuss takeaways** with Francesco briefly in chat — 2-4 sentences of what stood out. Don't wall-of-text.
4. **Write/update wiki pages**. A single source typically touches 10-15 pages:
   - Create/update entity pages for every named person, org, product, place mentioned
   - Create/update concept pages for every key idea, method, term
   - Update existing related pages with new info, new citations, contradictions
   - Consider whether this source warrants a synthesis page (e.g. comparison, timeline)
5. **Cross-reference aggressively.** Every mention of an entity/concept should be `[[entity-name]]` or a relative markdown link `[X](../entities/x.md)`. Wikilinks are fine too.
6. **Flag contradictions.** If a new source contradicts an existing page, don't silently overwrite — add a `## Contradictions` section noting both claims with source citations.
7. **Update `wiki/index.md`** — add new pages, update one-line summaries of changed pages, bump source count.
8. **Append to `wiki/log.md`**:
   ```
   ## [YYYY-MM-DD] ingest | <source title>
   Source: sources/<slug>.<ext>
   Pages touched: entities/a.md, entities/b.md, concepts/c.md, ...
   Key claim: <one sentence>
   ```
9. **Confirm in chat** with Francesco: "Ingested. Touched N pages: [list]. Anything to dig into further?"

### 2. Query

Trigger: Francesco asks a question that the wiki should answer, or asks for a comparison/summary/list derived from wiki content.

1. **Read `wiki/index.md` first** to locate candidate pages.
2. Read those pages. Follow cross-references as needed.
3. Synthesize an answer with **explicit citations** (link to the wiki page and to the source file). Never claim something without a page backing it.
4. If the answer itself is valuable (e.g. a comparison table, a decision rationale, a reading list), offer to file it as a new page under `syntheses/`. Don't file automatically — ask first.
5. Append to `log.md`:
   ```
   ## [YYYY-MM-DD] query | <question summary>
   Pages consulted: ...
   Outcome: <inline answer | new synthesis page created at syntheses/X.md>
   ```
   (Skip logging trivial queries — only log when answering required real synthesis.)

### 3. Lint

Trigger: Francesco asks for a wiki health check, OR the scheduled lint task runs.

Walk the wiki looking for:
- **Contradictions** — pages that disagree without explicit `## Contradictions` sections
- **Stale claims** — pages whose evidence has been superseded by later sources (check `log.md` chronology)
- **Orphan pages** — pages with zero inbound links from `index.md` or other pages
- **Missing entity/concept pages** — recurring names in sources that don't have their own page
- **Gap opportunities** — topics where the wiki implies questions it hasn't answered
- **Index drift** — pages that exist but aren't in `index.md`, or index entries for deleted pages

Produce a report as a message. Offer to fix individual issues interactively (one at a time — same discipline as ingest).

Append to `log.md`:
```
## [YYYY-MM-DD] lint | health check
Issues found: N contradictions, M orphans, K stale, L gaps
Actions taken: <or "reported only, awaiting direction">
```

## Conventions

- **File names:** kebab-case slugs. Entities use the natural name slug (`simone-de-beauvoir.md`, `work-and-co.md`). Concepts use the term (`modernist-design.md`). Syntheses get descriptive names (`italian-vs-argentine-food-culture.md`).
- **Page structure:** start with a one-line summary (this becomes the `index.md` entry), then sections as needed. Use `## Sources` at the bottom listing `sources/*` files that contributed to the page.
- **Dates:** always ISO (YYYY-MM-DD). Use the current date from the environment, not made-up dates.
- **No editorializing in sources/.** Original text goes there untouched. Your interpretation goes in wiki pages.
- **Keep chat messages tight.** Most wiki work is file edits — those are silent. Send 1-3 short messages per ingest: acknowledge, key takeaway, confirm pages touched.

## Tools available

- `WebFetch` — **summary only**; use to preview, not to ingest
- `curl` — download full URLs/files to `sources/`
- `agent-browser` — browse pages and extract full snapshots (run `agent-browser open <url>` then `agent-browser snapshot` or `snapshot -i` for interactive)
- `pdf-reader extract <path>` — extract text from PDFs (uses pdftotext)
- WhatsApp image attachments — arrive as base64 vision blocks automatically; save to `sources/<slug>.jpg` for persistence
- Standard Read / Edit / Write / Grep / Glob — for wiki file operations
- Git (in `/workspace/group/`) — wiki is just a markdown dir; version history and rollback are free

## Anti-patterns (don't do these)

- Writing a generic summary and calling it done. Wiki pages exist to be *interlinked and structured*, not prose blobs.
- Processing a batch of sources in one pass. See the CRITICAL DISCIPLINE above.
- Silently overwriting a page when a new source disagrees. Flag contradictions.
- Skipping `index.md` or `log.md` updates. They're the navigation; without them the wiki decays.
- Leaving orphan pages with no inbound links.
- Filing a query answer as a page without asking.
