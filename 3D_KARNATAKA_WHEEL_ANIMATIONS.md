# 🚀 ULTRON — 3D Map + Radial Wheel + Sick Animations

> **Separate Prompt for Google AI Studio**
> **Focus:** 3D Karnataka Map display, 4-Ring Radial Navigation Wheel, anime.js-style animations
> **Stack:** React 19 + TypeScript + Tailwind CSS 4 + Three.js + framer-motion + D3

---

## ═══════════════════════════════════════════════════════════════
## 1️⃣ THE KARNATAKA MAP — Real GeoJSON Display
## ═══════════════════════════════════════════════════════════════

### What to Build

A **fully rendered 3D map of Karnataka** using real GeoJSON data. Every district boundary must be visible, clickable, and color-coded by crime data. This is NOT a Leaflet map — it's a **Three.js / React Three Fiber** scene that renders the actual Karnataka geography.

### Data Source

Create a mock GeoJSON file at `public/data/karnataka-districts.geojson`. It must contain all 31 districts of Karnataka as `Polygon` or `MultiPolygon` features. Each feature has properties:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "bengaluru-urban",
        "name": "Bengaluru Urban",
        "nameKn": "ಬೆಂಗಳೂರು ನಗರ",
        "adminCenter": "Bengaluru",
        "area_km2": 2196,
        "population": 9620000,
        "policeStations": 85,
        "crimeDensity": 87,
        "trend": "rising",
        "isRedZone": true,
        "severityScore": 72
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[77.3, 12.8], [77.4, 12.9], ...]]
      }
    }
    // ... 30 more districts
  ]
}
```

**CRITICAL — Get the coordinates right:**
- Karnataka spans approximately: longitude 74.0°E to 78.5°E, latitude 11.5°N to 18.5°N
- Use real-ish polygon coordinates for each district (approximate boundaries)
- All coordinates are [longitude, latitude] format (GeoJSON standard)

### Step-by-Step Implementation

#### Step 1: Load GeoJSON Data

```typescript
// hooks/useKarnatakaGeoData.ts
import { useState, useEffect } from 'react';
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

interface DistrictProperties {
  id: string;
  name: string;
  nameKn: string;
  crimeDensity: number;
  trend: 'rising' | 'stable' | 'falling';
  isRedZone: boolean;
  severityScore: number;
  // ... other props
}

type DistrictFeature = Feature<Polygon | MultiPolygon, DistrictProperties>;

export function useKarnatakaGeoData() {
  const [geoData, setGeoData] = useState<FeatureCollection<Polygon | MultiPolygon, DistrictProperties> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/karnataka-districts.geojson')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load GeoJSON');
        return res.json();
      })
      .then((data: FeatureCollection<Polygon | MultiPolygon, DistrictProperties>) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { geoData, loading, error };
}
```

#### Step 2: Convert GeoJSON to 3D Meshes

The GeoJSON coordinates are in [longitude, latitude] (degrees). You MUST convert them to 3D space coordinates.

```typescript
// utils/geoTo3d.ts
// GeoJSON coordinates → Three.js world coordinates

export function geoTo3d(lng: number, lat: number): [number, number, number] {
  // Karnataka center: 76.0°E, 15.0°N
  const CENTER_LNG = 76.0;
  const CENTER_LAT = 15.0;
  
  // Scale factor: 1 degree ≈ 0.45 units in 3D space
  const SCALE = 0.45;
  
  const x = (lng - CENTER_LNG) * SCALE;
  const z = (lat - CENTER_LAT) * SCALE;
  
  return [x, 0, z];  // y=0 initially, elevation applied separately
}

// Convert a polygon ring of [lng, lat] pairs to 3D points
function ringToPoints(ring: number[][]): [number, number, number][] {
  return ring.map(([lng, lat]) => geoTo3d(lng, lat));
}
```

#### Step 3: Create Extruded District Mesh

```tsx
// features/command-center/components/DistrictMesh3D.tsx
// Uses THREE.ExtrudeGeometry to turn district polygons into 3D shapes

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DistrictFeature } from '../hooks/useKarnatakaGeoData';

interface DistrictMesh3DProps {
  feature: DistrictFeature;
  elevation: number;    // 0.2 to 2.0 (mapped from crimeDensity)
  color: string;         // '#ff1744' | '#ff9100' | '#ffd600' | '#00e676'
  emissiveIntensity: number; // 0.1 to 0.5
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}

