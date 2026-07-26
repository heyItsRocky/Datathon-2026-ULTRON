# 🎬 ULTRON — anime.js Style Scroll Animations + Section Loading

> **Separate Prompt for Google AI Studio**
> **Focus:** Scrolling sections that load one-by-one (like animejs.com), all animejs.com features mapped to framer-motion
> **Stack:** React 19 + TypeScript + Tailwind CSS 4 + framer-motion

---

## 🎯 THE CORE CONCEPT — Scroll Sections That Load One By One

### What animejs.com Does

When you visit animejs.com and scroll down, each **section** loads sequentially:
1. You're on Section 1 — it's fully visible and animated
2. You scroll — Section 1 slides up/out while Section 2 slides into view
3. Section 2 enters with a sequence: title → subtitle → code snippet → buttons
4. Each element within the section has staggered animation timing
5. The animations are FRICTION-FREE, no jank, no lag

### How to Replicate This in React

#### Section-by-Section Container

```tsx
// shared/components/ScrollSections.tsx
// THE MAIN WRAPPER — every page uses this

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SectionPage {
  id: string;
  component: React.ReactNode;
  color?: string;
}

export function ScrollSections({ sections }: { sections: SectionPage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={containerRef} className="relative">
      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 h-0.5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#f6c453] via-[#ff1744] to-[#00e5ff]"
          style={{ scaleX: scrollYProgress, transformOrigin: '0% 0%' }}
        />
      </div>

      {sections.map((section, i) => (
        <SectionView
          key={section.id}
          section={section}
          index={i}
          totalSections={sections.length}
        />
      ))}
    </div>
  );
}

function SectionView({ section, index, totalSections }: {
  section: SectionPage;
  index: number;
  totalSections: number;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Opacity: fade in when entering, fade out when leaving
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    [0, 1, 1, 1, 0]
  );

  // Scale: subtle scale animation
  const scale = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    [0.95, 1, 1, 1, 0.98]
  );

  // Y position: slides up as section passes
  const y = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    ['60px', '0px', '0px', '0px', '-40px']
  );

  // Blur: sharp when visible, blurry when entering/leaving
  const blur = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    ['8px', '0px', '0px', '0px', '4px']
  );

  return (
    <motion.section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center px-6 py-24 relative"
      style={{ opacity, scale, y, filter: `blur(${blur})` }}
    >
      {/* Section number indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
        {Array.from({ length: totalSections }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i === index ? 'bg-[#f6c453] scale-150' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Background that changes per section */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: section.color
            ? `radial-gradient(ellipse at center, ${section.color}10 0%, transparent 70%)`
            : 'transparent'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {section.component}
      </div>
    </motion.section>
  );
}
```

#### How to Use It — Section by Section Loading

```tsx
// pages/CommandCenterPage.tsx
// Uses the ScrollSections wrapper to make the page load section by section

export default function CommandCenterPage() {
  const sections = [
    {
      id: 'hero-3d-map',
      color: '#ff1744',
      component: (
        <div className="text-center space-y-8">
          <SectionHeader
            number="01"
            title="3D Karnataka Heatmap"
            subtitle="Real-time crime density visualization"
          />
          <div className="h-[60vh] rounded-2xl overflow-hidden border border-white/10">
            <Karnataka3DMap />
          </div>
          <SectionFooter text="Drag to orbit · Scroll to zoom · Click districts for details" />
        </div>
      ),
    },
    {
      id: 'kpi-dashboard',
      color: '#00e5ff',
      component: (
        <div className="space-y-8">
          <SectionHeader
            number="02"
            title="Command Center KPIs"
            subtitle="Live crime statistics at a glance"
          />
          <StaggerGrid columns={3} staggerDelay={0.1}>
            <KpiCard label="Total Crimes" value={12847} trend={-2.3} color="#f6c453" />
            <KpiCard label="Active Cases" value={843} trend={5.1} color="#ff1744" />
            <KpiCard label="Alerts Today" value={47} trend={12} color="#ff9100" />
            <KpiCard label="Cyber Incidents" value={128} trend={-8} color="#00e5ff" />
            <KpiCard label="Red Zones" value={6} color="#ff1744" />
            <KpiCard label="ML Active" value={8} color="#00e676" />
          </StaggerGrid>
        </div>
      ),
    },
    {
      id: 'crime-trends',
      color: '#7c4dff',
      component: (
        <div className="space-y-8">
          <SectionHeader
            number="03"
            title="Crime Trends Analytics"
            subtitle="Deep dive into crime patterns over time"
          />
          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <CrimeTrendChart />
            </div>
            <div className="glass-card p-6">
              <CrimeTypeChart />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'radial-wheel',
      color: '#f6c453',
      component: (
        <div className="flex flex-col items-center space-y-8">
          <SectionHeader
            number="04"
            title="Radial Navigation"
            subtitle="Navigate across all sections"
          />
          <RadialNavigationWheel />
        </div>
      ),
    },
  ];

  return <ScrollSections sections={sections} />;
}
```

