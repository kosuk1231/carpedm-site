// CARPEDM 캠퍼스의 배치와 이동 규칙.
// 좌표는 바닥 격자(x, y) 칸 단위입니다. 캠퍼스는 동서 0~NX, 남북 0~NY 로 남북으로 긴 학교 부지입니다.
// 남쪽(y = NY) 큰길 보도에서 바로 들어와, 가로수 산책로를 따라 북쪽으로 걸으며 건물을 차례로 만납니다.

export const NX = 56;          // 캠퍼스 동서 폭(칸)
export const NY = 88;          // 캠퍼스 남북 길이(칸). 남쪽 끝이 큰길
export const N = NY;           // 남쪽 경계(옛 이름)
export const GATE_X = 28;      // 남쪽 입구(웰컴 사인) 가운데
export const OUT_LEN = 4;      // 캠퍼스 남쪽 보도 폭(그 너머가 큰길)
export const SPEED = 4.0;      // 방문자 초당 이동 칸 수(가볍게 뛰는 속도)
export const DOOR_R = 1.4;     // 건물 입구 반경

// 캠퍼스 땅 모양: 남북으로 긴, 둘레가 굽은 학교 부지. 남쪽(큰길 쪽)만 곧게 열려 있습니다.
const CAMPUS_CTRL = [
  [3, 88], [16, 88], [28, 88], [40, 88], [53, 88], [54.6, 79], [53, 67], [55, 55], [53.4, 43], [55, 31], [52.6, 19], [48.5, 9],
  [41, 3], [31, 1], [21, 2.2], [12, 1.4], [5.5, 5.5], [2.2, 14], [3.4, 26], [1.4, 38], [3.0, 50], [1.3, 62], [2.6, 74], [1.4, 83],
];
function catmullClosed(pts, steps) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: Math.min(NY, f(p0[1], p1[1], p2[1], p3[1])) });
    }
  }
  return out;
}
function catmullOpen(pts, step = 0.8) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const seg = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]) });
    }
  }
  const l = pts[pts.length - 1]; out.push({ x: l[0], y: l[1] });
  return out;
}
export const CAMPUS = catmullClosed(CAMPUS_CTRL, 8);
export function inPoly(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}
// 둘레 곡선을 바깥(+)/안(-)으로 d 만큼 옮긴 곡선(도로·보도·울타리 자리)
export function offsetPoly(poly, d) {
  const n = poly.length;
  let area = 0;
  for (let i = 0; i < n; i++) { const a = poly[i], b = poly[(i + 1) % n]; area += a.x * b.y - b.x * a.y; }
  const sgn = area > 0 ? -1 : 1;
  return poly.map((p, i) => {
    const a = poly[(i - 1 + n) % n], b = poly[(i + 1) % n];
    const tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1;
    return { x: p.x + sgn * (ty / l) * d, y: p.y - sgn * (tx / l) * d };
  });
}
const segDist = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay;
  const u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (ax + u * dx), py - (ay + u * dy));
};
const lineDist = (pl, x, y) => { let b = Infinity; for (let i = 0; i < pl.length - 1; i++) b = Math.min(b, segDist(x, y, pl[i].x, pl[i].y, pl[i + 1].x, pl[i + 1].y)); return b; };
const isFront = (a, b) => a.y > NY - 0.4 && b.y > NY - 0.4; // 남쪽 큰길에 열린 부분
function hedgeDist(x, y) {
  let best = Infinity;
  for (let i = 0; i < CAMPUS.length; i++) {
    const a = CAMPUS[i], b = CAMPUS[(i + 1) % CAMPUS.length];
    if (!isFront(a, b)) best = Math.min(best, segDist(x, y, a.x, a.y, b.x, b.y));
  }
  return best;
}
export const nearHedge = (x, y) => hedgeDist(x, y);
export const HEDGE_IN = 0.45;  // 울타리는 둘레에서 이만큼 안쪽

// 가로수 산책로: 입구에서 북쪽 끝까지 완만하게 굽이치는 큰길. 건물은 이 길 양옆에 번호 순서대로 섭니다.
export const PROMENADE = catmullOpen([[28, 92], [28, 82], [25.5, 72], [24.5, 62], [26.5, 53], [30.5, 44], [31, 34], [28.5, 24], [27, 15], [28, 6]]);
export const PROM_HALF = 1.25;
// 산책로 가운데 쉼터 광장과 그 동쪽 잔디 마당(쿼드)
export const PLAZA = { x: 25.5, y: 58 };
export const QUAD = { x: 38, y: 50, rx: 6, ry: 4.5 };

