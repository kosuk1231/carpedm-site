'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AGENTS, CAMPS } from '../data/agents';

// 융중 마을: 비스듬히 내려다보는(아이소메트릭) 2.5D 마을을 방문자 캐릭터로 걸어 다닙니다.
// 좌표는 바닥 격자(x, y) 단위로 계산하고, 화면에는 아이소메트릭으로 투영합니다.
// 이동: 방향키/WASD, 또는 바닥을 눌러 그 자리까지 걷기. 장수·건물 앞에서 Space/Enter 또는 버튼으로 상호작용.

const N = 22;            // 마을 한 변의 칸 수
const TW = 96;           // 칸 하나의 화면 가로
const TH = 48;           // 칸 하나의 화면 세로
const PAD = 260;         // 위쪽 여백(높은 건물이 잘리지 않도록)
const WORLD_W = N * TW;
const WORLD_H = N * TH + PAD + 120;
const SPEED = 4.2;       // 초당 이동 칸 수
const TALK_R = 1.5;      // 장수와 대화 가능한 거리
const DOOR_R = 1.4;      // 건물 입구 반경

const toScreen = (x, y) => ({ sx: (x - y) * (TW / 2) + WORLD_W / 2, sy: (x + y) * (TH / 2) + PAD });
const toWorld = (sx, sy) => {
  const a = (sx - WORLD_W / 2) / (TW / 2);
  const b = (sy - PAD) / (TH / 2);
  return { x: (a + b) / 2, y: (b - a) / 2 };
};

// 건물 위치와 색. key 는 CAMPS 의 key 와 같습니다. art 에 그림 경로를 넣으면 임시 도형 대신 그림을 씁니다.
const BUILDINGS = [
  { key: 'chorye',   x: 5.5,  y: 5.5,  roof: '#6E5A3A', wall: '#E9DCC0', art: null },
  { key: 'lecture',  x: 4.5,  y: 14.5, roof: '#A0743A', wall: '#F0E2C4', art: null },
  { key: 'workshop', x: 14.5, y: 4.5,  roof: '#5D6B70', wall: '#E4DACB', art: null },
  { key: 'library',  x: 16.5, y: 12.5, roof: '#3F6650', wall: '#EFE3C8', art: null },
  { key: 'gate',     x: 10.5, y: 18,   roof: '#4A4A4F', wall: '#DCCDB0', art: null },
  { key: 'beacon',   x: 18.5, y: 18.5, roof: '#A23B26', wall: '#E8D6B5', art: null },
];
const B_R = 1.55; // 건물이 차지하는 반경(충돌)
const door = (b) => ({ x: b.x + 2.15, y: b.y + 2.15 });

// 장수 위치. 맡은 일과 맞는 건물 곁에 세웁니다.
const PIECES = [
  { id: 'main',       x: 9.2,  y: 8.6 },
  { id: 'trainer',    x: 7.6,  y: 13.4 },
  { id: 'researcher', x: 7.0,  y: 17.4 },
  { id: 'developer',  x: 17.6, y: 4.6 },
  { id: 'critic',     x: 14.2, y: 7.8 },
  { id: 'writer',     x: 14.0, y: 12.2 },
  { id: 'editor',     x: 19.8, y: 12.6 },
  { id: 'minutes',    x: 16.2, y: 16.0 },
  { id: 'brief',      x: 13.6, y: 18.6 },
  { id: 'local',      x: 8.2,  y: 19.4 },
];
const P_R = 0.45;

const TREES = [
  [1.5, 2], [2.5, 9.5], [1.6, 12], [3, 19.5], [1.8, 20.5], [9.5, 1.5], [11.5, 2.5], [19.5, 1.8], [20.5, 7.5],
  [20.6, 9.6], [12.5, 9.8], [9.8, 13.6], [20.5, 15.5], [14.5, 20.6], [6.5, 20.8], [3.2, 3.2], [7.5, 2.2], [17.5, 8.8],
];
const T_R = 0.5;

const START = { x: 11, y: 11.5 };
const PLAZA = { x: 11, y: 11 };

