'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AGENTS, CAMPS } from '../data/agents';
import { CloudSea, Drift, Flora, Ground, Sky } from './villageScenery';

// 융중 마을: 비스듬히 내려다보는(아이소메트릭) 2.5D 마을을 방문자 캐릭터로 걸어 다닙니다.
// 좌표는 바닥 격자(x, y) 단위로 계산하고, 화면에는 아이소메트릭으로 투영합니다.
// 이동: 방향키/WASD, 또는 바닥을 눌러 그 자리까지 걷기. 장수·건물 앞에서 Space/Enter 또는 버튼으로 상호작용.

const N = 28;            // 마을 한 변의 칸 수
const TW = 96;           // 칸 하나의 화면 가로
const TH = 48;           // 칸 하나의 화면 세로
const PAD = 420;         // 위쪽 여백(뒤쪽 산과 높은 건물이 잘리지 않도록)
const MX = 420;          // 좌우 여백(산과 구름 바다)
const WORLD_W = N * TW + MX * 2;
const WORLD_H = N * TH + PAD + 360;
const SPEED = 4.6;       // 초당 이동 칸 수
const TALK_R = 1.5;      // 장수와 대화 가능한 거리
const DOOR_R = 1.4;      // 건물 입구 반경

const toScreen = (x, y) => ({ sx: (x - y) * (TW / 2) + WORLD_W / 2, sy: (x + y) * (TH / 2) + PAD });
const toWorld = (sx, sy) => {
  const a = (sx - WORLD_W / 2) / (TW / 2);
  const b = (sy - PAD) / (TH / 2);
  return { x: (a + b) / 2, y: (b - a) / 2 };
};

// 건물 위치. key 는 CAMPS 의 key 와 같고, 그림은 public/village/<key>.png (배경 투명 디오라마).
const BUILDINGS = [
  { key: 'chorye', x: 6, y: 6 },
  { key: 'workshop', x: 17, y: 4.5 },
  { key: 'lecture', x: 5, y: 17 },
  { key: 'library', x: 21, y: 14 },
  { key: 'gate', x: 14, y: 23 },
  { key: 'beacon', x: 24, y: 23.5 },
];
const B_R = 1.9; // 건물이 차지하는 반경(충돌)
// 입구는 그림의 오른쪽 앞면, 돌길이 끝나는 자리
const door = (b) => ({ x: b.x + 2.5, y: b.y + 0.7 });

// 장수 위치. 맡은 일과 맞는 건물 곁에 세웁니다.
const PIECES = [
  { id: 'main', x: 9.5, y: 9 },
  { id: 'trainer', x: 9, y: 16 },
  { id: 'researcher', x: 5.5, y: 21 },
  { id: 'developer', x: 21.5, y: 4 },
  { id: 'critic', x: 15.5, y: 8.5 },
  { id: 'writer', x: 18.5, y: 17.5 },
  { id: 'editor', x: 25, y: 12 },
  { id: 'minutes', x: 23, y: 18 },
  { id: 'brief', x: 11.5, y: 25.5 },
  { id: 'local', x: 18, y: 23 },
];
const P_R = 0.45;

// 풍경 소품: 소나무·대나무·바위·깃발. 건물·입구·장수·길·물과 겹치지 않게 골라 둔 자리입니다.
const DECOR = [
  ['pine', 2.7, 14.2], ['pine', 2.2, 12.3], ['bamboo', 3.0, 3.5], ['rock', 17.3, 25.5], ['pine', 26.2, 2.4], ['bamboo', 23.2, 8.6], ['pine', 9.1, 22.1],
  ['pine', 18.8, 11.2], ['bamboo', 2.7, 6.5], ['rock', 19.9, 8.6], ['pine', 26.3, 4.2], ['bamboo', 11.9, 20.6], ['pine', 5.1, 13.7], ['pine', 13.3, 18.2],
  ['bamboo', 2.8, 19.2], ['rock', 11.1, 18.3], ['pine', 2.7, 20.9], ['bamboo', 8.3, 11.8], ['pine', 7.2, 13.6], ['pine', 25.6, 18.9], ['bamboo', 9.9, 2.5],
  ['rock', 1.2, 5.1], ['pine', 3.8, 10.5], ['bamboo', 1.9, 23.6], ['pine', 7.7, 10.1], ['pine', 10.5, 4.3], ['bamboo', 22.9, 26.6], ['rock', 24.2, 7.0],
  ['pine', 1.8, 25.5], ['bamboo', 15.1, 1.9], ['pine', 14.7, 26.2], ['pine', 1.9, 8.4], ['bamboo', 25.2, 26.5], ['rock', 25.6, 10.5],
  ['flag', 12.9, 16.7], ['flag', 11.15, 13.45], ['flag', 16.6, 12.7], ['flag', 11.3, 21.6],
];
const DECOR_R = { pine: 0.5, bamboo: 0.55, rock: 0.5, flag: 0.25 };

