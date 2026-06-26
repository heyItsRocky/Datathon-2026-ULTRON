# DESIGN SYSTEM — ULTRON Frontend

> Version 2.0 · June 2026
> Purpose: Define every visual token — color, typography, spacing, elevation, animation, and component feel — so the frontend is visually cohesive and government-grade. This file is the **single source of truth**. No agent may duplicate, override, or redefine these tokens.

---

## 0. Enforcement Rule

**This file is frozen after Phase 0.**

No execution agent may:
- Add new CSS custom properties outside this file
- Override these tokens in any page or component CSS
- Define inline colors, spacing, or radii that conflict with these tokens
- Add animation durations or easings that are not covered by Section 8

**Violations are UI quality blockers** and must be reverted before phase sign-off.

The QA agent validates design token compliance in every phase.

---

## 1. Design Language Overview

**"Intelligence-grade dark command interface with official KSP gold authority."**

The UI evokes:
- A tactical operations center at night
- Government intelligence dashboards
- Premium data analytics tools
- Indian police authority and trust

Every visual decision serves these three pillars equally.

---

## 2. Color System

### 2.1 Base Palette

```
                    ┌─────────────────────────────┐
                    │        SURFACE MAP           │
                    │                             │
                    │  Background    #0a0e1a       │
                    │  Surface       #111827       │
                    │  Elevated      #1a1f2e       │
                    │  Border        #2a3040       │
                    │  Border Light  #3a4050       │
                    │                             │
                    │  Text Primary  #f1f5f9       │
                    │  Text Secondary #94a3b8      │
                    │  Text Muted     #64748b      │
                    │                             │
                    │  White         #ffffff       │
                    │  Black         #000000       │
                    └─────────────────────────────┘
```

### 2.2 Accent Colors

```
Domain         │ Token        │ Hex       │ Usage
───────────────┼──────────────┼───────────┼──────────────────────────
KSP Gold       │ accent-gold  │ #f0b000   │ Primary accent, active states
               │ accent-gold  │ #d4a020   │ Hover state
               │ (dim)        │           │
───────────────┼──────────────┼───────────┼──────────────────────────
Crime          │ crime-red     │ #dc2626   │ Violent crime, critical alerts
               │ crime-amber   │ #f59e0b   │ Property crime, warnings
               │ crime-orange  │ #f97316   │ Medium severity
───────────────┼──────────────┼───────────┼──────────────────────────
Cyber          │ cyber-cyan    │ #06b6d4   │ Digital/cyber accent
               │ cyber-teal    │ #14b8a6   │ Network flow accent
               │ cyber-blue    │ #3b82f6   │ IP intelligence
───────────────┼──────────────┼───────────┼──────────────────────────
Network        │ net-magenta  │ #a21caf   │ Link analysis
               │ net-purple   │ #7c3aed   │ Criminal network
───────────────┼──────────────┼───────────┼──────────────────────────
Intel          │ intel-violet │ #6d28d9   │ Strategic intelligence
               │ intel-gold   │ #f0b000   │ Intelligence highlights
───────────────┼──────────────┼───────────┼──────────────────────────
Semantic       │ success       │ #22c55e   │ Resolved, healthy, active
               │ warning       │ #f59e0b   │ Pending, unstable
               │ error         │ #ef4444   │ Critical, broken
               │ info          │ #3b82f6   │ Informational
```

### 2.3 Radial Navigation Colors

```
Segment   │ Angle Range     │ Hex       │ Destination Page
──────────┼─────────────────┼───────────┼────────────────────
Gold      │ 0°–50° / 300°–360° │ #f0b000 │ Dashboard
Teal      │ 50°–130°        │ #20a080   │ Maps & Geospatial
Purple    │ 130°–240°       │ #800060   │ Network Analysis
Red       │ 240°–300°       │ #c02040   │ Intelligence
```

### 2.4 Severity / Risk Colors

```
Risk Tier  │ Score  │ Color       │ Badge
───────────┼────────┼─────────────┼────────────
Extreme    │ 80-100  │ #dc2626     │ [EXTREME]
High       │ 60-79   │ #f59e0b     │ [HIGH]
Medium     │ 30-59   │ #eab308     │ [MEDIUM]
Low        │ 0-29    │ #22c55e     │ [LOW]
```

---

## 3. Typography

### 3.1 Font Family

```
── UI (Inter) ─────────────────────────────────────────────────
  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
  a b c d e f g h i j k l m n o p q r s t u v w x y z
  0 1 2 3 4 5 6 7 8 9

── Technical (JetBrains Mono) ─────────────────────────────────
  192.168.1.1  |  FIR/2025/001  |  7A:4B:2C:9F:00:12
  SHA256: a3f1b2c8d9e0f4a5b6c7d8e9f0a1b2c3d4e5f6

── Kannada (Noto Sans Kannada) ────────────────────────────────
  ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್  |  ಡ್ಯಾಶ್ಬೋರ್ಡ್  |  ಅಪರಾಧ
```

