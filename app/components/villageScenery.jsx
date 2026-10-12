// 융중 마을의 풍경: 먹빛 산, 섬 같은 땅, 물, 길, 팔진도 광장, 소나무·대나무·바위·깃발, 구름.
// 그림 파일 없이 SVG 로만 그립니다. 좌표 변환(toScreen)과 크기는 YungjungVillage 에서 받습니다.

// 같은 입력이면 늘 같은 값을 내는 작은 난수(새로고침해도 풍경이 바뀌지 않도록)
const rand = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/* ---------- 구름 한 덩이 (상서로운 구름, 祥雲) ---------- */
export function Cloud({ w = 220, tone = '#FFFDF7', line = '#9C8A6C', className = '', style }) {
  return (
    <svg className={className} style={style} width={w} height={w * 0.42} viewBox="0 0 220 92" aria-hidden="true">
      <path
        d="M14 72 C2 72 2 52 18 52 C16 34 40 28 50 42 C54 20 86 14 96 36 C104 14 140 12 146 38 C160 26 186 32 182 52 C204 50 214 72 196 74 Z"
        fill={tone} stroke={line} strokeWidth="2"
      />
      {/* 구름 꼬리의 말린 획 */}
      <path d="M40 66 C30 66 30 54 40 54 C48 54 48 62 42 62" fill="none" stroke={line} strokeWidth="2" strokeLinecap="round" />
      <path d="M120 64 C108 64 108 50 120 50 C130 50 130 60 122 60" fill="none" stroke={line} strokeWidth="2" strokeLinecap="round" />
      <path d="M150 74 C166 82 190 82 206 74" fill="none" stroke={line} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- 땅 전체 (한 장의 SVG) ---------- */
export function Ground({ N, TW, TH, W, H, toScreen, ponds, streams, roads, plaza }) {
  const P = (x, y) => { const s = toScreen(x, y); return `${s.sx},${s.sy}`; };
  const pt = (x, y) => toScreen(x, y);
  const T = 46; // 땅 두께

  // 뒤쪽 두 가장자리를 따라 먹빛 산줄기
  const peaks = [];
  for (let i = 0; i < 34; i++) {
    const t = (i / 33) * (N + 4) - 2;
    const far = i % 2 === 0;
    peaks.push({ x: t, y: far ? -3.2 : -1.6, h: 110 + rand(i) * 190 * (far ? 1.15 : 0.8), w: 150 + rand(i + 50) * 120, far });
    peaks.push({ x: far ? -3.2 : -1.6, y: t, h: 110 + rand(i + 99) * 190 * (far ? 1.15 : 0.8), w: 150 + rand(i + 150) * 120, far });
  }
  peaks.sort((a, b) => (a.far === b.far ? a.x + a.y - (b.x + b.y) : a.far ? -1 : 1));

  // 땅 위 얼룩(풀밭·흙)
  const patches = Array.from({ length: 46 }, (_, i) => ({
    x: 1 + rand(i + 300) * (N - 2), y: 1 + rand(i + 400) * (N - 2),
    r: 1 + rand(i + 500) * 2.4, green: rand(i + 600) > 0.35,
  }));

  const pondEl = (c, r) => {
    const s = pt(c[0], c[1]);
    return { cx: s.sx, cy: s.sy, rx: r * TW * 0.7071, ry: r * TH * 0.7071 };
  };
  const line = (pts) => pts.map(([x, y], i) => { const s = pt(x, y); return `${i ? 'L' : 'M'}${s.sx} ${s.sy}`; }).join(' ');

  // 팔진도(八陣圖) 광장: 팔각형 두 겹과 방사선
  const oct = (r) => Array.from({ length: 8 }, (_, k) => {
    const a = (Math.PI / 4) * k + Math.PI / 8;
    return P(plaza.x + Math.cos(a) * r, plaza.y + Math.sin(a) * r);
  }).join(' ');
  const spokes = Array.from({ length: 8 }, (_, k) => {
    const a = (Math.PI / 4) * k + Math.PI / 8;
    const p1 = pt(plaza.x + Math.cos(a) * 0.9, plaza.y + Math.sin(a) * 0.9);
    const p2 = pt(plaza.x + Math.cos(a) * 2.2, plaza.y + Math.sin(a) * 2.2);
    return `M${p1.sx} ${p1.sy} L${p2.sx} ${p2.sy}`;
  }).join(' ');

  const top = pt(0, 0), right = pt(N, 0), bottom = pt(N, N), left = pt(0, N);

  return (
    <svg className="yv-ground" width={W} height={H} aria-hidden="true">
      <defs>
        <linearGradient id="yv-ink-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8D978A" stopOpacity=".75" />
          <stop offset=".7" stopColor="#C9C6B4" stopOpacity=".35" />
          <stop offset="1" stopColor="#EFE6D2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="yv-ink-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3F4C42" stopOpacity=".9" />
          <stop offset=".55" stopColor="#7B8774" stopOpacity=".55" />
          <stop offset="1" stopColor="#E9DFC8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="yv-soil-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A6A44" /><stop offset="1" stopColor="#5E4329" />
        </linearGradient>
        <linearGradient id="yv-soil-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#755836" /><stop offset="1" stopColor="#4B341F" />
        </linearGradient>
        <radialGradient id="yv-patch-g"><stop offset="0" stopColor="#8EA06A" stopOpacity=".55" /><stop offset="1" stopColor="#8EA06A" stopOpacity="0" /></radialGradient>
        <radialGradient id="yv-patch-e"><stop offset="0" stopColor="#E2CFA3" stopOpacity=".7" /><stop offset="1" stopColor="#E2CFA3" stopOpacity="0" /></radialGradient>
        <radialGradient id="yv-mist"><stop offset="0" stopColor="#FBF6EA" stopOpacity=".95" /><stop offset="1" stopColor="#FBF6EA" stopOpacity="0" /></radialGradient>
        <pattern id="yv-tuft" width="173" height="97" patternUnits="userSpaceOnUse">
          {[[12, 20], [70, 8], [131, 30], [40, 61], [101, 72], [158, 84], [23, 90]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y} l${2 + (i % 2)} -${5 + (i % 3)} M${x + 3} ${y} l0 -${6 + (i % 2)} M${x + 5} ${y} l-2 -${4 + (i % 3)}`}
              stroke={i % 2 ? '#6F7E4D' : '#7E8D59'} strokeWidth="1.2" strokeLinecap="round" opacity={0.25 + (i % 3) * 0.1} />
          ))}
          <circle cx="88" cy="40" r="1.3" fill="#A48B62" opacity=".4" />
          <circle cx="147" cy="58" r="1" fill="#A48B62" opacity=".35" />
        </pattern>
      </defs>

      {/* 먼 산과 가까운 산 */}
      {peaks.map((k, i) => {
        const b = pt(k.x, k.y);
        const lx = b.sx - k.w / 2, rx = b.sx + k.w / 2, ty = b.sy - k.h;
        return (
          <path key={i} fill={k.far ? 'url(#yv-ink-far)' : 'url(#yv-ink-near)'}
            d={`M${lx} ${b.sy + 30} C${lx + k.w * 0.22} ${b.sy - k.h * 0.35}, ${b.sx - k.w * 0.14} ${ty + k.h * 0.05}, ${b.sx} ${ty}
                C${b.sx + k.w * 0.12} ${ty + k.h * 0.2}, ${rx - k.w * 0.2} ${b.sy - k.h * 0.3}, ${rx} ${b.sy + 30} Z`} />
        );
      })}
      {/* 산 아래 안개 */}
      <ellipse cx={(top.sx + right.sx) / 2} cy={(top.sy + right.sy) / 2 - 20} rx={(right.sx - top.sx) * 0.75} ry="70" fill="url(#yv-mist)" />
      <ellipse cx={(top.sx + left.sx) / 2} cy={(top.sy + left.sy) / 2 - 20} rx={(top.sx - left.sx) * 0.75} ry="70" fill="url(#yv-mist)" />

      {/* 땅의 앞쪽 두 옆면(흙층) */}
      <polygon points={`${left.sx},${left.sy} ${bottom.sx},${bottom.sy} ${bottom.sx},${bottom.sy + T} ${left.sx},${left.sy + T}`} fill="url(#yv-soil-l)" />
      <polygon points={`${bottom.sx},${bottom.sy} ${right.sx},${right.sy} ${right.sx},${right.sy + T} ${bottom.sx},${bottom.sy + T}`} fill="url(#yv-soil-r)" />
      <path d={`M${left.sx} ${left.sy + 16} L${bottom.sx} ${bottom.sy + 16} L${right.sx} ${right.sy + 16}`} stroke="#4A341F" strokeWidth="1.5" strokeDasharray="14 10" fill="none" opacity=".5" />

      {/* 땅 윗면 */}
      <polygon points={`${P(0, 0)} ${P(N, 0)} ${P(N, N)} ${P(0, N)}`} fill="#CDBB8C" />
      {patches.map((p, i) => {
        const s = pt(p.x, p.y);
        return <ellipse key={i} cx={s.sx} cy={s.sy} rx={p.r * TW * 0.7} ry={p.r * TH * 0.7} fill={p.green ? 'url(#yv-patch-g)' : 'url(#yv-patch-e)'} />;
      })}
      <polygon points={`${P(0, 0)} ${P(N, 0)} ${P(N, N)} ${P(0, N)}`} fill="url(#yv-tuft)" />
      <polygon points={`${P(0, 0)} ${P(N, 0)} ${P(N, N)} ${P(0, N)}`} fill="none" stroke="#6C8A4E" strokeWidth="5" strokeLinejoin="round" opacity=".7" />

      {/* 길 */}
      {roads.map((d, i) => <path key={`rb${i}`} d={d} className="yv-road-edge" />)}
      {roads.map((d, i) => <path key={`r${i}`} d={d} className="yv-road" />)}

      {/* 물: 개울과 연못 */}
      {streams.map((s, i) => <path key={`sb${i}`} d={line(s)} className="yv-stream-bank" />)}
      {ponds.map(([c, r], i) => { const e = pondEl(c, r + 0.18); return <ellipse key={`pb${i}`} {...e} className="yv-pond-bank" />; })}
      {streams.map((s, i) => <path key={`s${i}`} d={line(s)} className="yv-stream" />)}
      {ponds.map(([c, r], i) => { const e = pondEl(c, r); return <ellipse key={`p${i}`} {...e} className="yv-pond" />; })}
      {streams.map((s, i) => <path key={`sr${i}`} d={line(s)} className="yv-ripple" />)}
      {ponds.map(([c, r], i) => {
        const e = pondEl(c, r);
        return (
          <g key={`pr${i}`} className="yv-pond-ripple">
            <ellipse cx={e.cx - e.rx * 0.2} cy={e.cy - e.ry * 0.15} rx={e.rx * 0.45} ry={e.ry * 0.38} />
            <ellipse cx={e.cx + e.rx * 0.25} cy={e.cy + e.ry * 0.2} rx={e.rx * 0.28} ry={e.ry * 0.22} />
          </g>
        );
      })}

      {/* 팔진도 광장 */}
      <polygon points={oct(2.6)} className="yv-plaza" />
      <polygon points={oct(2.2)} className="yv-plaza-ring" />
      <path d={spokes} className="yv-plaza-ring" />
      <polygon points={oct(0.9)} className="yv-plaza-core" />
    </svg>
  );
}

/* ---------- 땅 아래를 받치는 구름 바다 ---------- */
export function CloudSea({ N, toScreen }) {
  const items = [];
  const edge = (a, b, n, seed) => {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const s = toScreen(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
      items.push({ x: s.sx + (rand(seed + i) - 0.5) * 60, y: s.sy + 40 + rand(seed + i + 9) * 70, w: 200 + rand(seed + i + 3) * 180, d: rand(seed + i + 5) * 6 });
    }
  };
  edge([0, N], [N, N], 11, 10);
  edge([N, N], [N, 0], 11, 40);
  edge([-1, N * 0.25], [-1, N], 4, 70);
  edge([N * 0.25, -1], [N, -1], 4, 90);
  return (
    <div className="yv-cloudsea" aria-hidden="true">
      {items.map((c, i) => (
        <Cloud key={i} w={c.w} className="yv-sea-cloud" style={{ left: c.x - c.w / 2, top: c.y, animationDelay: `${-c.d}s` }} />
      ))}
    </div>
  );
}

/* ---------- 소나무·대나무·바위·깃발 ---------- */
export function Flora({ type, seed = 0 }) {
  if (type === 'pine') {
    const lean = (rand(seed) - 0.5) * 18;
    return (
      <svg className="yv-flora" width="120" height="170" viewBox="0 0 120 170" style={{ marginLeft: -60, marginTop: -164 }} aria-hidden="true">
        <ellipse cx="60" cy="162" rx="34" ry="9" fill="rgba(50,35,15,.22)" />
        <path d={`M56 164 C54 130 ${62 + lean} 110 ${58 + lean} 70 L${66 + lean} 70 C${70 + lean} 112 64 132 66 164 Z`} fill="#5C4127" stroke="#2E2116" strokeWidth="1.5" />
        <path d={`M${60 + lean} 104 C${40 + lean} 98 30 100 22 106`} stroke="#3B2A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
        {[[60 + lean, 40, 46, 15], [38 + lean, 72, 34, 12], [84 + lean, 66, 34, 12], [60 + lean, 92, 44, 13], [24, 102, 22, 9]].map(([cx, cy, rx, ry], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy + 3} rx={rx} ry={ry} fill="#2F4636" />
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={i % 2 ? '#4E6B4E' : '#41604A'} stroke="#24372A" strokeWidth="1.5" />
            <path d={`M${cx - rx * 0.6} ${cy} q${rx * 0.3} -${ry * 0.6} ${rx * 0.6} 0 q${rx * 0.3} -${ry * 0.6} ${rx * 0.6} 0`} stroke="#6E8C66" strokeWidth="1.4" fill="none" />
          </g>
        ))}
      </svg>
    );
  }
  if (type === 'bamboo') {
    const stalks = [[38, 150, 0], [50, 176, 1], [62, 140, 2], [72, 168, 3], [84, 130, 4]];
    return (
      <svg className="yv-flora yv-sway" width="120" height="190" viewBox="0 0 120 190" style={{ marginLeft: -60, marginTop: -184 }} aria-hidden="true">
        <ellipse cx="60" cy="182" rx="38" ry="9" fill="rgba(50,35,15,.2)" />
        {stalks.map(([x, h, i]) => (
          <g key={i}>
            <rect x={x - 3} y={182 - h} width="6" height={h} rx="3" fill={i % 2 ? '#7E9C58' : '#6C8B4B'} stroke="#3E5530" strokeWidth="1" />
            {Array.from({ length: Math.floor(h / 28) }, (_, k) => <line key={k} x1={x - 3} x2={x + 3} y1={182 - 26 * (k + 1)} y2={182 - 26 * (k + 1)} stroke="#3E5530" strokeWidth="1.6" />)}
            {Array.from({ length: 3 }, (_, k) => {
              const y = 182 - h + 12 + k * 22, dir = (i + k) % 2 ? 1 : -1;
              return <path key={`l${k}`} d={`M${x} ${y} q${dir * 14} -2 ${dir * 26} 6 q${-dir * 14} 2 ${-dir * 26} -6`} fill="#4F7140" stroke="#2F4626" strokeWidth=".8" />;
            })}
          </g>
        ))}
      </svg>
    );
  }
  if (type === 'rock') {
    // 태호석(太湖石)처럼 세로로 솟은 괴석
    return (
      <svg className="yv-flora" width="90" height="120" viewBox="0 0 90 120" style={{ marginLeft: -45, marginTop: -114 }} aria-hidden="true">
        <ellipse cx="45" cy="112" rx="34" ry="8" fill="rgba(50,35,15,.22)" />
        <path d="M18 112 C14 96 24 88 20 74 C14 58 26 50 24 36 C22 20 34 6 46 10 C54 2 68 8 64 22 C74 30 66 42 70 52 C78 64 64 72 68 86 C72 98 66 108 62 112 Z" fill="#B3AF9E" stroke="#3E3B33" strokeWidth="2" />
        <path d="M44 24 C40 18 48 14 50 20 C52 26 46 28 44 24 Z" fill="#6E6B60" />
        <path d="M34 62 C30 54 38 50 41 57 C43 64 36 66 34 62 Z" fill="#6E6B60" />
        <path d="M52 84 C50 78 58 76 58 82 C58 88 53 88 52 84 Z" fill="#7C796D" />
        <path d="M28 40 C34 46 30 52 36 56 M56 46 C52 54 60 60 56 68 M30 90 C36 96 32 104 38 108" stroke="#5E5B52" strokeWidth="1.4" fill="none" />
        <path d="M12 112 c4 -8 10 -8 12 0 M60 112 c3 -7 9 -7 12 0" stroke="#5E7A44" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  if (type === 'flag') {
    return (
      <div className="yv-flag" aria-hidden="true">
        <i />
        <b><span>漢</span></b>
      </div>
    );
  }
  return null;
}

/* ---------- 무대 뒤 하늘: 먼 산과 해 ---------- */
export function Sky() {
  return (
    <div className="yv-sky" aria-hidden="true">
      <div className="yv-sun" />
      <svg className="yv-far" viewBox="0 0 1600 400" preserveAspectRatio="none">
        <path d="M0 400 L0 250 C120 180 200 120 290 190 C360 110 430 60 520 160 C600 120 660 90 740 170 C820 80 900 40 1000 150 C1080 110 1160 70 1240 160 C1320 120 1400 90 1480 170 C1540 150 1580 160 1600 170 L1600 400 Z" fill="#B9B7A2" opacity=".45" />
        <path d="M0 400 L0 300 C100 250 180 210 260 260 C340 200 420 170 500 240 C580 200 660 180 760 250 C860 190 940 170 1040 240 C1120 210 1200 190 1300 250 C1400 210 1500 220 1600 250 L1600 400 Z" fill="#9EA38E" opacity=".45" />
      </svg>
      <Cloud w={260} className="yv-sky-cloud" style={{ left: '8%', top: '14%' }} />
      <Cloud w={200} className="yv-sky-cloud" style={{ right: '10%', top: '22%', animationDelay: '-30s' }} />
    </div>
  );
}

/* ---------- 마을 위를 흘러가는 구름과 새 ---------- */
export function Drift() {
  return (
    <div className="yv-drift" aria-hidden="true">
      <Cloud w={280} tone="rgba(255,253,247,.5)" line="rgba(140,120,90,.35)" className="yv-drift-cloud" style={{ top: '6%', animationDuration: '120s' }} />
      <Cloud w={240} tone="rgba(255,253,247,.45)" line="rgba(140,120,90,.3)" className="yv-drift-cloud" style={{ top: '30%', animationDuration: '160s', animationDelay: '-80s' }} />
      <svg className="yv-birds" width="90" height="40" viewBox="0 0 90 40">
        <path d="M2 14 q8 -8 14 0 q6 -8 14 0 M40 26 q6 -6 11 0 q5 -6 11 0 M64 8 q5 -5 9 0 q4 -5 9 0" stroke="#3B2F22" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
