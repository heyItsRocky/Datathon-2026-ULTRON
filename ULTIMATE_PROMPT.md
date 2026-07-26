# 🚀 ULTIMATE PROMPT — ULTRON 3D Frontend for Google AI Studio

> **Use this prompt in Google AI Studio (Gemini 2.5 Pro) to generate the ENTIRE ULTRON frontend.**
> **Goal:** Generate a complete `frontend/` directory with React 19 + TypeScript + Tailwind CSS 4 + Vite.
> **Aesthetic:** Sci-fi command center meets military intelligence HQ — think *Minority Report × Batman's Gotham PD × Zero Hour*.

---

## YOUR TASK

Generate a **complete, production-ready React 19 + TypeScript + Tailwind CSS 4 + Vite** frontend for **ULTRON (Unified Law Enforcement Threat Response & Optimization Nexus)** — an AI-powered crime analytics platform for the **Karnataka State Police (SCRB)** for **Datathon 2026**.

The entire app must have:
- **3D Karnataka heatmap** with elevation, glow, pulse animations (React Three Fiber)
- **50+ pages** across Crime Track, Cyber Track, Maps, Network, Intel, Admin
- **Glass morphism** everywhere
- **Particle backgrounds** with neural connection lines
- **Absurdly smooth animations** on every interaction
- **Zero light mode** — this is a dark, futuristic command center ONLY

Do NOT hold back on visuals. Every pixel must scream "next level."

---

## BRAND IDENTITY & DESIGN TOKENS

### Color System

```css
/* ─── BACKGROUNDS ─── */
--bg-deep:       #03050a;     /* Deepest background */
--bg-primary:    #070b12;     /* Page background */
--bg-secondary:  #0c1320;     /* Section backgrounds */
--bg-surface:    #111b2e;     /* Cards, panels */
--bg-elevated:   #172240;     /* Modals, dropdowns */
--bg-glass:      rgba(17, 27, 46, 0.78);  /* Glass morphism */

/* ─── KSP GOLD - Primary Brand ─── */
--gold:          #f6c453;     /* Primary gold */
--gold-bright:   #ffd966;     /* Hover/bright gold */
--gold-dim:      #c49b2e;     /* Muted gold */
--gold-glow:     rgba(246, 196, 83, 0.30);
--gold-subtle:   rgba(246, 196, 83, 0.10);

/* ─── CRIME TRACK - Red Zone System ─── */
--red-critical:  #ff1744;     /* Critical alert */
--red-high:      #ff5252;     /* High alert */
--red-pulse:     rgba(255, 23, 68, 0.50);
--red-glow:      rgba(255, 23, 68, 0.20);

/* ─── THREAT LEVELS ─── */
--danger:        #ff1744;     /* Critical */
--warning:       #ff9100;     /* High */
--caution:       #ffd600;     /* Medium */
--safe:          #00e676;     /* Low/Safe */

/* ─── CYBER TRACK - Neon Cyberpunk ─── */
--cyan:          #00e5ff;     /* Primary cyber */
--cyan-glow:     rgba(0, 229, 255, 0.25);
--teal:          #1de9b6;     /* Safe cyber */
--magenta:       #e040fb;     /* Attack detected */

/* ─── INTEL TRACK ─── */
--violet:        #7c4dff;     /* Intelligence primary */
--lavender:      #b388ff;     /* Soft intel */
--purple-glow:   rgba(124, 77, 255, 0.20);

/* ─── TEXT ─── */
--text-primary:  #ebf0f7;
--text-secondary:#94a3b8;
--text-muted:    #64748b;
--text-gold:     #f6c453;

/* ─── BORDERS ─── */
--border-subtle:  rgba(255, 255, 255, 0.05);
--border-default: rgba(255, 255, 255, 0.10);
--border-strong:  rgba(255, 255, 255, 0.18);
--border-gold:    rgba(246, 196, 83, 0.25);
```

### Typography
```css
--font-display: 'Space Grotesk', sans-serif;   /* All headings, H1-H4 */
--font-body:    'Inter', sans-serif;            /* Body text, labels */
--font-mono:    'JetBrains Mono', monospace;    /* Data, IPs, codes, timestamps */
--font-kannada: 'Noto Sans Kannada', sans-serif;/* Kannada text fallback */
```

### Glass Card Recipe (USE FOR ALL CARDS)
```tsx
// Every card, panel, container uses this pattern
<div className="
  relative
  bg-gradient-to-br from-[rgba(17,27,46,0.80)] to-[rgba(7,11,18,0.60)]
  backdrop-blur-xl saturate-[1.5]
  border border-[rgba(255,255,255,0.06)]
  shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]
  rounded-xl
  transition-all duration-300
  hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]
  hover:border-[rgba(255,255,255,0.12)]
  hover:-translate-y-0.5
">
```

### Animation Philosophy
- **Every entrance:** stagger, fade-up, scale-in with `framer-motion`
- **Every hover:** lift + glow border + shadow intensify
- **Every click:** scale bounce (0.98 → 1.0)
- **Every number:** count-up animation with odometer roll
- **Every chart:** draw-on-mount with path animation
- **Every page:** 3D transition between routes (cube rotate or slide with perspective)
- **Every data change:** old fades out → new slides up with green flash
- **Duration:** fast = 150ms, base = 250ms, slow = 400ms, stagger = 80ms

---

## ═══════════════════════════════════════════════════════════════
## 🏆 THE CROWN JEWEL — 3D KARNATAKA HEATMAP (React Three Fiber)
## ═══════════════════════════════════════════════════════════════

This is the **most important component** in the entire app. It appears on the Command Center homepage as the HERO section. MUST be jaw-dropping.

### What It Is

A **fully interactive 3D extruded map of Karnataka** where every district is a 3D mesh that rises, falls, glows, and pulses based on live crime data. It's the first thing judges see — make it count.

### Technical Setup

```tsx
// File: features/command-center/KarnatakaMap3D.tsx
// Libraries: @react-three/fiber, @react-three/drei, three, geojson

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
```

### District 3D Mesh Specification

**Input:** `karnataka-districts.geojson` (FeatureCollection of 31 Karnataka districts + 1 for the state outline)

Each district becomes a 3D `ExtrudeGeometry` mesh:

```tsx
// DistrictMesh.tsx
// For each GeoJSON feature:
<mesh
  position={[centerX, centerY, elevation / 2]}
  onPointerMove={(e) => /* highlight */}
  onClick={(e) => /* drill down */}
>
  <extrudeGeometry
    args={[
      coordinates,  // District polygon from GeoJSON
      {
        depth: elevation,     // CRITICAL: height = f(crime_density)
        bevelSize: 0.02,
        bevelThickness: 0.02,
        bevelSegments: 3,
      }
    ]}
  />
  <meshPhysicalMaterial
    color={districtColor}      // See color mapping below
    emissive={districtColor}
    emissiveIntensity={0.15 + (crimeDensity / 100) * 0.4}
    metalness={0.1}
    roughness={0.6}
    transparent
    opacity={0.92}
  />
</mesh>
```

### Color Mapping Logic (CRITICAL — Get This Right)

```typescript
function getDistrictColor(crimeDensity: number, trend: 'rising' | 'stable' | 'falling', isRedZone: boolean): string {
  if (isRedZone) return '#ff1744'; // BRIGHT RED — crisis mode
  if (crimeDensity > 75) return '#ff1744';   // Red — critical
  if (crimeDensity > 50) return '#ff9100';   // Orange — high
  if (crimeDensity > 25) return '#ffd600';   // Yellow/Amber — medium
  return '#00e676';                            // Green — low/safe
  
  // The emissive intensity also scales with density:
  // emissiveIntensity = 0.1 + (crimeDensity / 100) * 0.5
  // At density 100, the district GLOWS like lava
}
```

### Elevation Mapping (Height = Crime Severity)

```typescript
function getElevation(density: number, severityScore: number): number {
  // Base elevation from crime density (0.2 to 2.0 units)
  const densityHeight = 0.2 + (density / 100) * 1.8;
  // Crime type severity multiplier
  const severityMultiplier = severityScore / 50; // 0.5 to 2.0
  return densityHeight * severityMultiplier;
}
```

### Visual Effects ON TOP of the 3D Map