export function DistrictMesh3D({
  feature, elevation, color, emissiveIntensity,
  isHovered, isSelected, onClick, onHover, onUnhover
}: DistrictMesh3DProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometry = useMemo(() => {
    // Get the polygon coordinates
    const coords = feature.geometry.type === 'Polygon'
      ? feature.geometry.coordinates[0]  // Outer ring
      : feature.geometry.coordinates[0][0]; // MultiPolygon outer ring
    
    // Convert to 3D points
    const shape = new THREE.Shape();
    const points = coords.map(([lng, lat]) => geoTo3d(lng, lat));
    
    shape.moveTo(points[0][0], points[0][2]);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i][0], points[i][2]);
    }
    shape.closePath();
    
    // Extrude with elevation as depth
    return new THREE.ExtrudeGeometry(shape, {
      depth: elevation,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.02,
      bevelSegments: 3,
    });
  }, [feature]);

  // Animate hover/select state
  useFrame((state) => {
    const targetY = isSelected ? elevation + 0.3 : isHovered ? elevation + 0.15 : elevation / 2;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
    
    // Pulse glow on hover
    const pulse = isHovered ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15 : 1;
    meshRef.current.material.emissiveIntensity = emissiveIntensity * pulse;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, elevation / 2, 0]} // Center vertically
      onClick={onClick}
      onPointerEnter={onHover}
      onPointerLeave={onUnhover}
    >
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.15}
        roughness={0.55}
        transparent
        opacity={0.92}
        clearcoat={0.05}
      />
    </mesh>
  );
}
```

#### Step 4: Build the Full 3D Scene

```tsx
// features/command-center/Karnataka3DMap.tsx
// THE MAIN COMPONENT — assembles the entire 3D map

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Suspense, useState, useMemo } from 'react';
import { useKarnatakaGeoData } from './hooks/useKarnatakaGeoData';
import { DistrictMesh3D } from './components/DistrictMesh3D';

// Column of particles rising from hotspot
import { HotspotColumn } from './components/HotspotColumn';
// Pulsing ring around red zone districts
import { PulsingRing } from './components/PulsingRing';
// Animated border lines between districts
import { DistrictBorder } from './components/DistrictBorder';
// 500 floating particles
import { AmbientParticles } from './components/AmbientParticles';

function getColorAndElevation(density: number, isRedZone: boolean) {
  if (isRedZone || density > 80) return { color: '#ff1744', signal: 'red', elevation: 0.4 + (density / 100) * 1.6 };
  if (density > 55) return { color: '#ff9100', signal: 'orange', elevation: 0.3 + (density / 100) * 1.2 };
  if (density > 25) return { color: '#ffd600', signal: 'amber', elevation: 0.2 + (density / 100) * 1.0 };
  return { color: '#00e676', signal: 'green', elevation: 0.1 + (density / 100) * 0.8 };
}