// 건물 위치. key 는 CAMPS 의 key 와 같습니다. face: 1 이면 입구가 동쪽(+x), -1 이면 서쪽(-x) — 모두 산책로를 바라봅니다.
export const BUILDINGS = [
  { key: 'gate', x: GATE_X, y: NY, door: [0, 0.6], open: true }, // 웰컴 사인: 막지 않는 열린 입구
  { key: 'academy', x: 13, y: 73, face: 1 },
  { key: 'consult', x: 43, y: 63, face: -1 },
  { key: 'lab', x: 14, y: 45, face: 1 },
  { key: 'archive', x: 44.5, y: 36, face: -1 },
  { key: 'mission', x: 14, y: 19, face: 1 },
  { key: 'lounge', x: 41.5, y: 12, face: -1 },
];
export const B_R = 1.9; // 건물이 차지하는 반경(충돌)
// 입구 앞 자리
export const door = (b) => (b.door ? { x: b.x + b.door[0], y: b.y + b.door[1] } : { x: b.x + 2.5 * (b.face || 1), y: b.y + 0.7 * (b.face || 1) });
// 각 건물 입구에서 산책로로 이어지는 샛길(산책로 위 가장 가까운 점까지)
export const BRANCHES = BUILDINGS.filter((b) => !b.open).map((b) => {
  const d = door(b);
  let best = PROMENADE[0], bd = Infinity;
  for (const p of PROMENADE) { const k = Math.hypot(p.x - d.x, p.y - d.y); if (k < bd) { bd = k; best = p; } }
  return [d, { x: best.x, y: best.y }];
});

// 팀원 위치. 맡은 일과 맞는 건물 곁에 세웁니다.
export const PIECES = [
  { id: 'local', x: GATE_X + 2.2, y: NY + 1.2, patrol: [GATE_X + 3.2, NY - 4] },   // 환영 로봇: 출발점 바로 옆 보도에서 손님을 맞습니다
  { id: 'brief', x: GATE_X - 2.6, y: NY - 4, patrol: [PLAZA.x - 2.5, PLAZA.y + 3] }, // 입구와 쉼터 광장 사이 산책로를 오갑니다
  { id: 'trainer', x: 18.5, y: 76.5 },
  { id: 'researcher', x: 11, y: 78.5 },
  { id: 'critic', x: 37.5, y: 66 },
  { id: 'developer', x: 19, y: 48.5 },
  { id: 'minutes', x: 17.5, y: 40 },
  { id: 'writer', x: 39, y: 39.5 },
  { id: 'editor', x: 40, y: 31.5 },
  { id: 'main', x: 20, y: 22 },
  { id: 'ceo', x: 18, y: 15.5 },
];
export const P_R = 0.45;

// 물: 서쪽 숲 속 작은 연못 하나. 걸어서 건널 수 없습니다.
export const PONDS = [[[20, 31], 2.2]];
export const STREAMS = [];
export const STREAM_HALF = 0.4;
export const inWater = (x, y) => PONDS.some(([[cx, cy], r]) => Math.hypot(x - cx, y - cy) < r + 0.1);