#### 1. PARTICLE COLUMNS (Crime Hotspot Columns)
```tsx
// For each major hotspot, render a particle column rising from the district
function HotspotColumn({ lat, lng, crimeCount, crimeType }: HotspotColumnProps) {
  const particles = useMemo(() => {
    return Array.from({ length: Math.min(crimeCount, 100) }, (_, i) => ({
      position: [
        lng + (Math.random() - 0.5) * 0.05,    // Spread around center
        0.1 + Math.random() * (crimeCount / 20), // Random height
        lat + (Math.random() - 0.5) * 0.05,
      ],
      size: 0.02 + Math.random() * 0.04,
      speed: 0.5 + Math.random() * 1.5,
    }));
  }, [lat, lng, crimeCount]);

  return (
    <Points limit={particles.length}>
      <pointsMaterial
        size={0.03}
        color={crimeType === 'violent' ? '#ff1744' : crimeType === 'cyber' ? '#00e5ff' : '#ffd600'}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
      {particles.map((p, i) => (
        <Point key={i} position={p.position as [number, number, number]} />
      ))}
    </Points>
  );
}
```

#### 2. RED ZONE PULSING RINGS
```tsx
// Animated expanding ring around red-zone districts
function PulsingRing({ center, radius, intensity }: PulsingRingProps) {
  const ringRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 2) * 0.1 * intensity; // Pulse in/out
    const opacity = 0.3 + Math.sin(t * 2) * 0.15;         // Pulse opacity
    ringRef.current.scale.set(scale, scale, scale);
    // @ts-ignore
    ringRef.current.material.opacity = opacity;
  });

  return (
    <Ring
      ref={ringRef}
      position={[center[0], 0.05, center[1]]}
      rotation={[-Math.PI / 2, 0, 0]}
      args={[radius * 0.5, radius * 0.55, 32]}
    >
      <meshBasicMaterial
        color="#ff1744"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </Ring>
  );
}
```

#### 3. DISTRICT BORDER GLOW (Animated Dashed Borders)
```tsx
// Each district boundary has a glowing dashed line that animates
function DistrictBorder({ coordinates, color, speed }: DistrictBorderProps) {
  const lineRef = useRef<THREE.Line>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    // Animate dash offset to create flow effect
    lineRef.current.material.dashOffset = -t;
  });

  return (
    <Line
      ref={lineRef}
      points={coordinates}
      color={color}
      lineWidth={2}
      dashed
      dashSize={0.05}
      gapSize={0.1}
      transparent
      opacity={0.6}
    />
  );
}
```

#### 4. GROUND GRID — Holographic Floor
```tsx
// A circular grid under the map for holographic feel
<gridHelper
  args={[12, 24, '#00e5ff', '#1a237e']}
  position={[0, -0.1, 0]}
  opacity={0.15}
  transparent
/>
```

#### 5. AMBIENT DATA NODES (Floating Particles)
```tsx
// 300+ particles floating around the map with connection lines
function AmbientParticles() {
  const count = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;     // X spread
      pos[i * 3 + 1] = Math.random() * 8 + 0.5;    // Y height
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;  // Z spread
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#7c4dff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}
```

#### 6. MOUSE INTERACTION — Parallax + Click-to-Zoom
```typescript
// Camera auto-orbits slowly (0.01 rad/s)
// Mouse drag = manual orbit override (sticky, not reset)
// Scroll = zoom into hovered district
// Click district = smooth camera transition + open detail panel

// Hover effect:
// - District rises 0.1 units above neighbors
// - Label floats above district
// - Neighboring districts dim slightly (opacity 0.6)
// - Border glow intensifies

// Click effect:
// - Camera smoothly zooms to district center over 800ms
// - District elevates to max height
// - Detail panel slides in from left with district stats
// - Click "Back to Overview" or press Escape = camera zooms back out
```

#### 7. WEATHER/ATMOSPHERE — Cyberpunk Fog
```tsx
// Subtle fog at the edges of the 3D scene
<fog args={['#03050a', 8, 20]} attach="fog" />

// Hemisphere light for ambient
<hemisphereLight args={['#1a237e', '#03050a', 0.6]} />

// Point light above the center for dramatic shadows
<pointLight position={[0, 5, 0]} intensity={0.5} color="#f6c453" />
```

### Complete 3D Scene Composition

```tsx
export function KarnatakaMap3D() {
  return (
    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden">
      {/* Glass border overlay */}
      <div className="absolute inset-0 rounded-2xl border border-[rgba(255,255,255,0.08)] pointer-events-none z-10" />
      
      <Canvas
        camera={{ position: [0, 6, 10], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#03050a'); // Match background
        }}
      >
        {/* Atmosphere */}
        <fog args={['#03050a', 8, 20]} attach="fog" />
        <hemisphereLight args={['#1a237e', '#03050a', 0.6]} />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#f6c453" />
        
        {/* Ground */}
        <gridHelper args={[12, 24, '#00e5ff', '#1a237e']} position={[0, -0.1, 0]} opacity={0.15} transparent />
        
        {/* The actual map */}
        <group rotation={[-0.3, 0, 0]}>
          {/* District meshes */}
          {districts.map(d => (
            <DistrictMesh key={d.id} {...d} />
          ))}
          
          {/* District borders */}
          {districts.map(d => (
            <DistrictBorder key={`border-${d.id}`} {...d} />
          ))}
          
          {/* Hotspot particle columns */}
          {hotspots.map(h => (
            <HotspotColumn key={h.id} {...h} />
          ))}
          
          {/* Red zone pulsing rings */}
          {redZones.map(r => (
            <PulsingRing key={r.districtId} {...r} />
          ))}
          
          {/* Predictive zone overlays */}
          {predictiveZones.map(p => (
            <PredictiveGrid key={p.districtId} {...p} />
          ))}
        </group>
        
        {/* Ambient particles */}
        <AmbientParticles />
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={5}
          maxDistance={18}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* 3D Map Overlay UI */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="glass-card px-3 py-2 text-xs text-text-secondary">
          🖱️ Drag to orbit · Scroll to zoom · Click district
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 z-20 flex gap-3">
        <button className="glass-card px-3 py-2 text-xs hover:border-gold/30 transition-all">
          🔄 Auto-Rotate
        </button>
        <button className="glass-card px-3 py-2 text-xs hover:border-gold/30 transition-all">
          🎯 Reset View
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 glass-card px-4 py-3 text-xs space-y-1.5">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#ff1744]"></span> Critical (75-100)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#ff9100]"></span> High (50-75)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#ffd600]"></span> Medium (25-50)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#00e676]"></span> Low (0-25)</div>
      </div>
    </div>
  );
}
```

### District Detail Panel (Opens on Click)

```tsx
// Slides in from the LEFT on district click
// 380px wide, full height, glass morphism

┌──────────────────────────┐
│ Bengaluru Urban          │ ← District name with gold accent
│ ─────────────────────── │
│ Risk Level: CRITICAL    │ ← Color-coded badge
│ Trend: ▲ +12.4%         │ ← Red if rising, green if falling
│                          │
│ ┌─ Stats ──────────────┐│
│ │ Cases this month: 847 ││
│ │ Avg severity: 72/100  ││
│ │ Active alerts: 3      ││
│ │ Police stations: 24   ││
│ └──────────────────────┘│
│                          │
│ ┌─ Top Crime Types ────┐│
│ │ Theft       ████ 34% ││
│ │ Assault    ███  22%  ││
│ │ Burglary   ██   18%  ││
│ │ Cyber      █    12%  ││
│ │ Homicide   █     8%  ││
│ └──────────────────────┘│
│                          │
│ ┌─ 7-Day Trend ────────┐│
│ │ [Area chart with      ││
│ │  gradient fill]       ││
│ └──────────────────────┘│
│                          │
│ [View Full Report →]    │← Button with arrow animation
│ [Track in Map →]        │
└──────────────────────────┘
```

---

## ═══════════════════════════════════════════════════════════════
## AMBIENT BACKGROUND EFFECTS (Applied Site-Wide)
## ═══════════════════════════════════════════════════════════════

### Particle Network Background

