import React, { useEffect, useRef, useState } from 'react';

const HOJAS_FLOTANTES = [
  { id: 1, left: '5%', delay: '-2s', duration: '15s', size: 20, color: '#22c55e', variant: 1, shape: 0 },
  { id: 2, left: '12%', delay: '-9s', duration: '19s', size: 15, color: '#16a34a', variant: 2, shape: 1 },
  { id: 3, left: '19%', delay: '3.2s', duration: '17s', size: 18, color: '#84cc16', variant: 3, shape: 2 },
  { id: 4, left: '27%', delay: '-5.5s', duration: '21s', size: 14, color: '#4ade80', variant: 1, shape: 0 },
  { id: 5, left: '35%', delay: '6.5s', duration: '16.5s', size: 19, color: '#15803d', variant: 2, shape: 1 },
  { id: 6, left: '44%', delay: '-12s', duration: '20s', size: 16, color: '#65a30d', variant: 3, shape: 2 },
  { id: 7, left: '52%', delay: '1.8s', duration: '18.5s', size: 15, color: '#4ade80', variant: 1, shape: 0 },
  { id: 8, left: '61%', delay: '-7.2s', duration: '16s', size: 21, color: '#16a34a', variant: 2, shape: 1 },
  { id: 9, left: '69%', delay: '4.8s', duration: '19.5s', size: 17, color: '#2e8b57', variant: 3, shape: 2 },
  { id: 10, left: '77%', delay: '-3.6s', duration: '17.5s', size: 16, color: '#84cc16', variant: 1, shape: 0 },
  { id: 11, left: '84%', delay: '2.4s', duration: '18s', size: 19, color: '#22c55e', variant: 2, shape: 1 },
  { id: 12, left: '91%', delay: '-10.4s', duration: '21.5s', size: 15, color: '#65a30d', variant: 3, shape: 2 },
  { id: 13, left: '96%', delay: '7.5s', duration: '15.8s', size: 14, color: '#4ade80', variant: 1, shape: 0 },
  { id: 14, left: '8%', delay: '-14s', duration: '22s', size: 17, color: '#a3e635', variant: 2, shape: 2 }
];

const MOTAS_LUZ = [
  { id: 1, left: '12%', top: '26%', delay: '0s', duration: '9s', size: 6 },
  { id: 2, left: '24%', top: '48%', delay: '2s', duration: '11s', size: 5 },
  { id: 3, left: '38%', top: '20%', delay: '4s', duration: '10s', size: 7 },
  { id: 4, left: '54%', top: '38%', delay: '1s', duration: '12s', size: 5 },
  { id: 5, left: '68%', top: '28%', delay: '3.5s', duration: '9.5s', size: 6 },
  { id: 6, left: '80%', top: '44%', delay: '5s', duration: '11.5s', size: 5 },
  { id: 7, left: '90%', top: '30%', delay: '2.5s', duration: '10.5s', size: 6 },
  { id: 8, left: '17%', top: '62%', delay: '6s', duration: '12.5s', size: 4 }
];

const TREE_PALETTES = {
  'left-lg': ['#22c55e', '#16a34a', '#4ade80', '#84cc16', '#bef264', '#15803d'],
  'left-sm': ['#40916c', '#52b788', '#74c69d', '#65a30d', '#a3b18a'],
  'right-lg': ['#16a34a', '#22c55e', '#4ade80', '#84cc16', '#d9ed92', '#15803d'],
  'right-sm': ['#22c55e', '#74c69d', '#a3e635', '#bef264', '#4ade80']
};

const PROXIMITY_PX = 42;
const SPAWN_THROTTLE_MS = 85;
const MAX_INTERACTIVE_LEAVES = 42;

function LeafGlyph({ shape = 0, color = '#22c55e', opacity = 0.62 }) {
  if (shape === 1) {
    // Hoja ovalada de naranjo / limonero con nervadura central
    return (
      <>
        <path
          d="M12 2C17.5 4.8 20.5 10.2 19.5 15.8C18.6 19.8 15.2 21.8 12 22C8.8 21.8 5.4 19.8 4.5 15.8C3.5 10.2 6.5 4.8 12 2Z"
          fill={color}
          fillOpacity={opacity}
        />
        <path
          d="M12 3.5V22.5M12 9L15.5 7M12 13.5L8.2 11.2M12 17L15.2 15"
          stroke="#ecfccb"
          strokeOpacity={opacity * 0.85}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </>
    );
  }

  if (shape === 2) {
    // Hoja alargada de olivo / brote tierno
    return (
      <>
        <path
          d="M19 3C12 4.2 6.8 8.8 5.2 15.5C4.5 18.4 5.2 20.4 6.5 21.2C8.2 20.5 11.4 19.8 14.5 17.5C19.5 13.8 20.6 7.4 19 3Z"
          fill={color}
          fillOpacity={opacity}
        />
        <path
          d="M18.2 4.2C13.5 9.2 9.4 14.8 5.5 21.8"
          stroke="#f7fee7"
          strokeOpacity={opacity * 0.8}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </>
    );
  }

  // Hoja clásica de manzano con tallo y nervadura
  return (
    <>
      <path
        d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z"
        fill={color}
        fillOpacity={opacity}
      />
      <path
        d="M6.8 18.8C10.2 14.2 14.5 10.6 19.5 6.4"
        stroke="#ecfccb"
        strokeOpacity={opacity * 0.78}
        strokeWidth="1.05"
        strokeLinecap="round"
      />
    </>
  );
}