function Building({ b }) {
  const { sx, sy } = toScreen(b.x, b.y);
  if (b.art) {
    return (
      <div className="yv-obj yv-building" style={{ left: sx, top: sy, zIndex: Math.round((b.x + b.y) * 10) }}>
        <img className="yv-building-art" src={b.art} alt="" />
      </div>
    );
  }
  // 임시 도형: 3×3칸 바닥 위 벽 + 지붕
  const W = 3 * TW, D = 3 * TH, WL = 70, R = 84;
  const g = R + WL; // 바닥 마름모 꼭대기의 y
  const pts = (arr) => arr.map((p) => p.join(',')).join(' ');
  return (
    <div className="yv-obj yv-building" style={{ left: sx, top: sy, zIndex: Math.round((b.x + b.y) * 10) }}>
      <svg width={W} height={g + D} viewBox={`0 0 ${W} ${g + D}`} style={{ marginLeft: -W / 2, marginTop: -(g + D / 2) }} aria-hidden="true">
        <polygon points={pts([[0, g + D / 2], [W / 2, g + D], [W / 2, R + D], [0, R + D / 2]])} fill={b.wall} stroke="#5B4630" strokeWidth="1.5" />
        <polygon points={pts([[W / 2, g + D], [W, g + D / 2], [W, R + D / 2], [W / 2, R + D]])} fill={b.wall} stroke="#5B4630" strokeWidth="1.5" style={{ filter: 'brightness(.86)' }} />
        <polygon points={pts([[W / 2 + 0.35 * W / 2, g + D - 0.35 * D / 2], [W / 2 + 0.55 * W / 2, g + D - 0.55 * D / 2], [W / 2 + 0.55 * W / 2, g + D - 0.55 * D / 2 - 48], [W / 2 + 0.35 * W / 2, g + D - 0.35 * D / 2 - 48]])} fill="#4A3524" />
        <polygon points={pts([[-10, R + D / 2], [W / 2, R + D + 10], [W / 2, R + D / 2 - R]])} fill={b.roof} stroke="#3A2A1A" strokeWidth="1.5" />
        <polygon points={pts([[W / 2, R + D + 10], [W + 10, R + D / 2], [W / 2, R + D / 2 - R]])} fill={b.roof} stroke="#3A2A1A" strokeWidth="1.5" style={{ filter: 'brightness(.8)' }} />
      </svg>
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

  const blocked = useCallback((x, y) => {
    if (x < 0.8 || y < 0.8 || x > N - 0.8 || y > N - 0.8) return true;
    for (const b of BUILDINGS) if (Math.hypot(x - b.x, y - b.y) < B_R) return true;
    for (const p of PIECES) if (Math.hypot(x - p.x, y - p.y) < P_R) return true;
    for (const [tx, ty] of TREES) if (Math.hypot(x - tx, y - ty) < T_R) return true;
    return false;
  }, []);

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
          const tx = target.current.x - pos.current.x, ty = target.current.y - pos.current.y;
          const d = Math.hypot(tx, ty);
          if (d < 0.08) target.current = null;
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
  }, [blocked, paint]);

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
    target.current = { x: Math.max(1, Math.min(N - 1, w.x)), y: Math.max(1, Math.min(N - 1, w.y)) };
    setHint(false);
  };

  const walkTo = (pt) => { target.current = { ...pt }; setHint(false); setOpen(null); };

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
  const corner = (x, y) => { const s = toScreen(x, y); return `${s.sx},${s.sy}`; };

  return (
    <section className="yv" aria-label="융중 마을 — 걸어서 둘러보는 포트폴리오">
      <div className="yv-stage" ref={stageRef} onPointerDown={onGround}>
        <div className="yv-world" ref={worldRef} style={{ width: WORLD_W, height: WORLD_H }}>
          <svg className="yv-ground" width={WORLD_W} height={WORLD_H} aria-hidden="true">
            <defs>
              <pattern id="yv-grain" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
                <rect width="9" height="9" fill="#D7BF97" />
                <rect width="2" height="9" fill="#CFB68B" />
              </pattern>
            </defs>
            <polygon points={`${corner(0, 0)} ${corner(N, 0)} ${corner(N, N)} ${corner(0, N)}`} fill="url(#yv-grain)" stroke="#8C6A42" strokeWidth="3" />
            {roads.map((d, i) => <path key={i} d={d} className="yv-road" />)}
            <ellipse cx={toScreen(PLAZA.x, PLAZA.y).sx} cy={toScreen(PLAZA.x, PLAZA.y).sy} rx="150" ry="75" className="yv-plaza" />
          </svg>

          {BUILDINGS.map((b) => <Building key={b.key} b={b} />)}

          {BUILDINGS.map((b) => {
            const c = CAMPS.find((x) => x.key === b.key);
            const { sx, sy } = toScreen(b.x, b.y);
            return <span key={b.key} className="yv-sign" style={{ left: sx, top: sy - 175, zIndex: Math.round((b.x + b.y) * 10) + 5 }}>{c.no} {c.place}</span>;
          })}

          {TREES.map(([x, y]) => {
            const { sx, sy } = toScreen(x, y);
            return (
              <div key={`${x}-${y}`} className="yv-obj yv-tree" style={{ left: sx, top: sy, zIndex: Math.round((x + y) * 10) }} aria-hidden="true">
                <i /><b />
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
            <div className="yv-player-body"><span>나</span></div>
          </div>
        </div>

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
                <div><dt>쓰는 모델</dt><dd>{agent.model}</dd></div>
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