```tsx
// File: shared/components/ParticleNetwork.tsx
// Uses HTML Canvas (NOT Three.js — keep it lightweight)

// Renders 100+ floating dots connected by lines when within distance
// Colors: mix of gold (#f6c453), cyan (#00e5ff), violet (#7c4dff)
// Opacity: 0.15-0.35 for dots, 0.05-0.15 for lines
// Movement: random drift at 0.1-0.3 px/frame
// Mouse interaction: particles nearest mouse cursor connect to it with gold lines
// Z-index: -1 (behind everything)

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 120; // pixels
const PARTICLE_SPEED = 0.3;
const COLORS = ['#f6c453', '#00e5ff', '#7c4dff'];

// Each particle:
// { x, y, vx, vy, radius: 0.5-1.5, color: random from COLORS }

// Animation loop: requestAnimationFrame
// 1. Clear canvas
// 2. Move all particles (bounce off edges with 50px padding)
// 3. Draw all particles as filled circles
// 4. For each pair within CONNECTION_DISTANCE, draw semi-transparent line
// 5. Find nearest particle to mouse and draw special gold connection
```

### Scan Line Overlay (CRT Effect)

```css
/* Subtle CRT scan lines at 8% opacity */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

### Page Transition Effect

```tsx
// Use framer-motion AnimatePresence for route transitions
// Each page enters with:
// - scale: 0.98 → 1.0
// - opacity: 0 → 1
// - rotateY: 2deg → 0deg
// - filter: blur(4px) → blur(0)
// Duration: 350ms, ease: [0.22, 1, 0.36, 1]

<motion.div
  initial={{ opacity: 0, scale: 0.98, rotateY: 2, filter: 'blur(4px)' }}
  animate={{ opacity: 1, scale: 1, rotateY: 0, filter: 'blur(0)' }}
  exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
>
  {children}
</motion.div>
```

---

## ═══════════════════════════════════════════════════════════════
## COMMAND CENTER HOMEPAGE (The Masterpiece)
## ═══════════════════════════════════════════════════════════════

```
┌──────────────────────────────────────────────────────────────────────┐
│ [KSP COMMAND BAR]  ULTRON v2.0  [🔍 Search] [🔔 3] [🤖 AI] [👤 AK] │
├──────────────────────────────────────────────────────────────────────┤
│ Dashboard  │  Crime  │  Cyber  │  Maps  │  Network  │  Intel  │ Admin │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │         🌟 3D KARNATAKA HEATMAP (Full hero section)         │   │
│  │         - 31 extruded districts with glow/pulse              │   │
│  │         - Particle columns rising from hotspots              │   │
│  │         - Red zone pulsing rings with animation              │   │
│  │         - Auto-rotate camera · Drag to orbit                 │   │
│  │         - Click district → zoom + detail panel              │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │Total │ │Active│ │Alerts│ │Cyber │ │Red   │ │ML    │             │
│  │Crimes│ │Cases │ │Today │ │Inc.  │ │Zones │ │Active│             │
│  │12,847│ │ 843  │ │  47  │ │ 128  │ │  6   │ │8/8   │             │
│  │ -2.3%│ │ +5.1%│ │ +12% │ │ -8%  │ │ ⚠️   │ │ ✅   │             │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                                      │
│  ┌────────────────────┐ ┌────────────────────┐ ┌──────────────────┐ │
│  │ Crime Trend        │ │ Cyber Threat       │ │ Red Zone         │ │
│  │ (Area Chart)       │ │ (Bar Chart)        │ │ Alerts (Live)    │ │
│  │                    │ │                    │ │                  │ │
│  │ 📈 30-day trend    │ │ 📊 Top attack types│ │ ⚠️ Bengaluru: +47%│ │
│  │ Gradient fill      │ │ Hover for details  │ │ ⚠️ Mysuru: +23%  │ │
│  │ 7d/30d/90d toggle  │ │                   │ │ ⚠️ Hubli: +18%   │ │
│  └────────────────────┘ └────────────────────┘ └──────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  🤖 AI Intelligence Brief — Auto-generated daily summary       │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                │   │
│  │  │Trend 1 │ │Trend 2 │ │Trend 3 │ │Trend 4 │                │   │
│  │  │Cyber ▲ │ │Theft ▲ │ │Assault │ │Burglary│                │   │
│  │  │+47%   │ │+23%   │ │▼ -5%   │ │-12%   │                │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### KPI Cards Detail

Each KPI card has:
- **Glass morphism** background with left color bar (gold/red/cyan/violet)
- **Icon** from lucide-react at 20px
- **Value** with count-up animation (useIntersectionObserver + requestAnimationFrame)
- **Label** in text-muted
- **Trend** badge: ▲ green / ▼ red with percentage
- **Sparkline** mini chart (15 data points, 80×24px canvas)
- **Hover:** card lifts 2px, border brightens, tooltip with extended info
- **Entrance:** stagger in from bottom, 80ms apart

### AI Intelligence Brief Carousel

```tsx
// 4 brief cards that auto-rotate every 8 seconds
// Click dots or swipe to navigate manually
// Each card:
// - Color-coded top bar (red/amber/cyan/violet)
// - Crime type icon
// - Title: "Cyber Fraud up 47% in Bengaluru Urban"
// - Brief description: 2 lines
// - Confidence score: "AI Confidence: 92%"
// - Arrow button → full intel page

// Auto-rotate pauses on hover
// Transition: slide left with fade
```

---

## ═══════════════════════════════════════════════════════════════
## SITE-WIDE COMPONENTS (Every single one)
## ═══════════════════════════════════════════════════════════════

### 1. KSP Command Bar (Top Navigation)

```
┌──────────────────────────────────────────────────────────────────┐
│ [🛡️ KSP]    ULTRON v2.0    [🔍 Search cases, criminals, IPs...]  │
│ ──────────────────────────────────────────────────────────────── │
│  🌐 Dashboard │ 🔴 Crime │ 🔵 Cyber │ 🗺️ Maps │ 🔗 Network │   │
│  💜 Intel │ 📊 Graph │ ⚙️ Admin                                 │
└──────────────────────────────────────────────────────────────────┘
```

- **Height:** 56px
- **Glass morphism:** full width, no border-radius (edge-to-edge)
- **Bottom border:** 1px with gold gradient glow
- **Left section:** KSP shield SVG icon + "ULTRON" in Space Grotesk + "v2.0" badge
- **Center:** Search bar (click or `Cmd+K` triggers command palette)
- **Right section:** Notification bell (animated count badge) + AI button (pulsing cyan) + Avatar
- **Nav links:** Horizontal with animated gold underline
  - Active link has text-gold + text-glow
  - Hover: text brightens + subtle background highlight
  - Underline slides between sections on click (300ms cubic-bezier)

### 2. Command Palette (`Cmd+K`)

```
┌────────────────────────────────────────────────┐
│  🔍 Search anything...                         │
│  ─────────────────────────────────────────────  │
│  Recent Searches:                               │
│  📁 Case #2026-0842 — Theft, Bengaluru        │
│  👤 Criminal: A. Sharma                       │
│  🌐 IP: 192.168.1.1                           │
│  ─────────────────────────────────────────────  │
│  Quick Commands:                                │
│  /crime     → Crime Dashboard [⌘1]             │
│  /cyber     → Cyber Dashboard [⌘2]             │
│  /maps      → Maps Overview   [⌘3]             │
│  /intel     → Intel Hub       [⌘4]             │
│  /admin     → Admin Panel     [⌘5]             │
│  ─────────────────────────────────────────────  │
│  🔥 Trending:  Bengaluru · Cyber · Hotspots    │
└────────────────────────────────────────────────┘
```

- **Trigger:** `Cmd+K` or click search bar
- **Backdrop:** rgba(3, 5, 10, 0.8) with blur(20px)
- **Animation:** scale 0.95→1.0 + opacity 0→1
- **Behavior:**
  - Fuzzy match across cases, criminals, IPs, domains, pages
  - Keyboard navigation (↑↓ arrows, Enter to select, Escape to close)
  - Shows recent searches on empty input
  - `@` prefix for people, `#` for cases, `/` for commands

### 3. Side Panel (Data Stream)

```
[📡]  ← Toggle button on right edge of screen

┌──────────────────────────┐
│ 📡 DATA STREAM           │
│ ─────────────────────── │
│                          │
│ [NEW] 🔴 Case #2026-0912│ ← New entries slide in
│   Theft · Koramangala    │    from top with flash
│   2 min ago              │
│                          │
│ [NEW] 🟡 Alert: Hubli   │
│   Crime spike detected   │
│   5 min ago              │
│                          │
│ [UPDATE] 🟢 Cyber Case  │
│   IP blacklisted         │
│   12 min ago             │
│                          │
│ ─────────────────────── │
│ 🟢 System: All 8 ML     │
│    models operational   │
│ 🔵 API: 234ms latency   │
│ 🟡 Memory: 67% used     │
└──────────────────────────┘
```

