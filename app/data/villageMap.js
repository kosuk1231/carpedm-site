// CARPEDM 캠퍼스의 배치와 이동 규칙.
// 좌표는 바닥 격자(x, y) 칸 단위입니다. 캠퍼스 안은 0~N. 남쪽(y = N)은 담장 없이 열려 있어
// 큰길 보도(y = N ~ N + OUT_LEN)에서 바로 걸어 들어옵니다.

export const N = 48;           // 캠퍼스 한 변의 칸 수
export const GATE_X = 24;      // 남쪽 입구(웰컴 사인) 가운데
export const OUT_LEN = 4;      // 캠퍼스 남쪽 보도 폭(그 너머가 큰길)
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
  { id: 'developer', x: 41.5, y: 7 },
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
export const DECOR = [
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

export const blocked = (x, y) => {
  if (x < 0.8 || x > N - 0.8 || y < 0.8) return true;
  if (y > N + OUT_LEN) return true; // 보도 너머는 차도
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
  const open = [{ i: si, j: sj, g: 0, f: 0 }];
  const came = new Map(), gs = new Map([[key(si, sj), 0]]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  let guard = 0;
  while (open.length && guard++ < 20000) {
    let bi = 0;
    for (let k = 1; k < open.length; k++) if (open[k].f < open[bi].f) bi = k;
    const c = open.splice(bi, 1)[0];
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
        open.push({ i: ni, j: nj, g: ng, f: ng + Math.hypot(ti - ni, tj - nj) });
      }
    }
  }
  return null;
}