---

## ═══════════════════════════════════════════════════════════════
## animejs.com FEATURES — MAPPED TO REACT
## ═══════════════════════════════════════════════════════════════

I scraped animejs.com and here is every feature they offer, translated to React/framer-motion equivalents.

### 1. Scroll Observer (animejs: `onScroll({ sync: true })`)

**animejs equivalent:**
```js
animate('.square', {
  x: 100,
  autoplay: onScroll({
    container: '.container',
    target: '.section',
    axis: 'y',
    enter: 'bottom top',
    leave: 'top bottom',
    sync: true,  // animation progress = scroll progress
  })
});
```

**React version:**
```tsx
// ScrollProgress — animation progress syncs with scroll position
// As you scroll through a section, the animation plays forward/backward

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function ScrollDrivenAnimation({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'], // enter = target bottom hits container top, leave = target top hits container bottom
  });

  // Animation value mapped to scroll progress (0 to 1)
  const x = useTransform(scrollYProgress, [0, 1], ['-100px', '100px']);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div ref={ref} style={{ x, rotate, scale, opacity }}>
      {children}
    </motion.div>
  );
}

// Callbacks (animejs: onEnter, onLeave, onEnterForward, onLeaveBackward)
// Use framer-motion useInView instead
const [ref, inView] = useInView({
  threshold: 0.3,
  // Equivalent to animejs onEnter
});
// inView = onEnter (true) / onLeave (false)
// Use useScroll + scrollYProgress for onEnterForward vs onEnterBackward distinction
```

### 2. Stagger (animejs: `stagger(40)`)

**animejs equivalent:**
```js
animate('.dot', {
  scale: stagger([1.1, .75], {
    grid: [13, 13],
    from: 'center',
    ease: 'inOutQuad',
  }),
}, stagger(200, { grid: [13, 13], from: 'center' }));
```

**React version with ALL stagger features:**