- **Width:** 320px when open
- **Toggle:** Icon button on right edge with animated arrow (rotates on toggle)
- **Transition:** slides from right, 300ms cubic-bezier
- **Content:** live-updating feed of system events
- **Auto-scroll:** newest at top, old fades toward bottom
- **Severity color bar:** left edge of each entry

### 4. Notification System

```tsx
// Use sonner for all toasts
// Positions: bottom-right
// Dark theme
// Rich colors

toast.success('Case updated successfully');
toast.error('Failed to fetch crime data', {
  action: { label: 'Retry', onClick: () => refetch() },
});
toast.warning('Anomaly detected in Bengaluru Urban', {
  duration: 10000, // Persistent for warnings
});
toast.info('New intelligence brief available');

// Toast styles:
// Success: green left bar + checkmark
// Error: red left bar + X + optional Retry button
// Warning: amber left bar + triangle + persistent
// Info: blue left bar + "i"
```

### 5. Loading States

```
┌─────────────────────┐
│ ████████████░░░░░░  │ ← Shimmer loading bar for page-level
│ ┌─────────────────┐ │
│ │ [SKELETON CARD] │ │ ← Matching card shape + shimmer
│ │ ████ ████ ████  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ [SKELETON CHART]│ │ ← Chart shape with animated waves
│ └─────────────────┘ │
└─────────────────────┘
```

- **Page load:** Skeleton matching each section's exact layout
- **Table load:** 5 rows of shimmering text lines
- **Chart load:** Pulsing outline of chart shape
- **Card load:** Card outline with shimmer sweep
- **Data refresh:** Old content dims → spinner appears → new content fades in

### 6. Empty States

```tsx
// EVERY list/table/graph MUST have an empty state

// Pattern:
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-24 h-24 mb-4 opacity-20">
    {/* Animated SVG illustration */}
  </div>
  <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
    No cases found
  </h3>
  <p className="text-sm text-text-muted max-w-sm">
    No cases match your current filters. Try adjusting the time range or district filter.
  </p>
  <button className="mt-4 text-sm text-gold hover:text-gold-bright transition-colors">
    Clear all filters →
  </button>
</div>

// Specific empty states:
// Cases:    magnifying glass with question mark
// Criminals: silhouette with "?" 
// Alerts:   green shield with checkmark "All Clear"
// Search:   animated searching robot
// Chat AI:  "Ask me anything about crime in Karnataka"
```

### 7. Error States

```tsx
// API Error (caught by TanStack Query):
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-16 h-16 mb-4 text-red-critical">
    <AlertTriangle size={64} />
  </div>
  <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
    Failed to load data
  </h3>
  <p className="text-sm text-text-muted mb-4">
    {error.message || 'An unexpected error occurred'}
  </p>
  <button
    onClick={() => refetch()}
    className="px-4 py-2 bg-red-critical/10 border border-red-critical/30 rounded-lg
               text-red-critical text-sm hover:bg-red-critical/20 transition-all"
  >
    🔄 Retry
  </button>
</div>

// Network Offline:
<div className="fixed top-0 left-0 right-0 z-[9999] bg-warning/90 backdrop-blur-md
                text-white text-center py-2 text-sm font-medium">
  🌐 Connection lost — showing cached data. Auto-reconnecting...
</div>

// Component Crash (Error Boundary):
<div className="flex flex-col items-center justify-center py-16">
  <h3>Something went wrong</h3>
  <button onClick={() => window.location.reload()}>Reload page</button>
</div>
```

---

## ═══════════════════════════════════════════════════════════════
## PAGE SPECIFICATIONS (All 50+ pages)
## ═══════════════════════════════════════════════════════════════

### DASHBOARD PAGES

#### Unified Dashboard (`/dashboard`)
```
┌──────────────────────────────────────────────────────────────────┐
│ Unified Dashboard                          [7D] [30D] [90D] [1Y] │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │Total │ │Active│ │Closed│ │Conv. │ │Avg   │ │Clear-│          │
│ │Cases │ │Cases │ │Cases │ │Rate  │ │Resp. │ │ance %│          │
│ │12,847│ │ 843  │ │11,284│ │87.9% │ │4.2m  │ │72.3% │          │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
│ ┌─────────────────────────┐ ┌─────────────────────────────────┐ │
│ │ Cases Over Time         │ │ Cases by Type (Donut)           │ │
│ │ [AreaChart with         │ │ [PieChart with center total]     │ │
│ │  gradient fill]         │ │  - Theft 34%                    │ │
│ │  x: date, y: count      │ │  - Assault 22%                  │ │
│ │  3 series: Violent/      │ │  - Burglary 18%                 │ │
│ │  Property/Cyber          │ │  - Cyber 12%                    │ │
│ └─────────────────────────┘ └─────────────────────────────────┘ │
│ ┌─────────────────────────┐ ┌─────────────────────────────────┐ │
│ │ Top Districts           │ │ Recent Cases (table)            │ │
│ │ [HorizontalBarChart]    │ │ FIR# │ Type │ District │ Status │ │
│ │ - Bengaluru: 2,847     │ │ ...  │ ...  │ ...      │ ...   │ │
│ │ - Mysuru: 1,234        │ │ Paginated, sortable             │ │
│ │ - Hubli: 987           │ └─────────────────────────────────┘ │
│ └─────────────────────────┘                                     │
└──────────────────────────────────────────────────────────────────┘
```

#### Alerts Page (`/dashboard/alerts`)
- **3 sections:** Critical Alerts, Warnings, Info
- Each alert: severity bar, timestamp, district, type, description, action button
- **Filter:** by severity, district, crime type, date range
- **Mark as read:** individual + "Mark all read"
- **Real-time:** new alerts slide in from top with flash animation
- **Empty:** green shield "No active alerts — all clear"

#### Reports Page (`/dashboard/reports`)
- Grid of report cards with download buttons
- Reports: "Monthly Crime Summary", "District Comparison", "Trend Analysis", etc.
- Each: title, description, date generated, format badge (PDF/CSV/PNG), download button
- Generate new report modal with date range, district, crime type selectors

---

### CRIME TRACK PAGES (9 pages)

