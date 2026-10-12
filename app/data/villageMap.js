// CARPEDM 캠퍼스의 배치와 이동 규칙.
// 좌표는 바닥 격자(x, y) 칸 단위입니다. 캠퍼스 안은 0~N. 남쪽(y = N)은 담장 없이 열려 있어
// 큰길 보도(y = N ~ N + OUT_LEN)에서 바로 걸어 들어옵니다.

export const N = 48;           // 캠퍼스 한 변의 칸 수
export const GATE_X = 24;      // 남쪽 입구(웰컴 사인) 가운데
export const OUT_LEN = 4;      // 캠퍼스 남쪽 보도 폭(그 너머가 큰길)

// 캠퍼스 땅 모양: 반듯한 사각형이 아니라 실제 도시의 학교 부지처럼 둘레가 굽은 땅.
// 남쪽(큰길 쪽)만 곧게 열려 있고, 나머지는 굽은 생울타리와 보도로 둘러싸입니다. 아래 점들을 부드러운 곡선으로 잇습니다.
const CAMPUS_CTRL = [
  [1.5, 48], [12, 48], [24, 48], [36, 48], [46.5, 48], [47.6, 41], [46.4, 33], [47.4, 25], [45.6, 17], [42.2, 9.5],
  [37.5, 3.2], [30, 0.8], [21, 1.8], [13, 0.6], [6.5, 2.2], [2.6, 6.5], [1.0, 13], [2.4, 21], [0.9, 29], [2.0, 37], [0.9, 43.5],
];
function catmullClosed(pts, steps) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: Math.min(N, f(p0[1], p1[1], p2[1], p3[1])) });
    }
  }
  return out;
}
export const CAMPUS = catmullClosed(CAMPUS_CTRL, 10);
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
const isFront = (a, b) => a.y > N - 0.4 && b.y > N - 0.4; // 남쪽 큰길에 열린 부분
// 생울타리(남쪽 제외)까지의 거리
function hedgeDist(x, y) {
  let best = Infinity;
  for (let i = 0; i < CAMPUS.length; i++) {
    const a = CAMPUS[i], b = CAMPUS[(i + 1) % CAMPUS.length];
    if (isFront(a, b)) continue;
    const dx = b.x - a.x, dy = b.y - a.y;
    const u = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(x - (a.x + u * dx), y - (a.y + u * dy)));
  }
  return best;
}
export const HEDGE_IN = 0.45;  // 울타리는 둘레에서 이만큼 안쪽
// 걸을 수 있는 땅 미리 계산(0.25칸 격자): 캠퍼스 안(울타리 앞까지) + 남쪽 보도
const MR = 4;
const MW = N * MR + 1, MH = (N + 8) * MR + 1;
const walkMask = new Uint8Array(MW * MH);
for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
  const x = i / MR, y = j / MR;
  const side = y > N - 0.5 && y <= N + 4 && x > 0.8 && x < N - 0.8;
  walkMask[j * MW + i] = side || (inPoly(CAMPUS, x, y) && hedgeDist(x, y) > HEDGE_IN + 0.5) ? 1 : 0;
}
const walkable = (x, y) => {
  const i = Math.round(x * MR), j = Math.round(y * MR);
  return i >= 0 && j >= 0 && i < MW && j < MH && walkMask[j * MW + i] === 1;
};
export const nearHedge = (x, y) => hedgeDist(x, y);

export const SPEED = 4.0;      // 방문자 초당 이동 칸 수(가볍게 뛰는 속도)
export const TALK_R = 1.5;     // 인물과 대화 가능한 거리
export const DOOR_R = 1.4;     // 건물 입구 반경

// 건물 위치. key 는 CAMPS 의 key 와 같습니다. 건물은 입구가 +x 쪽(화면 오른쪽 앞)을 보도록 짓습니다.
export const BUILDINGS = [
  { key: 'gate', x: GATE_X, y: N, door: [0, 0.6], open: true }, // 웰컴 사인: 막지 않는 열린 입구
  { key: 'mission', x: 10, y: 9 },
  { key: 'lab', x: 37, y: 9 },
  { key: 'consult', x: 24, y: 10 },
  { key: 'academy', x: 9, y: 30 },
  { key: 'archive', x: 39, y: 27 },
  { key: 'lounge', x: 41, y: 41 },
];
export const B_R = 1.9; // 건물이 차지하는 반경(충돌)
// 입구 앞 자리. 웰컴 사인은 보도와 캠퍼스 경계입니다.
export const door = (b) => (b.door ? { x: b.x + b.door[0], y: b.y + b.door[1] } : { x: b.x + 2.5, y: b.y + 0.7 });

// 팀원 위치. 맡은 일과 맞는 건물 곁에 세웁니다.
export const PIECES = [
  { id: 'main', x: 17.5, y: 13 },
  { id: 'ceo', x: 14.5, y: 6.5 },                                        // 미션컨트롤 앞의 대표
  { id: 'developer', x: 40.5, y: 11.5 },
  { id: 'critic', x: 28.5, y: 14.5 },
  { id: 'trainer', x: 14.5, y: 33 },
  { id: 'researcher', x: 9, y: 35.5 },
  { id: 'writer', x: 35, y: 31 },
  { id: 'editor', x: 43.5, y: 25 },
  { id: 'minutes', x: 30, y: 8.5 },
  { id: 'brief', x: GATE_X - 1.6, y: N - 3, patrol: [GATE_X - 1.4, 29] },   // 입구와 광장 사이 큰길을 오가며 손님을 맞습니다
  { id: 'local', x: GATE_X + 2.6, y: N + 1.4, patrol: [GATE_X + 2.6, N - 2.5] }, // 환영 로봇: 입구에서 손님을 맞습니다
];
export const P_R = 0.45;

