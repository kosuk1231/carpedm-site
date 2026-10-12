'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AGENTS, CAMPS } from '../data/agents';
import VillageCards from './VillageCards';
import {
  NX, NY, SPEED, DOOR_R, BUILDINGS, door, PIECES, START, PLAZA, blocked, findPath,
} from '../data/villageMap';
import { rand } from './village3d/kit';

// CARPEDM 캠퍼스 3D: 도심 큰길 셔틀 정류장에서 내려 보도에서 바로 캠퍼스로 걸어 들어갑니다.
// 지형·건물·사람은 모두 코드로 빚었습니다. 카메라는 걷는 사람 뒤를 따라가며(끌어서 둘러보기, 휠로 거리 조절),
// 팀원(사람·로봇)은 다가오면 몸을 돌려 맞이하고, 캠퍼스 사람들은 제 볼일을 보러 오갑니다.

const EL_MIN = 0.1, EL_MAX = 1.2, EL_DEFAULT = 0.34;
const DIST_MIN = 4.5, DIST_MAX = 60, DIST_DEFAULT = 11;
const HEAD_H = 2.25;
const SIGN_RANGE = 50, NAME_RANGE = 14;
const BUBBLE_R = 3.2; // 팀원 곁 이 거리 안에 들어서면 메뉴 소개 말풍선

