---
name: hallmark
description: "Anti-AI-slop design skill for greenfield pages, audits, redesigns, and design extraction from URLs or screenshots. Use when the user asks to build a new app or landing page, wants to redesign something, invokes Hallmark by name, or uses audit/redesign/study."
version: 1.1.0
---

# Hallmark (Together AI Anti-Slop Design Engine)

A design skill for AI coding assistants. Makes the UIs they generate look made, not generated.

Hallmark is opinionated, short, and rigorous on purpose. It encodes a tight set of rules — drawn from the consensus of the anti-AI-slop design field (Anthropic's frontend-design skill, the Claude cookbook on frontend aesthetics, and the 2026 "tactile rebellion" movement) — and refuses to let the model fall back to the defaults every LLM was trained on.

The differentiator: Hallmark insists on **structural variety**, not just visual variety. Two pages by Hallmark for two different briefs should not share the same hero → 3-feature → CTA → footer rhythm. They should feel like different sites, not different colour-swaps of the same template.

---

## How to use this skill

Hallmark has one default behaviour and three explicit verbs.

| Invocation | What it does |
| --- | --- |
| *(default)* | The user asked you to design or build something new. Follow the **Design flow** below. |
| `hallmark audit <target>` | Read the target, score it against the anti-pattern list, return a ranked punch list. **Do not edit.** |
| `hallmark redesign <target> [--mood <name>]` | Take the target's content and intent, then redesign the visual structure **inside the existing implementation boundaries unless the user explicitly confirms a full rebuild.** New section rhythm, new heading placement, new component voice. Preserve existing routes, component ownership, copy intent, brand, and information architecture; replace only the visual/interaction layer needed for the requested scope. |
| `hallmark study <screenshot \| URL>` | Extract the **DNA** — macrostructure, archetypes, type-pairing, colour anchor — and produce a diagnosis report, then optionally rebuild the user's content using the extracted DNA. |

---

## 6 Invariant Disciplines Across Every Verb

1. **Pre-emit self-critique:** Before handing back any output, score it 1–5 on six axes — Philosophy, Hierarchy, Execution, Specificity, Restraint, Variety. Anything < 3 triggers a revision pass. Stamp the six scores at the top of the artifact (`/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */`).
2. **Honest copy — no fabricated content:** Never invent fake conversion numbers or placeholder corporate claims.
3. **Locked tokens — no mid-render improvisation:** Every color and font-family must reference named tokens (e.g., `var(--color-accent)`). Inline arbitrary hex codes without semantic tokens are forbidden.
4. **Re-drawn chrome forbidden:** No hand-built fake browser chrome bars or mock title bars.
5. **Mobile responsiveness — verified at 320 / 375 / 414 / 768 px:** No horizontal scroll, `overflow-x: clip` on root, no two-line clickable buttons, grid tracks use `minmax(0, 1fr)`.
6. **Typography purity — no italic headers:** Headings and display type are always roman (`font-style: normal`). No italic emphasis inside upright headings (`Built to <em>think</em>`). Carry emphasis with weight, letter-spacing, or subtle accent lines.

---

## Hallmark Haute Couture & Luxury Design Rules

### 1. Macrostructure & Asymmetry
- Ditch the centered-hero + 3-column-card grid.
- Use asymmetric editorial layout: 60/40 split with dramatic typographic anchors, staggered visual card arrangements, tactile hairline borders (`border-stone-800/80` or `border-amber-500/20`).
- Generous breathable whitespace balanced with high-density data chips.

### 2. Atmospheric Lighting & Depth
- Layered background gradients with dark obsidian base (`#0c0a09` / `stone-950`), warm champagne undertones (`rgba(217, 119, 6, 0.04)`), and subtle radial highlights.
- Ambient card glows on hover (`box-shadow: 0 12px 36px -8px rgba(245, 158, 11, 0.12)`).
- Hairline glassmorphism: `backdrop-blur-md bg-stone-900/60 border border-stone-800/60`.

### 3. Typography & Hierarchy
- Display Headings: Serif or Editorial high-contrast fonts (Playfair, Cormorant Garamond, Cinzel, or styled serif display accents) for Haute Couture presence.
- Body & Controls: Ultra-clean technical grotesque sans-serif (Plus Jakarta Sans, Inter, Outfit) with tracked-out uppercase micro-labels (`tracking-widest text-[10px] uppercase font-mono font-bold`).
- Price & Accents: Crisp, high-contrast currency presentation with distinct strikethrough styling and luxury discount pills.

### 4. Interactive State Rigor (The 8-State Rule)
Every card, button, and input MUST define explicit treatments for:
1. `default` 2. `hover` 3. `:focus-visible` 4. `:active` 5. `disabled` 6. `loading` 7. `error` 8. `success`
