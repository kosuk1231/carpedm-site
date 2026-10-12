// 융중성의 배치와 이동 규칙.
// 좌표는 바닥 격자(x, y) 칸 단위입니다. 성 안은 0~N, 성문은 남쪽 성벽(y = N) 가운데,
// 성 밖으로는 골짜기 길이 남쪽(y > N)으로 이어지고, 도중에 강을 다리로 건넙니다.

export const N = 48;           // 성 한 변의 칸 수
export const GATE_X = 24;      // 성문 가운데
export const GATE_HALF = 1.15; // 성문 통로 반폭
export const OUT_LEN = 16;     // 성 밖 길 길이
export const ROAD_MIN = GATE_X - 5.5, ROAD_MAX = GATE_X + 5.5; // 성 밖 골짜기 길의 좌우 끝
export const RIVER_Y = N + 7.5;  // 성 밖 강(가운데 줄)
export const BRIDGE_HALF = 1.25;
export const SPEED = 5.6;      // 초당 이동 칸 수
export const TALK_R = 1.5;     // 장수와 대화 가능한 거리
export const DOOR_R = 1.4;     // 건물 입구 반경

// 건물 위치. key 는 CAMPS 의 key 와 같습니다. 건물은 입구가 +x 쪽(화면 오른쪽 앞)을 보도록 짓습니다.
export const BUILDINGS = [
  { key: 'gate', x: GATE_X, y: N, door: [0, 1.8], onWall: true },
  { key: 'chorye', x: 10, y: 9 },
  { key: 'workshop', x: 35, y: 9 },
  { key: 'lecture', x: 9, y: 30 },
  { key: 'library', x: 39, y: 27 },
  { key: 'beacon', x: 41, y: 41 },
];
export const B_R = 1.9; // 건물이 차지하는 반경(충돌)
// 입구 앞 자리. 성문은 성 밖 쪽 문 앞입니다.
export const door = (b) => (b.door ? { x: b.x + b.door[0], y: b.y + b.door[1] } : { x: b.x + 2.5, y: b.y + 0.7 });

// 장수 위치. 맡은 일과 맞는 건물 곁에 세웁니다.
export const PIECES = [
  { id: 'main', x: 12.5, y: 14.5 },
  { id: 'developer', x: 39, y: 7.5 },
  { id: 'critic', x: 31, y: 13 },
  { id: 'trainer', x: 14.5, y: 33 },
  { id: 'researcher', x: 9, y: 35.5 },
  { id: 'writer', x: 35, y: 31 },
  { id: 'editor', x: 43.5, y: 25 },
  { id: 'minutes', x: 41, y: 32.5 },
  { id: 'brief', x: GATE_X - 1.6, y: N - 3, patrol: [GATE_X - 1.4, 29] },   // 사신: 성문 안쪽과 광장 사이 큰길을 오가며 손님을 맞습니다
  { id: 'local', x: GATE_X + 2.3, y: N + 1.4, patrol: [GATE_X + 2.6, N + 4.6] }, // 수문장: 성문 밖을 지킵니다
];
export const P_R = 0.45;

