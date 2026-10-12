// 융중 마을의 배치와 이동 규칙.
// 좌표는 바닥 격자(x, y) 칸 단위입니다.

export const N = 28;           // 마을 한 변의 칸 수
export const SPEED = 4.6;      // 초당 이동 칸 수
export const TALK_R = 1.5;     // 장수와 대화 가능한 거리
export const DOOR_R = 1.4;     // 건물 입구 반경

// 건물 위치. key 는 CAMPS 의 key 와 같습니다. 건물은 입구가 +x 쪽(화면 오른쪽 앞)을 보도록 짓습니다.
export const BUILDINGS = [
  { key: 'chorye', x: 6, y: 6 },
  { key: 'workshop', x: 17, y: 4.5 },
  { key: 'lecture', x: 5, y: 17 },
  { key: 'library', x: 21, y: 14 },
  { key: 'gate', x: 14, y: 23 },
  { key: 'beacon', x: 24, y: 23.5 },
];
export const B_R = 1.9; // 건물이 차지하는 반경(충돌)
// 입구 앞 자리
export const door = (b) => ({ x: b.x + 2.5, y: b.y + 0.7 });

// 장수 위치. 맡은 일과 맞는 건물 곁에 세웁니다.
export const PIECES = [
  { id: 'main', x: 9.5, y: 9 },
  { id: 'trainer', x: 9, y: 16 },
  { id: 'researcher', x: 5.5, y: 21 },
  { id: 'developer', x: 21.5, y: 4 },
  { id: 'critic', x: 15.5, y: 8.5 },
  { id: 'writer', x: 18.5, y: 17.5 },
  { id: 'editor', x: 25, y: 12 },
  { id: 'minutes', x: 23, y: 18 },
  { id: 'brief', x: 11.5, y: 25.5, patrol: [12.2, 17.4] },   // 사신: 성문과 광장 사이를 오갑니다
  { id: 'local', x: 18, y: 23, patrol: [19.6, 20.4] },       // 수문장: 성문 앞을 순찰합니다
];
export const P_R = 0.45;

// 풍경 소품: 소나무·대나무·바위·깃발. 건물·입구·장수·길·물과 겹치지 않게 골라 둔 자리입니다.
export const DECOR = [
  ['pine', 2.7, 14.2], ['pine', 2.2, 12.3], ['bamboo', 3.0, 3.5], ['rock', 17.3, 25.5], ['pine', 26.2, 2.4], ['bamboo', 23.2, 8.6], ['pine', 9.1, 22.1],
  ['pine', 18.8, 11.2], ['bamboo', 2.7, 6.5], ['rock', 19.9, 8.6], ['pine', 26.3, 4.2], ['bamboo', 11.9, 20.6], ['pine', 5.1, 13.7], ['pine', 13.3, 18.2],
  ['bamboo', 2.8, 19.2], ['rock', 11.1, 18.3], ['pine', 2.7, 20.9], ['bamboo', 8.3, 11.8], ['pine', 7.2, 13.6], ['pine', 25.6, 18.9], ['bamboo', 9.9, 2.5],
  ['rock', 1.2, 5.1], ['pine', 3.8, 10.5], ['bamboo', 1.9, 23.6], ['pine', 7.7, 10.1], ['pine', 10.5, 4.3], ['bamboo', 22.9, 26.6], ['rock', 24.2, 7.0],
  ['pine', 1.8, 25.5], ['bamboo', 15.1, 1.9], ['pine', 14.7, 26.2], ['pine', 1.9, 8.4], ['bamboo', 25.2, 26.5], ['rock', 25.6, 10.5],
  ['flag', 12.9, 16.7], ['flag', 11.15, 13.45], ['flag', 16.6, 12.7], ['flag', 11.3, 21.6],
];
export const DECOR_R = { pine: 0.5, bamboo: 0.55, rock: 0.5, flag: 0.25 };

// 물: 연못 [중심, 반지름], 개울(꺾은선). 걸어서 건널 수 없습니다.
export const PONDS = [[[12.2, 8.2], 1.15], [[8.6, 24.6], 1.5]];
export const STREAMS = [
  [[11.4, 0], [12.5, 3], [11.7, 5.8], [12.2, 8.2]],
  [[8.6, 24.6], [6.2, 26], [4.6, 28]],
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

export const START = { x: 14, y: 14.6 };
export const PLAZA = { x: 14, y: 14 };

export const blocked = (x, y) => {
  if (x < 0.8 || y < 0.8 || x > N - 0.8 || y > N - 0.8) return true;
  for (const b of BUILDINGS) if (Math.hypot(x - b.x, y - b.y) < B_R) return true;
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
  const free = (i, j) => i >= 0 && j >= 0 && i <= W && j <= W && !blocked(i / G, j / G);
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