export function Karnataka3DMap() {
  const { geoData, loading, error } = useKarnatakaGeoData();
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  if (loading) return <div className="h-[70vh] flex items-center justify-center"><span className="text-text-muted">Loading map data...</span></div>;
  if (error || !geoData) return <div className="h-[70vh] flex items-center justify-center"><span className="text-red-critical">Failed to load Karnataka map</span></div>;

  return (
    <div className="relative w-full h-[75vh] rounded-2xl overflow-hidden">
      {/* Top-left instructions */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-text-secondary border border-white/10">
        🖱️ Drag to orbit · Scroll to zoom · Click district
      </div>

      {/* Top-right stats */}
      <div className="absolute top-4 right-4 z-10 flex gap-3">
        <DistrictStatBadge label="Red Zones" value="6" color="#ff1744" />
        <DistrictStatBadge label="Active Alerts" value="23" color="#ff9100" />
        <DistrictStatBadge label="Stable" value="12" color="#00e676" />
      </div>

      {/* Color Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 text-xs space-y-1.5">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{background:'#ff1744'}}></span> Critical (80-100)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{background:'#ff9100'}}></span> High (55-79)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{background:'#ffd600'}}></span> Medium (25-54)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{background:'#00e676'}}></span> Low (0-24)</div>
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg text-xs text-text-secondary border border-white/10 hover:border-gold/40 transition-all"
          onClick={() => /* reset camera */}>
          🎯 Reset View
        </button>
        <button className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg text-xs text-text-secondary border border-white/10 hover:border-gold/40 transition-all"
          onClick={() => /* toggle auto-rotate */}>
          🔄 Auto-Rotate
        </button>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 5, 10], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor('#05070a')}
      >
        {/* Atmosphere */}
        <fog args={['#05070a', 8, 18]} attach="fog" />
        <hemisphereLight args={['#1a237e', '#05070a', 0.5]} />
        <directionalLight position={[5, 10, 5]} intensity={0.3} />
        <ambientLight intensity={0.2} />

        {/* Ground grid — holographic floor */}
        <gridHelper args={[14, 28, '#00e5ff', '#1a237e']} position={[0, -0.05, 0]} opacity={0.12} transparent />

        {/* The Map */}
        <group rotation={[-0.25, 0, 0]} position={[0, 0, 0]}>
          <Suspense fallback={null}>
            {geoData.features.map((feature) => {
              const { crimeDensity, isRedZone } = feature.properties;
              const { color, elevation } = getColorAndElevation(crimeDensity, isRedZone);
              const isHovered = hoveredDistrict === feature.properties.id;
              const isSelected = selectedDistrict === feature.properties.id;

              return (
                <group key={feature.properties.id}>
                  {/* Extruded district */}
                  <DistrictMesh3D
                    feature={feature}
                    elevation={elevation}
                    color={color}
                    emissiveIntensity={0.1 + (crimeDensity / 100) * 0.4}
                    isHovered={isHovered}
                    isSelected={isSelected}
                    onClick={() => setSelectedDistrict(feature.properties.id)}
                    onHover={() => setHoveredDistrict(feature.properties.id)}
                    onUnhover={() => setHoveredDistrict(null)}
                  />

                  {/* Border outline */}
                  <DistrictBorder feature={feature} color={isHovered ? '#f6c453' : color} />

                  {/* Red zone pulsing ring */}
                  {isRedZone && (
                    <PulsingRing feature={feature} color="#ff1744" intensity={crimeDensity / 100} />
                  )}

                  {/* District name label */}
                  {isHovered && (
                    <Text
                      position={[ /* center of district */ ]}
                      fontSize={0.08}
                      color="#f6c453"
                      anchorX="center"
                      anchorY="middle"
                    >
                      {feature.properties.name}
                    </Text>
                  )}
                </group>
              );
            })}

            {/* Hotspot particles */}
            <HotspotColumn position={[ /* bengaluru */ ]} count={87} color="#ff1744" />
            <HotspotColumn position={[ /* mysuru */ ]} count={45} color="#ff9100" />
            <HotspotColumn position={[ /* hubli */ ]} count={32} color="#ffd600" />
          </Suspense>
        </group>

        {/* Ambient particles */}
        <AmbientParticles count={400} />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={4}
          maxDistance={16}
          autoRotate
          autoRotateSpeed={0.5}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
```

### Visual Layer Details

**District coloring rules (LIVE — not static):**
- `crimeDensity > 80` or `isRedZone: true` → **BRIGHT RED** (#ff1744) — emergency glow
- `crimeDensity > 55` → **ORANGE** (#ff9100) — warning, thermal intensity
- `crimeDensity > 25` → **AMBER/YELLOW** (#ffd600) — caution
- `crimeDensity <= 25` → **GREEN** (#00e676) — safe

**The district border glow:**
```tsx
// Animated dashed border that flows along each district boundary
// Dash offset animates with useFrame to create flow effect
// Border color matches district color but brighter
// On hover: border turns gold (#f6c453) and thickens
```

**The hotspot particle columns:**
```tsx
// For major crime clusters, a column of particles rises UP from the district
// Particle count = number of crimes in that cluster
// Particle color = crime type (violent = red, cyber = cyan, property = amber)
// Particles float upward and fade out, looping continuously
// Height of column = severity of the cluster
```

**Red zone pulsing rings:**
```tsx
// An expanding/contracting ring around red-zone districts
// Uses useFrame to pulse: scale oscillates between 0.8× and 1.2×
// Opacity oscillates between 0.2 and 0.5
// Color: bright red with glow
// The ring sits flat on the ground plane, NOT elevated
```

---

## ═══════════════════════════════════════════════════════════════
## 2️⃣ THE 4-RING RADIAL NAVIGATION WHEEL
## ═══════════════════════════════════════════════════════════════

### What to Build

A **circular navigation menu** split into 4 colored segments (like a pie chart). Each segment is a ring section that represents a main category. The wheel sits in the center of the page or as a floating command dial.

Think: *Iron Man's holographic interface × Spider-Verse dimension wheel × Minority Report gesture menu*

### Visual Design

```
                      ┌──────────────────────┐
                    ╱ │      CRIME TRACK      │ ╲
                  ╱   │       🔴 Red Zone      │   ╲
                ╱     │    12,847 crimes       │     ╲
              ╱       └──────────────────────┘       ╲
            ╱          ┌──────────────────────┐        ╲
          ╱           ╱                        ╲          ╲
        ╱            ╱          ULTRON           ╲           ╲
      ╱             ╱            HUB              ╲            ╲
     ╱              ╲                            ╱              ╲
    ╱                ╲                          ╱                ╲
   ╱                  └────────────────────────┘                  ╲
  ╱                                                               ╲
  ╲                    ┌──────────────────────┐                    ╱
   ╲                  ╱       CYBER TRACK      ╲                  ╱
    ╲                ╱       🔵 Cyber Threat     ╲               ╱
     ╲              ╱     1,247 incidents        ╲              ╱
      ╲            ╱                              ╲            ╱
        ╲         └──────────────────────────────┘          ╱
          ╲        ┌──────────────────────┐                ╱
            ╲     ╱       INTELLIGENCE     ╲              ╱
              ╲  ╱     🟣 Intel Briefing     ╲           ╱
                ╲    23 active predictions    ╱         ╱
                  ╲                          ╱        ╱
                    └──────────────────────┘        ╱
```

### Implementation

```tsx
// features/radial-wheel/RadialNavigationWheel.tsx
// THE 4-RING RADIAL NAVIGATION WHEEL

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface RingSegment {
  id: string;
  label: string;
  sublabel: string;
  icon: string;  // emoji or lucide icon name
  color: string;
  glowColor: string;
  path: string;
  angle: number;  // Start angle in degrees
  arcLength: number; // 90 degrees for 4 segments
  stats: {
    primary: string;
    label: string;
    trend: string;
  };
}

const SEGMENTS: RingSegment[] = [
  {
    id: 'crime',
    label: 'CRIME',
    sublabel: 'Track & Analyze',
    icon: '🔴',
    color: '#ff1744',
    glowColor: 'rgba(255, 23, 68, 0.3)',
    path: '/crime',
    angle: -45,       // Top-right
    arcLength: 90,
    stats: { primary: '12,847', label: 'Total Cases', trend: '+5.2%' },
  },
  {
    id: 'cyber',
    label: 'CYBER',
    sublabel: 'Digital Forensics',
    icon: '🔵',
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.3)',
    path: '/cyber',
    angle: 45,        // Bottom-right
    arcLength: 90,
    stats: { primary: '1,247', label: 'Incidents', trend: '+12.8%' },
  },
  {
    id: 'intel',
    label: 'INTEL',
    sublabel: 'Intelligence Hub',
    icon: '🟣',
    color: '#7c4dff',
    glowColor: 'rgba(124, 77, 255, 0.3)',
    path: '/intel',
    angle: 135,       // Bottom-left
    arcLength: 90,
    stats: { primary: '23', label: 'Active Intel', trend: '-3.1%' },
  },
  {
    id: 'maps',
    label: 'MAPS',
    sublabel: 'Geospatial View',
    icon: '🟢',
    color: '#00e676',
    glowColor: 'rgba(0, 230, 118, 0.3)',
    path: '/maps',
    angle: 225,       // Top-left
    arcLength: 90,
    stats: { primary: '6', label: 'Layers Active', trend: '—' },
  },
];