| Role | Font | Weight | Where |
|------|------|--------|-------|
| UI text | Inter | 400 / 500 / 600 / 700 / 800 / 900 | All interface elements |
| Technical data | JetBrains Mono | 400 / 500 / 700 | IPs, FIR numbers, hashes, timestamps, case IDs |
| Kannada | Noto Sans Kannada | 500 / 700 | Bilingual headers, Kannala mode |

### 3.2 Type Scale

```
Token          │ Size   │ Line Ht │ Weight  │ Usage
───────────────┼────────┼─────────┼─────────┼──────────────────────
text-xs        │ 12px   │ 16px    │ 500     │ Labels, footnotes
text-sm        │ 13px   │ 18px    │ 500     │ Descriptions, metadata
text-base      │ 14px   │ 20px    │ 400     │ Body, table cells
text-md        │ 15px   │ 22px    │ 500     │ Card body
text-lg        │ 16px   │ 24px    │ 600     │ Card titles
text-xl        │ 18px   │ 26px    │ 700     │ Section headings
text-2xl       │ 22px   │ 28px    │ 700     │ Page headings
text-3xl       │ 28px   │ 34px    │ 800     │ Dashboard KPI numbers
text-4xl       │ 36px   │ 42px    │ 900     │ Hero / Landing
```

---

## 4. Spacing System

```
Spacing scale follows Tailwind defaults on a 4px grid:

  Token   │ Px    │ Usage
  ─────────┼───────┼─────────────────────────
  spacing-1│ 4px   │ Micro padding, icon gaps
  spacing-2│ 8px   │ Button padding, small gaps
  spacing-3│ 12px  │ Card inner padding
  spacing-4│ 16px  │ Standard padding
  spacing-5│ 20px  │ Section padding
  spacing-6│ 24px  │ Card gaps, page padding
  spacing-8│ 32px  │ Section margins
  spacing-10│ 40px │ Large gaps
  spacing-12│ 48px │ Page section spacing
```

---

## 5. Elevation & Surface Depth

```
Token      │ Shadow                                    │ Usage
───────────┼───────────────────────────────────────────┼────────────────────
surface-0  │ none                                      │ Page background
surface-1  │ 0 1px 3px rgba(0,0,0,0.3)                │ Cards, panels
surface-2  │ 0 4px 12px rgba(0,0,0,0.4)               │ Dropdowns, popovers
surface-3  │ 0 8px 24px rgba(0,0,0,0.5)               │ Modals, drawers
surface-4  │ 0 16px 48px rgba(0,0,0,0.6)              │ Fullscreen overlays
surface-5  │ 0 0 0 1px rgba(255,255,255,0.06)         │ Border-only elevation
           │ + inset 0 0 0 1px rgba(255,255,255,0.03)  │ (for glass panels)
```

### Glass Card Formula
```css
.glass-card {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
```
All agents must use this exact formula for glass surfaces. No variant glass formulas permitted.

---

## 6. Border Radius

```
Token     │ Value  │ Usage
──────────┼────────┼────────────────────
radius-sm │ 4px    │ Inputs, small elements
radius-md │ 6px    │ Buttons, badges
radius-lg │ 8px    │ Cards, panels
radius-xl │ 12px   │ Modals, drawers
radius-2xl│ 16px   │ Large cards
radius-full │ 9999px │ Pills, avatars
```

---

## 7. Component Feel Specifications

| Component | Style Spec |
|-----------|------------|
| **KPI Card** | Dark glass surface, gold top-border accent, large number with unit, trending indicator, subtle hover lift |
| **Data Table** | Row hover highlight, sticky header, sortable columns, striped rows (subtle), compact cell padding |
| **Crime Pin (Map)** | Circular, colored by type, pulsing ring for active, shadow for depth |
| **District Polygon** | Fill opacity proportional to crime density, stroke for boundary, hover highlight |
| **Network Node** | Sized by degree/weight, colored by type, labeled, glow on hover |
| **Network Edge** | Line thickness proportional to relationship strength, colored by type, animated dash for active investigation |
| **Intel Graph Node** | Colored border by type, editable fields, dark fill, handles visible on hover |
| **Alert Badge** | Red pulse, white text, compact |
| **Status Badge** | Colored dot + label (Resolved=green, Investigating=yellow, Open=red) |
| **Loading Skeleton** | Shimmer gradient animation, matching card dimensions |
| **Empty State** | Centered icon + title + description + suggested action |
| **Error State** | Red-tinted glass card, error icon, message, retry button |
| **Modal** | Dark overlay with blur, centered card, slide-up entrance |
| **Drawer** | Slide from right, semi-transparent overlay, close on outside click |
| **Search Input** | Glass surface, magnifying glass icon, clear button, keyboard shortcut hint |
| **Role Badge** | Colored pill: Admin=gold, Sudo=purple, User=slate |