// 물: 연못 [중심, 반지름], 개울(꺾은선). 걸어서 건널 수 없습니다.
const PONDS = [[[12.2, 8.2], 1.15], [[8.6, 24.6], 1.5]];
const STREAMS = [
  [[11.4, 0], [12.5, 3], [11.7, 5.8], [12.2, 8.2]],
  [[8.6, 24.6], [6.2, 26], [4.6, 28]],
];
const STREAM_HALF = 0.4;
const segDist = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay;
  const u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + u * dx), py - (ay + u * dy));
};
const inWater = (x, y) => {
  for (const [[cx, cy], r] of PONDS) if (Math.hypot(x - cx, y - cy) < r + 0.1) return true;
  for (const s of STREAMS) for (let i = 0; i < s.length - 1; i++) if (segDist(x, y, s[i], s[i + 1]) < STREAM_HALF) return true;
  return false;
};

const START = { x: 14, y: 14.6 };
const PLAZA = { x: 14, y: 14 };

const blocked = (x, y) => {
  if (x < 0.8 || y < 0.8 || x > N - 0.8 || y > N - 0.8) return true;
  for (const b of BUILDINGS) if (Math.hypot(x - b.x, y - b.y) < B_R) return true;
  for (const p of PIECES) if (Math.hypot(x - p.x, y - p.y) < P_R) return true;
  for (const [t, dx, dy] of DECOR) if (Math.hypot(x - dx, y - dy) < DECOR_R[t]) return true;
  if (inWater(x, y)) return true;
  return false;
};