// 캠퍼스 풍경: 산책로 가로수(tree)·가로등(lamp)·벤치, 숲(tree·pine·bamboo·rock), 작은 사무 동(pod), 입구 현수막(banner), 광장 커피 카트(kiosk).
// 산책로·샛길·건물·연못을 피해 자리를 정합니다(매번 같은 배치).
export const DECOR_R = { street: 0.2, pine: 0.5, bamboo: 0.55, rock: 0.5, tree: 0.5, bench: 0.6, banner: 0.25, lamp: 0.15, kiosk: 0.9, pod: 1.5 };
const rnd = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const DECOR = (() => {
  const out = [];
  const branchDist = (x, y) => Math.min(...BRANCHES.map(([a, b]) => segDist(x, y, a.x, a.y, b.x, b.y)));
  const free = (x, y, r, gap = 1.2) => inPoly(CAMPUS, x, y) && hedgeDist(x, y) > r + 1.0 && y < NY - 1
    && !BUILDINGS.some((b) => !b.open && Math.hypot(x - b.x, y - b.y) < B_R + r + 1.6)
    && !BUILDINGS.some((b) => { const d = door(b); return Math.hypot(x - d.x, y - d.y) < 2.4; })
    && branchDist(x, y) > PROM_HALF + r + 0.5 && !PONDS.some(([[cx, cy], pr]) => Math.hypot(x - cx, y - cy) < pr + r + 1)
    && Math.hypot(x - PLAZA.x, y - PLAZA.y) > 3.6 + r
    && !out.some(([t, ox, oy]) => Math.hypot(x - ox, y - oy) < r + DECOR_R[t] + gap);
  // 산책로 가로수와 가로등: 길 양옆에 줄지어
  let acc = 0, side = 1;
  for (let i = 1; i < PROMENADE.length; i++) {
    const a = PROMENADE[i - 1], b = PROMENADE[i];
    const l = Math.hypot(b.x - a.x, b.y - a.y); if (!l) continue;
    const nx = -(b.y - a.y) / l, ny = (b.x - a.x) / l;
    const before = acc; acc += l;
    if (Math.floor(acc / 5.5) !== Math.floor(before / 5.5) && b.y < NY - 4) {
      for (const s of [-1, 1]) { const x = b.x + nx * s * 2.2, y = b.y + ny * s * 2.2; if (free(x, y, 0.2, 0.6)) out.push(['street', x, y]); }
    }
    if (Math.floor(acc / 8.4 + 0.5) !== Math.floor(before / 8.4 + 0.5) && b.y < NY - 2) {
      side = -side; const x = b.x + nx * side * 1.75, y = b.y + ny * side * 1.75; if (free(x, y, 0.15, 0.3)) out.push(['lamp', x, y]);
    }
    if (Math.floor(acc / 13 + 0.3) !== Math.floor(before / 13 + 0.3) && b.y < NY - 6) {
      const x = b.x - nx * side * 1.95, y = b.y - ny * side * 1.95; if (free(x, y, 0.6, 0.4)) out.push(['bench', x, y]);
    }
  }
  // 입구 현수막과 광장 커피 카트·벤치
  out.push(['banner', GATE_X - 2.4, NY - 3], ['banner', GATE_X + 2.4, NY - 3]);
  for (const [dx, dy] of [[4.6, -1.5], [-4.4, 1.8]]) out.push(['kiosk', PLAZA.x + dx, PLAZA.y + dy]);
  for (const [dx, dy] of [[0, -4.4], [3.6, 3.4], [-3.4, -3.2]]) if (free(PLAZA.x + dx, PLAZA.y + dy, 0.6, 0.3) || true) out.push(['bench', PLAZA.x + dx, PLAZA.y + dy]);
  // 쿼드 둘레 나무
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; const x = QUAD.x + Math.cos(a) * (QUAD.rx + 1.6), y = QUAD.y + Math.sin(a) * (QUAD.ry + 1.6); if (free(x, y, 0.5, 0.8)) out.push(['tree', x, y]); }
  // 숲과 작은 사무 동: 남는 땅에 고루
  const kinds = ['tree', 'pine', 'rock', 'tree', 'bamboo', 'pine', 'pod'];
  for (let i = 0; out.length < 150 && i < 2500; i++) {
    const t = kinds[i % kinds.length];
    const x = 2 + rnd(i * 2 + 1) * (NX - 4), y = 2 + rnd(i * 2 + 2) * (NY - 6);
    if (Math.hypot(x - QUAD.x, (y - QUAD.y) * QUAD.rx / QUAD.ry) < QUAD.rx + 0.8) continue;
    if (lineDist(PROMENADE, x, y) < PROM_HALF + DECOR_R[t] + (t === 'pod' ? 3 : 4.5)) continue;
    if (free(x, y, DECOR_R[t], t === 'pod' ? 2.5 : 1.0)) out.push([t, x, y]);
  }
  return out;
})();

export const START = { x: GATE_X, y: NY + OUT_LEN - 0.8 }; // 큰길 셔틀 정류장에서 출발

// 걸을 수 있는 땅 미리 계산(0.25칸 격자): 캠퍼스 안(울타리 앞까지) + 남쪽 보도
const MR = 4;
const MW = NX * MR + 1, MH = (NY + 8) * MR + 1;
const walkMask = new Uint8Array(MW * MH);
for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
  const x = i / MR, y = j / MR;
  const side = y > NY - 0.5 && y <= NY + OUT_LEN && x > 0.8 && x < NX - 0.8;
  walkMask[j * MW + i] = side || (inPoly(CAMPUS, x, y) && hedgeDist(x, y) > HEDGE_IN + 0.5) ? 1 : 0;
}
const walkable = (x, y) => {
  const i = Math.round(x * MR), j = Math.round(y * MR);
  return i >= 0 && j >= 0 && i < MW && j < MH && walkMask[j * MW + i] === 1;
};