// 캠퍼스 풍경: 큰길 키오스크(kiosk)·가로등(lamp), 작은 사무 동(pod), 벤치, 나무·대나무·바위, 현수막(banner).
// 건물·입구·인물·길·물과 겹치지 않게 골라 둔 자리입니다.
const DECOR_ALL = [
  ['kiosk', 21.4, 32], ['kiosk', 26.6, 32], ['kiosk', 21.4, 35], ['kiosk', 26.6, 35], ['kiosk', 21.4, 38], ['kiosk', 26.6, 38],
  ['kiosk', 21.4, 41], ['kiosk', 26.6, 41], ['pod', 41.8, 22.6], ['pod', 10.8, 24.5], ['pod', 7.0, 15.7], ['pod', 32.1, 4.8],
  ['pod', 9.6, 3.6], ['pod', 22.2, 14.7], ['pod', 44.9, 44.8], ['pod', 38.3, 32.7], ['pod', 35.2, 19.8], ['pod', 38.6, 19.2],
  ['pod', 3.0, 11.8], ['pod', 44.2, 19.7], ['pod', 43.5, 34.8], ['pod', 11.9, 14.3], ['tree', 44.9, 37.5], ['pine', 15.3, 41.1],
  ['tree', 6.3, 45.7], ['bench', 36.1, 16.4], ['bamboo', 5.8, 27.7], ['tree', 12.6, 28.5], ['rock', 18.3, 21.9], ['bench', 34.6, 43.6],
  ['tree', 10.5, 44.0], ['pine', 20.5, 6.4], ['tree', 3.5, 44.5], ['bench', 12.4, 33.1], ['bamboo', 13.2, 38.4], ['tree', 42.5, 10.9],
  ['rock', 21.6, 4.5], ['bench', 9.6, 18.2], ['tree', 27.2, 7.6], ['pine', 17.9, 41.4], ['tree', 45.3, 31.0], ['bench', 2.6, 42.2],
  ['bamboo', 32.9, 44.5], ['tree', 2.7, 30.0], ['rock', 16.0, 46.2], ['bench', 5.1, 26.0], ['tree', 34.5, 41.8], ['pine', 37.0, 42.4],
  ['tree', 17.4, 32.2], ['bench', 45.9, 40.9], ['bamboo', 5.5, 35.1], ['tree', 3.1, 28.5], ['rock', 32.8, 23.9], ['bench', 13.2, 2.3],
  ['tree', 42.0, 31.1], ['pine', 7.8, 23.8], ['tree', 29.6, 23.7], ['bench', 15.8, 39.1], ['bamboo', 45.4, 21.9], ['tree', 5.1, 3.2],
  ['rock', 40.6, 3.6], ['bench', 15.5, 36.9], ['tree', 2.6, 7.8], ['pine', 22.0, 2.9], ['tree', 37.6, 44.4], ['bench', 32.2, 10.7],
  ['bamboo', 2.3, 22.8], ['tree', 13.9, 17.2], ['rock', 29.1, 35.4], ['bench', 19.3, 37.0], ['tree', 40.8, 37.2], ['pine', 30.7, 10.9],
  ['tree', 30.3, 33.7], ['bench', 11.3, 41.8], ['bamboo', 37.7, 4.6], ['tree', 43.9, 5.6], ['rock', 15.6, 18.7], ['bench', 11.0, 39.6],
  ['banner', 21.6, 30.5], ['banner', 26.4, 30.5], ['banner', 21.6, 21.5], ['banner', 26.4, 21.5], ['lamp', 22.4, 33.5], ['lamp', 25.6, 33.5],
  ['lamp', 22.4, 36.5], ['lamp', 25.6, 36.5], ['lamp', 22.4, 39.5], ['lamp', 25.6, 39.5], ['lamp', 22.4, 42.5], ['lamp', 25.6, 42.5],
];
// 굽은 둘레 밖이나 울타리에 걸리는 풍경은 뺌
export const DECOR = DECOR_ALL.filter(([, x, y]) => inPoly(CAMPUS, x, y) && hedgeDist(x, y) > 1.3);
export const DECOR_R = { pine: 0.5, bamboo: 0.55, rock: 0.5, tree: 0.5, bench: 0.6, banner: 0.25, lamp: 0.15, kiosk: 0.9, pod: 1.5 };

// 물: 연못 [중심, 반지름], 개울(꺾은선). 걸어서 건널 수 없습니다.
export const PONDS = [[[13, 21], 1.6], [[32, 38], 2.0], [[6, 21], 1.3]];
export const STREAMS = [
  [[32, 38], [29, 41.5], [27.5, 45]],
];
export const STREAM_HALF = 0.4;
const segDist = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay;
  const u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + u * dx), py - (ay + u * dy));
};
export const inWater = (x, y) => {
  for (const [[cx, cy], r] of PONDS) if (Math.hypot(x - cx, y - cy) < r + 0.1) return true;
  for (const s of STREAMS) for (let i = 0; i < s.length - 1; i++) if (segDist(x, y, s[i], s[i + 1]) < STREAM_HALF) return true;
  return false;
};

export const START = { x: GATE_X, y: N + OUT_LEN - 0.8 }; // 큰길 셔틀 정류장에서 출발
export const PLAZA = { x: 24, y: 26 };

const blockedRaw = (x, y) => {
  if (y > N + OUT_LEN || !walkable(x, y)) return true; // 캠퍼스 밖·울타리·차도
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
  const W = N * G;
  const cell = (x, y) => [Math.round(x * G), Math.round(y * G)];
  const H = (N + OUT_LEN) * G;
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
