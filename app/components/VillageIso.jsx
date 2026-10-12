'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AGENTS, CAMPS } from '../data/agents';
import VillageCards from './VillageCards';
import { CloudSea, Drift, Flora, Ground, Sky } from './villageScenery';
import {
  N, SPEED, TALK_R, DOOR_R, BUILDINGS, door, PIECES, DECOR, PONDS, STREAMS, START, PLAZA, blocked, findPath,
} from '../data/villageMap';

// 융중 마을: 비스듬히 내려다보는(아이소메트릭) 2.5D 마을을 방문자 캐릭터로 걸어 다닙니다.
// 좌표는 바닥 격자(x, y) 단위로 계산하고, 화면에는 아이소메트릭으로 투영합니다.
// 이동: 방향키/WASD, 또는 바닥을 눌러 그 자리까지 걷기. 장수·건물 앞에서 Space/Enter 또는 버튼으로 상호작용.

const TW = 96;           // 칸 하나의 화면 가로
const TH = 48;           // 칸 하나의 화면 세로
const PAD = 420;         // 위쪽 여백(뒤쪽 산과 높은 건물이 잘리지 않도록)
const MX = 420;          // 좌우 여백(산과 구름 바다)
const WORLD_W = N * TW + MX * 2;
const WORLD_H = N * TH + PAD + 360;

const toScreen = (x, y) => ({ sx: (x - y) * (TW / 2) + WORLD_W / 2, sy: (x + y) * (TH / 2) + PAD });
const toWorld = (sx, sy) => {
  const a = (sx - WORLD_W / 2) / (TW / 2);
  const b = (sy - PAD) / (TH / 2);
  return { x: (a + b) / 2, y: (b - a) / 2 };
};

function Building({ b }) {
  const { sx, sy } = toScreen(b.x, b.y);
  return (
    <div className="yv-obj yv-building" style={{ left: sx, top: sy, zIndex: Math.round((b.x + b.y) * 10) }}>
      <img className="yv-building-art" src={`/village/${b.key}.png`} alt="" draggable="false" />
    </div>
  );
}

export default function VillageIso({ onSwitch }) {
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
          {onSwitch && <button type="button" className="yv-mode" onClick={onSwitch}>3D로 보기</button>}
          <a className="yv-skip" href="#overview">목록으로 보기 ↓</a>
        </nav>
      </div>

      <VillageCards open={open} setOpen={setOpen} />
    </section>
  );
}