// 성 안 풍경: 큰길 장터(stall), 민가(house), 나무·대나무·괴석, 깃발. 건물·입구·장수·길·물과 겹치지 않게 골라 둔 자리입니다.
export const DECOR = [
  ['stall', 21.4, 32], ['stall', 26.6, 32], ['stall', 21.4, 35], ['stall', 26.6, 35], ['stall', 21.4, 38], ['stall', 26.6, 38],
  ['stall', 21.4, 41], ['stall', 26.6, 41], ['house', 41.8, 22.6], ['house', 10.8, 24.5], ['house', 7.0, 15.7], ['house', 32.1, 4.8],
  ['house', 9.6, 3.6], ['house', 25.2, 5.5], ['house', 22.2, 14.7], ['house', 44.9, 44.8], ['house', 15.1, 5.9], ['house', 35.2, 19.8],
  ['house', 38.6, 19.2], ['house', 3.0, 11.8], ['house', 44.2, 19.7], ['house', 43.5, 34.8], ['house', 15.8, 40.2], ['house', 11.8, 19.6],
  ['house', 7.2, 44.6], ['house', 34.1, 42.5], ['house', 11.3, 42.9], ['house', 28.1, 15.3], ['house', 41.5, 11.6], ['house', 21.7, 5.5],
  ['pine', 9.6, 18.2], ['pine', 27.2, 7.6], ['bamboo', 45.3, 31.0], ['rock', 2.6, 42.2], ['pine', 2.7, 30.0], ['bamboo', 16.0, 46.2],
  ['tree', 5.1, 26.0], ['pine', 37.0, 42.4], ['pine', 17.4, 32.2], ['bamboo', 45.9, 40.9], ['rock', 5.5, 35.1], ['pine', 3.1, 28.5],
  ['bamboo', 23.2, 12.0], ['tree', 32.8, 23.9], ['pine', 13.2, 2.3], ['pine', 7.8, 23.8], ['bamboo', 29.6, 23.7], ['rock', 45.4, 21.9],
  ['pine', 5.1, 3.2], ['bamboo', 40.6, 3.6], ['tree', 15.5, 36.9], ['pine', 2.6, 7.8], ['pine', 22.0, 2.9], ['bamboo', 38.6, 12.3],
  ['rock', 29.7, 21.6], ['pine', 37.6, 44.4], ['bamboo', 22.9, 9.7], ['tree', 2.3, 22.8], ['pine', 13.9, 17.2], ['pine', 29.1, 35.4],
  ['bamboo', 19.3, 37.0], ['rock', 42.0, 5.7], ['pine', 40.8, 37.2], ['bamboo', 30.7, 10.9], ['tree', 30.3, 33.7], ['pine', 37.7, 4.6],
  ['pine', 43.9, 5.6], ['bamboo', 15.6, 18.7], ['rock', 11.0, 39.6], ['pine', 27.2, 10.7], ['bamboo', 28.7, 3.0], ['tree', 25.7, 20.2],
  ['pine', 13.8, 22.8], ['pine', 42.9, 7.5], ['bamboo', 36.4, 2.8], ['rock', 25.3, 8.9], ['pine', 41.9, 15.8], ['bamboo', 15.8, 42.8],
  ['tree', 11.5, 46.1], ['pine', 41.2, 7.7], ['pine', 12.4, 34.1], ['bamboo', 44.8, 6.9], ['rock', 39.1, 45.8], ['pine', 4.6, 44.0],
  ['bamboo', 16.3, 22.5], ['tree', 9.8, 22.0], ['flag', 22.4, 30], ['flag', 25.6, 30], ['flag', 21.5, 24], ['flag', 26.5, 24],
  ['flag', 21.8, N + 1.0], ['flag', 26.2, N + 1.0],
];
export const DECOR_R = { pine: 0.5, bamboo: 0.55, rock: 0.5, tree: 0.5, flag: 0.25, stall: 0.9, house: 1.5 };

// 물: 연못 [중심, 반지름], 개울(꺾은선). 걸어서 건널 수 없습니다.
export const PONDS = [[[19, 10], 1.6], [[32, 38], 2.0], [[6, 21], 1.3]];
export const STREAMS = [
  [[17, 0], [18.5, 4], [17.5, 7.5], [19, 10]],
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

export const START = { x: GATE_X, y: N + OUT_LEN - 2 }; // 성 밖 골짜기 길에서 출발
export const PLAZA = { x: 24, y: 26 };

// 성 밖 강물(다리 위는 지날 수 있음)
export const riverZ = (x) => RIVER_Y + Math.sin(x * 0.18) * 1.2;
const inRiver = (x, y) => Math.abs(y - riverZ(x)) < 1.3 && Math.abs(x - GATE_X) > BRIDGE_HALF;

export const blocked = (x, y) => {
  if (x < 0.8 || x > N - 0.8 || y < 0.8) return true;
  if (y > N - 0.8) {
    // 성벽: 성문 통로로만 지날 수 있음
    if (y < N + 0.8) return Math.abs(x - GATE_X) > GATE_HALF;
    // 성 밖 골짜기 길
    if (x < ROAD_MIN || x > ROAD_MAX || y > N + OUT_LEN) return true;
    if (inRiver(x, y)) return true;
  }
  for (const b of BUILDINGS) if (!b.onWall && Math.hypot(x - b.x, y - b.y) < B_R) return true;
  for (const p of PIECES) if (!p.patrol && Math.hypot(x - p.x, y - p.y) < P_R) return true;
  for (const [t, dx, dy] of DECOR) if (Math.hypot(x - dx, y - dy) < DECOR_R[t]) return true;
  if (inWater(x, y)) return true;
  return false;
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
      return path;
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