const angleLerp = (a, b, k) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
};
// 정해진 속도(라디안) 이상으로는 돌지 않게 몸을 돌림
const turnToward = (a, b, maxStep) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + Math.max(-maxStep, Math.min(maxStep, d * Math.min(1, maxStep * 3)));
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
  const [title, setTitle] = useState(null);
  const openRef = useRef(null);
  openRef.current = open;
  const nearRef = useRef(null);
  nearRef.current = near;

  // 배경음악: 'Apple Cider' — Zane Little Music (CC0, opengameart.org/content/apple-cider)
  // 브라우저는 소리 자동 재생을 막으므로, 캠퍼스에서 처음 걷거나 누를 때 작게 시작해 천천히 키웁니다.
  const audioRef = useRef(null);
  const [music, setMusic] = useState(true);
  const musicRef = useRef(true);
  musicRef.current = music;
  const fadeRef = useRef(0);
  const fadeTo = useCallback((target, ms = 1200) => {
    const a = audioRef.current; if (!a) return;
    cancelAnimationFrame(fadeRef.current);
    const from = a.volume, t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = from + (target - from) * k;
      if (k < 1) fadeRef.current = requestAnimationFrame(step);
      else if (target === 0) a.pause();
    };
    step();
  }, []);
  const startMusic = useCallback(() => {
    const a = audioRef.current;
    if (!a || !musicRef.current || !activeRef.current || !a.paused) return;
    a.volume = 0;
    a.play().then(() => fadeTo(0.32, 2500)).catch(() => {});
  }, [fadeTo]);
  useEffect(() => {
    try { if (localStorage.getItem('carpedm-bgm') === 'off') setMusic(false); } catch {}
    const stage = stageRef.current;
    const onGesture = () => startMusic();
    stage?.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    // 캠퍼스가 화면에서 벗어나거나 탭을 숨기면 소리를 줄여 멈춤
    const io = new IntersectionObserver(([e]) => { const a = audioRef.current; if (!a) return; if (!e.isIntersecting && !a.paused) fadeTo(0, 600); }, { threshold: 0 });
    if (stage) io.observe(stage);
    const onVis = () => { if (document.hidden && audioRef.current && !audioRef.current.paused) fadeTo(0, 300); };
    document.addEventListener('visibilitychange', onVis);
    return () => { stage?.removeEventListener('pointerdown', onGesture); window.removeEventListener('keydown', onGesture); io.disconnect(); document.removeEventListener('visibilitychange', onVis); cancelAnimationFrame(fadeRef.current); };
  }, [startMusic, fadeTo]);
  const toggleMusic = () => {
    const next = !music;
    setMusic(next); musicRef.current = next;
    try { localStorage.setItem('carpedm-bgm', next ? 'on' : 'off'); } catch {}
    const a = audioRef.current; if (!a) return;
    if (next) { a.volume = 0; a.play().then(() => fadeTo(0.32, 1500)).catch(() => {}); } else fadeTo(0, 500);
  };

  // 팀원을 누르거나 곁에서 Space: 그 팀원이 맡은 사이트 메뉴로 이동
  const goMenu = useCallback((id) => {
    const m = AGENTS[id]?.menu;
    if (!m) return;
    keys.current.clear(); target.current = null;
    if (m.href.startsWith('/')) { window.location.href = m.href; return; }
    const el = document.querySelector(m.href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', m.href);
      // 부드러운 스크롤이 막히면(무거운 3D 화면 등) 바로 이동
      setTimeout(() => { if (Math.abs(el.getBoundingClientRect().top) > 200 && window.scrollY < 50) el.scrollIntoView({ behavior: 'instant', block: 'start' }); }, 1200);
    }
    else window.location.hash = m.href;
  }, []);
  const interact = useCallback((n) => {
    const t = n || nearRef.current;
    if (!t) return;
    if (t.kind === 'agent') { goMenu(t.id); return; }
    setOpen(t); keys.current.clear(); target.current = null;
  }, [goMenu]);
  const walkTo = useCallback((pt) => { target.current = findPath(pos.current, pt); setHint(false); setOpen(null); }, []);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      let THREE, mod, post;
      try {
        THREE = await import('three');
        mod = await import('./village3d/world');
      } catch { onFail?.(); return; }
      // 성능이 낮을 법한 기기(터치·좁은 화면)는 후처리와 그림자 품질을 낮춥니다.
      const low = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 800;
      if (!low) {
        try {
          const [ec, rp, bp, sp, op, ao] = await Promise.all([
            import('three/addons/postprocessing/EffectComposer.js'),
            import('three/addons/postprocessing/RenderPass.js'),
            import('three/addons/postprocessing/UnrealBloomPass.js'),
            import('three/addons/postprocessing/ShaderPass.js'),
            import('three/addons/postprocessing/OutputPass.js'),
            import('three/addons/postprocessing/GTAOPass.js'),
          ]);
          post = { ...ec, ...rp, ...bp, ...sp, ...op, ...ao };
        } catch { post = null; }
      }
      if (disposed) return;
      const { buildWorld, toXZ, BASE_AZ, groundY } = mod;
      const host = hostRef.current, stage = stageRef.current;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      } catch { onFail?.(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.5 : 1.75));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      host.appendChild(renderer.domElement);

      const world = buildWorld(THREE, renderer, { low });
      const cam = new THREE.PerspectiveCamera(42, 1, 0.3, 600);
      // 카메라 방위 az: 바라보는 곳에서 카메라가 있는 쪽. 처음엔 남쪽(큰길)에서 캠퍼스를 바라봅니다.
      const view = { az: Math.PI / 2, el: EL_DEFAULT, dist: DIST_DEFAULT, intro: 0 };
      const [sx, sz] = toXZ(START.x, START.y);
      const camTarget = new THREE.Vector3(sx, 1.2, sz);
      const introFrom = new THREE.Vector3(0, 2, 8);
      const introStart = performance.now();
      let lastDrag = -1e9;
      let inside = false;
      setReady(true);

      // 후처리: 은은한 빛 번짐(등불·봉화) + 가장자리 어둡게 + 따뜻한 색감
      let composer = null;
      if (post) {
        composer = new post.EffectComposer(renderer);
        composer.addPass(new post.RenderPass(world.scene, cam));
        // 앰비언트 오클루전: 발밑·건물 모서리·나무 아래에 부드러운 접지 그늘
        if (post.GTAOPass) {
          const ao = new post.GTAOPass(world.scene, cam, host.clientWidth || 1024, host.clientHeight || 640);
          ao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1.2, scale: 1.0, samples: 12 });
          ao.blendIntensity = 0.85;
          composer.addPass(ao);
        }
        composer.addPass(new post.UnrealBloomPass(new THREE.Vector2(512, 512), 0.18, 0.4, 0.99));
        composer.addPass(new post.ShaderPass({
          uniforms: { tDiffuse: { value: null }, uAmount: { value: 0.55 } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: `uniform sampler2D tDiffuse; uniform float uAmount; varying vec2 vUv;
            void main(){
              vec4 c = texture2D(tDiffuse, vUv);
              float d = distance(vUv, vec2(0.5));
              float vig = smoothstep(0.78, 0.28, d);
              c.rgb *= mix(1.0 - uAmount * 0.6, 1.0, vig);
              c.rgb = mix(c.rgb, c.rgb * vec3(1.04, 1.0, 0.94), 0.6);
              gl_FragColor = c;
            }`,
        }));
        composer.addPass(new post.OutputPass());
      }

      // 팀원 상태(순찰하는 팀원은 길을 미리 구해 둡니다)
      const agents = PIECES.map((p, i) => {
        const st = { id: p.id, x: p.x, y: p.y, yaw: BASE_AZ, home: { x: p.x, y: p.y }, path: null, wait: 1 + Math.random() * 4, out: true, v: 0, maxV: 1.45 + rand(i + 40) * 0.45 };
        if (p.patrol) {
          const far = { x: p.patrol[0], y: p.patrol[1] };
          st.routeOut = findPath(st.home, far) || [];
          st.routeBack = findPath(far, st.home) || [];
        }
        return st;
      });
      // 사람들이 오가는 자리(캠퍼스 안 빈 땅에서 미리 골라 둠)
      const spots = [];
      for (let i = 0; spots.length < 70 && i < 4000; i++) {
        const pt = { x: 2 + rand(i * 2 + 101) * (NX - 4), y: 2 + rand(i * 2 + 102) * (NY - 4) };
        if (!blocked(pt.x, pt.y)) spots.push(pt);
      }
      const folk = world.folk.map((f, i) => {
        const sp = spots[(i * 5) % spots.length];
        return { person: f, x: sp.x, y: sp.y, yaw: rand(i) * 6, path: null, wait: rand(i + 3) * 4, v: 0, maxV: (f.flying ? 2.2 : 1.35) + rand(i + 60) * 0.5 };
      });

      const resize = () => {
        const w = host.clientWidth, h = host.clientHeight;
        renderer.setSize(w, h, false);
        composer?.setSize(w, h);
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
        if (raycaster.ray.intersectPlane(groundPlane, hit)) return { kind: 'ground', x: hit.x + NX / 2, y: hit.z + NY / 2 };
        return null;
      };

      // 끌기·누르기·휠
      let drag = null;
      const pointers = new Map();
      const onDown = (e) => {
        if (e.target.closest('button, a')) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        drag = { x: e.clientX, y: e.clientY, az: view.az, el: view.el, moved: false };
        lastDrag = performance.now();
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
          lastDrag = performance.now();
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
        target.current = findPath(pos.current, { x: THREE.MathUtils.clamp(hit.x, 1, NX - 1), y: THREE.MathUtils.clamp(hit.y, 1, NY + 3) });
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

      let last = performance.now(), yaw = Math.PI, visV = 0;
      const occRay = new THREE.Raycaster(); const occDir = new THREE.Vector3(); let occLift = 0;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      // 걷는 사람 한 걸음: 출발할 땐 서서히 빨라지고, 도착할 땐 천천히 멈추며, 크게 돌 땐 속도를 줄이고 몸을 먼저 돌림.
      // 앞에 다른 사람이 있으면 잠깐 비켜 서서 기다림. 반환값은 실제 이동 속도(초당 칸).
      const walkers = [...agents, ...folk, pos.current];
      const stepAgent = (st, dt, stop = false) => {
        const wp = st.path && st.path[0];
        let want = 0, hx = 0, hy = 0;
        if (wp && !stop) {
          const tx = wp.x - st.x, ty = wp.y - st.y;
          const d = Math.hypot(tx, ty);
          if (d < (st.path.length > 1 ? 0.35 : 0.06)) { st.path.shift(); if (!st.path.length) st.path = null; }
          if (d > 1e-4) {
            hx = tx / d; hy = ty / d;
            let rest = d;
            for (let k = 1; st.path && k < st.path.length && rest < 3; k++) rest += Math.hypot(st.path[k].x - st.path[k - 1].x, st.path[k].y - st.path[k - 1].y);
            const turn = Math.abs(Math.atan2(Math.sin(Math.atan2(hx, hy) - st.yaw), Math.cos(Math.atan2(hx, hy) - st.yaw)));
            want = Math.min(st.maxV, 0.25 + rest * 1.2) * Math.max(0.15, Math.cos(Math.min(turn, 1.45)));
            // 앞사람 양보
            for (const o of walkers) {
              if (o === st) continue;
              const ox = o.x - st.x, oy = o.y - st.y, od = Math.hypot(ox, oy);
              if (od < 1.1 && (ox * hx + oy * hy) / od > 0.55) { want = Math.min(want, Math.max(0, (od - 0.6) * 1.5)); }
            }
            st.yaw = turnToward(st.yaw, Math.atan2(hx, hy), dt * (want > 0.3 ? 4.5 : 7));
          }
        }
        st.v += THREE.MathUtils.clamp(want - st.v, -dt * 3.2, dt * 2.2);
        if (st.v < 0.01 && !want) st.v = 0;
        if (st.v && (hx || hy)) {
          const nx = st.x + hx * st.v * dt, ny = st.y + hy * st.v * dt;
          if (!blocked(nx, ny)) { st.x = nx; st.y = ny; } else st.v = 0;
        }
        return st.v;
      };

      const loop = () => {
        const now = performance.now();
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
          else if (target.current && !target.current.length) target.current = null;
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
        // 방문자 속도: 출발·멈춤을 부드럽게
        visV += THREE.MathUtils.clamp((len > 0 ? SPEED : 0) - visV, -dt * 16, dt * 10);
        if (len > 0) {
          // 다른 사람과 부딪히지 않게(몸을 통과하지 않음)
          for (const o of walkers) {
            if (o === pos.current) continue;
            const ox = o.x - pos.current.x, oy = o.y - pos.current.y, od = Math.hypot(ox, oy);
            if (od < 0.75 && (ox * dx + oy * dy) / (od * len) > 0.3) {
              const side = (ox * dy - oy * dx) > 0 ? -1 : 1; // 옆으로 비켜 감
              dx += -dy / len * side * 0.9; dy += dx / len * side * 0.9;
            }
          }
          const s = (visV * dt) / Math.hypot(dx, dy);
          const nx = pos.current.x + dx * s, ny = pos.current.y + dy * s;
          if (!blocked(nx, ny)) { pos.current.x = nx; pos.current.y = ny; moving = 1; }
          else if (!blocked(nx, pos.current.y)) { pos.current.x = nx; moving = 1; }
          else if (!blocked(pos.current.x, ny)) { pos.current.y = ny; moving = 1; }
          else target.current = null;
          yaw = angleLerp(yaw, Math.atan2(dx, dy), Math.min(1, dt * 10));
        } else visV = 0;
        const [PX, PZ] = toXZ(pos.current.x, pos.current.y);
        const PY = groundY(pos.current.x, pos.current.y);
        world.visitor.group.position.set(PX, PY, PZ);
        // 걷는 동안은 카메라가 천천히 등 뒤로 돌아옵니다(최근에 끌어서 돌렸으면 기다림).
        if (moving && now - lastDrag > 1800 && view.intro >= 1) view.az = angleLerp(view.az, Math.atan2(-Math.cos(yaw), -Math.sin(yaw)), Math.min(1, dt * 1.6));
        // 캠퍼스에 들어서면 제목을 띄웁니다.
        const nowInside = pos.current.y < NY - 0.6;
        if (nowInside !== inside) { inside = nowInside; setTitle(inside ? 'in' : 'out'); setTimeout(() => setTitle(null), 3600); }
        world.visitor.group.rotation.y = yaw;
        world.visitor.update(dt, moving ? visV : 0, t, cam);

        // 팀원들: 맡은 건물 둘레와 광장을 실제로 오가고, 방문자가 다가오면 멈춰 몸을 돌려 맞이함
        for (const st of agents) {
          const dist = Math.hypot(pos.current.x - st.x, pos.current.y - st.y);
          const greeting = dist < 3.2;
          if (!st.path && !greeting && (st.wait -= dt) <= 0) {
            if (st.routeOut) {
              st.path = findPath(st, st.out ? st.routeOut[st.routeOut.length - 1] || st.home : st.home);
              st.out = !st.out;
              st.wait = 3 + Math.random() * 4;
            } else {
              // 집에서 멀면 돌아가고, 아니면 가까운 곳이나 가끔 광장·이웃 건물까지 다녀옴
              const away = Math.hypot(st.x - st.home.x, st.y - st.home.y);
              let to = null;
              if (away > 4) to = st.home;
              else if (Math.random() < 0.18) to = Math.random() < 0.5 ? { x: PLAZA.x + (Math.random() - 0.5) * 4, y: PLAZA.y + (Math.random() - 0.5) * 4 } : door(BUILDINGS[1 + Math.floor(Math.random() * (BUILDINGS.length - 1))]);
              for (let k = 0; k < 14 && !to; k++) {
                const a = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 3.5;
                const c = { x: st.home.x + Math.cos(a) * r, y: st.home.y + Math.sin(a) * r };
                if (!blocked(c.x, c.y)) to = c;
              }
              st.path = to ? findPath(st, to) : null;
              st.wait = 2 + Math.random() * 5;
            }
          }
          const speed = stepAgent(st, dt, greeting);
          if (greeting) st.yaw = turnToward(st.yaw, Math.atan2(pos.current.x - st.x, pos.current.y - st.y), dt * 4);
          const person = world.people[st.id];
          const [ax, az] = toXZ(st.x, st.y);
          person.group.position.set(ax, groundY(st.x, st.y), az);
          person.group.rotation.y = st.yaw;
          person.update(dt, speed, t, cam);
        }
        for (const f of folk) {
          if (!f.path && (f.wait -= dt) <= 0) {
            const to = spots[Math.floor(Math.random() * spots.length)];
            f.path = findPath(f, to);
            f.wait = 1.5 + Math.random() * 6;
          }
          const speed = stepAgent(f, dt);
          const [fx, fz] = toXZ(f.x, f.y);
          f.person.group.position.set(fx, 0, fz);
          f.person.group.rotation.y = f.yaw;
          f.person.update(dt, speed, t, cam);
        }

        // 카메라: 처음에는 하늘에서 맴돌며 내려옵니다.
        // 카메라: 처음엔 골짜기 하늘에서 성 전체를 보다가, 걷는 사람 뒤로 내려옵니다.
        let el = view.el, dist = view.dist, az = view.az;
        if (view.intro < 1) {
          view.intro = Math.min(1, (now - introStart) / 6500);
          const e = easeIO(view.intro);
          camTarget.copy(introFrom).lerp(tmp.set(PX, PY + 1.2, PZ), e);
          el = THREE.MathUtils.lerp(0.62, view.el, e);
          dist = THREE.MathUtils.lerp(110, view.dist, e);
          az = view.az + (1 - e) * 0.7;
        } else {
          camTarget.lerp(tmp.set(PX, PY + 1.2, PZ), 1 - Math.pow(0.002, dt));
        }
        el = THREE.MathUtils.lerp(el, 1.1, occLift);
        if (cam.aspect < 1) dist *= Math.min(1.6, 0.75 / cam.aspect);
        cam.position.set(
          camTarget.x + dist * Math.cos(el) * Math.cos(az),
          camTarget.y + dist * Math.sin(el),
          camTarget.z + dist * Math.cos(el) * Math.sin(az),
        );
        cam.lookAt(camTarget);

        // 건물이 사람을 가리는지 살펴, 가리면 다음 프레임부터 카메라를 위로 들어 올려 내려다봄
        if (view.intro >= 1) {
          occRay.set(camTarget, occDir.subVectors(cam.position, camTarget).normalize());
          occRay.far = camTarget.distanceTo(cam.position);
          const hit = occRay.intersectObjects(world.occluders, true).length > 0;
          occLift = THREE.MathUtils.clamp(occLift + (hit ? dt * 2.5 : -dt * 0.8), 0, 1);
        }
        // 땅 속으로 카메라가 들어가지 않게
        const camGround = mod.heightAt(cam.position.x, cam.position.z) + 0.6;
        if (cam.position.y < camGround) { cam.position.y = camGround; cam.lookAt(camTarget); }

        world.focus(camTarget.x, camTarget.z);
        world.update(t, dt);
        if (composer) composer.render(); else renderer.render(world.scene, cam);

        // 이름표·간판·말풍선
        for (const st of agents) {
          const [ax, az2] = toXZ(st.x, st.y);
          const pr = project(ax, groundY(st.x, st.y) - 0.05, az2);
          if (Math.hypot(ax - PX, az2 - PZ) > NAME_RANGE) pr.hidden = true;
          placeLabel(labelRefs.current[`a-${st.id}`], pr);
        }
        for (const b of world.buildings) {
          const pr = project(b.X, b.height, b.Z);
          if (Math.hypot(b.X - PX, b.Z - PZ) > SIGN_RANGE) pr.hidden = true;
          if (!inside && b.key !== 'gate') pr.hidden = true; // 캠퍼스 밖(보도)에서는 웰컴 사인만
          placeLabel(labelRefs.current[`b-${b.key}`], pr);
        }
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
          if (d < BUBBLE_R && d < best) { best = d; found = { kind: 'agent', id: st.id }; }
        }
        for (const b of BUILDINGS) {
          const dr = door(b);
          const d = Math.hypot(pos.current.x - dr.x, pos.current.y - dr.y);
          if (d < DOOR_R && d < best) { best = d; found = { kind: 'place', id: b.key }; }
        }
        // 건물 입구에 서면 카메라가 입구 바깥쪽에서 건물을 바라보게 천천히 돎
        if (found?.kind === 'place' && now - lastDrag > 1800 && !moving) {
          const b = BUILDINGS.find((x) => x.key === found.id);
          const outAz = b.door ? Math.PI / 2 : 0;
          view.az = angleLerp(view.az, outAz + 0.35, Math.min(1, dt * 1.5));
        }
        if ((cur?.id || null) !== (found?.id || null)) setNear(found);
      };
      renderer.setAnimationLoop(loop);

      cleanup = () => {
        renderer.setAnimationLoop(null);
        composer?.dispose?.();
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
      ? `${AGENTS[near.id].emoji} ${AGENTS[near.id].menu.label}`
      : `${CAMPS.find((c) => c.key === near.id).place} 들어가기`
    : null;

  return (
    <section className="yv yv3" aria-label="CARPEDM 캠퍼스 — 걸어서 둘러보는 포트폴리오">
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
              <div className="yv3-bubble yv3-bubble-menu">
                <b>{AGENTS[near.id].name}</b>
                <span>{AGENTS[near.id].menu.pitch}</span>
                <button type="button" onClick={() => goMenu(near.id)}>{AGENTS[near.id].menu.label} →</button>
              </div>
            </div>
          )}
        </div>

        {!ready && (
          <div className="yv3-loading">
            <b>CARPEDM 캠퍼스로 가는 길…</b>
            <span>캠퍼스를 짓고 있습니다</span>
          </div>
        )}

        {title && (
          <div className={`yv3-title ${title === 'in' ? 'is-in' : ''}`} key={title}>
            {title === 'in' ? (<><b>CARPEDM</b><span>오늘을 붙잡는 팀, 캠퍼스에 오신 것을 환영합니다</span></>) : (<><b>CITY</b><span>도심 셔틀 정류장</span></>)}
          </div>
        )}

        {ready && hint && (
          <div className="yv-hint">
            <b>큰길에서 바로 CARPEDM 캠퍼스로 걸어 들어가 보세요</b>
            <span className="yv-hint-desk">W·방향키로 걷고, 끌어서 둘러보고, 휠로 거리 조절. 사람이나 건물 앞에서 Space</span>
            <span className="yv-hint-touch">가고 싶은 곳을 누르면 걸어가고, 끌면 둘러봅니다</span>
          </div>
        )}

        {nearLabel && !open && (
          <button type="button" className="yv-act" onClick={() => interact()}>
            {nearLabel} <kbd>Space</kbd>
          </button>
        )}

        <audio ref={audioRef} src="/audio/campus-bgm.mp3" loop preload="none" />
        <button type="button" className={`yv3-music ${music ? 'is-on' : ''}`} onClick={toggleMusic} aria-pressed={music} title="배경음악: Apple Cider — Zane Little Music (CC0)">
          {music ? '♪ 음악 켜짐' : '♪ 음악 꺼짐'}
        </button>

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