#### Crime Overview (`/crime`)
```
┌──────────────────────────────────────────────────────────────────┐
│ Crime Analytics Center                  [7D] [30D] [90D] [1Y]   │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                            │
│ │Total │ │Active│ │Closed│ │Clear-│                            │
│ │Cases │ │Cases │ │Cases │ │ance  │                            │
│ │12,847│ │ 843  │ │11,284│ │72.3% │                            │
│ └──────┘ └──────┘ └──────┘ └──────┘                            │
│ ┌──────────────────────┐ ┌──────────────────────┐               │
│ │ Crime by Type        │ │ Crime by District    │               │
│ │ [Donut Chart]        │ │ [Horizontal Bar]     │               │
│ │ Click segment =      │ │ Top 10 districts     │               │
│ │ filter page          │ │ Color = severity     │               │
│ └──────────────────────┘ └──────────────────────┘               │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ District Table — sortable, searchable, paginated             ││
│ │ # │ District │ Cases │ Clearance │ Trend │ Severity │ Action ││
│ │ 1 │ Bengaluru│ 2,847 │ 68%       │ ▲+5%  │ 🔴 High  │ View  ││
│ │ 2 │ Mysuru   │ 1,234 │ 74%       │ ▲+2%  │ 🟡 Med   │ View  ││
│ └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

**Table column details:**
- **Trend column:** sparkline (15px × 40px mini chart) + percentage text
- **Severity column:** colored badge with subtle glow matching severity color
- **Action column:** "View Details" button → navigates to district map page
- **Search:** debounced input at top, filters by district name
- **Pagination:** "Showing 1-10 of 847" with prev/next + page numbers

#### Crime Trends (`/crime/trends`)
- **Dual chart layout:**
  - Top: Large area chart — 12 months of crime data, toggle individual crime types
  - Bottom: Heatmap calendar (GitHub contribution style) showing crime count per day
- **Controls:** Date range picker, crime type multi-select, district multi-select
- **Download:** Export chart as PNG, export data as CSV
- **Annotations:** Click data point to add annotation note

#### Crime Hotspots (`/crime/hotspots`)
- **Full-screen interactive map** (2D Leaflet + 3D overlay toggle)
- **Layer controls:**
  - 🗺️ Base: Dark monochrome (CartoDB dark_matter)
  - 🔥 Heatmap: Thermal overlay (Leaflet.heat)
  - 🔴 DBSCAN clusters: Animated circles with density number
  - 🚨 Red zones: Pulsing district polygons
  - 📊 Predictive: Semi-transparent risk grid
  - 👤 Socio-economic: Toggle literacy/poverty/density
- **Time slider:** Animate through dates, video-style play/pause
- **Cluster panel:** Click cluster → slide panel with: center, radius, density, crime types, peak hours, top criminals, "View Cases" button
- **Mini-map:** Corner inset showing overview
- **Controls:** Zoom, fullscreen, draw tools, measure tool

#### Crime Cases (`/crime/cases`) + Case Detail (`/crime/cases/:caseId`)
```
┌──────────────────────────────────────────────────────────────────┐
│ Crime Cases                    [🔍 Search] [Filter] [New Case+] │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Table: FIR# │ Type │ District │ Date │ Status │ Severity │  ││
│ │ Paginated, sortable by any column                            ││
│ │ Row hover: highlight with gold left border                   ││
│ │ Row click: → case detail                                     ││
│ └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Case #2026-0842                            [Edit] [Export] […]  │
│ ────────────────────────────────────────────────────────────────│
│ Type: Theft  |  Severity: 🔴 High  |  Status: Under Investigation│
│ District: Bengaluru Urban  |  Date: 2026-06-25  |  FIR: 0842/26│
│ ┌────────────────────┐ ┌────────────────────┐ ┌───────────────┐ │
│ │ Victim Details     │ │ Accused Details    │ │ Evidence       │ │
│ │ Name, Age, Address │ │ Name, Age, MO,     │ │ List of files  │ │
│ │                    │ │ priors, photo      │ │ with download  │ │
│ └────────────────────┘ └────────────────────┘ └───────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ [Leaflet Map showing crime location with marker]             ││
│ └──────────────────────────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Timeline: FIR → Investigation → Arrest → Court → Verdict     ││
│ │ Horizontal timeline with status dots and dates               ││
│ └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

#### Criminals List (`/crime/criminals`) + Detail (`/crime/criminals/:criminalId`)
- **Table:** Name, age, type, risk score (colored bar), priors, status, last seen, action
- **Risk score column:** Animated progress bar (green → amber → red) with numeric value
- **Criminal Detail:** Full profile with:
  - Header: photo placeholder, name, alias, risk meter (semi-circular gauge)
  - Stats cards: total crimes, active warrants, connections, MO matches
  - Case history: timeline of linked cases
  - Network graph: connected criminals, associates (Cytoscape mini-graph)
  - MO signature: text analysis + similar criminals

#### Crime Patterns (`/crime/patterns`) + Predictive (`/crime/predictive`)
- **Patterns:** MO cluster analysis, crime type correlation matrix
- **Predictive:** Risk forecast charts, "Next 30 days" predicted hotspots, ML confidence scores

---

### CYBER TRACK PAGES (10 pages)

#### Cyber Overview (`/cyber`)
```
┌──────────────────────────────────────────────────────────────────┐
│ Cyber Threat Command Center                    [24h][7d][30d]   │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐              │
│ │Inc.  │ │Active│ │IPs   │ │Domain│ │Phishing  │              │
│ │Today │ │Cases │ │Black │ │Block │ │Campaigns │              │
│ │  47  │ │ 128  │ │2,341 │ │  89  │ │   12     │              │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘              │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Cyber Threat Timeline — horizontal timeline                │ │
│ │ [●]──[●]──[●]────[●]──[●]──[●]──[●]──[●]────[●]──[●]    │ │
│ │ Dots sized by severity, colored by type                    │ │
│ │ Hover: tooltip with type, target, timestamp, severity      │ │
│ │ Click: → threat detail                                     │ │
│ └────────────────────────────────────────────────────────────┘ │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────────┐   │
│ │ Top Vectors    │ │ Top Targets    │ │ Threat Actor Map   │   │
│ │ [Bar Chart]    │ │ [Pie Chart]    │ │ [3D Globe]         │   │
│ └────────────────┘ └────────────────┘ └────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

#### Cyber Threats (`/cyber/threats`) + Detail (`/cyber/cases/:caseId`)
- **Table:** ID, type, severity, source IP, target, date, status, action
- **Detail page:** Full threat report with:
  - Header: type badge, severity glow, status, timestamp
  - IOCs list: IP, domains, hashes with copy button
  - Attack path graph (Cytoscape): source → intermediary → target
  - Timeline of events
  - MITRE ATT&CK mapping (tactic + technique with links to MITRE site)

#### IP Intelligence (`/cyber/ip/:ip`)
```
┌──────────────────────────────────────────────────────────────────┐
│ IP Intelligence: 192.168.1.1                   [🔍 New IP]      │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [Mini 3D Globe centered on IP geolocation]                   │ │
│ │ Location: Bengaluru, KA, IN  |  ISP: Airtel Broadband       │ │
│ │ Reputation: ████████████░░ 78/100 — 🟡 Suspicious            │ │
│ │ First Seen: Jan 15, 2026  |  Last Active: 2 min ago         │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐  │
│ │ WHOIS        │ │ DNS Records  │ │ Linked Incidents (3)     │  │
│ │ Org:...      │ │ A → x.x.x.x │ │ #CYB-045 — Phishing     │  │
│ │ Reg:...      │ │ MX → mail.. │ │ #CYB-032 — Malware      │  │
│ │ Created:...  │ │ NS → ns..   │ │ #CYB-089 — DDoS         │  │
│ └──────────────┘ └──────────────┘ └──────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [Attack Path Graph] — Source IP → Compromised Host → Victim  │ │
│ │ Nodes glow on hover, edges animate with data flow particles  │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

#### Domain Intelligence (`/cyber/domain/:domain`)
- Similar layout to IP but for domains
- Sections: WHOIS, SSL cert, DNS records, phishing score, screenshots
- **Phishing score:** Large gauge (0-100) with color zones

#### Network Flow (`/cyber/flows`)
- Cytoscape.js graph of network connections
- **Layout:** Hierarchical (top → bottom: External → Internal → Victim)
- **Node colors:** IP (cyan), Domain (orange), Victim (red)
- **Edge colors:** Normal (green), Suspicious (amber), Malicious (red)
- **Search:** Find specific IP/domain in graph
- **Timeline slider:** Watch connections form over time

#### Fraud Analytics (`/cyber/fraud-analytics`)
- Fraud trend chart, top fraud types, amount lost over time
- Geographic distribution of fraud cases (map with circles sized by loss)

#### Digital Evidence (`/cyber/digital-evidence`)
- Grid of evidence cards: filename, type, size, date, case link, download button
- Upload button → drag-and-drop modal
- Evidence viewer: image preview, text preview, hex viewer for binaries

#### Cyber Heatmap (`/cyber/heatmap`)
- Leaflet map with cyber incident density as heatmap overlay
- Filter by threat type, date range, severity
- Click to see incident list in that area

---

### MAP PAGES (6 pages)

#### Maps Overview (`/maps`)
- Grid of 6 map type cards, each with:
  - Mini preview (small Leaflet instance)
  - Title, short description
  - "Explore →" button

#### Hotspot Map (`/maps/hotspots`)
- **Full Leaflet map** with ALL layers:
  - DBSCAN clusters (animated circles with density labels)
  - Heatmap overlay
  - Crime pins (color-coded by type, clustered at zoom)
  - Red zone polygons (pulsing)
  - Predictive risk grid
  - Socio-economic overlay toggle
- **Map controls:** Top-right slide panel with checkboxes
- **Time animation:** Play button to animate crime appearance over time
- **Draw tools:** Polygon, circle, marker, measure (for investigators)

#### Patrol Map (`/maps/patrol`)
- Police station locations (badge markers)
- Patrol route overlays (animated dashed lines)
- Coverage heatmap (how well each area is covered)
- Response time overlay (contour lines)