export function RadialNavigationWheel() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Auto-rotate slowly when idle
  useEffect(() => {
    if (isExpanded) return;
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isExpanded]);

  // SVG arc path calculator
  function describeArc(
    cx: number, cy: number,
    outerRadius: number, innerRadius: number,
    startAngle: number, endAngle: number
  ): string {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + outerRadius * Math.cos(startRad);
    const y1 = cy + outerRadius * Math.sin(startRad);
    const x2 = cx + outerRadius * Math.cos(endRad);
    const y2 = cy + outerRadius * Math.sin(endRad);
    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');
  }

  const CX = 200;
  const CY = 200;
  const OUTER_R = 180;
  const INNER_R = 80;
  const CENTER_R = 45;

  return (
    <div className="relative flex items-center justify-center w-[400px] h-[400px]">
      <motion.div
        ref={wheelRef}
        className="relative cursor-pointer"
        animate={{ rotate: rotation }}
        transition={{ duration: 0.1, ease: 'linear' }}
      >
        <svg width="400" height="400" viewBox="0 0 400 400">
          {/* Glow filters */}
          <defs>
            {SEGMENTS.map(seg => (
              <filter key={`glow-${seg.id}`} id={`glow-${seg.id}`}>
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            ))}
            <filter id="centerGlow">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Ring segments */}
          {SEGMENTS.map(seg => {
            const isHovered = hoveredId === seg.id;
            const hoverScale = isHovered ? 1.04 : 1;
            const opacity = hoveredId && !isHovered ? 0.4 : 1;
            
            return (
              <g key={seg.id}
                filter={isHovered ? `url(#glow-${seg.id})` : undefined}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
              >
                <motion.path
                  d={describeArc(
                    CX, CY,
                    OUTER_R * hoverScale, INNER_R * hoverScale,
                    seg.angle, seg.angle + seg.arcLength
                  )}
                  fill={seg.color}
                  fillOpacity={isHovered ? 0.35 : 0.18}
                  stroke={seg.color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeOpacity={isHovered ? 0.9 : 0.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, opacity }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  onClick={() => navigate(seg.path)}
                  onMouseEnter={() => setHoveredId(seg.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="transition-all duration-300"
                  style={{ cursor: 'pointer' }}
                />
                
                {/* Segment label — positioned at center of arc */}
                <motion.text
                  x={CX + (OUTER_R * 0.72) * Math.cos((seg.angle + seg.arcLength / 2) * Math.PI / 180)}
                  y={CY + (OUTER_R * 0.72) * Math.sin((seg.angle + seg.arcLength / 2) * Math.PI / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ebf0f7"
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="Space Grotesk, sans-serif"
                  letterSpacing="2"
                  opacity={opacity}
                >
                  {seg.label}
                </motion.text>

                {/* Stats icon at outer edge */}
                <motion.text
                  x={CX + (OUTER_R * 0.88) * Math.cos((seg.angle + seg.arcLength / 2) * Math.PI / 180)}
                  y={CY + (OUTER_R * 0.88) * Math.sin((seg.angle + seg.arcLength / 2) * Math.PI / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  opacity={opacity}
                >
                  {seg.icon}
                </motion.text>

                {/* Hover tooltip - radial stats */}
                {isHovered && (
                  <g>
                    <motion.text
                      x={CX + (OUTER_R * 0.60) * Math.cos((seg.angle + seg.arcLength / 2) * Math.PI / 180)}
                      y={CY + (OUTER_R * 0.60) * Math.sin((seg.angle + seg.arcLength / 2) * Math.PI / 180) - 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={seg.color}
                      fontSize="18"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {seg.stats.primary}
                    </motion.text>
                    <motion.text
                      x={CX + (OUTER_R * 0.60) * Math.cos((seg.angle + seg.arcLength / 2) * Math.PI / 180)}
                      y={CY + (OUTER_R * 0.60) * Math.sin((seg.angle + seg.arcLength / 2) * Math.PI / 180) + 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="Inter, sans-serif"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {seg.stats.label}
                    </motion.text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Outer ring glow */}
          <circle
            cx={CX} cy={CY} r={OUTER_R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />

          {/* Inner decorative rings */}
          <circle
            cx={CX} cy={CY} r={INNER_R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle
            cx={CX} cy={CY} r={CENTER_R + 10}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />

          {/* Center hub — ULTRON logo */}
          <motion.g
            filter="url(#centerGlow)"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx={CX} cy={CY} r={CENTER_R} fill="#0d1520" stroke="#f6c453" strokeWidth="2" />
            {/* KSP shield icon */}
            <text x={CX} y={CY - 3} textAnchor="middle" dominantBaseline="middle" fill="#f6c453" fontSize="11" fontFamily="Inter" fontWeight="700">KSP</text>
            <text x={CX} y={CY + 12} textAnchor="middle" dominantBaseline="middle" fill="#f6c453" fontSize="7" fontFamily="Space Grotesk" letterSpacing="1">ULTRON</text>
          </motion.g>

          {/* Tick marks on outer ring (8 ticks for precision look) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <line
              key={angle}
              x1={CX + (OUTER_R + 5) * Math.cos(angle * Math.PI / 180)}
              y1={CY + (OUTER_R + 5) * Math.sin(angle * Math.PI / 180)}
              x2={CX + (OUTER_R + 10) * Math.cos(angle * Math.PI / 180)}
              y2={CY + (OUTER_R + 10) * Math.sin(angle * Math.PI / 180)}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          ))}
        </svg>
      </motion.div>

      {/* Click-to-navigate indicator */}
      <div className="absolute -bottom-8 text-center text-xs text-text-muted">
        Hover a segment to preview · Click to navigate
      </div>
    </div>
  );
}
```

### How It Floats on the Page

The radial wheel should appear as a **floating holographic overlay** on the command center page. It's positioned to the right of the 3D map, or as a centerpiece on a landing section.

```tsx
// Position: absolute, centered in the right half of the hero
// Background: transparent with a subtle circular glow behind it
// Animation: fades in + scales up on page load (1.5s stagger)
// On scroll: wheel shrinks and moves to top-right corner (sticky mini version)
```

```tsx
// Mini version (sticky on scroll)
function MiniRadialWheel() {
  // Shrunk to 120px
  // Only shows the 4 outer rings as thin colored arcs
  // Center shows a pulsing dot
  // Click opens the full wheel as a modal overlay
}
```

### Alternative — The Horizontal Scroll Snap Wheel

If radial doesn't fit, create a **horizontal scroll-snap wheel**:

```tsx
// A horizontal row of 4 circular cards
// Each card: icon, label, stat, colored border
// Scroll snap: each card snaps to center
// 3D effect: non-centered cards tilt away with rotateY(-15deg)
// Background of each card: glass morphism with tint matching segment color
// Animated scroll indicator at bottom

// Auto-scrolls through the 4 segments every 5 seconds
// Pause on hover
// Click card → navigate to section
```

---

## ═══════════════════════════════════════════════════════════════
## 3️⃣ SICK ANIMATIONS (anime.js style with framer-motion)
## ═══════════════════════════════════════════════════════════════

### Animation Philosophy

Use **framer-motion** as the animation engine. Every animation must feel like it belongs in a Hollywood sci-fi interface. Think: *Spider-Verse impact frames × Batman Arkham UI × Iron Man holograms × animejs.com demos.*

### 1. SCROLL-TRIGGERED ANIMATIONS (Like animejs.com scroll)

```tsx
// ScrollReveal.tsx — reusable wrapper for scroll-triggered animations
// Each element animates when it enters the viewport

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({
  children, className, delay = 0,
  direction = 'up', distance = 60,
  duration = 0.6, once = true
}: ScrollRevealProps) {
  const [ref, inView] = useInView({ triggerOnce: once, margin: '-50px' });

  const directionVariants = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: { scale: 0.9, opacity: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ ...directionVariants[direction], opacity: 0 }}
      animate={inView ? { x: 0, y: 0, scale: 1, opacity: 1 } : {}}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for snappy feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**Usage on EVERY page:**
```tsx
// Cards stagger in as user scrolls
<section className="space-y-6">
  <ScrollReveal delay={0}>
    <h1 className="text-3xl font-display font-bold">Crime Overview</h1>
  </ScrollReveal>
  
  <div className="grid grid-cols-3 gap-4">
    <ScrollReveal delay={0.1}>
      <KpiCard title="Total Cases" value="12,847" />
    </ScrollReveal>
    <ScrollReveal delay={0.2}>
      <KpiCard title="Active" value="843" />
    </ScrollReveal>
    <ScrollReveal delay={0.3}>
      <KpiCard title="Closed" value="11,284" />
    </ScrollReveal>
  </div>
  
  <ScrollReveal delay={0.2} direction="left">
    <CrimeChart />
  </ScrollReveal>
</section>
```

### 2. STAGGER ANIMATIONS (Like animejs.com stagger)

```tsx
// StaggerContainer.tsx — animates children one by one with mounting delay

import { motion, type Variants } from 'framer-motion';

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export function StaggerContainer({
  children, staggerDelay = 0.08,
  className, direction = 'up'
}: StaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const childVariants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
      scale: direction === 'fade' ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

// Usage: Grid of KPI cards that stagger in
<StaggerContainer className="grid grid-cols-3 gap-4" staggerDelay={0.1}>
  {kpis.map(kpi => (
    <KpiCard key={kpi.id} {...kpi} />
  ))}
</StaggerContainer>
```

### 3. MORPHING SVG ANIMATIONS (Like animejs.com morphing)

```tsx
// MorphingPath.tsx — SVG path morphing animation (like animejs morphing demos)

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Path data for different shapes
const PATHS = {
  shield: 'M12 2L3 7v6c0 5.25 3.83 10.04 9 11 5.17-.96 9-5.75 9-11V7l-9-5z',
  hexagon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  circle: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
  triangle: 'M12 2L2 22h20L12 2z',
  diamond: 'M12 2L22 12 12 22 2 12 12 2z',
};

export function MorphingIcon() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const shapes = Object.values(PATHS);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % shapes.length);
    }, 2000);
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
          key={currentIndex}
          d={shapes[currentIndex]}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          exit={{ pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
    </motion.svg>
  );
}
```

### 4. TIMELINE-BASED SEQUENTIAL ANIMATIONS (Like animejs.com timeline)

```tsx
// TimelineAnimation.tsx — sequential animation timeline (like animejs timeline)

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export function CommandCenterEntrance() {
  const controls = useAnimation();

  useEffect(() => {
    async function sequence() {
      // Step 1: BG dark overlay fades in
      await controls.start('bg');
      // Step 2: Title slides down
      await controls.start('title');
      // Step 3: Subtitle fades in
      await controls.start('subtitle');
      // Step 4: KPI cards stagger
      await controls.start('kpis');
      // Step 5: Chart fades in from right
      await controls.start('chart');
      // Step 6: Final glow pulse
      await controls.start('glow');
    }
    sequence();
  }, []);

  return (
    <div className="relative">
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          bg: { opacity: 1, transition: { duration: 0.8 } },
        }}
        initial="hidden"
        animate={controls}
      >
        {/* Background layer */}
      </motion.div>

      <motion.h1
        variants={{
          hidden: { opacity: 0, y: -30 },
          title: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
        }}
        initial="hidden"
        animate={controls}
      >
        Command Center
      </motion.h1>

      <motion.p
        variants={{
          hidden: { opacity: 0 },
          subtitle: { opacity: 1, transition: { duration: 0.4 } },
        }}
        initial="hidden"
        animate={controls}
      >
        Real-time crime monitoring dashboard
      </motion.p>

      <motion.div
        variants={{
          hidden: { opacity: 0 },
          kpis: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
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

### 5. HOVER ANIMATIONS (Every interactive element)

```tsx
// ScaleLift — wrapper that adds hover lift + glow
export function ScaleLift({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="transition-shadow duration-200 hover:shadow-lg"
    >
      {children}
    </motion.div>
  );
}
```

### 6. NUMBER COUNT-UP (Like animejs count-up)

```tsx
// useCountUp.ts — animated counter hook

import { useState, useEffect, useRef } from 'react';

export function useCountUp(
  target: number,
  duration: number = 1000,
  enabled: boolean = true
): number {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(null);

  useEffect(() => {
    if (!enabled) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = timestamp - startTime.current;
      const percentage = Math.min(progress / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - percentage, 3);
      setCount(Math.floor(eased * target));
      
      if (percentage < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      startTime.current = null;
    };
  }, [target, duration, enabled]);

  return count;
}

// Usage:
function KpiCard({ value, label }: { value: number; label: string }) {
  const [ref, inView] = useInView({ triggerOnce: true });
  const count = useCountUp(value, 1500, inView);

  return (
    <div ref={ref} className="glass-card p-4">
      <motion.span
        className="text-3xl font-mono font-bold text-text-primary"
        key={count}
      >
        {count.toLocaleString()}
      </motion.span>
      <span className="text-sm text-text-muted">{label}</span>
    </div>
  );
}
```

### 7. TEXT ANIMATIONS (Typewriter + Glitch)

```tsx
// TypewriterText.tsx
export function TypewriterText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="text-gold"
      >
        |
      </motion.span>
    </span>
  );
}

// GlitchText.tsx — CSS-based glitch effect
// Uses CSS pseudo-elements for the glitch offset
// Works best on large headings

// CSS:
// @keyframes glitch {
//   0% { clip-path: inset(0 0 80% 0); transform: translate(-2px, 2px); }
//   20% { clip-path: inset(20% 0 60% 0); transform: translate(2px, -2px); }
//   40% { clip-path: inset(40% 0 40% 0); transform: translate(-1px, 1px); }
//   60% { clip-path: inset(60% 0 20% 0); transform: translate(1px, -1px); }
//   80% { clip-path: inset(80% 0 0 0); transform: translate(-2px, 2px); }
//   100% { clip-path: inset(0 0 80% 0); transform: translate(2px, -2px); }
// }
```

### 8. PARALLAX SCROLL EFFECT

```tsx
// ParallaxSection.tsx — background moves slower than foreground on scroll

import { motion, useScroll, useTransform } from 'framer-motion';

export function ParallaxSection({ children, bgSpeed = 0.5 }: { children: React.ReactNode; bgSpeed?: number }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${bgSpeed * 100}%`]);

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        {/* Background particles or gradient */}
      </motion.div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

### 9. PAGE TRANSITIONS (3D Cube Effect)

```tsx
// PageTransition.tsx — wraps each page for entrance animation

import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    rotateY: 3,
    filter: 'blur(4px)',
  },
  in: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    filter: 'blur(0px)',
  },
  out: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(4px)',
  },
};

const pageTransition = {
  type: 'tween',
  ease: [0.22, 1, 0.36, 1],
  duration: 0.35,
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

// Usage in router:
// <AnimatePresence mode="wait">
//   <Routes location={location} key={location.pathname}>
//     <Route path="/" element={<PageTransition><CommandCenterPage /></PageTransition>} />
//     ...
//   </Routes>
// </AnimatePresence>
```

### 10. LOADING ANIMATION (The Shield)

```tsx
// LoadingShield.tsx — animated KSP shield that appears on initial load

export function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#05070a]"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Shield SVG with glow */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#f6c453" strokeWidth="1.5">
          <motion.path
            d="M12 2L3 7v6c0 5.25 3.83 10.04 9 11 5.17-.96 9-5.75 9-11V7l-9-5z"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </svg>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-2xl font-display font-bold text-gold mt-4 tracking-widest"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        ULTRON
      </motion.h1>

      {/* Loading bar */}
      <motion.div
        className="w-48 h-0.5 bg-white/10 rounded-full mt-6 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="h-full bg-gold rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut', delay: 0.8 }}
        />
      </motion.div>

      <motion.p
        className="text-xs text-text-muted mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Initializing Command Center...
      </motion.p>
    </motion.div>
  );
}
```

### 11. CHART ANIMATIONS (Like animejs.com chart demos)

```tsx
// Every Recharts chart must animate on mount:
// <AreaChart>
//   <defs>
//     <linearGradient id="colorCrime" x1="0" y1="0" x2="0" y2="1">
//       <stop offset="5%" stopColor="#ff1744" stopOpacity={0.3}/>
//       <stop offset="95%" stopColor="#ff1744" stopOpacity={0}/>
//     </linearGradient>
//   </defs>
//   <Area type="monotone" dataKey="value" stroke="#ff1744" fill="url(#colorCrime)">
//     <animate attributeName="opacity" from="0" to="1" dur="1s" />
//   </Area>
// </AreaChart>

// Better approach — use framer-motion with Recharts:
// Wrap chart in motion.div with layout animations
// Set isAnimationActive={true} on all charts
```

### 12. PARTICLE BACKGROUND (Canvas-based)

```tsx
// ParticleBackground.tsx — 150 floating particles with connection lines
// Uses HTML Canvas (not Three.js) for performance
// Particles drift slowly, connected by lines when close
// Colors: gold, cyan, violet with low opacity
// Mouse: particles near cursor connect with gold lines

// Connection line opacity = f(distance):
// dist < 50px → opacity 0.3
// dist < 100px → opacity 0.15
// dist < 150px → opacity 0.05
// dist >= 150px → no line

// Each particle has:
// { x, y, vx, vy, radius: 1-3px, color, opacity: 0.1-0.3 }
// Particles bounce off canvas edges with 30px padding

// requestAnimationFrame loop:
// 1. Clear canvas with semi-transparent rect for trail effect
// 2. Update positions
// 3. Draw particles
// 4. Draw connections
// 5. Draw mouse connections
```

---

## ═══════════════════════════════════════════════════════════════
## PUTTING IT ALL TOGETHER — The Command Center Hero Section
## ═══════════════════════════════════════════════════════════════

This is the **final composition** for the command center homepage hero section. It combines:
1. The 3D Karnataka Map (background/top)
2. The Radial Navigation Wheel (floating over right side)
3. All the sick animations (scroll-triggered, stagger, morph, timeline)

```
┌──────────────────────────────────────────────────────────────────┐
│ [KSP Command Bar]                                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    3D KARNATAKA MAP                     │     │
│  │                    (Three.js Scene)                     │  ┌──┐│
│  │                                                        │  │  ││
│  │   Districts glow red/orange/amber/green                │  │  ││
│  │   Particle columns rise from hotspots                  │  │  ││
│  │   Red zone rings pulse                                 │  │  ││
│  │   Auto-rotate camera                                   │  │  ││
│  │                                                        │  │  ││
│  │                                                        │  │ ⭕││
│  │                                                        │  │  ││
│  │                                                        │  │  ││
│  │                                                        │  │  ││
│  │                                                        │  └──┘│
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Total │ │Active│ │Alerts│ │Cyber │ │Red   │ │ML    │        │
│  │Crimes│ │Cases │ │Today │ │Inc.  │ │Zones │ │Active│        │
│  │12,847│ │ 843  │ │  47  │ │ 128  │ │  6   │ │8/8   │        │
│  │ -2.3%│ │ +5.1%│ │ +12% │ │ -8%  │ │ ⚠️   │ │ ✅   │        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                                                  │
│  ┌────────────────────┐ ┌────────────────────┐ ┌──────────────┐ │
│  │ Crime Trend        │ │ Cyber Threat       │ │ Red Zone     │ │
│  │ (Area Chart)       │ │ (Bar Chart)        │ │ Alerts       │ │
│  └────────────────────┘ └────────────────────┘ └──────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Complete Page Component

```tsx
// pages/CommandCenterPage.tsx
// THE MASTER PAGE — assembles everything

import { motion } from 'framer-motion';
import { Karnataka3DMap } from '@/features/command-center/Karnataka3DMap';
import { RadialNavigationWheel } from '@/features/radial-wheel/RadialNavigationWheel';
import { StaggerContainer } from '@/shared/components/StaggerContainer';
import { ScrollReveal } from '@/shared/components/ScrollReveal';
import { KpiCard } from '@/shared/components/KpiCard';
import { CrimeTrendChart } from '@/features/crime/CrimeTrendChart';
import { CyberThreatChart } from '@/features/cyber/CyberThreatChart';
import { RedZoneFeed } from '@/features/crime/RedZoneFeed';
import { ParticleBackground } from '@/shared/components/ParticleBackground';

export default function CommandCenterPage() {
  const kpis = [
    { id: '1', label: 'Total Crimes', value: 12847, trend: -2.3, icon: 'scale', color: '#f6c453' },
    { id: '2', label: 'Active Cases', value: 843, trend: 5.1, icon: 'activity', color: '#ff1744' },
    { id: '3', label: 'Alerts Today', value: 47, trend: 12, icon: 'bell', color: '#ff9100' },
    { id: '4', label: 'Cyber Incidents', value: 128, trend: -8, icon: 'shield', color: '#00e5ff' },
    { id: '5', label: 'Red Zones', value: 6, trend: null, icon: 'map-pin', color: '#ff1744' },
    { id: '6', label: 'ML Models Active', value: 8, trend: null, icon: 'cpu', color: '#00e676' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Particle background — site-wide */}
      <ParticleBackground />
      
      {/* Hero section with 3D map + radial wheel */}
      <section className="relative h-[80vh]">
        <div className="absolute inset-0">
          <Karnataka3DMap />
        </div>
        
        {/* Radial wheel overlay — bottom-right */}
        <div className="absolute bottom-0 right-0 p-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <RadialNavigationWheel />
          </motion.div>
        </div>
        
        {/* Entrance title */}
        <div className="absolute top-8 left-8">
          <motion.h1
            className="text-4xl font-display font-bold text-text-primary"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Command Center
          </motion.h1>
          <motion.p
            className="text-sm text-text-muted mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Karnataka State Police · Real-time Crime Monitoring
          </motion.p>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="px-6 -mt-16 relative z-10">
        <ScrollReveal>
          <StaggerContainer className="grid grid-cols-6 gap-4">
            {kpis.map(kpi => (
              <KpiCard key={kpi.id} {...kpi} />
            ))}
          </StaggerContainer>
        </ScrollReveal>
      </section>

      {/* Charts section */}
      <section className="px-6 py-12 grid grid-cols-3 gap-6">
        <ScrollReveal direction="left" delay={0.1}>
          <CrimeTrendChart />
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.2}>
          <CyberThreatChart />
        </ScrollReveal>
        <ScrollReveal direction="right" delay={0.3}>
          <RedZoneFeed />
        </ScrollReveal>
      </section>
      
      {/* More sections with scroll animations */}
      {/* ... */}
    </div>
  );
}
```

---

## ═══════════════════════════════════════════════════════════════
## RECAP — What This Prompt Covers
## ═══════════════════════════════════════════════════════════════

### 1️⃣ The Karnataka Map (REAL GeoJSON)
- Loads `karnataka-districts.geojson` with all 31 districts
- Converts longitude/latitude to 3D space using coordinate projection
- Creates extruded district meshes with `THREE.ExtrudeGeometry`
- Color-coded by crime density: **Red > Orange > Amber > Green**
- Districts glow (emissive) proportional to crime severity
- Hotspot particle columns rising from high-crime areas
- Red zone pulsing rings with `useFrame` oscillating animation
- Animated dashed borders flowing along district boundaries
- Floating district name labels on hover
- Holographic ground grid underneath
- 400 ambient particles floating around the scene
- Fog atmosphere + hemisphere lighting
- Auto-rotating OrbitControls + click-to-zoom district drill-down
- Color legend + overlay UI with reset/auto-rotate buttons

### 2️⃣ The 4-Ring Radial Navigation Wheel
- SVG-based circular menu with 4 segments (Crime, Cyber, Intel, Maps)
- Each segment: colored arc with icon, label, hover tooltip with stats
- Center hub: KSP/ULTRON logo with breathing animation
- Auto-rotates slowly when idle
- Hover: segment expands, glows, shows detailed stats
- Click: navigates to section
- SVG glow filters for neon effect
- Tick marks on outer ring for precision look
- Mini version for sticky scroll behavior

### 3️⃣ Sick animations (animejs.com style)
- **ScrollReveal** — elements animate when scrolled into view
- **StaggerContainer** — children animate one by one with delay
- **MorphingPath** — SVG paths morph between shapes (shield ↔ hexagon ↔ circle)
- **Timeline** — sequential animation pipeline (bg → title → subtitle → cards → chart)
- **ScaleLift** — hover lift + spring effect on every card
- **useCountUp** — numbers count up with easing when scrolled into view
- **TypewriterText** — characters appear one by one with blinking cursor
- **GlitchText** — CSS glitch effect on hero headings
- **ParallaxSection** — background parallax on scroll
- **PageTransition** — 3D rotate + blur page transitions
- **LoadingShield** — animated KSP shield with progress bar
- **ParticleBackground** — 150 floating particles with connection lines

---

## GENERATE THIS

Generate the **ENTIRE `frontend/` directory** with ALL these components working together. The output must be a fully functional React 19 + TypeScript + Vite app that runs with `npm install && npm run dev`.

**THE THREE PILLARS:**
1. A working 3D Karnataka map with real GeoJSON districts that glow red/orange/green
2. A beautiful 4-segment radial navigation wheel that auto-rotates
3. Smooth, animejs.com-level animations on every interaction

**MAKE IT SICK.**