function AppleFruit({ cx, cy, r = 7.2, gradientId = 'appleGradL' }) {
  return (
    <g>
      <circle cx={cx + 0.8} cy={cy + 1.4} r={r} fill="#7f1d1d" fillOpacity="0.28" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${gradientId})`} />
      <ellipse
        cx={cx - r * 0.32}
        cy={cy - r * 0.34}
        rx={r * 0.28}
        ry={r * 0.18}
        transform={`rotate(-28 ${cx - r * 0.32} ${cy - r * 0.34})`}
        fill="#fee2e2"
        fillOpacity="0.88"
      />
      <path
        d={`M${cx} ${cy - r + 1} Q${cx + 2} ${cy - r - 4.5} ${cx + 5.5} ${cy - r - 3.5}`}
        stroke="#582f0e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={`M${cx + 1.5} ${cy - r - 2} C${cx + 4.5} ${cy - r - 5.5}, ${cx + 8.5} ${cy - r - 3.5}, ${cx + 6.2} ${cy - r - 0.6} C${cx + 4} ${cy - r + 0.6}, ${cx + 2} ${cy - r - 0.8}, ${cx + 1.5} ${cy - r - 2} Z`}
        fill="#4ade80"
        fillOpacity="0.92"
      />
    </g>
  );
}

function OrangeFruit({ cx, cy, r = 7.4, gradientId = 'orangeGradR' }) {
  return (
    <g>
      <circle cx={cx + 0.8} cy={cy + 1.4} r={r} fill="#7c2d12" fillOpacity="0.24" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${gradientId})`} />
      <ellipse
        cx={cx - r * 0.32}
        cy={cy - r * 0.32}
        rx={r * 0.28}
        ry={r * 0.18}
        transform={`rotate(-25 ${cx - r * 0.32} ${cy - r * 0.32})`}
        fill="#ffedd5"
        fillOpacity="0.86"
      />
      <circle cx={cx + r * 0.18} cy={cy + r * 0.36} r="0.85" fill="#9a3412" fillOpacity="0.45" />
      <path
        d={`M${cx} ${cy - r + 0.8} Q${cx - 1.5} ${cy - r - 4} ${cx - 4.2} ${cy - r - 3}`}
        stroke="#166534"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d={`M${cx - 0.5} ${cy - r - 1.5} C${cx - 4.2} ${cy - r - 5.5}, ${cx - 8} ${cy - r - 3}, ${cx - 5.5} ${cy - r - 0.4} Z`}
        fill="#22c55e"
        fillOpacity="0.9"
      />
    </g>
  );
}

function Blossom({ cx, cy, scale = 1, tint = '#fffbeb' }) {
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      <circle cx="0" cy="-3.2" r="2.2" fill={tint} fillOpacity="0.92" />
      <circle cx="3" cy="-1" r="2.2" fill={tint} fillOpacity="0.9" />
      <circle cx="1.9" cy="2.6" r="2.2" fill={tint} fillOpacity="0.9" />
      <circle cx="-1.9" cy="2.6" r="2.2" fill={tint} fillOpacity="0.9" />
      <circle cx="-3" cy="-1" r="2.2" fill={tint} fillOpacity="0.9" />
      <circle cx="0" cy="0" r="1.5" fill="#facc15" fillOpacity="0.95" />
    </g>
  );
}

/**
 * Fondo animado de huerto botánico:
 * - Árboles frutales detallados con troncos con vetas/textura, múltiples capas de follaje,
 *   frutos, flores y luces filtradas.
 * - Hojas cayendo suavemente de forma continua con aleteo orgánico.
 * - Interactividad con el mouse: al pasar o acercarse a las copas y hojas, las ramas se
 *   mecen y se desprenden hojas animadas adicionales.
 */
