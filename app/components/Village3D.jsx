'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AGENTS, CAMPS } from '../data/agents';
import VillageCards from './VillageCards';
import {
  N, SPEED, TALK_R, DOOR_R, BUILDINGS, door, PIECES, START, blocked, findPath,
} from '../data/villageMap';

// 융중 마을 3D: 구름 바다 위에 뜬 섬. 건물·사람·나무를 모두 코드로 빚고 툰 음영으로 칠합니다.
// 방문자는 걸어 다니고, 장수들은 다가오면 몸을 돌려 맞이하며, 사신과 수문장은 제 길을 오갑니다.
// 카메라: 끌어서 360도 돌리기(Q·E 키도 됨), 휠·두 손가락으로 가까이 보기.

const EL_MIN = 0.32, EL_MAX = 1.15, EL_DEFAULT = 0.62;
const DIST_MIN = 9, DIST_MAX = 40, DIST_DEFAULT = 24;
const HEAD_H = 2.25;

const angleLerp = (a, b, k) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
};

export default function Village3D({ onFail }) {
  const stageRef = useRef(null);
  const hostRef = useRef(null);
  const labelRefs = useRef({});
  const bubbleRef = useRef(null);
  const pos = useRef({ ...START });
  const keys = useRef(new Set());
  const target = useRef(null);
  const activeRef = useRef(false);
  const [near, setNear] = useState(null);
  const [open, setOpen] = useState(null);
  const [hint, setHint] = useState(true);
  const [ready, setReady] = useState(false);
  const openRef = useRef(null);
  openRef.current = open;
  const nearRef = useRef(null);
  nearRef.current = near;

  const interact = useCallback((n) => {
    const t = n || nearRef.current;
    if (t) { setOpen(t); keys.current.clear(); target.current = null; }
  }, []);
  const walkTo = useCallback((pt) => { target.current = findPath(pos.current, pt); setHint(false); setOpen(null); }, []);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      let THREE, mod;
      try {
        THREE = await import('three');
        mod = await import('./village3d/world');
      } catch { onFail?.(); return; }
      if (disposed) return;
      const { buildWorld, toXZ, BASE_AZ } = mod;
      const host = hostRef.current, stage = stageRef.current;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      } catch { onFail?.(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      host.appendChild(renderer.domElement);

      const world = buildWorld(THREE, renderer);
      const cam = new THREE.PerspectiveCamera(32, 1, 0.5, 400);
      const view = { az: BASE_AZ, el: EL_DEFAULT, dist: DIST_DEFAULT, intro: 0 };
      const [sx, sz] = toXZ(START.x, START.y);
      const camTarget = new THREE.Vector3(sx, 0.9, sz);
      const introStart = performance.now();
      setReady(true);

      // 장수 상태(순찰하는 장수는 길을 미리 구해 둡니다)
      const agents = PIECES.map((p) => {
        const st = { id: p.id, x: p.x, y: p.y, yaw: BASE_AZ, home: { x: p.x, y: p.y }, path: null, wait: 2 + Math.random() * 3, out: true };
        if (p.patrol) {
          const far = { x: p.patrol[0], y: p.patrol[1] };
          st.routeOut = findPath(st.home, far) || [];
          st.routeBack = findPath(far, st.home) || [];
        }
        return st;
      });

      const resize = () => {
        const w = host.clientWidth, h = host.clientHeight;
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; activeRef.current = e.intersectionRatio > 0.6; }, { threshold: [0, 0.6, 1] });
      io.observe(stage);

      const tmp = new THREE.Vector3();
      const project = (x, y, z) => {
        tmp.set(x, y, z).project(cam);
        return { x: (tmp.x + 1) / 2 * host.clientWidth, y: (1 - tmp.y) / 2 * host.clientHeight, hidden: tmp.z > 1 };
      };
      const placeLabel = (el, p) => {
        if (!el) return;
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        el.style.visibility = p.hidden ? 'hidden' : 'visible';
      };

      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const pickAt = (clientX, clientY) => {
        const r = host.getBoundingClientRect();
        ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, cam);
        const hits = raycaster.intersectObjects(world.pickables, true);
        for (const h of hits) if (h.object.userData.pick) return h.object.userData.pick;
        const hit = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(groundPlane, hit)) return { kind: 'ground', x: hit.x + N / 2, y: hit.z + N / 2 };
        return null;
      };

      // 끌기·누르기·휠
      let drag = null;
      const pointers = new Map();
      const onDown = (e) => {
        if (e.target.closest('button, a')) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        drag = { x: e.clientX, y: e.clientY, az: view.az, el: view.el, moved: false };
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          drag.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: view.dist };
        }
        view.intro = 1;
      };
      const onMove = (e) => {
        if (!drag || !pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2 && drag.pinch) {
          const [a, b] = [...pointers.values()];
          view.dist = THREE.MathUtils.clamp(drag.pinch.dist * (drag.pinch.d / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y))), DIST_MIN, DIST_MAX);
          drag.moved = true;
          return;
        }
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 6) drag.moved = true;
        if (drag.moved) {
          view.az = drag.az - dx * 0.005;
          view.el = THREE.MathUtils.clamp(drag.el + dy * 0.003, EL_MIN, EL_MAX);
        }
      };
      const onUp = (e) => {
        const wasDrag = drag && drag.moved;
        pointers.delete(e.pointerId);
        if (pointers.size) return;
        drag = null;
        if (wasDrag || e.target.closest('button, a')) return;
        const hit = pickAt(e.clientX, e.clientY);
        if (!hit) return;
        setHint(false);
        if (hit.kind === 'agent') { interact({ kind: 'agent', id: hit.id }); return; }
        if (hit.kind === 'place') { target.current = findPath(pos.current, door(BUILDINGS.find((b) => b.key === hit.id))); return; }
        target.current = findPath(pos.current, { x: THREE.MathUtils.clamp(hit.x, 1, N - 1), y: THREE.MathUtils.clamp(hit.y, 1, N - 1) });
      };
      const onWheel = (e) => {
        if (!activeRef.current) return;
        e.preventDefault();
        view.dist = THREE.MathUtils.clamp(view.dist * (1 + Math.sign(e.deltaY) * 0.08), DIST_MIN, DIST_MAX);
        view.intro = 1;
      };
      stage.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      stage.addEventListener('wheel', onWheel, { passive: false });

      const keyMap = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', KeyQ: 'rotl', KeyE: 'rotr' };
      const kd = (e) => {
        if (e.key === 'Escape') { setOpen(null); return; }
        if (!activeRef.current || openRef.current) return;
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (keyMap[e.code]) { keys.current.add(keyMap[e.code]); setHint(false); view.intro = 1; e.preventDefault(); }
        else if ((e.code === 'Space' || e.code === 'Enter') && nearRef.current && tag !== 'BUTTON' && tag !== 'A') { e.preventDefault(); interact(); }
      };
      const ku = (e) => { if (keyMap[e.code]) keys.current.delete(keyMap[e.code]); };
      const blur = () => keys.current.clear();
      window.addEventListener('keydown', kd);
      window.addEventListener('keyup', ku);
      window.addEventListener('blur', blur);

      let raf = 0, last = performance.now(), yaw = BASE_AZ;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const stepAgent = (st, dt) => {
        // 순찰 경로를 따라 한 걸음
        const wp = st.path[0];
        const tx = wp.x - st.x, ty = wp.y - st.y;
        const d = Math.hypot(tx, ty);
        if (d < 0.1) { st.path.shift(); return 0.55; }
        const s = Math.min(d, SPEED * 0.4 * dt);
        st.x += (tx / d) * s; st.y += (ty / d) * s;
        st.yaw = angleLerp(st.yaw, Math.atan2(tx, ty), Math.min(1, dt * 8));
        return 0.55;
      };

      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!visible || document.hidden) return;
        const t = now / 1000;

        if (keys.current.has('rotl')) view.az -= dt * 1.6;
        if (keys.current.has('rotr')) view.az += dt * 1.6;

        // 방문자 이동(카메라 기준 방향)
        const up = { x: -Math.cos(view.az), y: -Math.sin(view.az) };
        const right = { x: -up.y, y: up.x };
        let dx = 0, dy = 0;
        const k = keys.current;
        if (!openRef.current) {
          if (k.has('up'))    { dx += up.x; dy += up.y; }
          if (k.has('down'))  { dx -= up.x; dy -= up.y; }
          if (k.has('right')) { dx += right.x; dy += right.y; }
          if (k.has('left'))  { dx -= right.x; dy -= right.y; }
          if (dx || dy) target.current = null;
          else if (target.current) {
            const wp = target.current[0];
            const tx = wp.x - pos.current.x, ty = wp.y - pos.current.y;
            const d = Math.hypot(tx, ty);
            if (d < 0.12) { target.current.shift(); if (!target.current.length) target.current = null; }
            else { dx = tx / d; dy = ty / d; }
          }
        }
        const len = Math.hypot(dx, dy);
        let moving = 0;
        if (len > 0) {
          const s = (SPEED * dt) / len;
          const nx = pos.current.x + dx * s, ny = pos.current.y + dy * s;
          if (!blocked(nx, ny)) { pos.current.x = nx; pos.current.y = ny; moving = 1; }
          else if (!blocked(nx, pos.current.y)) { pos.current.x = nx; moving = 1; }
          else if (!blocked(pos.current.x, ny)) { pos.current.y = ny; moving = 1; }
          else target.current = null;
          yaw = angleLerp(yaw, Math.atan2(dx, dy), Math.min(1, dt * 10));
        }
        const [PX, PZ] = toXZ(pos.current.x, pos.current.y);
        world.visitor.group.position.set(PX, 0, PZ);
        world.visitor.group.rotation.y = yaw;
        world.visitor.update(dt, moving, t);

        // 장수들: 순찰하거나, 방문자가 오면 몸을 돌려 맞이함
        for (const st of agents) {
          const dist = Math.hypot(pos.current.x - st.x, pos.current.y - st.y);
          const greeting = dist < 3.2;
          let speed = 0;
          if (st.routeOut && !greeting) {
            if (st.path && st.path.length) speed = stepAgent(st, dt);
            else if ((st.wait -= dt) <= 0) {
              st.path = (st.out ? st.routeOut : st.routeBack).map((p) => ({ ...p }));
              st.out = !st.out;
              st.wait = 3 + Math.random() * 3;
            }
          }
          if (greeting) st.yaw = angleLerp(st.yaw, Math.atan2(pos.current.x - st.x, pos.current.y - st.y), Math.min(1, dt * 5));
          else if (!speed && !st.routeOut) st.yaw = angleLerp(st.yaw, BASE_AZ, Math.min(1, dt * 2));
          const person = world.people[st.id];
          const [ax, az] = toXZ(st.x, st.y);
          person.group.position.set(ax, 0, az);
          person.group.rotation.y = st.yaw;
          person.update(dt, speed, t);
        }

        // 카메라: 처음에는 하늘에서 맴돌며 내려옵니다.
        camTarget.lerp(tmp.set(PX, 0.9, PZ), 1 - Math.pow(0.002, dt));
        let el = view.el, dist = view.dist, az = view.az;
        if (view.intro < 1) {
          view.intro = Math.min(1, (now - introStart) / 4600);
          const e = ease(view.intro);
          el = THREE.MathUtils.lerp(1.3, view.el, e);
          dist = THREE.MathUtils.lerp(95, view.dist, e);
          az = view.az - (1 - e) * 0.9;
        }
        if (cam.aspect < 1) dist *= Math.min(1.6, 0.75 / cam.aspect);
        cam.position.set(
          camTarget.x + dist * Math.cos(el) * Math.cos(az),
          camTarget.y + dist * Math.sin(el),
          camTarget.z + dist * Math.cos(el) * Math.sin(az),
        );
        cam.lookAt(camTarget);

        world.update(t, dt);
        renderer.render(world.scene, cam);

        // 이름표·간판·말풍선
        for (const st of agents) {
          const [ax, az2] = toXZ(st.x, st.y);
          placeLabel(labelRefs.current[`a-${st.id}`], project(ax, -0.05, az2));
        }
        for (const b of world.buildings) placeLabel(labelRefs.current[`b-${b.key}`], project(b.X, b.height, b.Z));
        const cur = nearRef.current;
        if (cur?.kind === 'agent' && bubbleRef.current) {
          const st = agents.find((a) => a.id === cur.id);
          const [ax, az2] = toXZ(st.x, st.y);
          placeLabel(bubbleRef.current, project(ax, HEAD_H, az2));
        }

        // 가까운 대상
        let found = null, best = Infinity;
        for (const st of agents) {
          const d = Math.hypot(pos.current.x - st.x, pos.current.y - st.y);
          if (d < TALK_R && d < best) { best = d; found = { kind: 'agent', id: st.id }; }
        }
        for (const b of BUILDINGS) {
          const dr = door(b);
          const d = Math.hypot(pos.current.x - dr.x, pos.current.y - dr.y);
          if (d < DOOR_R && d < best) { best = d; found = { kind: 'place', id: b.key }; }
        }
        if ((cur?.id || null) !== (found?.id || null)) setNear(found);
      };
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect(); io.disconnect();
        stage.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        stage.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', kd);
        window.removeEventListener('keyup', ku);
        window.removeEventListener('blur', blur);
        world.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();
    return () => { disposed = true; cleanup(); };
  }, [interact, onFail]);

  const nearLabel = near
    ? near.kind === 'agent'
      ? `${AGENTS[near.id].emoji} ${AGENTS[near.id].name}에게 말 걸기`
      : `${CAMPS.find((c) => c.key === near.id).place} 들어가기`
    : null;

  return (
    <section className="yv yv3" aria-label="융중 마을 — 3D로 걸어서 둘러보는 포트폴리오">
      <div className="yv-stage yv3-stage" ref={stageRef}>
        <div className="yv3-canvas" ref={hostRef} />

        <div className="yv3-labels" aria-hidden="true">
          {BUILDINGS.map((b) => {
            const c = CAMPS.find((x) => x.key === b.key);
            return (
              <div key={b.key} className="yv3-pin" ref={(el) => { labelRefs.current[`b-${b.key}`] = el; }}>
                <span className="yv3-sign">{c.no} {c.place}</span>
              </div>
            );
          })}
          {PIECES.map((p) => (
            <div key={p.id} className="yv3-pin" ref={(el) => { labelRefs.current[`a-${p.id}`] = el; }}>
              <span className="yv3-name">{AGENTS[p.id].emoji} {AGENTS[p.id].name}</span>
            </div>
          ))}
          {near?.kind === 'agent' && (
            <div className="yv3-pin" ref={bubbleRef}>
              <div className="yv3-bubble">{AGENTS[near.id].greet}</div>
            </div>
          )}
        </div>

        {!ready && (
          <div className="yv3-loading">
            <b>융중으로 들어가는 중…</b>
            <span>구름 위의 마을을 짓고 있습니다</span>
          </div>
        )}

        {ready && hint && (
          <div className="yv-hint">
            <b>융중 마을에 오신 것을 환영합니다</b>
            <span className="yv-hint-desk">방향키·WASD로 걷고, 끌어서 둘러보고(Q·E 회전), 휠로 가까이. 장수나 건물 앞에서 Space</span>
            <span className="yv-hint-touch">바닥을 누르면 걸어가고, 끌면 둘러봅니다</span>
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

      <VillageCards open={open} setOpen={setOpen} />
    </section>
  );
}
