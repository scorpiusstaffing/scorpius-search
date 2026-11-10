# Unify Now group: design system

One system, two brands, one tree. The gateway at `/` is Unify Now. `/carter-james/` is Carter James.
`/rec2rec/` is the Unify Now rec2rec site, to be built on exactly this system. Everything shared lives in
`/shared/`: `system.css` (tokens, primitives, components), `system.js` (reveal, nav, menu), `fonts/`,
`logo/`. A brand adds one small stylesheet on top (`/carter-james/cj.css` is the example) and nothing
else. All paths are root-absolute so the whole tree can be published under one prefix.

The client's bar: quiet luxury. Readability first, calm colour, native scrolling, one soft reveal, and
quality shown through spacing, alignment and typographic detail rather than effects.

## 1. Palette

Shared neutrals (both brands):

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F3F4F2` | page ground |
| `--paper-2` | `#E8EAE7` | a second light tone, rarely |
| `--line` | ink at 18% | hairlines on paper |
| `--muted` | `#5B6367` (UN) / `#44565F` (CJ) | labels and captions only, never body text; both at least 5.6:1 on paper |

One ink and one accent per brand, set by a class on `<body>`:

| | Unify Now (default) | Carter James (`.brand-cj`) |
|---|---|---|
| `--ink` | `#15191B` | `#051B27` petrol |
| `--accent` | `#2440D8` blue | `#D9401D` coral |
| `--accent-on-ink` | `#9FB0FF` | `#FF6A48` |
| `--line-on-ink` | paper at 22% | `#B59977` brass |

Rules: body text is always `--ink` on `--paper` or `--on-ink` on `--ink`, never grey. The accent is a
mark, a hover, a focus ring or a single word; never a surface, never a headline. Dark bands (`.band-ink`)
are used for rhythm, at most two or three per page, and they swap `--line`, `--muted` and `--accent` to
their on-ink values automatically.

## 2. Type

| Role | Unify Now | Carter James |
|---|---|---|
| `--display` (h1, h2, large names) | Bricolage Grotesque 500 | Archivo 600, width 104 |
| `--sans` (h3, labels, nav, buttons) | Instrument Sans | Archivo |
| `--text` (body, ledes, quotes) | Instrument Sans | Newsreader |

Scale (desktop at 1440px, fluid down to phones):

| Token | Size | Line height | Use |
|---|---|---|---|
| `--fs-h1` | 62px (40 on phones) | 1.04 | one per page |
| `--fs-h2` | 44px (30) | 1.1 | section headline, sentence case, balanced |
| `--fs-h3` | 24px (20) | 1.25 | card and row headings, questions |
| `--fs-lede` | 24px (20) | 1.4 | first paragraph of a section |
| `--fs-body` | 19px (17) | 1.6 | reading text, measure `--measure` = 34em (60 to 70 characters) |
| `--fs-small` | 15px | 1.55 | nav, buttons, meta, captions |
| `--fs-label` | 13px | 1.4 | small caps labels, letter-spacing .1em, never smaller |

Details: sentence case everywhere, `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs,
`.tnum` for every number, `hanging-punctuation: first` on blockquotes (Safari), real quotation marks and
apostrophes, no em or en dashes in copy. Carter James only: the closing phrase of a headline may be set a
little narrower with `.nw` (width 86), the brand's one typographic detail.

## 3. Spacing and grid

Spacing scale `--s1` to `--s10`: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Between sections `--sec`
(72 to 128px), between blocks inside a section `--block` (44 to 72px). Gutter `--gutter` (20 to 72px),
column gap `--gap` (16 to 32px), content width `--max` 80rem.

Twelve columns. The standard block is `.split`: headline in columns 1 to 5, reading text in 7 to 12,
collapsing to one column under 900px. Lists are `.rows` (number, title, meta, text), columns of equal
weight are `.cards` (ruled at the top, no boxes, no shadows, no rounded corners).

## 4. Components (all in system.css)

- **Nav** `.nav`: fixed, paper, hairline below, 68px (60 on phones). Order: `.nav-group` (the small
  "Unify Now" link with the mark, back to the gateway), `.nav-logo`, `.nav-links`, `.nav-cta` (a text link,
  not a button), `.nav-toggle` under 1100px with `.menu`. The current section is underlined.
- **Hero** `.hero` + `.hero-wrap` + `.hero-top` (two labels) + `.hero-grid` (`.hero-h` 1 to 7, `.hero-side`
  8 to 12 with `.lede` and `.actions`) + optional `.hero-foot`. Light paper by default; a brand may set
  `.band-ink` on it.
- **Section header** `.sec-head`: a hairline (`.rule`, or the Carter James stepped `.line`) and a `.label`.
  Numbered labels (`<b>01</b>`) only where a list benefits from scanning.
- **Rows** `.rows` > `.row` with `.row-n`, `.row-title`, `.row-meta`, `.row-text`.
- **Cards** `.cards` (3) or `.cards--4` > `.card`: `.label`, `.h3`, paragraph.
- **Definition list** `.deflist`.
- **FAQ** `.faq` with native `<details name="faq">` and `.plus`.
- **Quote** `.quote` (blockquote, figcaption with `.quote-name` and a `.label`).
- **Buttons and links** `.btn` (ink fill, accent on hover), `.btn--ghost`, `.tlink` (small underlined
  link with arrow), `.link` (inline underlined). On `.band-ink` the button inverts.
- **CTA row** `.cta-row`: a sentence left, one button right, hairline above.
- **Forms** `.form` > `.field` > `label` + `.input` / `.textarea`: underlined fields, accent underline on
  focus, `.field--wide` spans both columns, `.hint` for help text.
- **Footer** `.foot.band-ink` > `.foot-top` (brand with logo and one sentence, then columns) + `.foot-base`
  (copyright, the group link "Part of the Unify Now group", back to top).

## 5. Motion

One soft reveal per block: `data-r` on the block, opacity and 10px, 600ms, once. Section hairlines draw
once. Hover changes a colour or moves an arrow 2px. Nothing else: no pinning, no parallax, no smooth-scroll
library, no custom cursor, no page transitions. With `prefers-reduced-motion` or `?static=1` or without
JavaScript everything is simply there. The head of every page carries the small inline script that adds
`js` and `static` classes.

## 6. Header pattern and the group

Every site in the group starts its nav with `.nav-group`: the Unify Now mark and the word "Unify Now",
linking to `/`. The footer base repeats it as "Part of the Unify Now group". The gateway itself shows only
the Unify Now logo, two doors and a one-line legal footer.

## 7. Accessibility and preview

Skip link, `:focus-visible` ring in the accent, AA contrast on every text style, `aria-current` on the
current nav item, native `details` for accordions, `aria-label` on logo links, labels above form fields.
Every page carries `<meta name="robots" content="noindex, nofollow">` while the tree is a private
preview, and `/robots.txt` disallows all.

## 8. Building the rec2rec site on this system

1. Start every page with the same head as `/carter-james/index.html`: preload the two brand fonts
   (Bricolage Grotesque and Instrument Sans), the inline `js`/`static` script, `/shared/system.css`, then
   one brand stylesheet of your own, no `brand-` class on `<body>` (Unify Now is the default).
2. Use the components as they are. Add a brand stylesheet only for a logo, a brand device or a
   component the system does not have; put nothing in it that changes sizes, colours or spacing tokens.
3. Keep the `.nav-group` link and the footer group link.
4. No names of people anywhere on the rec2rec site.
5. Test at 1440 and 375 with the same questions: is anything shouting, can anything be removed, is every
   line of text at least 17px, every label at least 13px, every colour pair at least AA.