// 길찾기: 반 칸 격자 위 A*. 건물·장수·나무를 돌아서 갑니다.
const G = 2; // 한 칸을 몇 조각으로 나눌지
function findPath(from, to) {
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

function Building({ b }) {
  const { sx, sy } = toScreen(b.x, b.y);
  return (
    <div className="yv-obj yv-building" style={{ left: sx, top: sy, zIndex: Math.round((b.x + b.y) * 10) }}>
      <img className="yv-building-art" src={`/village/${b.key}.png`} alt="" draggable="false" />
    </div>
  );
}

export default function YungjungVillage() {
  const stageRef = useRef(null);
  const worldRef = useRef(null);
  const playerRef = useRef(null);
  const pos = useRef({ ...START });
  const keys = useRef(new Set());
  const target = useRef(null);
  const facing = useRef(1);
  const activeRef = useRef(false);
  const [near, setNear] = useState(null);       // { kind: 'agent'|'place', id }
  const [open, setOpen] = useState(null);       // 위와 같은 꼴, 열린 카드
  const [moving, setMoving] = useState(false);
  const [hint, setHint] = useState(true);
  const openRef = useRef(null);
  openRef.current = open;
  const nearRef = useRef(null);
  nearRef.current = near;

  const interact = useCallback((n) => {
    const t = n || nearRef.current;
    if (t) { setOpen(t); keys.current.clear(); target.current = null; }
  }, []);

  // 카메라와 캐릭터 위치를 DOM 에 직접 반영(매 프레임 React 렌더를 피함)
  const paint = useCallback(() => {
    const stage = stageRef.current, world = worldRef.current, player = playerRef.current;
    if (!stage || !world || !player) return;
    const { sx, sy } = toScreen(pos.current.x, pos.current.y);
    player.style.left = `${sx}px`;
    player.style.top = `${sy}px`;
    player.style.zIndex = String(Math.round((pos.current.x + pos.current.y) * 10) + 1);
    player.style.setProperty('--face', String(facing.current));
    const vw = stage.clientWidth, vh = stage.clientHeight;
    const cx = Math.min(0, Math.max(vw - WORLD_W, vw / 2 - sx));
    const cy = Math.min(0, Math.max(vh - WORLD_H, vh / 2 - sy + 40));
    world.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
  }, []);

  useEffect(() => {
    let raf = 0, last = performance.now(), wasMoving = false;
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let dx = 0, dy = 0;
      const k = keys.current;
      if (!openRef.current) {
        // 화면 기준 위·아래·왼쪽·오른쪽을 격자 방향으로 바꿉니다.
        if (k.has('up'))    { dx -= 1; dy -= 1; }
        if (k.has('down'))  { dx += 1; dy += 1; }
        if (k.has('left'))  { dx -= 1; dy += 1; }
        if (k.has('right')) { dx += 1; dy -= 1; }
        if (dx || dy) target.current = null;
        else if (target.current) {
          // target.current 는 경유점 배열
          const wp = target.current[0];
          const tx = wp.x - pos.current.x, ty = wp.y - pos.current.y;
          const d = Math.hypot(tx, ty);
          if (d < 0.12) { target.current.shift(); if (!target.current.length) target.current = null; }
          else { dx = tx / d; dy = ty / d; }
        }
      }
      const len = Math.hypot(dx, dy);
      const isMoving = len > 0;
      if (isMoving) {
        const s = (SPEED * dt) / len;
        const nx = pos.current.x + dx * s, ny = pos.current.y + dy * s;
        // 막히면 한 축씩 미끄러지듯 이동
        if (!blocked(nx, ny)) { pos.current.x = nx; pos.current.y = ny; }
        else if (!blocked(nx, pos.current.y)) pos.current.x = nx;
        else if (!blocked(pos.current.x, ny)) pos.current.y = ny;
        else target.current = null;
        const screenDx = dx - dy;
        if (Math.abs(screenDx) > 0.01) facing.current = screenDx < 0 ? -1 : 1;
      }
      if (isMoving !== wasMoving) { wasMoving = isMoving; setMoving(isMoving); }
      paint();

      // 가까운 대상 찾기
      let found = null, best = Infinity;
      for (const p of PIECES) {
        const d = Math.hypot(pos.current.x - p.x, pos.current.y - p.y);
        if (d < TALK_R && d < best) { best = d; found = { kind: 'agent', id: p.id }; }
      }
      for (const b of BUILDINGS) {
        const dr = door(b);
        const d = Math.hypot(pos.current.x - dr.x, pos.current.y - dr.y);
        if (d < DOOR_R && d < best) { best = d; found = { kind: 'place', id: b.key }; }
      }
      const cur = nearRef.current;
      if ((cur?.id || null) !== (found?.id || null)) setNear(found);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paint]);

  // 화면에 충분히 보일 때만 키보드를 가져옵니다(아래 목록을 읽을 때는 방향키가 평소처럼 스크롤).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const io = new IntersectionObserver(([e]) => { activeRef.current = e.intersectionRatio > 0.6; }, { threshold: [0, 0.6, 1] });
    io.observe(stage);
    const map = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
    const down = (e) => {
      if (e.key === 'Escape') { setOpen(null); return; }
      if (!activeRef.current || openRef.current) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (map[e.code]) { keys.current.add(map[e.code]); setHint(false); e.preventDefault(); }
      else if ((e.code === 'Space' || e.code === 'Enter') && nearRef.current && tag !== 'BUTTON' && tag !== 'A') { e.preventDefault(); interact(); }
    };
    const up = (e) => { if (map[e.code]) keys.current.delete(map[e.code]); };
    const blur = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    window.addEventListener('resize', paint);
    paint();
    return () => {
      io.disconnect();
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      window.removeEventListener('resize', paint);
    };
  }, [interact, paint]);

  // 바닥을 누르면 그 자리까지 걷습니다.
  const onGround = (e) => {
    if (e.target.closest('button, a')) return;
    const rect = worldRef.current.getBoundingClientRect();
    const w = toWorld(e.clientX - rect.left, e.clientY - rect.top);
    target.current = findPath(pos.current, { x: Math.max(1, Math.min(N - 1, w.x)), y: Math.max(1, Math.min(N - 1, w.y)) });
    setHint(false);
  };

  const walkTo = (pt) => { target.current = findPath(pos.current, pt); setHint(false); setOpen(null); };

  const agent = open?.kind === 'agent' ? AGENTS[open.id] : null;
  const camp = open?.kind === 'place' ? CAMPS.find((c) => c.key === open.id) : null;
  const nearLabel = near
    ? near.kind === 'agent'
      ? `${AGENTS[near.id].emoji} ${AGENTS[near.id].name}에게 말 걸기`
      : `${CAMPS.find((c) => c.key === near.id).place} 들어가기`
    : null;

  // 바닥 길: 광장에서 각 건물 입구까지
  const roads = BUILDINGS.map((b) => {
    const a = toScreen(PLAZA.x, PLAZA.y), d0 = door(b), d = toScreen(d0.x, d0.y);
    return `M${a.sx} ${a.sy} L${d.sx} ${d.sy}`;
  });

  return (
    <section className="yv" aria-label="융중 마을 — 걸어서 둘러보는 포트폴리오">
      <div className="yv-stage" ref={stageRef} onPointerDown={onGround}>
        <Sky />
        <div className="yv-world" ref={worldRef} style={{ width: WORLD_W, height: WORLD_H }}>
          <Ground N={N} TW={TW} TH={TH} W={WORLD_W} H={WORLD_H} toScreen={toScreen} ponds={PONDS} streams={STREAMS} roads={roads} plaza={PLAZA} />
          <CloudSea N={N} toScreen={toScreen} />

          {BUILDINGS.map((b) => <Building key={b.key} b={b} />)}

          {BUILDINGS.map((b) => {
            const c = CAMPS.find((x) => x.key === b.key);
            const { sx, sy } = toScreen(b.x, b.y);
            return <span key={b.key} className="yv-sign" style={{ left: sx, top: sy - 175, zIndex: Math.round((b.x + b.y) * 10) + 5 }}>{c.no} {c.place}</span>;
          })}

          {DECOR.map(([t, x, y], i) => {
            const { sx, sy } = toScreen(x, y);
            return (
              <div key={`${t}-${x}-${y}`} className={`yv-obj yv-decor yv-decor-${t}`} style={{ left: sx, top: sy, zIndex: Math.round((x + y) * 10) }}>
                <Flora type={t} seed={i} />
              </div>
            );
          })}

          {PIECES.map((p) => {
            const a = AGENTS[p.id];
            const { sx, sy } = toScreen(p.x, p.y);
            const isNear = near?.kind === 'agent' && near.id === p.id;
            return (
              <div key={p.id} className={`yv-obj yv-agent${isNear ? ' is-near' : ''}`} style={{ left: sx, top: sy, zIndex: Math.round((p.x + p.y) * 10) }}>
                {isNear && <div className="yv-bubble">{a.greet}</div>}
                <button type="button" onClick={() => interact({ kind: 'agent', id: p.id })} aria-label={`${a.name} — ${a.role}, 장수 카드 열기`}>
                  <img src={`/agents/${p.id}.png`} alt="" draggable="false" />
                </button>
                <span className="yv-name">{a.emoji} {a.name}</span>
              </div>
            );
          })}

          <div className={`yv-obj yv-player${moving ? ' is-moving' : ''}`} ref={playerRef} aria-hidden="true">
            <img className="yv-player-body" src="/village/visitor.png" alt="" draggable="false" />
          </div>
        </div>

        <Drift />

        {hint && (
          <div className="yv-hint">
            <b>융중 마을에 오신 것을 환영합니다</b>
            <span className="yv-hint-desk">방향키·WASD로 걷고, 장수나 건물 앞에서 Space</span>
            <span className="yv-hint-touch">바닥을 누르면 그곳으로 걸어갑니다</span>
          </div>
        )}

        {nearLabel && !open && (
          <button type="button" className="yv-act" onClick={() => interact()}>
            {nearLabel} <kbd>Space</kbd>
          </button>
        )}

        <nav className="yv-hud" aria-label="마을 빠른 이동">
          {CAMPS.map((c) => {
            const b = BUILDINGS.find((x) => x.key === c.key);
            return (
              <button type="button" key={c.key} onClick={() => walkTo(door(b))} title={`${c.place}(으)로 걸어가기`}>
                <b>{c.no}</b>{c.place}
              </button>
            );
          })}
          <a className="yv-skip" href="#overview">목록으로 보기 ↓</a>
        </nav>
      </div>

      {agent && (
        <div className="ym-modal" role="dialog" aria-modal="true" aria-label={`${agent.name} 장수 카드`} onClick={() => setOpen(null)}>
          <div className="ym-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ym-close" onClick={() => setOpen(null)} aria-label="닫기">×</button>
            <img src={`/agents/${open.id}.png`} alt={`${agent.name} 페이퍼크래프트 피규어`} />
            <div>
              <span className="ym-place">{agent.emoji} {agent.role}</span>
              <h3>{agent.name} <small>자 {agent.style}</small></h3>
              <p className="yv-quote">“{agent.greet}”</p>
              <p>{agent.desc}</p>
              <dl>
                <div><dt>에이전트 id</dt><dd className="mono">{open.id}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {camp && (
        <div className="ym-modal" role="dialog" aria-modal="true" aria-label={camp.place} onClick={() => setOpen(null)}>
          <div className="ym-sheet yv-place-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ym-close" onClick={() => setOpen(null)} aria-label="닫기">×</button>
            <div>
              <span className="ym-place">{camp.no} · {camp.place}</span>
              <h3>{camp.title}</h3>
              <p>{camp.body}</p>
              {camp.agents.length > 0 && (
                <div className="yv-crew">
                  {camp.agents.map((id) => (
                    <button type="button" key={id} onClick={() => setOpen({ kind: 'agent', id })}>
                      <img src={`/agents/${id}.png`} alt="" />
                      <span>{AGENTS[id].name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="ym-actions">
                {camp.link.href.startsWith('/')
                  ? <Link className="ym-link" href={camp.link.href}>{camp.link.label} <b aria-hidden="true">→</b></Link>
                  : <a className="ym-link" href={camp.link.href} onClick={() => setOpen(null)}>{camp.link.label} <b aria-hidden="true">→</b></a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