```tsx
// Time staggering — items animate one after another with delay
// animejs: stagger(40) = 40ms between each element
// framer-motion: staggerChildren: 0.04 in container variants

// Values staggering — each item gets a different value from a range
// animejs: stagger([1.1, .75]) = values distributed across items
// React: assign values programmatically

// Grid staggering — items animate based on grid position (center out, top-left, etc.)
// animejs: grid: [13, 13], from: 'center'
// framer-motion: custom stagger direction via spring

export function StaggerGrid({
  children,
  columns = 3,
  staggerDelay = 0.08,
  from = 'center', // 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'random'
  className = '',
}: {
  children: React.ReactNode[];
  columns?: number;
  staggerDelay?: number;
  from?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'random';
  className?: string;
}) {
  const items = React.Children.toArray(children);
  
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
  };

  // Calculate stagger order based on grid position
  const getStaggerIndex = (i: number) => {
    const row = Math.floor(i / columns);
    const col = i % columns;
    const centerRow = Math.ceil(items.length / columns / 2) - 1;
    const centerCol = Math.ceil(columns / 2) - 1;
    
    switch (from) {
      case 'center':
        return Math.abs(row - centerRow) + Math.abs(col - centerCol);
      case 'top-left':
        return row + col;
      case 'top-right':
        return row + (columns - 1 - col);
      case 'bottom-left':
        return (Math.floor(items.length / columns) - row) + col;
      case 'bottom-right':
        return (Math.floor(items.length / columns) - row) + (columns - 1 - col);
      case 'random':
        return Math.random();
      default:
        return i;
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: getStaggerIndex(i) * staggerDelay,
      },
    }),
  };

  return (
    <motion.div
      className={`grid grid-cols-${columns} gap-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {items.map((child, i) => (
        <motion.div key={i} custom={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 3. SVG Morphing (animejs: `svg.morphTo()`)

**animejs equivalent:**
```js
animate($path1, {
  points: svg.morphTo($path2),
  ease: 'inOutCirc',
  duration: 500,
  onComplete: animateRandomPoints
});
```

**React version:**
```tsx
// Path morphing with SVG — animate between two SVG path shapes
// Uses framer-motion with AnimatePresence to morph between d attributes

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// KSP Shield paths (2 different shapes for morphing)
const SHIELD_PATH_1 = 'M12 2L3 7v6c0 5.25 3.83 10.04 9 11 5.17-.96 9-5.75 9-11V7l-9-5z';
const SHIELD_PATH_2 = 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5';

// Crime icon paths
const CRIME_PATHS = [
  // Shield
  'M12 2L3 7v6c0 5.25 3.83 10.04 9 11 5.17-.96 9-5.75 9-11V7l-9-5z',
  // Target
  'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z',
  // Alert triangle
  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
];

export function MorphingCrimeIcon() {
  const [pathIndex, setPathIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPathIndex(prev => (prev + 1) % CRIME_PATHS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f6c453"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <AnimatePresence mode="wait">
        <motion.path
          key={pathIndex}
          d={CRIME_PATHS[pathIndex]}
          initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
          animate={{ pathLength: 1, opacity: 1, scale: 1 }}
          exit={{ pathLength: 0, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
    </motion.svg>
  );
}
```

### 4. Motion Path (animejs: `createMotionPath()`)

**animejs equivalent:**
```js
animate('.car', {
  ...createMotionPath('.circuit'),
});
```

**React version:**
```tsx
// MotionPath — Animate element along an SVG path
// Uses framer-motion with motion.path for offsetDistance animation

import { motion, useScroll, useTransform } from 'framer-motion';

export function CrimeMotionPath({ pathId, objectId }: { pathId: string; objectId: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
      {/* The visible path */}
      <motion.path
        id={pathId}
        d="M10 180 Q 50 10, 100 180 T 200 180 T 300 180 T 390 180"
        fill="none"
        stroke="rgba(246, 196, 83, 0.3)"
        strokeWidth="1"
        strokeDasharray="8 4"
      />
      {/* The moving object */}
      <motion.circle
        id={objectId}
        r="6"
        fill="#f6c453"
        filter="url(#glow)"
        initial={{ offsetDistance: '0%' }}
        whileInView={{ offsetDistance: '100%' }}
        transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
        style={{ offsetPath: `path('M10 180 Q 50 10, 100 180 T 200 180 T 300 180 T 390 180')` }}
      />
    </svg>
  );
}
```

### 5. Line Drawing (animejs: `createDrawable()`)

**animejs equivalent:**
```js
animate(createDrawable('.circuit'), {
  draw: '0 1',
});
```

**React version:**
```tsx
// LineDrawing — SVG path draws itself when scrolled into view
// Uses framer-motion pathLength animation

export function AnimatedKarnatakaOutline() {
  return (
    <motion.svg
      viewBox="0 0 400 500"
      className="w-full h-full"
    >
      <motion.path
        d="M50 100 Q 100 50, 150 100 T 250 80 T 350 120 T 300 200 T 350 300 T 250 350 T 150 400 T 80 300 T 50 200 Z"
        fill="none"
        stroke="#f6c453"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        viewport={{ once: true }}
      />
      {/* Glow filter */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </motion.svg>
  );
}
```

### 6. Draggable (animejs: `createDraggable()`)

**animejs equivalent:**
```js
createDraggable('.circle', {
  releaseEase: createSpring({ stiffness: 120, damping: 6 })
});
```

**React version:**
```tsx
// DraggablePanel — card that can be dragged around, snaps back with spring
// Uses framer-motion drag with spring physics

import { motion } from 'framer-motion';

export function DraggableIntelCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      dragElastic={0.7}
      whileDrag={{ scale: 1.05, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      className="glass-card p-4 cursor-grab active:cursor-grabbing"
    >
      {children}
    </motion.div>
  );
}
```

### 7. Timeline (animejs: `createTimeline()`)

**animejs equivalent:**
```js
createTimeline()
  .add('.tick', { y: '-=6', duration: 50 }, stagger(10))
  .add('.ticker', { rotate: 360, duration: 1920 }, '<');
```

**React version with orchestration:**
```tsx
// SequentialAnimation — orchestrates multiple animations in sequence
// Uses framer-motion useAnimation controls

import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

export function CommandCenterEntrance() {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView) return;
    
    async function sequence() {
      // Step 1: Background and title
      await controls.start('visible');
      // Step 2: KPI cards stagger
      await new Promise(resolve => setTimeout(resolve, 600));
      // Step 3: Charts fly in
      await new Promise(resolve => setTimeout(resolve, 900));
    }
    sequence();
  }, [inView, controls]);

  return (
    <div ref={ref}>
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: -40, filter: 'blur(10px)' },
          visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
        }}
        initial="hidden"
        animate={controls}
      >
        Command Center
      </motion.h1>
      
      <motion.div
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
        }}
        initial="hidden"
        animate={controls}
      >
        {/* KPI cards */}
      </motion.div>
    </div>
  );
}
```

### 8. Scope with Media Queries (animejs: `createScope({ mediaQueries })`)

**animejs equivalent:**
```js
createScope({
  mediaQueries: { portrait: '(orientation: portrait)' }
}).add(({ matches }) => {
  // Different animations for portrait vs landscape
});
```

**React version:**
```tsx
// Use Tailwind responsive classes OR useMediaQuery hook
// framer-motion doesn't have built-in media query matching,
// so use a custom hook:

function useAnimationMedia() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  
  return { isMobile, isTablet, prefersReduced, isPortrait };
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}
```

### 9. Text Split (animejs: `splitText()`)

**animejs equivalent:**
```js
// Splits text into lines, words, and/or characters for individual animation
```

**React version:**
```tsx
// SplitText — splits text into individual characters or words
// Each wrapped in a motion.span for staggered animation

export function AnimatedHeading({ text, className }: { text: string; className?: string }) {
  const chars = text.split('');

  return (
    <motion.h1
      className={`inline-flex flex-wrap ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20, rotateX: -90 },
            visible: { opacity: 1, y: 0, rotateX: 0 },
          }}
          transition={{ duration: 0.4, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}
```

### 10. scrambleText (animejs NEW)

**animejs equivalent:**
```js
// Text that scrambles/unscrambles like a code decryption effect
// Characters rapidly change before settling into final text
```

**React version:**
```tsx
// ScrambleText — characters scramble before revealing the final text
// Like the decryption effect in sci-fi movies

import { useState, useEffect, useRef } from 'react';

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/`~ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function ScrambleText({ text, scrambleSpeed = 50, revealDuration = 2000 }: {
  text: string;
  scrambleSpeed?: number;
  revealDuration?: number;
}) {
  const [displayed, setDisplayed] = useState(text.replace(/[a-zA-Z0-9]/g, () => 
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ));
  const [isRevealed, setIsRevealed] = useState(false);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(null);

  useEffect(() => {
    const scramble = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / revealDuration, 1);
      
      const result = text.split('').map((char, i) => {
        if (char === ' ') return ' ';
        const charProgress = progress * 1.2 - (i / text.length) * 0.3;
        if (charProgress >= 1) return char;
        if (charProgress <= 0) return CHARS[Math.floor(Math.random() * CHARS.length)];
        // Gradually reveal characters from left to right
        const shouldScramble = Math.random() > charProgress;
        return shouldScramble
          ? CHARS[Math.floor(Math.random() * CHARS.length)]
          : char;
      }).join('');
      
      setDisplayed(result);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(scramble);
      } else {
        setDisplayed(text);
        setIsRevealed(true);
      }
    };

    startTime.current = null;
    frameRef.current = requestAnimationFrame(scramble);
    
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, revealDuration]);

  return (
    <span className={`font-mono ${isRevealed ? 'text-gold' : 'text-text-muted'}`}>
      {displayed}
      {!isRevealed && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-gold"
        >
          _
        </motion.span>
      )}
    </span>
  );
}
```

### 11. Spring Physics (animejs: `createSpring({ stiffness, damping })`)

**animejs equivalent:**
```js
createSpring({ stiffness: 120, damping: 6 })
```

**React version:**
```tsx
// Spring-based animations follow Hooke's law physics
// framer-motion spring: { type: 'spring', stiffness: 100, damping: 10 }

// Anime.js spring defaults:
// stiffness: 120 → framer: stiffness: 120
// damping: 6 → framer: damping: 10 (slightly different scale)
// mass: 1 → framer: mass: 1

// Spring presets for ULTRON:
export const SPRINGS = {
  // Bouncy — for cards entering
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 15, mass: 0.8 },
  // Smooth — for page transitions
  smooth: { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 },
  // Snappy — for hover effects
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.5 },
  // Wobbly — for attention-seeking elements
  wobbly: { type: 'spring' as const, stiffness: 180, damping: 8, mass: 1.2 },
  // Heavy — for modals
  heavy: { type: 'spring' as const, stiffness: 200, damping: 25, mass: 2 },
};
```

### 12. Keyframes (animejs: keyframes)

**animejs equivalent:**
```js
// Duration based: animate over total timeline
// Percentage based: each keyframe at specific % of total duration
animate('.el', {
  keyframes: [
    { x: 0, opacity: 1 },
    { x: 100, opacity: 0.5 },
    { x: 200, opacity: 1 },
  ],
  duration: 2000,
  ease: 'inOutQuad',
});
```

**React version:**
```tsx
// Keyframe animation with framer-motion
<motion.div
  animate={{
    x: [0, 100, 200],    // Array = keyframes
    opacity: [1, 0.5, 1],
  }}
  transition={{
    duration: 2,
    ease: ['easeInOut', 'easeInOut'],
    times: [0, 0.5, 1],   // Percentage positions (optional)
  }}
/>
```

### 13. Individual CSS Transforms (animejs: composition)

**animejs equivalent:**
```js
animate('.shape', {
  x: random(-100, 100),
  y: random(-100, 100),
  rotate: random(-180, 180),
  composition: 'blend',  // Each transform animates independently
});
```

**React version:**
```tsx
// framer-motion handles individual transforms by default — no extra config needed
<motion.div
  animate={{
    x: [0, 100, -50, 0],
    y: [0, -50, 100, 0],
    rotate: [0, 180, -180, 0],
    scale: [1, 1.2, 0.8, 1],
  }}
  transition={{ duration: 4, repeat: Infinity }}
/>
```

---

## ═══════════════════════════════════════════════════════════════
## COMPLETE SECTION LOADING PATTERN — Like animejs.com Homepage
## ═══════════════════════════════════════════════════════════════

### The animejs.com Homepage Structure

Looking at animejs.com, the homepage scrolls through these sections:

1. **Hero** — Logo + "All-in-one animation engine" + CTA buttons
2. **Complete animator's toolbox** — Feature cards in a grid
3. **Intuitive API** — Code snippets with staggered reveal
4. **Enhanced transforms** — Interactive demo
5. **Scroll Observer** — Scroll-driven animation demo
6. **Advanced staggering** — Grid stagger demo
7. **SVG toolset** — Morphing/line drawing/motion path demos
8. **Springs and Draggable** — Interactive draggable demo
9. **Timeline** — Clockwork animation demo
10. **Responsive animations** — Media query demo
11. **Lightweight and modular** — Bundle size info
12. **Footer** — Links and sponsor info

Each section:
- Takes full viewport height (or close to it)
- Has its own background color/theme
- Content animates in when section scrolls into view
- Has a progress indicator showing which section you're on

### How to Replicate This EXACTLY for ULTRON

```tsx
// pages/CommandCenterPage.tsx
// THE COMPLETE animejs.com-style scrolling page

const COMMAND_CENTER_SECTIONS = [
  {
    id: 'hero',
    title: 'ULTRON',
    subtitle: 'Unified Law Enforcement Threat Response & Optimization Nexus',
    bgGradient: 'from-[#05070a] via-[#0d1520] to-[#05070a]',
    content: (
      <div className="text-center space-y-8">
        {/* 3D Karnataka Map as background */}
        <div className="absolute inset-0">
          <Karnataka3DMap />
        </div>
        {/* Overlay text */}
        <div className="relative z-10">
          <AnimatedHeading text="ULTRON" className="text-7xl font-bold text-gold" />
          <ScrambleText text="Unified Law Enforcement Threat Response & Optimization Nexus" />
          <motion.div className="mt-8 flex gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <button className="px-8 py-3 bg-gold/20 border border-gold/40 rounded-lg text-gold hover:bg-gold/30 transition-all">
              Explore Crime →
            </button>
            <button className="px-8 py-3 bg-cyan/10 border border-cyan/30 rounded-lg text-cyan hover:bg-cyan/20 transition-all">
              Explore Cyber →
            </button>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    id: 'kpi-dashboard',
    title: 'Live Crime Dashboard',
    subtitle: 'Real-time Karnataka crime statistics at a glance',
    bgGradient: 'from-[#0d1520] via-[#111b2e] to-[#0d1520]',
    content: (
      <StaggerGrid columns={3} staggerDelay={0.1} from="center">
        <KpiCard label="Total Crimes" value={12847} trend={-2.3} color="#f6c453" />
        <KpiCard label="Active Cases" value={843} trend={5.1} color="#ff1744" />
        <KpiCard label="Alerts Today" value={47} trend={12} color="#ff9100" />
        <KpiCard label="Cyber Incidents" value={128} trend={-8} color="#00e5ff" />
        <KpiCard label="Red Zones" value={6} color="#ff1744" />
        <KpiCard label="ML Models Active" value={8} color="#00e676" />
      </StaggerGrid>
    ),
  },
  {
    id: 'crime-patterns',
    title: 'Crime Pattern Analysis',
    subtitle: 'ML-powered crime trend detection across all 31 districts',
    bgGradient: 'from-[#111b2e] via-[#1a0533] to-[#111b2e]',
    content: (
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">30-Day Crime Trend</h3>
          <CrimeTrendChart />
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Crime Distribution</h3>
          <CrimeTypeChart />
        </div>
        <div className="col-span-2 glass-card p-6">
          <AnimatedKarnatakaOutline />
        </div>
      </div>
    ),
  },
  {
    id: 'radial-navigation',
    title: 'Radial Navigation',
    subtitle: 'Navigate all crime intelligence modules',
    bgGradient: 'from-[#0d1520] via-[#1a1a2e] to-[#0d1520]',
    content: (
      <div className="flex flex-col items-center">
        <RadialNavigationWheel />
        <p className="text-text-muted text-sm mt-8 text-center">
          Hover segments to preview · Click to navigate
        </p>
      </div>
    ),
  },
  {
    id: 'cyber-threats',
    title: 'Cyber Threat Timeline',
    subtitle: 'Real-time cyber incident tracking and visualization',
    bgGradient: 'from-[#0a1628] via-[#001a2e] to-[#0a1628]',
    content: (
      <div className="space-y-6">
        <ThreatTimeline />
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-bold text-cyan">47</div>
            <div className="text-xs text-text-muted">Incidents Today</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-bold text-cyan">2,341</div>
            <div className="text-xs text-text-muted">Blocked IPs</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-bold text-cyan">89</div>
            <div className="text-xs text-text-muted">Blocked Domains</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'network-graph',
    title: 'Network Analysis',
    subtitle: 'Entity relationship mapping and link analysis',
    bgGradient: 'from-[#0d1520] via-[#1a0a2e] to-[#0d1520]',
    content: (
      <div className="glass-card p-6 h-[60vh]">
        <NetworkGraph />
      </div>
    ),
  },
];

export default function CommandCenterPage() {
  return (
    <div className="relative">
      {/* Fixed progress dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {COMMAND_CENTER_SECTIONS.map((section, i) => (
          <ScrollSectionDot
            key={section.id}
            index={i}
            total={COMMAND_CENTER_SECTIONS.length}
          />
        ))}
      </div>
      
      {/* Section by section */}
      {COMMAND_CENTER_SECTIONS.map((section, i) => (
        <SectionView
          key={section.id}
          section={section}
          index={i}
        />
      ))}
    </div>
  );
}
```

### The Section Component (One Section at a Time)

```tsx
// SectionView.tsx — renders ONE section at full viewport height
// Content animates in when this section scrolls into view

function SectionView({ section, index }: {
  section: typeof COMMAND_CENTER_SECTIONS[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const inView = useInView(ref, {
    margin: '-20%',  // Trigger when 20% of section is visible
    once: false,      // Re-trigger when scrolling back up
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [inView, controls]);

  return (
    <motion.section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${section.bgGradient})`,
      }}
    >
      {/* Background ambient glow */}
      <div className={`absolute inset-0 opacity-30 transition-opacity duration-1000 ${
        index % 2 === 0 ? 'bg-gradient-radial from-gold/5 to-transparent' : 'bg-gradient-radial from-cyan/5 to-transparent'
      }`} />

      {/* Section number */}
      <div className="absolute top-24 left-8 text-8xl font-bold text-white/5 select-none">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Content */}
      <motion.div
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15, delayChildren: 0.2 },
          },
        }}
        initial="hidden"
        animate={controls}
        className="relative z-10 w-full max-w-6xl mx-auto"
      >
        {/* Title */}
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="text-4xl font-display font-bold text-text-primary mb-3"
        >
          {section.title}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 } },
          }}
          className="text-lg text-text-secondary mb-10"
        >
          {section.subtitle}
        </motion.p>

        {/* Main content */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3 } },
          }}
        >
          {section.content}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