#### Geo-Fence Map (`/maps/geofences`)
- Animated geo-fence boundaries (colored polygons)
- Alert zones with pulsing borders
- Add new geo-fence: draw polygon with tool

#### District Map (`/maps/districts/:districtId`)
- Deep-dive into one district
- Ward-level boundary overlay
- Crime dot density (each dot = 1 crime)
- Police station markers with coverage radius
- Stats panel: population, area, police count, crime rate, literacy

#### Route Analysis (`/maps/routes`)
- Crime route prediction
- Animated flow lines between connected locations
- Heatmap of common crime corridors

---

### NETWORK / LINK ANALYSIS PAGES (6 pages)

#### Network Overview (`/network`)
```
┌──────────────────────────────────────────────────────────────────┐
│ Network Analysis Center                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│ │Total Entities│ │ Connections  │ │Clusters Found│              │
│ │   2,847      │ │   12,341     │ │     47       │              │
│ └──────────────┘ └──────────────┘ └──────────────┘              │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │           [Full-screen Cytoscape.js Graph]                    ││
│ │  ○ Suspect  ◇ Location  ▢ Case  △ IP  ⬡ Device              ││
│ │  Edges: thickness = relationship strength                     ││
│ │  Colors: red=violent, amber=property, cyan=cyber             ││
│ │  Physics: force-directed, drag to reposition, scroll to zoom ││
│ │  Hover: highlight node + connected edges                     ││
│ │  Double-click: expand node connections                       ││
│ │  Right-click: context menu                                   ││
│ └──────────────────────────────────────────────────────────────┘│
│ ┌─── Filters ─────────────────────────────────────────────┐    │
│ │ [Entity Type ▼] [Min Strength ▼] [Time Range ▼] [Apply] │    │
│ └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

#### Link Analysis (`/network/link-analysis`)
- Full Cytoscape graph with entity exploration
- Left panel: search + filter controls
- Right panel: detail on click (entity info)

#### Entity Explorer (`/network/entities`)
- Searchable entity database
- Each entity card: icon, name, type, connection count, risk score
- Click → highlight in graph

#### Network Clusters (`/network/clusters`)
- List of detected clusters (community detection)
- Each cluster: size, top entities, crime types, risk score
- Click → focus graph on that cluster

#### Suspect Profile (`/network/suspects/:suspectId`)
- Full suspect dossier
- Personal info, criminal history, known associates graph, timeline, MO analysis

#### Association Matrix (`/network/association-matrix`)
- Heatmap matrix: rows & columns = entities
- Cell color = association strength (white → dark red)
- Click cell → show connection details
- Search to filter/reorder

---

### INTEL GRAPH PAGES (React Flow) (4 pages)

#### Intel Graph Workspace (`/intel-graph`)
```
┌──────────────────────────────────────────────────────────────────┐
│ Intel Graph — Case Relationship Builder        [Export JSON]    │
│ ┌── Toolbar ──┐ ┌────────────────────────────────────────────┐  │
│ │ ➕ Person   │ │                                            │  │
│ │ ➕ Place    │ │      [React Flow Canvas]                    │  │
│ │ ➕ Object   │ │                                            │  │
│ │ ➕ IP       │ │   Drag nodes from toolbar onto canvas       │  │
│ │ ➕ Event    │ │   Connect nodes by dragging between handles │  │
│ │ ➕ Motive   │ │   Double-click node to edit label          │  │
│ │ ➕ Result   │ │   Right-click for context menu             │  │
│ │             │ │                                            │  │
│ │ [Auto Layout│ │   ┌──────────┐                             │  │
│ │ [Clear All] │ │   │ Person   │──►┌──────────┐             │  │
│ └─────────────┘ │   │ A.Sharma │   │ Place    │             │  │
│                  │   └──────────┘   │ MG Road  │             │  │
│ ┌─ Node Colors┐ │                  └──────────┘             │  │
│ │ 🔴 Person   │ │                                            │  │
│ │ 🟢 Place    │ │   [Mini-map in bottom-right]               │  │
│ │ 🟠 Object   │ │   [Snap-to-grid background]                │  │
│ │ 🔵 IP       │ └────────────────────────────────────────────┘  │
│ │ 🟣 Event    │                                                 │
│ │ 🩷 Motive   │                                                 │
│ │ 🟡 Result   │                                                 │
│ └────────────┘                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**7 Node Types (Visual Design):**
| Type | Shape | Color | Icon | Fields |
|------|-------|-------|------|--------|
| **Person** | Circle | `#ff1744` | 👤 | Name, alias, DOB, photo |
| **Place** | Diamond | `#00e676` | 📍 | Address, lat/lng, type |
| **Object** | Square | `#ff9100` | 📦 | Item, desc, evidence# |
| **IP** | Hexagon | `#00e5ff` | 🌐 | IP, location, reputation |
| **Event** | Triangle (up) | `#e040fb` | ⚡ | Action, timestamp, desc |
| **Motive** | Triangle (down) | `#ff4081` | ❓ | Theory, evidence |
| **Result** | Rounded rect | `#ffd600` | 🎯 | Outcome, impact |

#### Graph Builder (`/intel-graph/builder`)
- Same workspace but starts with empty canvas
- "Start from template" dropdown: Burglary, Cyber Attack, etc.

#### Graph Search (`/intel-graph/search`)
- Full-text search across all saved graphs
- Results show graph preview + match highlights

#### Graph Timeline (`/intel-graph/timeline`)
- Timeline view of graph events
- Nodes placed on timeline based on date
- Play animation to watch graph build over time

---

### INTELLIGENCE HUB PAGES (6 pages)

#### Intel Hub (`/intel`)
```
┌──────────────────────────────────────────────────────────────────┐
│ Strategic Intelligence Hub          [Last updated: 2 min ago] 🔄 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │Intel     │ │High Conf.│ │Active    │ │Predictive│            │
│ │Reports   │ │Predicts  │ │Watchlists│ │Zones     │            │
│ │1,247     │ │   23     │ │   12     │ │    8     │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Predictive Risk Heatmap                                       ││
│ │ [Same 3D Karnataka map but showing PREDICTED risk, not real]  ││
│ │ Districts rise based on ML prediction of NEXT 30 DAYS         ││
│ │ Colors: green → amber → red based on risk score               ││
│ │ Hover: district + predicted score + top predicted crime      ││
│ └──────────────────────────────────────────────────────────────┘│
│ ┌────────────────────┐ ┌────────────────────┐ ┌───────────────┐ │
│ │ Socio-Economic     │ │ Emerging Trends    │ │ Top Signals   │ │
│ │ Correlation        │ │ [Ranked list]      │ │ [Alert cards] │ │
│ │ Scatter plot       │ │ 1. Cyber +47%     │ │               │ │
│ │ X: Poverty Index   │ │ 2. Theft +23%     │ │               │ │
│ │ Y: Crime Rate      │ │ 3. Assault -5%    │ │               │ │
│ │ Hover: district    │ │ Each: district, % │ │               │ │
│ └────────────────────┘ └────────────────────┘ └───────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

#### Briefings (`/intel/briefings`)
- Full intelligence briefs
- Each brief: title, date, severity, summary, affected districts, related cases
- Auto-generated by AI (from mock data)
- Download as PDF

#### Intel Reports (`/intel/reports`)
- List of generated reports
- Filters: date range, type, status
- Each: title, type, date, status, download button

#### Watchlists (`/intel/watchlists`)
- Watchlists: "High Risk Criminals", "Emerging Cyber Threats", etc.
- Each watchlist: name, item count, last updated, "View" button
- Items within: entity name, type, risk score, reason, date added

#### Signals (`/intel/signals`)
- Real-time intelligence signals
- Cards: signal type, confidence, source, description, timestamp
- Filter by confidence, type, source

#### Strategic Forecast (`/intel/forecast`)
- 30/60/90 day crime forecast
- Charts: predicted crime volume, predicted hotspot locations, resource recommendations
- Confidence intervals shown as shaded areas on charts

---

### ADMIN PAGES (7 pages)

Polished admin interface with glass morphism:
- **Admin Overview:** System health gauges (CPU, memory, API, DB), active users, storage, audit count
- **User Management:** Table with avatar, name, email, role, status, last login, actions
- **Role Permissions:** Permission matrix with toggle switches, grouped by module
- **Data Ingestion:** Drag-drop file upload with multi-file support, progress bars, ingestion history
- **Data Quality:** Completeness %, accuracy %, timeliness % — radar chart, missing fields table
- **Audit Log:** Filterable timeline with user, action, resource, timestamp, details expandable
- **System Health:** Real-time gauges, uptime, version, service status cards

---

### LOGIN PAGE (`/login`)
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    🛡️ ULTRON v2.0                             │
│         Unified Law Enforcement Threat Response              │
│                                                              │
│  ┌──────────────────────────────────────┐                    │
│  │                                      │                    │
│  │         Sign In to ULTRON            │                    │
│  │                                      │                    │
│  │  ┌────────────────────────────────┐  │                    │
│  │  │ 📧 Email or Employee ID       │  │                    │
│  │  └────────────────────────────────┘  │                    │
│  │  ┌────────────────────────────────┐  │                    │
│  │  │ 🔒 Password                    │  │                    │
│  │  └────────────────────────────────┘  │                    │
│  │                                      │                    │
│  │  ┌────────────────────────────────┐  │                    │
│  │  │         Sign In →              │  │                    │
│  │  └────────────────────────────────┘  │                    │
│  │                                      │                    │
│  │  [Forgot password?]                  │                    │
│  │                                      │                    │
│  │  ──── or continue with ────         │                    │
│  │  [G] [Z] [GH]                       │                    │
│  │                                      │                    │
│  └──────────────────────────────────────┘                    │
│                                                              │
│  KARNATAKA STATE POLICE · CONFIDENTIAL                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- **Full viewport height**, centered card
- **Background:** dark with particle network animation
- **KSP logo** at top, animated glow
- **Form:** glass card with inputs, focus states with gold border
- **Social buttons:** Google, Zoho, GitHub (from Catalyst Auth)
- **Footer:** "KARNATAKA STATE POLICE · CONFIDENTIAL"

---

### 404 Page (`*`)
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│                     ⚠️ 404 — CASE NOT FOUND                  │
│                                                              │
│         The case you're looking for doesn't exist.          │
│                   It may have been classified.               │
│                                                              │
│              [🔍 Search for something else]                  │
│                    [🏠 Return to HQ]                         │
│                                                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- Animated searching flashlight effect
- Particle network background

---

## ═══════════════════════════════════════════════════════════════
## TECHNICAL IMPLEMENTATION
## ═══════════════════════════════════════════════════════════════

### Required Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router-dom": "^7.18.0",
    "@tanstack/react-query": "^5.101.1",
    "zustand": "^5.0.14",
    "axios": "^1.18.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.6.0",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^1.21.0",
    "sonner": "^2.0.7",
    
    "framer-motion": "^12.x",
    "@react-three/fiber": "^9.x",
    "@react-three/drei": "^10.x",
    "three": "^0.175.x",
    
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0",
    "@types/leaflet": "^1.9.21",
    "leaflet.heat": "^0.2.0",
    
    "cytoscape": "^3.34.0",
    "react-cytoscapejs": "^2.0.0",
    "@xyflow/react": "^12.11.1",
    
    "recharts": "^3.9.0",
    
    "@radix-ui/react-dialog": "^1.1.17",
    "@radix-ui/react-select": "^2.3.1",
    "@radix-ui/react-dropdown-menu": "^2.1.18",
    "@radix-ui/react-tabs": "^1.1.15",
    
    "geojson": "^0.5.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "tailwindcss": "^4.3.1",
    "@tailwindcss/postcss": "^4.3.1",
    "vite": "^7.2.7",
    "@vitejs/plugin-react": "^5.1.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@types/cytoscape": "^3.21.9",
    "@types/three": "^0.175.x"
  }
}
```

### Complete File Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
├── .env                            # VITE_MOCK_MODE=true
│
├── public/
│   └── data/
│       ├── karnataka-districts.geojson  # 31 districts + state outline
│       ├── crime_records.csv
│       └── cyber_incidents.csv
│
└── src/
    ├── main.tsx                    # Entry point, providers
    ├── App.tsx                     # Router + Providers
    ├── globals.css                 # Tailwind + CSS variables + animations
    │
    ├── router/
    │   ├── AppRoutes.tsx           # All routes, lazy loading
    │   ├── routes.tsx              # Route definitions (50+)
    │   └── ProtectedRoute.tsx      # Auth wrapper
    │
    ├── stores/
    │   ├── authStore.ts
    │   ├── uiStore.ts              # Sidebar, palette, theme
    │   ├── filterStore.ts          # Global filters (time, district, type)
    │   └── navStore.ts             # Navigation history, active section
    │
    ├── shared/
    │   ├── api/
    │   │   ├── client.ts           # Axios with mock/real switching
    │   │   ├── mock/               # Mock JSON for all endpoints
    │   │   └── dto-adapters/       # Response → frontend type mappers
    │   ├── components/
    │   │   ├── GlassCard.tsx        # Reusable glass card
    │   │   ├── KpiCard.tsx          # KPI with count-up, sparkline
    │   │   ├── LoadingSkeleton.tsx   # Shimmer skeleton
    │   │   ├── ErrorBoundary.tsx    # Error boundary
    │   │   ├── EmptyState.tsx       # Animated empty states
    │   │   ├── Badge.tsx            # Severity/status badges
    │   │   ├── DataTable.tsx        # Sort, filter, paginate
    │   │   ├── Pagination.tsx
    │   │   ├── SearchInput.tsx      # Debounced search
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── StatusDot.tsx        # Pulsing status indicator
    │   │   └── ParticleNetwork.tsx  # Canvas particle background
    │   ├── layout/
    │   │   ├── AppShell.tsx         # Main layout shell
    │   │   ├── CommandBar.tsx       # Top nav bar
    │   │   ├── SidePanel.tsx        # Right data stream
    │   │   └── CommandPalette.tsx   # Cmd+K overlay
    │   └── ui-kit/
    │       ├── Button.tsx
    │       ├── Input.tsx
    │       ├── Select.tsx
    │       ├── Modal.tsx
    │       ├── Dropdown.tsx
    │       ├── Tabs.tsx
    │       └── Tooltip.tsx
    │
    ├── features/
    │   ├── command-center/
    │   │   ├── KarnatakaMap3D.tsx       # MAIN: 3D heatmap scene
    │   │   ├── DistrictMesh.tsx         # Single district 3D
    │   │   ├── DistrictBorder.tsx       # Animated borders
    │   │   ├── HotspotColumn.tsx        # Particle columns
    │   │   ├── PulsingRing.tsx          # Red zone rings
    │   │   ├── AmbientParticles.tsx     # Floating particles
    │   │   ├── PredictiveGrid.tsx       # ML prediction overlay
    │   │   └── DistrictDetailPanel.tsx  # Click detail panel
    │   ├── crime/
    │   │   ├── CrimeStatsGrid.tsx
    │   │   ├── CrimeTypeChart.tsx       # Donut
    │   │   ├── CrimeTrendChart.tsx      # Area
    │   │   ├── DistrictTable.tsx
    │   │   ├── HotspotMap.tsx           # Leaflet + heatmap
    │   │   ├── ClusterPanel.tsx         # DBSCAN popup
    │   │   ├── RedZoneOverlay.tsx       # Pulsing polygons
    │   │   ├── CrimeTimeline.tsx
    │   │   ├── CrimeCaseCard.tsx
    │   │   └── CriminalProfile.tsx
    │   ├── cyber/
    │   │   ├── CyberStatsGrid.tsx
    │   │   ├── ThreatTimeline.tsx
    │   │   ├── IpReport.tsx
    │   │   ├── DomainReport.tsx
    │   │   ├── AttackPathGraph.tsx      # Cytoscape
    │   │   └── MiniGlobe.tsx            # Three.js mini globe
    │   ├── maps/
    │   │   ├── MapControls.tsx          # Layer toggles, time slider
    │   │   ├── MapLegend.tsx
    │   │   └── DrawTools.tsx
    │   ├── network/
    │   │   ├── NetworkGraph.tsx          # Cytoscape wrapper
    │   │   ├── NodeDetail.tsx
    │   │   └── GraphControls.tsx
    │   ├── intel-graph/
    │   │   ├── GraphCanvas.tsx           # React Flow wrapper
    │   │   ├── NodePalette.tsx           # Toolbar of node types
    │   │   └── MiniMap.tsx
    │   ├── intelligence/
    │   │   ├── IntelBriefCard.tsx
    │   │   ├── PredictiveHeatmap.tsx     # 3D for intel
    │   │   └── CorrelationChart.tsx
    │   └── admin/
    │       ├── SystemHealthGauge.tsx     # SVG gauge
    │       └── PermissionMatrix.tsx
    │
    ├── pages/
    │   ├── CommandCenterPage.tsx
    │   ├── LoginPage.tsx
    │   ├── NotFoundPage.tsx
    │   ├── dashboard/
    │   │   ├── UnifiedDashboardPage.tsx
    │   │   ├── AlertsPage.tsx
    │   │   └── ReportsPage.tsx
    │   ├── crime/
    │   │   ├── CrimeOverviewPage.tsx
    │   │   ├── CrimeTrendsPage.tsx
    │   │   ├── CrimeHotspotsPage.tsx
    │   │   ├── CrimeCasesPage.tsx
    │   │   ├── CrimeCaseDetailPage.tsx
    │   │   ├── CriminalListPage.tsx
    │   │   ├── CriminalDetailPage.tsx
    │   │   ├── CrimePatternsPage.tsx
    │   │   └── CrimePredictivePage.tsx
    │   ├── cyber/
    │   │   ├── CyberOverviewPage.tsx
    │   │   ├── CyberThreatsPage.tsx
    │   │   ├── CyberCasesPage.tsx
    │   │   ├── CyberCaseDetailPage.tsx
    │   │   ├── IpIntelligencePage.tsx
    │   │   ├── DomainIntelligencePage.tsx
    │   │   ├── FraudAnalyticsPage.tsx
    │   │   ├── DigitalEvidencePage.tsx
    │   │   ├── CyberHeatmapPage.tsx
    │   │   └── NetworkFlowPage.tsx
    │   ├── maps/
    │   │   ├── MapsOverviewPage.tsx
    │   │   ├── HotspotMapPage.tsx
    │   │   ├── PatrolMapPage.tsx
    │   │   ├── GeoFencePage.tsx
    │   │   ├── DistrictMapPage.tsx
    │   │   └── RouteAnalysisPage.tsx
    │   ├── network/
    │   │   ├── NetworkOverviewPage.tsx
    │   │   ├── LinkAnalysisPage.tsx
    │   │   ├── EntityExplorerPage.tsx
    │   │   ├── NetworkClustersPage.tsx
    │   │   ├── SuspectProfilePage.tsx
    │   │   └── AssociationMatrixPage.tsx
    │   ├── intel-graph/
    │   │   ├── IntelGraphWorkspacePage.tsx
    │   │   ├── GraphBuilderPage.tsx
    │   │   ├── GraphSearchPage.tsx
    │   │   └── GraphTimelinePage.tsx
    │   ├── intel/
    │   │   ├── IntelHubPage.tsx
    │   │   ├── BriefingsPage.tsx
    │   │   ├── IntelReportsPage.tsx
    │   │   ├── WatchlistsPage.tsx
    │   │   ├── SignalsPage.tsx
    │   │   └── StrategicForecastPage.tsx
    │   └── admin/
    │       ├── AdminOverviewPage.tsx
    │       ├── UserManagementPage.tsx
    │       ├── RolePermissionsPage.tsx
    │       ├── DataIngestionPage.tsx
    │       ├── DataQualityPage.tsx
    │       ├── AuditLogPage.tsx
    │       └── SystemHealthPage.tsx
    │
    └── hooks/
        ├── useCountUp.ts           # Animated number counter
        ├── useInView.ts            # Intersection observer
        └── useKeyboard.ts          # Key bindings
```

### State Management Pattern

```typescript
// Use Zustand for ALL global UI state
interface UIStore {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  sidePanelOpen: boolean;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  toggleSidePanel: () => void;
}

interface FilterStore {
  timeRange: '24h' | '7d' | '30d' | '90d' | '1y';
  districts: string[];
  crimeTypes: string[];
  severities: string[];
  setTimeRange: (range: string) => void;
  setDistricts: (districts: string[]) => void;
  setCrimeTypes: (types: string[]) => void;
  resetFilters: () => void;
}

// Use TanStack Query for ALL server state
// Features: caching, refetching, stale detection, pagination, infinite scroll
// Poll every 30s for live data: refetchInterval: 30000
```

### Data Fetching

```typescript
// API client with mock switching
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const MOCK_ENABLED = import.meta.env.VITE_MOCK_MODE === 'true';

async function apiGet<T>(url: string): Promise<T> {
  if (MOCK_ENABLED) {
    const mock = await import(`../shared/api/mock${url}.json`);
    return mock.default as T;
  }
  const { data } = await axios.get(`${API_BASE}${url}`);
  return data;
}

// TanStack Query hook for every endpoint
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiGet<DashboardStats>('/dashboard/stats'),
    refetchInterval: 30000,
  });
}