export default function OrchardBackground() {
  const canopyRefs = useRef({});
  const lastSpawnAtRef = useRef(0);
  const rustleTimersRef = useRef({});
  const leafTimersRef = useRef([]);
  const nextLeafIdRef = useRef(1);

  const [interactiveLeaves, setInteractiveLeaves] = useState([]);
  const [rustlingTrees, setRustlingTrees] = useState({});

  const registerCanopyRef = (key) => (node) => {
    canopyRefs.current[key] = node;
  };

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return undefined;

    const triggerTreeRustle = (treeKey) => {
      setRustlingTrees((prev) => (prev[treeKey] ? prev : { ...prev, [treeKey]: true }));
      if (rustleTimersRef.current[treeKey]) {
        clearTimeout(rustleTimersRef.current[treeKey]);
      }
      rustleTimersRef.current[treeKey] = setTimeout(() => {
        setRustlingTrees((prev) => {
          if (!prev[treeKey]) return prev;
          const next = { ...prev };
          delete next[treeKey];
          return next;
        });
      }, 580);
    };

    const spawnLeavesNear = (treeKey, originX, originY, rect) => {
      const palette = TREE_PALETTES[treeKey] || TREE_PALETTES['left-lg'];
      const count = 2 + Math.floor(Math.random() * 2); // 2-3 hojas por ráfaga
      const newLeaves = [];

      for (let i = 0; i < count; i += 1) {
        const clampedX = Math.max(rect.left + 12, Math.min(rect.right - 12, originX));
        const clampedY = Math.max(rect.top + 12, Math.min(rect.bottom - 12, originY));
        const jitterX = (Math.random() - 0.5) * 44;
        const jitterY = (Math.random() - 0.5) * 32;
        const durationMs = 2600 + Math.floor(Math.random() * 1700);
        const id = nextLeafIdRef.current++;

        newLeaves.push({
          id,
          x: clampedX + jitterX,
          y: clampedY + jitterY,
          driftX: `${Math.round((Math.random() - 0.5) * 160)}px`,
          fallY: `${Math.round(250 + Math.random() * 260)}px`,
          rot: `${Math.round((Math.random() > 0.5 ? 1 : -1) * (190 + Math.random() * 220))}deg`,
          size: 14 + Math.floor(Math.random() * 10),
          color: palette[Math.floor(Math.random() * palette.length)],
          shape: Math.floor(Math.random() * 3),
          duration: `${(durationMs / 1000).toFixed(2)}s`,
          durationMs
        });
      }

      setInteractiveLeaves((prev) => {
        const merged = [...prev, ...newLeaves];
        return merged.length > MAX_INTERACTIVE_LEAVES
          ? merged.slice(merged.length - MAX_INTERACTIVE_LEAVES)
          : merged;
      });

      newLeaves.forEach((leaf) => {
        const timerId = setTimeout(() => {
          setInteractiveLeaves((prev) => prev.filter((item) => item.id !== leaf.id));
        }, leaf.durationMs + 120);
        leafTimersRef.current.push(timerId);
      });
    };

    const handleMouseMove = (event) => {
      const now = performance.now();
      if (now - lastSpawnAtRef.current < SPAWN_THROTTLE_MS) return;

      const { clientX, clientY } = event;
      const entries = Object.entries(canopyRefs.current);

      for (let i = 0; i < entries.length; i += 1) {
        const [treeKey, node] = entries[i];
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const isNearOrInside =
          clientX >= rect.left - PROXIMITY_PX &&
          clientX <= rect.right + PROXIMITY_PX &&
          clientY >= rect.top - PROXIMITY_PX &&
          clientY <= rect.bottom + PROXIMITY_PX;

        if (isNearOrInside) {
          lastSpawnAtRef.current = now;
          triggerTreeRustle(treeKey);
          spawnLeavesNear(treeKey, clientX, clientY, rect);
          break;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      Object.values(rustleTimersRef.current).forEach(clearTimeout);
      leafTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="orchard-bg-layer" aria-hidden="true" data-testid="orchard-background">
      {/* Rayos de sol cálidos desde la esquina superior */}
      <div className="orchard-sun-glow" />

      {/* Motas suaves de luz / polen flotando */}
      {MOTAS_LUZ.map((mota) => (
        <span
          key={mota.id}
          className="orchard-pollen-mote"
          style={{
            left: mota.left,
            top: mota.top,
            width: `${mota.size}px`,
            height: `${mota.size}px`,
            animationDelay: mota.delay,
            animationDuration: mota.duration
          }}
        />
      ))}

      {/* Hojas cayendo suavemente de forma continua */}
      {HOJAS_FLOTANTES.map((hoja) => (
        <svg
          key={hoja.id}
          className={`orchard-floating-leaf ${
            hoja.variant === 2
              ? 'orchard-leaf-alt'
              : hoja.variant === 3
                ? 'orchard-leaf-gentle'
                : ''
          }`}
          style={{
            left: hoja.left,
            animationDelay: hoja.delay,
            animationDuration: hoja.duration,
            width: `${hoja.size}px`,
            height: `${hoja.size}px`
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <LeafGlyph shape={hoja.shape} color={hoja.color} opacity={0.56} />
        </svg>
      ))}

      {/* Hojas desprendidas dinámicamente al pasar o acercar el mouse */}
      {interactiveLeaves.map((leaf) => (
        <svg
          key={leaf.id}
          className="orchard-interactive-leaf"
          style={{
            left: `${leaf.x}px`,
            top: `${leaf.y}px`,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            '--leaf-drift-x': leaf.driftX,
            '--leaf-fall-y': leaf.fallY,
            '--leaf-rot': leaf.rot,
            animationDuration: leaf.duration
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <LeafGlyph shape={leaf.shape} color={leaf.color} opacity={0.86} />
        </svg>
      ))}

      {/* Colinas en capas del valle con siluetas lejanas */}
      <svg className="orchard-hills-svg" viewBox="0 0 1440 340" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.44" />
            <stop offset="100%" stopColor="#86efac" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <path
          fill="url(#hillFar)"
          d="M0,185 C240,120 420,210 720,175 C1020,140 1220,195 1440,145 L1440,340 L0,340 Z"
        />
        <path
          fill="url(#hillMid)"
          d="M0,235 C280,275 510,185 780,225 C1050,265 1260,195 1440,220 L1440,340 L0,340 Z"
        />
        <path
          fill="url(#hillNear)"
          d="M0,280 C340,245 620,310 940,270 C1180,240 1320,285 1440,268 L1440,340 L0,340 Z"
        />
      </svg>

      {/* =================================================================== */}
      {/* ÁRBOL IZQUIERDO PRINCIPAL: MANZANO FRONDOSO CON TEXTURA Y LUCES     */}
      {/* =================================================================== */}
      <svg className="orchard-tree orchard-tree-left-lg" viewBox="0 0 320 420" fill="none">
        <defs>
          <linearGradient id="trunkLeft" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#b07d56" stopOpacity="0.96" />
            <stop offset="42%" stopColor="#8c5837" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#4e2a14" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="trunkLeftShadow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6f4518" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b1f0b" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="canopyDarkL" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#1b4332" stopOpacity="0.86" />
            <stop offset="100%" stopColor="#0f2f22" stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="canopyMidBackL" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#2d6a4f" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1b4332" stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="canopyMidL" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#52b788" stopOpacity="0.88" />
            <stop offset="65%" stopColor="#40916c" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#2d6a4f" stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="canopyLightL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d9ed92" stopOpacity="0.9" />
            <stop offset="52%" stopColor="#74c69d" stopOpacity="0.84" />
            <stop offset="100%" stopColor="#40916c" stopOpacity="0.74" />
          </linearGradient>
          <radialGradient id="sunDappleL" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.62" />
            <stop offset="60%" stopColor="#bef264" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#74c69d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="appleGradL" cx="34%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="48%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>
        </defs>

        {/* Tronco con raíces, ramas secundarias y vetas de corteza */}
        <g className="orchard-trunk-sway">
          {/* Ramas traseras en sombra */}
          <path
            d="M150 220 C134 192, 114 166, 86 144 L94 136 C120 156, 140 182, 158 212 Z"
            fill="url(#trunkLeftShadow)"
          />
          <path
            d="M164 218 C184 190, 206 168, 232 152 L226 144 C198 160, 176 184, 156 210 Z"
            fill="url(#trunkLeftShadow)"
          />

          {/* Tronco principal y raíces */}
          <path
            d="M126 416 C140 402, 144 378, 144 348 C144 302, 143 262, 138 225 C132 190, 116 162, 92 134 L106 126 C128 152, 142 178, 150 206 C162 174, 182 148, 208 124 L218 134 C194 158, 175 186, 169 225 C165 275, 168 345, 178 394 C181 405, 188 412, 196 416 L166 416 C161 404, 158 404, 153 416 Z"
            fill="url(#trunkLeft)"
          />

          {/* Rama lateral izquierda y sub-ramas */}
          <path
            d="M144 252 C118 232, 90 216, 66 198 L74 188 C98 204, 124 220, 148 238 Z"
            fill="url(#trunkLeft)"
          />
          <path
            d="M108 214 C98 196, 86 182, 72 172 L77 167 C92 178, 104 192, 114 210 Z"
            fill="url(#trunkLeft)"
          />
          {/* Rama lateral derecha */}
          <path
            d="M166 238 C192 222, 218 208, 244 190 L238 181 C212 198, 188 212, 164 226 Z"
            fill="url(#trunkLeft)"
          />

          {/* Luz cálida en el borde izquierdo de la corteza */}
          <path
            d="M145 388 C147 334, 146 280, 142 232 C137 198, 124 172, 104 146"
            stroke="#d4a373"
            strokeOpacity="0.45"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Vetas orgánicas y nudo de corteza */}
          <path
            d="M153 392 C155 340, 155 288, 152 240"
            stroke="#3e2723"
            strokeOpacity="0.44"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M161 368 C162 325, 161 286, 158 256"
            stroke="#3e2723"
            strokeOpacity="0.34"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M148 310 C152 296, 155 284, 158 272"
            stroke="#3e2723"
            strokeOpacity="0.32"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <ellipse cx="156" cy="292" rx="4.2" ry="7.2" fill="#3e2723" fillOpacity="0.32" />
          <ellipse cx="156" cy="292" rx="2" ry="4" fill="#6f4518" fillOpacity="0.45" />
          <path
            d="M134 238 C114 222, 96 210, 80 198"
            stroke="#3e2723"
            strokeOpacity="0.35"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </g>

        {/* Zona interactiva de copa del manzano */}
        <g
          ref={registerCanopyRef('left-lg')}
          className={rustlingTrees['left-lg'] ? 'orchard-tree-rustling' : ''}
        >
          {/* Capa 1: Copa trasera en sombra profunda */}
          <g className="orchard-canopy-back">
            <path
              d="M66 220 C30 208, 18 160, 48 130 C38 92, 74 56, 118 64 C140 28, 204 30, 224 72 C266 68, 294 112, 272 152 C294 186, 264 232, 224 224 C192 248, 122 248, 66 220 Z"
              fill="url(#canopyDarkL)"
            />
          </g>

          {/* Capa 2: Follaje medio-trasero */}
          <g className="orchard-canopy-mid-back">
            <path
              d="M54 198 C34 176, 42 134, 72 120 C78 86, 118 68, 152 80 C182 62, 228 76, 240 112 C268 124, 272 168, 244 192 C214 218, 102 222, 54 198 Z"
              fill="url(#canopyMidBackL)"
            />
          </g>

          {/* Capa 3: Ramillete izquierdo independiente */}
          <g className="orchard-branch-left">
            <path
              d="M38 184 C16 166, 22 126, 52 116 C64 88, 104 84, 124 108 C148 126, 140 172, 110 186 C86 198, 56 196, 38 184 Z"
              fill="url(#canopyMidL)"
            />
            {/* Hojas salientes para silueta botánica */}
            <path d="M26 144 C16 138, 18 126, 32 128 C34 136, 30 142, 26 144 Z" fill="#52b788" fillOpacity="0.86" />
            <path d="M56 102 C50 90, 62 82, 70 94 C66 100, 60 102, 56 102 Z" fill="#74c69d" fillOpacity="0.84" />
            <g className="orchard-fruit-bob">
              <AppleFruit cx={70} cy={156} r={7.5} gradientId="appleGradL" />
              <AppleFruit cx={104} cy={170} r={6.2} gradientId="appleGradL" />
            </g>
            <Blossom cx={54} cy={132} scale={0.95} />
          </g>

          {/* Capa 4: Ramillete derecho independiente */}
          <g className="orchard-branch-right">
            <path
              d="M170 188 C152 162, 166 116, 200 108 C224 84, 268 98, 274 134 C292 158, 272 198, 238 202 C214 210, 184 204, 170 188 Z"
              fill="url(#canopyMidL)"
            />
            <path d="M276 140 C288 134, 290 148, 278 154 C272 150, 272 144, 276 140 Z" fill="#52b788" fillOpacity="0.84" />
            <g className="orchard-fruit-bob-alt">
              <AppleFruit cx={228} cy={154} r={7.2} gradientId="appleGradL" />
              <AppleFruit cx={196} cy={174} r={6.4} gradientId="appleGradL" />
            </g>
            <Blossom cx={250} cy={128} scale={0.9} />
          </g>

          {/* Capa 5: Corona superior iluminada por el sol + luces filtradas */}
          <g className="orchard-canopy-top">
            <path
              d="M88 122 C70 90, 96 50, 136 50 C158 26, 208 34, 218 70 C242 86, 234 126, 204 136 C172 150, 112 148, 88 122 Z"
              fill="url(#canopyLightL)"
            />
            {/* Luz solar filtrada entre hojas */}
            <ellipse cx="136" cy="84" rx="34" ry="22" fill="url(#sunDappleL)" className="orchard-dappled-light" />
            <ellipse cx="182" cy="96" rx="22" ry="15" fill="url(#sunDappleL)" className="orchard-dappled-light" />
            <path d="M128 46 C124 32, 138 28, 142 42 C138 46, 132 48, 128 46 Z" fill="#bef264" fillOpacity="0.82" />
            <AppleFruit cx={152} cy={96} r={6.8} gradientId="appleGradL" />
            <AppleFruit cx={188} cy={112} r={5.8} gradientId="appleGradL" />
            <Blossom cx={120} cy={88} scale={1.05} />
            <Blossom cx={176} cy={72} scale={0.85} />
          </g>
        </g>

        {/* Cajón rústico de cosecha al pie del manzano */}
        <g opacity="0.9">
          <rect x="192" y="378" width="46" height="29" rx="3" fill="#a47148" stroke="#6f4518" strokeWidth="1.8" />
          <line x1="192" y1="388" x2="238" y2="388" stroke="#6f4518" strokeWidth="1.5" />
          <line x1="192" y1="398" x2="238" y2="398" stroke="#6f4518" strokeWidth="1.5" />
          <line x1="206" y1="378" x2="206" y2="407" stroke="#582f0e" strokeOpacity="0.35" strokeWidth="1.2" />
          <line x1="224" y1="378" x2="224" y2="407" stroke="#582f0e" strokeOpacity="0.35" strokeWidth="1.2" />
          <circle cx="204" cy="376" r="5" fill="url(#appleGradL)" />
          <circle cx="215" cy="374.5" r="5.3" fill="url(#appleGradL)" />
          <circle cx="226" cy="376.5" r="4.8" fill="url(#appleGradL)" />
        </g>
      </svg>

      {/* =================================================================== */}
      {/* ÁRBOL IZQUIERDO SECUNDARIO (OLIVO MEDITERRÁNEO V REGIÓN)            */}
      {/* =================================================================== */}
      <svg className="orchard-tree orchard-tree-left-sm" viewBox="0 0 200 300" fill="none">
        <defs>
          <linearGradient id="trunkOlive" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#9c7a5b" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#5c4028" stopOpacity="0.86" />
          </linearGradient>
          <linearGradient id="oliveCanopyMid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#74c69d" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#40916c" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="oliveCanopyLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d9ed92" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#52b788" stopOpacity="0.68" />
          </linearGradient>
        </defs>

        <g className="orchard-trunk-sway-alt">
          <path
            d="M88 298 C93 252, 93 212, 90 174 C86 154, 78 140, 68 128 L75 123 C85 134, 92 148, 97 164 C103 148, 112 134, 124 124 L130 130 C118 142, 110 158, 106 176 C105 214, 107 254, 114 298 Z"
            fill="url(#trunkOlive)"
          />
          <path
            d="M98 282 C99 246, 98 214, 96 184"
            stroke="#3e2723"
            strokeOpacity="0.34"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        <g
          ref={registerCanopyRef('left-sm')}
          className={rustlingTrees['left-sm'] ? 'orchard-tree-rustling' : ''}
        >
          <g className="orchard-canopy-back">
            <path
              d="M52 194 C36 160, 48 104, 74 78 C86 42, 116 42, 128 78 C154 104, 162 160, 144 194 C124 214, 72 214, 52 194 Z"
              fill="#2d6a4f"
              fillOpacity="0.72"
            />
          </g>
          <g className="orchard-branch-left">
            <path
              d="M64 176 C52 146, 66 96, 96 84 C124 84, 142 134, 126 176 C110 192, 80 192, 64 176 Z"
              fill="url(#oliveCanopyMid)"
            />
            <circle cx="82" cy="144" r="2.6" fill="#3f6212" fillOpacity="0.82" />
            <circle cx="112" cy="152" r="2.4" fill="#3f6212" fillOpacity="0.8" />
          </g>
          <g className="orchard-canopy-top">
            <path
              d="M72 126 C64 96, 80 62, 102 60 C122 60, 134 94, 122 126 C110 140, 84 140, 72 126 Z"
              fill="url(#oliveCanopyLight)"
            />
            <circle cx="96" cy="102" r="2.5" fill="#4d7c0f" fillOpacity="0.82" />
          </g>
        </g>
      </svg>

      {/* =================================================================== */}
      {/* ÁRBOL DERECHO PRINCIPAL: NARANJO DE LA V REGIÓN CON AZAHARES Y LUZ  */}
      {/* =================================================================== */}
      <svg className="orchard-tree orchard-tree-right-lg" viewBox="0 0 320 420" fill="none">
        <defs>
          <linearGradient id="trunkRight" x1="1" y1="0" x2="0" y2="0.4">
            <stop offset="0%" stopColor="#b07d56" stopOpacity="0.95" />
            <stop offset="48%" stopColor="#8c5837" stopOpacity="0.93" />
            <stop offset="100%" stopColor="#4e2a14" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="trunkRightShadow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6f4518" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#3b1f0b" stopOpacity="0.88" />
          </linearGradient>
          <linearGradient id="canopyDarkR" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#1b4332" stopOpacity="0.84" />
            <stop offset="100%" stopColor="#0f2f22" stopOpacity="0.76" />
          </linearGradient>
          <linearGradient id="canopyMidBackR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2d6a4f" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#1b4332" stopOpacity="0.76" />
          </linearGradient>
          <linearGradient id="canopyMidR" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#52b788" stopOpacity="0.86" />
            <stop offset="65%" stopColor="#40916c" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2d6a4f" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="canopyLightR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d9ed92" stopOpacity="0.88" />
            <stop offset="55%" stopColor="#74c69d" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#40916c" stopOpacity="0.72" />
          </linearGradient>
          <radialGradient id="sunDappleR" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.58" />
            <stop offset="60%" stopColor="#bef264" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#74c69d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orangeGradR" cx="35%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="45%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>

        {/* Tronco y ramas con vetas */}
        <g className="orchard-trunk-sway-alt">
          <path
            d="M150 220 C134 190, 114 166, 88 148 L96 140 C122 158, 142 182, 158 212 Z"
            fill="url(#trunkRightShadow)"
          />
          <path
            d="M132 416 C144 402, 148 378, 148 346 C150 302, 150 262, 146 225 C138 190, 122 164, 98 140 L112 132 C134 154, 148 178, 158 206 C170 174, 190 148, 216 128 L226 138 C202 160, 184 188, 176 225 C172 278, 176 346, 186 394 C189 405, 194 412, 202 416 L172 416 C167 404, 163 404, 158 416 Z"
            fill="url(#trunkRight)"
          />
          <path
            d="M172 248 C198 230, 226 216, 250 198 L242 188 C218 204, 194 218, 168 234 Z"
            fill="url(#trunkRight)"
          />
          <path
            d="M214 212 C226 196, 238 182, 252 172 L247 166 C232 176, 218 190, 206 208 Z"
            fill="url(#trunkRight)"
          />
          {/* Luz en corteza y vetas */}
          <path
            d="M153 386 C156 334, 156 282, 152 232"
            stroke="#d4a373"
            strokeOpacity="0.4"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M161 392 C164 340, 164 286, 160 236"
            stroke="#3e2723"
            strokeOpacity="0.42"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M168 358 C170 318, 169 282, 166 250"
            stroke="#3e2723"
            strokeOpacity="0.32"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <ellipse cx="163" cy="288" rx="3.8" ry="6.6" fill="#3e2723" fillOpacity="0.3" />
          <path
            d="M180 236 C202 220, 220 208, 236 196"
            stroke="#3e2723"
            strokeOpacity="0.34"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>

        {/* Zona interactiva de copa del naranjo */}
        <g
          ref={registerCanopyRef('right-lg')}
          className={rustlingTrees['right-lg'] ? 'orchard-tree-rustling' : ''}
        >
          {/* Capa 1: Copa trasera */}
          <g className="orchard-canopy-back">
            <path
              d="M64 216 C30 200, 24 154, 56 126 C50 88, 86 54, 130 64 C154 28, 214 34, 232 74 C272 74, 298 118, 274 158 C292 194, 260 234, 218 224 C184 248, 116 246, 64 216 Z"
              fill="url(#canopyDarkR)"
            />
          </g>

          {/* Capa 2: Follaje medio-trasero */}
          <g className="orchard-canopy-mid-back">
            <path
              d="M62 196 C42 172, 52 130, 82 118 C92 84, 132 68, 164 82 C196 66, 238 82, 248 118 C274 132, 272 174, 244 196 C210 220, 104 222, 62 196 Z"
              fill="url(#canopyMidBackR)"
            />
          </g>

          {/* Capa 3: Ramillete izquierdo */}
          <g className="orchard-branch-left">
            <path
              d="M44 186 C24 164, 32 120, 66 110 C82 86, 124 90, 140 118 C158 140, 144 184, 112 194 C88 202, 60 200, 44 186 Z"
              fill="url(#canopyMidR)"
            />
            <path d="M36 146 C24 140, 26 128, 38 130 C42 136, 40 142, 36 146 Z" fill="#52b788" fillOpacity="0.82" />
            <g className="orchard-fruit-bob">
              <OrangeFruit cx={86} cy={154} r={7.6} gradientId="orangeGradR" />
              <OrangeFruit cx={116} cy={170} r={6.2} gradientId="orangeGradR" />
            </g>
            <Blossom cx={64} cy={130} scale={0.95} tint="#ffffff" />
          </g>

          {/* Capa 4: Ramillete derecho */}
          <g className="orchard-branch-right">
            <path
              d="M174 190 C156 160, 170 114, 208 106 C232 84, 274 100, 278 138 C294 162, 272 204, 238 206 C212 210, 188 206, 174 190 Z"
              fill="url(#canopyMidR)"
            />
            <path d="M280 144 C292 138, 294 152, 282 158 C276 154, 276 148, 280 144 Z" fill="#74c69d" fillOpacity="0.84" />
            <g className="orchard-fruit-bob-alt">
              <OrangeFruit cx={232} cy={152} r={7.6} gradientId="orangeGradR" />
              <OrangeFruit cx={202} cy={174} r={6.4} gradientId="orangeGradR" />
            </g>
            <Blossom cx={254} cy={132} scale={0.9} tint="#ffffff" />
          </g>

          {/* Capa 5: Copa superior iluminada + luces */}
          <g className="orchard-canopy-top">
            <path
              d="M94 120 C78 88, 106 48, 146 50 C168 28, 216 38, 224 76 C246 92, 236 130, 204 140 C172 152, 114 146, 94 120 Z"
              fill="url(#canopyLightR)"
            />
            <ellipse cx="144" cy="84" rx="32" ry="20" fill="url(#sunDappleR)" className="orchard-dappled-light" />
            <ellipse cx="190" cy="96" rx="22" ry="14" fill="url(#sunDappleR)" className="orchard-dappled-light" />
            <OrangeFruit cx={164} cy={96} r={6.8} gradientId="orangeGradR" />
            <Blossom cx={128} cy={82} scale={1.0} tint="#ffffff" />
            <Blossom cx={194} cy={78} scale={0.85} tint="#ffffff" />
          </g>
        </g>
      </svg>

      {/* =================================================================== */}
      {/* ÁRBOL DERECHO SECUNDARIO: LIMONERO JOVEN                            */}
      {/* =================================================================== */}
      <svg className="orchard-tree orchard-tree-right-sm" viewBox="0 0 200 300" fill="none">
        <defs>
          <linearGradient id="trunkLemon" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#9c7a5b" stopOpacity="0.86" />
            <stop offset="100%" stopColor="#5c4028" stopOpacity="0.84" />
          </linearGradient>
          <linearGradient id="lemonCanopyTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bef264" stopOpacity="0.76" />
            <stop offset="100%" stopColor="#52b788" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <g className="orchard-trunk-sway">
          <path
            d="M88 298 C93 252, 93 214, 90 178 C86 158, 80 144, 70 132 L76 127 C86 138, 92 152, 97 168 C103 152, 112 138, 122 128 L128 134 C118 144, 110 160, 106 178 C105 214, 107 254, 114 298 Z"
            fill="url(#trunkLemon)"
          />
          <path
            d="M98 282 C99 246, 98 214, 96 186"
            stroke="#3e2723"
            strokeOpacity="0.32"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        <g
          ref={registerCanopyRef('right-sm')}
          className={rustlingTrees['right-sm'] ? 'orchard-tree-rustling' : ''}
        >
          <g className="orchard-canopy-back">
            <path
              d="M50 192 C30 166, 40 114, 70 98 C86 66, 128 70, 144 102 C170 120, 168 172, 140 194 C114 210, 70 208, 50 192 Z"
              fill="#2d6a4f"
              fillOpacity="0.7"
            />
          </g>
          <g className="orchard-branch-right">
            <path
              d="M70 174 C56 150, 66 110, 98 102 C124 96, 148 134, 132 172 C116 188, 84 188, 70 174 Z"
              fill="#74c69d"
              fillOpacity="0.72"
            />
            <ellipse cx="86" cy="148" rx="4.2" ry="5.4" transform="rotate(14 86 148)" fill="#facc15" fillOpacity="0.9" />
            <ellipse cx="118" cy="154" rx="4" ry="5.2" transform="rotate(-12 118 154)" fill="#eab308" fillOpacity="0.88" />
          </g>
          <g className="orchard-canopy-top">
            <path
              d="M74 128 C66 100, 82 74, 106 72 C128 70, 140 100, 128 128 C114 140, 86 140, 74 128 Z"
              fill="url(#lemonCanopyTop)"
            />
            <ellipse cx="104" cy="108" rx="3.8" ry="4.8" transform="rotate(8 104 108)" fill="#facc15" fillOpacity="0.9" />
          </g>
        </g>
      </svg>
    </div>
  );
}