---

## 8. Animation & Motion

### 8.1 Philosophy
**"Motion serves comprehension, not decoration."**

Every animation has a purpose:
- **Transitions:** Guide the user's focus between states
- **Feedback:** Confirm interaction success
- **Attention:** Draw eye to critical events
- **Narrative:** Reveal information progressively

### 8.2 Animation Tokens (Frozen)

```
Token               │ Duration  │ Easing              │ Usage
────────────────────┼───────────┼─────────────────────┼────────────────────────
transition-fast     │ 150ms     │ ease-in-out         │ Hover, focus, active
transition-base     │ 200ms     │ ease-in-out         │ Toggle, expand, collapse
transition-slow     │ 300ms     │ ease-in-out         │ Panel slide, drawer
transition-enter    │ 400ms     │ ease-out-expo       │ Page enter
transition-exit     │ 350ms     │ ease-in-expo        │ Page exit
transition-stagger  │ 80ms      │ —                   │ Sequential item reveals
transition-countup  │ 2000ms    │ ease-out-cubic      │ KPI number animation
transition-pulse    │ 1600ms    │ ease-in-out         │ Alert/red-zone pulse
transition-spin     │ 40s       │ linear infinite     │ Outer ring decorative spin
```

**No agent may add new animation tokens.** If a new animation is needed, the orchestrator must approve a DESIGN_SYSTEM.md update.

### 8.3 Key Animations

| Event | Animation | Tool |
|-------|-----------|------|
| Command Center entrance | Rings scale in 0→1, stagger 120ms | anime.js |
| Page transition (radial) | Current page fades out, new slides up | anime.js |
| Page transition (sidebar) | Instant route change, content fades in | CSS transition |
| KPI numbers | Count up from 0 to final value | anime.js |
| Section nav underline | Slides from current to target position | anime.js |
| Card hover | Lift 4px, shadow intensifies, border highlight | CSS transition |
| Chart reveal | Series animate from bottom, sequential | Recharts built-in |
| Red-zone alert | District polygon pulses opacity/scale | CSS keyframes |
| Notification | Slides in from top-right, auto-dismisses | Sonner |
| Loading skeleton | Shimmer moves left to right | CSS keyframes |

---

## 9. Icons

- Primary: **Lucide React** (consistent, clean, tree-shakeable)
- Fallback: Inline SVG for custom graph/map icons
- Rule: Icon-only buttons must have `aria-label`
- Size: 16px inline, 20px buttons, 24px section icons, 32px+ hero

---

## 10. Responsive Breakpoints

```
Breakpoint   │ Width      │ Layout Changes
─────────────┼────────────┼────────────────────────────────
Desktop      │ ≥1280px    │ Full shell — header + sidebar + workspace + context panel
Small Desktop│ ≥1024px    │ Sidebar collapses to icons only
Tablet       │ ≥768px     │ Context panel becomes overlay drawer
Mobile       │ <768px     │ Sidebar becomes bottom nav or hamburger, simplified cards
```

---

## 11. Dark Mode Only

ULTRON is **dark mode only**.

No light mode toggle. No theme switching.

Rationale:
- Command centers operate in low-light environments
- Dark mode reduces eye strain for analysts staring at screens
- Data visualization pops better on dark backgrounds
- Government intelligence tools are universally dark-themed

---

## 12. Browser QA Validation Checklist

Each phase's QA agent must verify:

- [ ] All colors match DESIGN_SYSTEM tokens (eyeball check on key pages)
- [ ] Typography uses correct fonts (Inter for UI, JetBrains Mono for data)
- [ ] Spacing is consistent (4px grid visible in layouts)
- [ ] Elevation matches surface tokens (no card without appropriate shadow)
- [ ] Glass cards use the exact glass formula from Section 5
- [ ] Animations use centralized timing tokens (no ad hoc durations)
- [ ] All icons are from Lucide (except custom SVG for graphs/maps)
- [ ] Responsive breakpoints match Section 10
- [ ] Dark mode only — no light mode elements visible

---

*This design system is the single source of truth for all visual decisions. Every component must conform to these tokens. Version 2.0 adds enforcement rules, frozen animation tokens, and a QA validation checklist for agent-execution compliance.*