export function useCrimeCases(filters: CrimeFilters) {
  return useQuery({
    queryKey: ['crime', 'cases', filters],
    queryFn: () => apiGet<CrimeCase[]>('/crime/cases', { params: filters }),
  });
}
```

### Mock Data Structure

Create JSON files matching each API endpoint. Store in `src/shared/api/mock/`:

```
mock/
├── dashboard/
│   └── stats.json          # { totalCrimes, activeCases, alertsToday, ... }
├── crime/
│   ├── cases.json          # { crimes: [...] }
│   ├── case-{id}.json      # Single case detail
│   ├── criminals.json      # { criminals: [...] }
│   ├── criminal-{id}.json  # Single criminal
│   ├── hotspots.json       # { clusters: [...] }
│   ├── red-zones.json      # { redZones: [...] }
│   ├── trends.json         # { trends: [...] }
│   └── predictive.json     # { predictions: [...] }
├── cyber/
│   ├── incidents.json
│   ├── ip-{address}.json
│   ├── domain-{domain}.json
│   └── flows.json
├── maps/
│   ├── geo-data.json
│   └── patrol-zones.json
├── network/
│   └── graph.json          # { nodes: [...], edges: [...] }
├── intel/
│   ├── briefs.json
│   └── socio-economic.json
└── admin/
    ├── users.json
    └── audit-logs.json