const blockedRaw = (x, y) => {
  if (y > NY + OUT_LEN || !walkable(x, y)) return true; // 캠퍼스 밖·울타리·차도
  for (const b of BUILDINGS) if (!b.open && Math.hypot(x - b.x, y - b.y) < B_R) return true;
  for (const [t, dx, dy] of DECOR) if (Math.hypot(x - dx, y - dy) < DECOR_R[t]) return true;
  if (inWater(x, y)) return true;
  return false;
};

// 두 점 사이가 막힘 없이 트였는지(사람 몸 폭을 감안해 좌우로도 살핌)
export function clearLine(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
  if (!d) return true;
  const nx = -dy / d * 0.22, ny = dx / d * 0.22;
  for (let s = 0.2; s < d; s += 0.2) {
    const x = a.x + dx * s / d, y = a.y + dy * s / d;
    if (blocked(x, y) || blocked(x + nx, y + ny) || blocked(x - nx, y - ny)) return false;
  }
  return true;
}
// 격자 길을 곧게 펴기: 보이는 가장 먼 점으로 바로 감(지그재그 없이 사람처럼 대각선으로 걸음)
function smoothPath(from, path) {
  const out = [];
  let cur = from, i = 0;
  while (i < path.length) {
    let j = path.length - 1;
    while (j > i && !clearLine(cur, path[j])) j--;
    out.push(path[j]); cur = path[j]; i = j + 1;
  }
  return out;
}

// 막힌 곳은 모두 움직이지 않으므로 0.25칸 격자로 한 번 계산해 두고 찾아봄(길찾기가 빨라짐)
let fullMask = null;
export const blocked = (x, y) => {
  if (!fullMask) {
    fullMask = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) fullMask[j * MW + i] = blockedRaw(i / MR, j / MR) ? 1 : 0;
  }
  const i = Math.round(x * MR), j = Math.round(y * MR);
  return i < 0 || j < 0 || i >= MW || j >= MH || fullMask[j * MW + i] === 1;
};

// 길찾기: 반 칸 격자 위 A*. 건물·장수·나무를 돌아서 갑니다.
const G = 2; // 한 칸을 몇 조각으로 나눌지
export function findPath(from, to) {
  const W = NX * G;
  const cell = (x, y) => [Math.round(x * G), Math.round(y * G)];
  const H = (NY + OUT_LEN) * G;
  const free = (i, j) => i >= 0 && j >= 0 && i <= W && j <= H && !blocked(i / G, j / G);
  let [ti, tj] = cell(to.x, to.y);
  if (!free(ti, tj)) {
    // 목적지가 막혀 있으면 가장 가까운 빈자리
    let best = null;
    for (let r = 1; r < 8 && !best; r++) for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++) {
      if (free(ti + di, tj + dj) && (!best || Math.hypot(di, dj) < best.d)) best = { i: ti + di, j: tj + dj, d: Math.hypot(di, dj) };
    }
    if (!best) return null;
    ti = best.i; tj = best.j;
  }
  const [si, sj] = cell(from.x, from.y);
  const key = (i, j) => i * 1000 + j;
  // 우선순위 큐(이진 힙)
  const heap = [];
  const push = (n) => { heap.push(n); let k = heap.length - 1; while (k) { const p = (k - 1) >> 1; if (heap[p].f <= heap[k].f) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l].f < heap[m].f) m = l; if (r < heap.length && heap[r].f < heap[m].f) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  push({ i: si, j: sj, g: 0, f: 0 });
  const came = new Map(), gs = new Map([[key(si, sj), 0]]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  let guard = 0;
  while (heap.length && guard++ < 20000) {
    const c = pop();
    if (c.g > (gs.get(key(c.i, c.j)) ?? Infinity)) continue;
    if (c.i === ti && c.j === tj) {
      const path = [];
      let k = key(c.i, c.j);
      while (came.has(k)) { path.push({ x: Math.floor(k / 1000) / G, y: (k % 1000) / G }); k = came.get(k); }
      path.reverse();
      if (path.length) path[path.length - 1] = { x: ti / G, y: tj / G };
      return smoothPath(from, path);
    }
    for (const [di, dj] of dirs) {
      const ni = c.i + di, nj = c.j + dj;
      if (!free(ni, nj)) continue;
      if (di && dj && (!free(c.i + di, c.j) || !free(c.i, c.j + dj))) continue;
      const ng = c.g + Math.hypot(di, dj);
      const nk = key(ni, nj);
      if (ng < (gs.get(nk) ?? Infinity)) {
        gs.set(nk, ng); came.set(nk, key(c.i, c.j));
        push({ i: ni, j: nj, g: ng, f: ng + Math.hypot(ti - ni, tj - nj) });
      }
    }
  }
  return null;
}