```

### Progress Dots (Right Side)

```tsx
function ScrollSectionDot({ index, total }: { index: number; total: number }) {
  const { scrollYProgress } = useScroll();
  const sectionProgress = useTransform(
    scrollYProgress,
    [index / total, (index + 1) / total],
    [0, 1]
  );
  const opacity = useTransform(sectionProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
  const scale = useTransform(sectionProgress, [0, 0.5, 1], [1, 2, 1]);

  return (
    <motion.div
      style={{ opacity, scale }}
      className="w-2 h-2 rounded-full bg-gold cursor-pointer"
    />
  );
}
```

---

## ═══════════════════════════════════════════════════════════════
## SECTION-BY-SECTION ENTRANCE SEQUENCE — The "One By One" Effect
## ═══════════════════════════════════════════════════════════════

This is THE KEY feature that animejs.com uses. Each section enters with a **specific sequence**:

### The Sequence Pattern

```
When Section enters viewport:
  ├── 0ms    → Section background fades in (opacity 0 → 1)
  ├── 200ms  → Section number (01/02/03) slides in from left
  ├── 300ms  → Title text drops down with blur dissolve
  ├── 450ms  → Subtitle fades in below title
  ├── 600ms  → Main content container starts entering
  │   ├── 600ms  → First child (card/chart/graph)
  │   ├── 700ms  → Second child
  │   ├── 800ms  → Third child
  │   └── ...    → (stagger continues)
  └── 1200ms → All content settled, ready for interactions
```

### Implementation

```tsx
// SectionEntrance.tsx — the complete entrance sequence for ANY section

interface EntranceSequence {
  background: Variants;
  sectionNumber: Variants;
  title: Variants;
  subtitle: Variants;
  content: Variants;
  children?: Variants;
}

export function SectionEntrance({ children, sectionNumber, title, subtitle }: {
  children: React.ReactNode;
  sectionNumber: string;
  title: string;
  subtitle: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const inView = useInView(ref, { margin: '-15%' });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [inView, controls]);

  const sequence: EntranceSequence = {
    background: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.8 } },
    },
    sectionNumber: {
      hidden: { opacity: 0, x: -30, filter: 'blur(5px)' },
      visible: {
        opacity: 0.05,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
      },
    },
    title: {
      hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
      visible: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
      },
    },
    subtitle: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: 'easeOut', delay: 0.35 },
      },
    },
    content: {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 },
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={sequence.background}
      initial="hidden"
      animate={controls}
      className="relative"
    >
      {/* Section number background */}
      <motion.div
        variants={sequence.sectionNumber}
        initial="hidden"
        animate={controls}
        className="absolute top-12 left-8 text-9xl font-bold text-white select-none pointer-events-none"
      >
        {sectionNumber}
      </motion.div>

      {/* Title */}
      <motion.h2
        variants={sequence.title}
        initial="hidden"
        animate={controls}
        className="text-4xl font-display font-bold text-text-primary mb-3"
      >
        {title}
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        variants={sequence.subtitle}
        initial="hidden"
        animate={controls}
        className="text-lg text-text-secondary mb-10"
      >
        {subtitle}
      </motion.p>

      {/* Main content with staggered children */}
      <motion.div
        variants={sequence.content}
        initial="hidden"
        animate={controls}
      >
        <StaggerContainer staggerDelay={0.1}>
          {children}
        </StaggerContainer>
      </motion.div>
    </motion.div>
  );
}
```

---

## ═══════════════════════════════════════════════════════════════
## COMPLETE ANIMATION REFERENCE — All animejs.com features
## ═══════════════════════════════════════════════════════════════

| animejs.com Feature | React/framer-motion Equivalent | File |
|---------------------|-------------------------------|------|
| Scroll Observer (`onScroll`) | `useScroll()` + `useTransform()` + `useInView()` | ScrollSections.tsx |
| Stagger (`stagger(40)`) | `staggerChildren` in variants | StaggerGrid.tsx |
| SVG Morph (`svg.morphTo()`) | `AnimatePresence` + `motion.path` `d` prop | MorphingCrimeIcon.tsx |
| SVG Draw (`createDrawable()`) | `pathLength` animation | AnimatedKarnatakaOutline.tsx |
| Motion Path (`createMotionPath()`) | `offsetPath` + `offsetDistance` CSS | CrimeMotionPath.tsx |
| Draggable (`createDraggable()`) | framer `drag` prop + spring physics | DraggableIntelCard.tsx |
| Timeline (`createTimeline()`) | `useAnimation` + async sequence | CommandCenterEntrance.tsx |
| Responsive (Scope + mediaQueries) | `useMediaQuery` hook + Tailwind responsive | useAnimationMedia.ts |
| Text Split (`splitText()`) | Character-level staggered spans | AnimatedHeading.tsx |
| scrambleText (NEW) | Custom React hook with character scrambling | ScrambleText.tsx |
| Keyframes | Array values in `animate` prop | All animated components |
| Spring (`createSpring()`) | `type: 'spring'` with stiffness/damping/mass | SPRINGS constant |
| Individual Transforms | Individual transform props (x, y, rotate, scale) | All motion.div |
| Playback controls (play/pause/reverse/seek) | `useAnimation` controls | All animated components |
| Callbacks (onBegin/onComplete/onUpdate) | `onAnimationStart`/`onAnimationComplete` | All animated components |
| Easing functions | `ease` prop with cubic-bezier or built-in | All animations |

---

## ═══════════════════════════════════════════════════════════════
## COMPLETE EASING REFERENCE
## ═══════════════════════════════════════════════════════════════

### Built-in framer-motion easings (mapped from animejs)

```typescript
export const EASINGS = {
  // animejs linear → framer 'linear'
  linear: [0, 0, 1, 1] as [number, number, number, number],
  
  // animejs easeInQuad → framer [0.55, 0.085, 0.68, 0.53]
  easeInQuad: [0.55, 0.085, 0.68, 0.53] as [number, number, number, number],
  
  // animejs easeOutQuad → framer [0.25, 0.46, 0.45, 0.94]
  easeOutQuad: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  
  // animejs easeInOutQuad → framer [0.455, 0.03, 0.515, 0.955]
  easeInOutQuad: [0.455, 0.03, 0.515, 0.955] as [number, number, number, number],
  
  // animejs easeInOutExpo → framer [0.87, 0, 0.13, 1] (THE BEST ONE)
  ultraSmooth: [0.87, 0, 0.13, 1] as [number, number, number, number],
  
  // animejs easeInOutCirc → framer [0.785, 0.135, 0.15, 0.86]
  dramatic: [0.785, 0.135, 0.15, 0.86] as [number, number, number, number],
  
  // animejs easeOutBack → framer [0.175, 0.885, 0.32, 1.275]
  bouncy: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
};
```

---

## ═══════════════════════════════════════════════════════════════
## WHAT TO GENERATE
## ═══════════════════════════════════════════════════════════════

Generate the COMPLETE implementation of:

1. **ScrollSections** — The main wrapper that loads sections one by one as user scrolls (like animejs.com)
2. **SectionView** — Individual section with timed entrance sequence (background → number → title → subtitle → content → children stagger)
3. **StaggerGrid** — Grid staggering with configurable origin (center/top-left/grid-based)
4. **ScrollDrivenAnimation** — Animation progress tied to scroll position (sync mode)
5. **AnimatedHeading** — Character-by-character text animation
6. **ScrambleText** — Text decryption/scramble effect
7. **MorphingCrimeIcon** — SVG path morphing between shapes
8. **AnimatedKarnatakaOutline** — SVG line drawing animation
9. **DraggableIntelCard** — Draggable card with spring physics
10. **SPRINGS** — Spring presets for all interactive elements
11. **EASINGS** — Easing presets mapped from animejs

**All integrate into the Command Center page** so that scrolling through the page reveals each section one by one with animejs.com quality animations.

**MAKE EVERY SECTION LOAD ONE BY ONE AS THE USER SCROLLS.**
