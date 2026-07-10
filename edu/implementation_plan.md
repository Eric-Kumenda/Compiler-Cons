# Elmo ICG Interactive Explainer - Implementation Plan

This document outlines the plan to build the "How Compilers Think" interactive guide for the Elmo compiler. The application will be a single-page React app built with Vite, utilizing HeroUI v3 for components, GSAP for animations, and Zustand for state management.

## Answers to Your PRD Questions

> [!NOTE]
> **GSAP Smooth Scrolling vs Lenis**
> You asked if GSAP has a smooth scrolling feature. Yes, GSAP has the **ScrollSmoother** plugin, which is incredibly powerful. However, it is a premium plugin that requires a paid "Club GSAP" license. Because of this, **Lenis** is the industry-standard, open-source (free) alternative. Lenis integrates perfectly with GSAP's `ScrollTrigger`, so we will stick with your original suggestion to use Lenis for smooth scrolling!
> 
> **Decorative SVGs (GSAP-style)**
> Ah, I understand now! You are referring to the beautiful, abstract, colorful 3D-like geometric shapes (like the gradient orbs, floating rings, and flower shapes) seen on the GSAP website. Since these aren't standard icons, we won't use an icon library for them. Instead, we can create these highly decorative, abstract SVG elements using pure SVG with `<linearGradient>`, `<radialGradient>`, and `<filter>` (for glow and noise effects), or CSS mesh gradients. We can also use open-source shape generators (like *Shape Divider* or *Mesh Gradient* tools) to grab the exact SVG paths for these blobs, stars, and rings, and then animate them floating around the page using GSAP to achieve that premium, playful aesthetic.

## Design Decisions Based on Feedback

- **Project Location**: The Vite project will be initialized in the `/edu/app` subdirectory to keep it isolated from the existing `docs` folder.
- **Theming**: We will implement a seamless **Light/Dark mode toggle**. With Tailwind v4 and HeroUI v3, this is easily achievable using standard CSS variables and the `dark` class toggling.
- **Typography**: To fit the "friendly, playful, and honest" aesthetic while avoiding generic AI slop, we will use **Outfit** for headings (a geometric sans that feels modern and approachable) and **Plus Jakarta Sans** or **Inter** for highly legible body text.

---

## Proposed Changes

### Setup & Infrastructure

#### [NEW] Vite + React + TS Project Setup
- Initialize the application in `/Users/app/Developer/Compiler Construction/edu/app` using `Vite 5` + `React 18` + `TypeScript`.
- Setup absolute imports (`src/*`).

#### [NEW] Dependencies
- **Core**: `zustand`, `react-router-dom`, `lucide-react`, `lenis`
- **Styling**: `tailwindcss` (v4), `@tailwindcss/postcss`, `postcss`
- **HeroUI v3**: `@heroui/react`, `@heroui/styles`, `tailwind-variants`, `clsx`, `tailwind-merge`
- **Animations**: `gsap`, `@gsap/react`
- **Fonts**: `@fontsource/outfit`, `@fontsource/plus-jakarta-sans`

#### [NEW] `src/globals.css` & Tailwind Config
- Setup Tailwind v4 and HeroUI v3 imports.
- Define OKLCH CSS variables for the color palette (primary indigo, success emerald, etc.) with both light and dark mode variants.
- Initialize Lenis smooth scroll CSS requirements.

---

### Global State & Data Layer

#### [NEW] `src/store/elmoStore.ts`
- Zustand store with state for:
  - `activeSection`, `stepIndex` (StepThrough), `memStep` (MemorySim), `activeOp` (Quadruples explorer).
  - Add `theme` state ('light' | 'dark') to manage the theme toggle.

#### [NEW] `src/data/*.ts`
- `tokens.ts`: Export `TOKEN_LIST`.
- `quads.ts`: Export `QUADS` and `OP_DEFS`.
- `stepThrough.ts`: Export `STEP_THROUGH`.
- `memSim.ts`: Export `MEM_STATES`.
- All data will be hardcoded exactly as specified in the PRD.

---

### Components & UI Implementation

#### [NEW] `src/ui/*` (Reusable UI Elements)
- `ThemeToggle.tsx`: A HeroUI-styled button to switch between light and dark modes.
- `CodeBlock.tsx`: Custom hand-rolled syntax highlighter for Elmo keywords.
- `QuadRow.tsx`: Component to display a single quadruple instruction.
- `MemoryCell.tsx`: Card for displaying memory state with GSAP flash animations on value changes.
- `ParseTreeNode.tsx`: SVG-based node for drawing the parse tree with glow/pulse states.
- `OpChip.tsx`: HeroUI `Chip` wrapper mapped to category colors.

#### [NEW] `src/components/*` (Main Sections)
- **`Navbar.tsx`**: Sticky top navbar with glassmorphism and the theme toggle button.
- **`Hero.tsx`**: GSAP typing animation for the subtitle and a smooth scroll CTA button.
- **`Pipeline.tsx`**: Horizontal flow diagram of compiler stages (Scanner → Parser → ICG → Code Gen) with ScrollTrigger line drawing.
- **`WhatIsICG.tsx`**: Side-by-side comparison with a "Watch it happen" GSAP timeline syncing code highlights and quad table rows.
- **`QuadruplesExplorer.tsx`**: HeroUI grid with selectable operation chips and a detailed explanation panel.
- **`StepThrough.tsx`**: 3-panel layout (SVG parse tree, Tokens, Quads) utilizing keyboard navigation and auto-play hooks.
- **`MemorySim.tsx`**: Real-time virtual machine simulation with auto-scrolling active instructions, flashing memory cells, and SVG GOTO arrows.
- **`WhyICG.tsx`**: Expandable HeroUI Accordions and a grammar mapping table.

---

### Hooks & Utilities

#### [NEW] `src/hooks/useAutoPlay.ts` & `src/hooks/useKeyboardNav.ts`
- Shared logic for handling auto-playing the step-through/memory simulations and binding left/right arrow keys to step changes.

#### [NEW] `src/hooks/useLenis.ts`
- Shared hook to initialize and manage Lenis smooth scrolling alongside GSAP's ScrollTrigger.

## Verification Plan

### Automated/Build Tests
- Run `npm run build` to ensure no TypeScript strict mode errors and no Vite build issues.
- Verify Tailwind v4 and HeroUI v3 CSS layers compile correctly.

### Manual Verification
- **Responsiveness**: Verify the layout stacks cleanly on mobile (<768px).
- **Functionality**: Test step-through navigation (Next/Prev, auto-play, arrow keys), quadruple selection, and memory simulation accuracy.
- **Animations**: Verify GSAP animations trigger correctly (scroll triggers, step-through highlights, memory cell flashes) and test with `prefers-reduced-motion` enabled to ensure compliance.
- **Theming**: Toggle light/dark mode and ensure colors switch seamlessly without visual jarring.