```

### Performance MUST-Haves

- **Lazy load EVERY page:** `React.lazy(() => import('./pages/xyz'))`
- **React.memo** on: KpiCard, GlassCard, Badge, table rows, chart wrappers
- **useMemo** on: chart data transformations, filtered lists, GeoJSON processing
- **useCallback** on: event handlers passed to child components
- **Avoid** inline styles in render — use CSS classes or `clsx`
- **Bundle:** keep main entry < 200KB gzipped
- **Animations:** ONLY use `transform` and `opacity` (GPU-composited)
- **Images:** WebP format, lazy loading with `loading="lazy"`
- **TanStack Query:** aggressive caching, staleTime: 30s (don't refetch same data)
- **Virtual scroll** for any table with >100 rows

---

## ═══════════════════════════════════════════════════════════════
## ACCESSIBILITY & QUALITY
## ═══════════════════════════════════════════════════════════════

- [ ] All interactive elements keyboard-navigable (Tab, Enter, Escape)
- [ ] ARIA labels on all icon-only buttons
- [ ] visible focus ring (gold 2px outline)
- [ ] Color contrast AA minimum (AAA for text)
- [ ] Screen reader announcements for dynamic updates
- [ ] `prefers-reduced-motion` media query disables all animations
- [ ] Zero console errors
- [ ] TypeScript strict mode, zero errors
- [ ] Build succeeds: `npm run build`
- [ ] Lighthouse score ≥ 90

---

## ═══════════════════════════════════════════════════════════════
## WHAT TO GENERATE
## ═══════════════════════════════════════════════════════════════

Generate the **COMPLETE `frontend/` directory** with ALL files listed above.

**IMPORTANT:**
- Generate REAL, working code. No placeholders, no "TODO", no "implement later".
- Use mock data from JSON files (no backend required to run).
- The app MUST run with `npm install && npm run dev` and show a fully functional UI.
- Every page must render SOMETHING (even if it's an empty state or skeleton).
- The 3D Karnataka heatmap must be the star of the show.
- Glass morphism must be everywhere.
- Animations must be smooth and plentiful.
- Make it look like a Hollywood movie command center.

**YOU ARE BUILDING A DATATHON SUBMISSION. THIS NEEDS TO WIN. GO ALL OUT.**
