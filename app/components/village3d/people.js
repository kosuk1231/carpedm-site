// 코드로 빚은 CARPEDM 캠퍼스 사람들과 로봇. 카드 그림(클레이 피규어)과 같은 인상을 내도록
// 2.5등신 비율(큰 머리, 작은 몸), 큰 눈과 볼터치, 부드러운 클레이 재질로 만듭니다.
// 모든 인물은 몸 앞이 +Z 방향입니다. update(dt, speed, t) 의 speed 는 0~1.

const BROWN = '#5A3A28';
export const PEOPLE = {
  main:       { shirt: '#F4EFE6', jacket: '#2F3E5C', pants: '#D9C8AA', hair: 'long-wavy', hairColor: BROWN, item: 'tablet', lanyard: true },
  ceo:        { shirt: '#F7F4EC', pants: '#CDB892', hair: 'short', hairColor: '#1F1A17', item: 'coffee', glasses: true },
  critic:     { shirt: '#22262A', pants: '#D9C8AA', hair: 'bob', hairColor: BROWN, item: 'tablet', glasses: true },
  writer:     { shirt: '#F1E6D6', jacket: '#B5654A', pants: '#D9C8AA', hair: 'long', hairColor: BROWN, item: 'notebook' },
  trainer:    { shirt: '#F7F4EC', jacket: '#2E5E52', pants: '#D9C8AA', hair: 'bun', hairColor: BROWN, item: 'point' },
  brief:      { shirt: '#E9B54E', pants: '#D9C8AA', hair: 'short', hairColor: BROWN, item: 'envelope', lanyard: true },
  developer:  { robot: 'builder' },
  researcher: { robot: 'drone' },
  editor:     { robot: 'wheel' },
  minutes:    { robot: 'printer' },
  local:      { robot: 'guard' },
  visitor:    { shirt: '#F5F2EA', pants: '#8A9AA8', hair: 'short', hairColor: '#1F1A17', item: 'none', backpack: true },
};

// 이름 없는 캠퍼스 사람들: 직원, 수강생, 배달 라이더, 아이, 배송 드론, 안내 로봇
export const TOWNSFOLK = [
  { shirt: '#5E7A94', pants: '#3A3F44', hair: 'short', item: 'laptop' },
  { shirt: '#E9D7C0', pants: '#5D6E5A', hair: 'long', hairColor: '#3A2A20', item: 'coffee' },
  { shirt: '#C8402E', pants: '#3A3F44', hair: 'short', helmet: true, item: 'box' },
  { shirt: '#7FA862', pants: '#4A4E5A', hair: 'bob', hairColor: '#3A2A20', item: 'none', scale: 0.72 },
  { shirt: '#F4F1EA', jacket: '#3A3F44', pants: '#3A3F44', hair: 'short', item: 'tablet' },
  { shirt: '#D9A23A', pants: '#5D6E84', hair: 'bun', hairColor: '#3A2A20', item: 'coffee' },
  { shirt: '#43706A', pants: '#CDB892', hair: 'short', item: 'none', backpack: true },
  { shirt: '#B5654A', pants: '#3A3F44', hair: 'long', hairColor: '#2A1E18', item: 'laptop' },
  { robot: 'drone', scale: 0.6 },
  { shirt: '#9AB6C9', pants: '#3E4A5A', hair: 'short', item: 'coffee', glasses: true },
  { shirt: '#E2A3A0', pants: '#4A4E54', hair: 'long', hairColor: '#3A2A20', item: 'notebook' },
  { robot: 'wheel', scale: 0.75 },
];

let seedN = 0;
function rand0() { seedN += 1; const s = Math.sin(seedN * 91.7) * 4375.85; return (s - Math.floor(s)) * 6; }

// 클레이 재질(부드러운 무광) 캐시
function clayKit(THREE, kit) {
  const cache = new Map();
  const clay = (color, opts = {}) => {
    const key = `${color}|${opts.emissive || ''}|${opts.rough ?? ''}|${opts.side || ''}|${opts.map ? opts.map.uuid : ''}`;
    if (!cache.has(key)) {
      cache.set(key, kit.track(new THREE.MeshStandardMaterial({
        color, roughness: opts.rough ?? 0.72, metalness: 0,
        emissive: opts.emissive || 0x000000, emissiveIntensity: opts.ei ?? 1,
        side: opts.side ?? THREE.FrontSide, map: opts.map || null,
      })));
    }
    return cache.get(key);
  };
  return clay;
}

// 로봇 화면 얼굴: 어두운 화면에 웃는 청록 눈과 입
function faceTexture(THREE, kit, { w = 256, h = 160, bg = '#1C2428', line = '#5EE6D6' } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = line; g.lineWidth = 14; g.lineCap = 'round';
  g.shadowColor = line; g.shadowBlur = 18;
  g.beginPath(); g.arc(w * 0.3, h * 0.5, 26, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  g.beginPath(); g.arc(w * 0.7, h * 0.5, 26, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  g.lineWidth = 9;
  g.beginPath(); g.arc(w * 0.5, h * 0.62, 16, Math.PI * 0.2, Math.PI * 0.8); g.stroke();
  const t = kit.track(new THREE.CanvasTexture(c));
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// 사람 얼굴: 큰 눈(흰자·갈색 눈동자·하이라이트), 볼터치, 웃는 입
function addFace(THREE, kit, clay, head, R, { glasses } = {}) {
  const white = clay('#FFFFFF', { rough: 0.4 });
  const iris = clay('#3A2418', { rough: 0.3 });
  const shine = clay('#FFFFFF', { emissive: 0xffffff, ei: 0.6 });
  const m = (geo, mat, o) => { const x = new THREE.Mesh(kit.track(geo), mat); x.position.set(o.x || 0, o.y || 0, o.z || 0); if (o.s) x.scale.set(...o.s); if (o.rz) x.rotation.z = o.rz; head.add(x); return x; };
  for (const s of [-1, 1]) {
    const ex = s * R * 0.36, ey = -R * 0.04, ez = R * 0.9;
    m(new THREE.SphereGeometry(R * 0.2, 16, 12), white, { x: ex, y: ey, z: ez - R * 0.06, s: [1, 1.15, 0.45] });
    m(new THREE.SphereGeometry(R * 0.15, 16, 12), iris, { x: ex, y: ey - R * 0.02, z: ez - R * 0.01, s: [1, 1.15, 0.45] });
    m(new THREE.SphereGeometry(R * 0.05, 8, 6), shine, { x: ex + R * 0.05, y: ey + R * 0.06, z: ez + R * 0.03 });
    m(new THREE.SphereGeometry(R * 0.12, 12, 8), clay('#F2A7A0', { rough: 0.9 }), { x: s * R * 0.55, y: -R * 0.3, z: R * 0.78, s: [1, 0.6, 0.3] });
    // 눈썹
    m(new THREE.CapsuleGeometry(R * 0.025, R * 0.16, 3, 6), clay('#4A3020'), { x: ex, y: ey + R * 0.3, z: ez - R * 0.02, rz: Math.PI / 2 + s * 0.15 });
  }
  const smile = new THREE.Mesh(kit.track(new THREE.TorusGeometry(R * 0.1, R * 0.025, 6, 14, Math.PI)), clay('#B2584A'));
  smile.position.set(0, -R * 0.36, R * 0.93); smile.rotation.z = Math.PI; head.add(smile);
  if (glasses) {
    for (const s of [-1, 1]) {
      const g = new THREE.Mesh(kit.track(new THREE.TorusGeometry(R * 0.24, R * 0.03, 6, 20)), clay('#3A2E26', { rough: 0.4 }));
      g.position.set(s * R * 0.36, -R * 0.04, R * 0.96); head.add(g);
    }
  }
}

export function makePerson(THREE, kit, spec) {
  if (spec.robot) return makeRobot(THREE, kit, spec);
  const clay = clayKit(THREE, kit);
  const mesh = (geo, mat, o = {}) => {
    const m = new THREE.Mesh(kit.track(geo), mat);
    m.position.set(o.x || 0, o.y || 0, o.z || 0);
    m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    if (o.s) m.scale.set(...o.s);
    m.castShadow = o.cast !== false;
    return m;
  };
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const skin = clay('#F6D7BC', { rough: 0.8 });
  const hair = clay(spec.hairColor || '#2A1E18', { rough: 0.6 });
  const shirt = clay(spec.shirt);
  const pants = clay(spec.pants);
  const jacket = spec.jacket ? clay(spec.jacket) : null;
  const shoe = clay('#F1E9DC');

  // 다리(통 넓은 바지) — 키의 약 30%
  const legs = [-1, 1].map((side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.085, 0.5, 0);
    hip.add(mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.42, 12), pants, { y: -0.21 }));
    hip.add(mesh(new THREE.CapsuleGeometry(0.065, 0.08, 4, 10), shoe, { y: -0.44, z: 0.04, rx: Math.PI / 2 }));
    body.add(hip);
    return hip;
  });

  // 몸통: 둥근 상체
  body.add(mesh(new THREE.CapsuleGeometry(0.17, 0.2, 6, 14), shirt, { y: 0.72, s: [1, 1, 0.82] }));
  body.add(mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.04, 14), clay('#6B4A32'), { y: 0.55 }));
  if (jacket) {
    const jk = mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.36, 16, 1, true, Math.PI * 0.68, Math.PI * 1.64), clay(spec.jacket, { side: THREE.DoubleSide }), { y: 0.72, s: [1, 1, 0.86] });
    body.add(jk);
    for (const s of [-1, 1]) body.add(mesh(new THREE.BoxGeometry(0.05, 0.22, 0.02), jacket, { x: s * 0.07, y: 0.78, z: 0.15, rz: s * 0.35 }));
  }
  if (spec.lanyard) {
    body.add(mesh(new THREE.TorusGeometry(0.09, 0.008, 4, 16, Math.PI), clay('#3E8A86'), { y: 0.86, z: 0.08, rx: Math.PI / 2 + 0.7, rz: Math.PI }));
    body.add(mesh(new THREE.BoxGeometry(0.06, 0.08, 0.01), clay('#FBFAF6'), { y: 0.7, z: 0.15 }));
  }
  if (spec.backpack) body.add(mesh(new THREE.CapsuleGeometry(0.12, 0.12, 4, 10), clay('#3A3F44'), { y: 0.74, z: -0.18 }));

  // 팔
  const arms = [-1, 1].map((side) => {
    const sh = new THREE.Group();
    sh.position.set(side * 0.2, 0.86, 0);
    sh.rotation.z = side * 0.12;
    sh.add(mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 10), jacket || shirt, { y: -0.15 }));
    sh.add(mesh(new THREE.SphereGeometry(0.048, 10, 8), skin, { y: -0.32 }));
    body.add(sh);
    return sh;
  });

  // 머리: 지름이 몸통보다 큰 둥근 머리(2.5등신)
  const R = 0.3;
  const head = new THREE.Group();
  head.position.y = 1.02 + R;
  body.add(head);
  head.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 10), skin, { y: -R - 0.02 }));
  head.add(mesh(new THREE.SphereGeometry(R, 28, 22), skin, { s: [1, 0.96, 0.95] }));
  for (const s of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(R * 0.14, 10, 8), skin, { x: s * R * 0.97, y: -R * 0.05, s: [0.5, 1, 0.8] }));
  addFace(THREE, kit, clay, head, R, spec);

  // 머리카락: 뒤통수·윗머리를 덮는 캡 + 앞머리 + 스타일별 덩어리
  head.add(mesh(new THREE.SphereGeometry(R * 1.06, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, { y: R * 0.05, rx: -0.42 }));
  // 앞머리: 이마를 덮는 납작한 띠(둥근 혹처럼 보이지 않게)
  head.add(mesh(new THREE.SphereGeometry(R * 1.04, 28, 12, Math.PI * 1.15, Math.PI * 0.7, Math.PI * 0.18, Math.PI * 0.2), clay(spec.hairColor || '#2A1E18', { side: THREE.DoubleSide, rough: 0.6 }), { y: R * 0.02 }));
  if (spec.hair === 'long' || spec.hair === 'long-wavy') {
    head.add(mesh(new THREE.CapsuleGeometry(R * 0.85, R * 1.1, 6, 16), hair, { y: -R * 0.55, z: -R * 0.32, s: [1.05, 1, 0.7] }));
    for (const s of [-1, 1]) {
      for (let k = 0; k < (spec.hair === 'long-wavy' ? 3 : 1); k++) {
        head.add(mesh(new THREE.CapsuleGeometry(R * 0.22, R * 0.6, 4, 10), hair, { x: s * R * (0.92 + (k % 2) * 0.08), y: -R * (0.35 + k * 0.45), z: R * 0.05, rz: s * 0.12 }));
      }
    }
  } else if (spec.hair === 'bob') {
    head.add(mesh(new THREE.SphereGeometry(R * 1.12, 24, 16, Math.PI * 0.62, Math.PI * 1.76, Math.PI * 0.25, Math.PI * 0.45), clay(spec.hairColor || '#2A1E18', { side: THREE.DoubleSide, rough: 0.6 }), { y: -R * 0.05 }));
  } else if (spec.hair === 'bun') {
    head.add(mesh(new THREE.SphereGeometry(R * 0.38, 16, 12), hair, { y: R * 0.95, z: -R * 0.15 }));
    for (const s of [-1, 1]) head.add(mesh(new THREE.CapsuleGeometry(R * 0.08, R * 0.5, 3, 8), hair, { x: s * R * 0.92, y: -R * 0.35, z: R * 0.25 }));
  } else {
    head.add(mesh(new THREE.SphereGeometry(R * 1.04, 24, 16, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.4), hair, { y: 0, z: -R * 0.08, s: [1, 1, 0.9] }));
  }
  if (spec.helmet) head.add(mesh(new THREE.SphereGeometry(R * 1.12, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), clay('#F4F1EA', { rough: 0.35 }), { y: R * 0.08 }));

  // 손에 든 것(오른손 = arms[1])
  const hand = new THREE.Group(); hand.position.y = -0.33; arms[1].add(hand);
  const left = new THREE.Group(); left.position.y = -0.3; arms[0].add(left);
  const item = spec.item;
  if (item === 'tablet') hand.add(mesh(new THREE.BoxGeometry(0.15, 0.2, 0.02), clay('#4A4E54', { rough: 0.3 }), { z: 0.07, rx: -0.3 }));
  else if (item === 'laptop') left.add(mesh(new THREE.BoxGeometry(0.24, 0.17, 0.025), clay('#B9BEC4', { rough: 0.3 }), { z: 0.07 }));
  else if (item === 'coffee') { hand.add(mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.09, 12), clay('#FBFAF6'), { z: 0.05 })); hand.add(mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.025, 12), clay('#8A6440'), { y: 0.03, z: 0.05 })); }
  else if (item === 'notebook') hand.add(mesh(new THREE.BoxGeometry(0.13, 0.17, 0.03), clay('#3E7A5A'), { z: 0.07, rx: -0.2 }));
  else if (item === 'envelope') hand.add(mesh(new THREE.BoxGeometry(0.16, 0.11, 0.015), clay('#FBF3E2'), { z: 0.08 }));
  else if (item === 'box') hand.add(mesh(new THREE.BoxGeometry(0.22, 0.16, 0.2), clay('#C9A86A'), { z: 0.12 }));
  else if (item === 'point') arms[1].userData.raise = 1.2;

  const hold = ['tablet', 'coffee', 'notebook', 'envelope', 'box'].includes(item);
  let phase = rand0();
  let walkAmt = 0;
  const update = (dt, speed, t) => {
    walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 8);
    phase += dt * (7 + 5 * walkAmt) * (walkAmt > 0.05 ? 1 : 0.15);
    const swing = Math.sin(phase) * 0.55 * walkAmt;
    legs[0].rotation.x = swing;
    legs[1].rotation.x = -swing;
    const raise = arms[1].userData.raise || 0;
    arms[0].rotation.x = item === 'laptop' ? -0.9 : -swing * 0.9;
    arms[1].rotation.x = swing * 0.9 * (raise ? 0.3 : 1) - raise * (1 - walkAmt) - (hold ? 0.8 - walkAmt * 0.3 : 0);
    body.position.y = Math.abs(Math.cos(phase)) * 0.05 * walkAmt + Math.sin(t * 1.8 + phase) * 0.008 * (1 - walkAmt);
    body.rotation.z = Math.sin(phase) * 0.04 * walkAmt;
    head.rotation.y = Math.sin(t * 0.5 + phase * 0.1) * 0.2 * (1 - walkAmt);
    head.rotation.z = Math.sin(t * 0.9 + phase) * 0.04 * (1 - walkAmt);
  };
  if (spec.scale) g.scale.setScalar(spec.scale);
  g.scale.multiplyScalar(1.15);
  return { group: g, update };
}

function makeRobot(THREE, kit, spec) {
  const clay = clayKit(THREE, kit);
  const mesh = (geo, mat, o = {}) => {
    const m = new THREE.Mesh(kit.track(geo), mat);
    m.position.set(o.x || 0, o.y || 0, o.z || 0);
    m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    if (o.s) m.scale.set(...o.s);
    m.castShadow = o.cast !== false;
    return m;
  };
  const rbox = (w, h, d, r) => new THREE.CapsuleGeometry(Math.min(w, d) * r, Math.max(0.01, h - Math.min(w, d) * r * 2), 6, 16);
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const face = clay('#ffffff', { map: faceTexture(THREE, kit), emissive: 0xffffff, ei: 0.35, rough: 0.3 });
  const teal = clay('#2E9A8C');
  const dark = clay('#3A3F44');
  const cream = clay('#EFE3CC');
  const screenHead = (parent, w, h, d, shell, y) => {
    const hd = new THREE.Group(); hd.position.y = y; parent.add(hd);
    hd.add(mesh(new THREE.BoxGeometry(w, h, d), shell, {}));
    for (const e of [[w / 2, 0], [-w / 2, 0], [0, h / 2], [0, -h / 2]]) hd.add(mesh(new THREE.CylinderGeometry(Math.min(w, h) * 0.06, Math.min(w, h) * 0.06, d, 8), shell, { x: e[0], y: e[1], rx: Math.PI / 2 }));
    hd.add(mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.68), face, { z: d / 2 + 0.003, cast: false }));
    return hd;
  };
  let phase = rand0();
  let walkAmt = 0;
  let update;

  if (spec.robot === 'builder') {
    const orange = clay('#EE8A3C');
    const legs = [-1, 1].map((s) => {
      const hip = new THREE.Group(); hip.position.set(s * 0.17, 0.42, 0);
      hip.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 10), clay('#8A9298'), { y: -0.14 }));
      hip.add(mesh(new THREE.CapsuleGeometry(0.1, 0.1, 4, 10), orange, { y: -0.32, z: 0.05, rx: Math.PI / 2 }));
      body.add(hip); return hip;
    });
    body.add(mesh(new THREE.BoxGeometry(0.56, 0.42, 0.42), orange, { y: 0.66 }));
    body.add(mesh(new THREE.BoxGeometry(0.34, 0.2, 0.02), cream, { y: 0.66, z: 0.215 }));
    body.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14), teal, { x: 0.08, y: 0.63, z: 0.23, rx: Math.PI / 2 }));
    const head = screenHead(body, 0.66, 0.5, 0.46, orange, 1.18);
    for (const s of [-1, 1]) head.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16), teal, { x: s * 0.36, rz: Math.PI / 2 }));
    head.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6), dark, { y: 0.34 }));
    head.add(mesh(new THREE.SphereGeometry(0.05, 10, 8), orange, { y: 0.47 }));
    const arms = [-1, 1].map((s) => {
      const sh = new THREE.Group(); sh.position.set(s * 0.33, 0.78, 0);
      sh.add(mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 8), clay('#8A9298'), { y: -0.16 }));
      if (s < 0) { sh.add(mesh(new THREE.BoxGeometry(0.06, 0.2, 0.04), clay('#9AA3A8', { rough: 0.35 }), { y: -0.4 })); sh.add(mesh(new THREE.TorusGeometry(0.06, 0.022, 6, 12, Math.PI * 1.5), clay('#9AA3A8', { rough: 0.35 }), { y: -0.53 })); }
      else { sh.add(mesh(new THREE.TorusGeometry(0.06, 0.025, 6, 12, Math.PI * 1.3), teal, { y: -0.36, rz: -Math.PI / 2 })); }
      body.add(sh); return sh;
    });
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 8);
      phase += dt * (8 + 4 * walkAmt) * (walkAmt > 0.05 ? 1 : 0.1);
      const sw = Math.sin(phase) * 0.5 * walkAmt;
      legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
      arms[1].rotation.x = -sw * 0.6;
      arms[0].rotation.x = sw * 0.6 - (1 - walkAmt) * (1.6 + Math.sin(t * 5) * 0.25); // 렌치를 들어 흔듦
      body.position.y = Math.abs(Math.cos(phase)) * 0.04 * walkAmt;
      head.rotation.z = Math.sin(t * 1.2) * 0.08 * (1 - walkAmt);
    };
  } else if (spec.robot === 'drone') {
    const shell = clay('#6E819A');
    const hover = new THREE.Group(); body.add(hover);
    hover.add(mesh(new THREE.SphereGeometry(0.34, 24, 18), shell, {}));
    hover.add(mesh(new THREE.TorusGeometry(0.2, 0.05, 10, 24), cream, { z: 0.28 }));
    hover.add(mesh(new THREE.SphereGeometry(0.17, 18, 14), clay('#1C2428', { rough: 0.2 }), { z: 0.24, s: [1, 1, 0.6] }));
    hover.add(mesh(new THREE.SphereGeometry(0.09, 14, 10), clay('#3FD1C0', { emissive: 0x2AA198, ei: 1.0 }), { z: 0.32, s: [1, 1, 0.5] }));
    hover.add(mesh(new THREE.SphereGeometry(0.035, 8, 6), clay('#FFFFFF', { emissive: 0xffffff, ei: 0.8 }), { x: 0.04, y: 0.04, z: 0.37 }));
    hover.add(mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.08, 16), clay('#3FD1C0', { emissive: 0x2AA198, ei: 0.8 }), { y: -0.34 }));
    const rotors = [];
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      hover.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6), cream, { x: x * 0.3, z: z * 0.3, rz: x * 0.9, rx: -z * 0.9, cast: false }));
      const r = new THREE.Group(); r.position.set(x * 0.45, 0.12, z * 0.45); hover.add(r);
      r.add(mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 20), cream, { rx: Math.PI / 2 }));
      const blades = new THREE.Group(); r.add(blades);
      blades.add(mesh(new THREE.BoxGeometry(0.3, 0.01, 0.06), clay('#2E9A8C'), { cast: false }));
      blades.add(mesh(new THREE.BoxGeometry(0.06, 0.01, 0.3), clay('#2E9A8C'), { cast: false }));
      blades.add(mesh(new THREE.SphereGeometry(0.035, 8, 6), clay('#EE8A3C'), {}));
      rotors.push(blades);
    }
    const cone = new THREE.Mesh(kit.track(new THREE.ConeGeometry(0.32, 1.1, 18, 1, true)), kit.track(new THREE.MeshBasicMaterial({ color: '#4FD1C5', transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide })));
    cone.position.y = -0.92; hover.add(cone);
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 4);
      hover.position.y = 1.55 + Math.sin(t * 2 + phase) * 0.08;
      hover.rotation.x = walkAmt * 0.25;
      rotors.forEach((r, i) => { r.rotation.y = t * 30 * (i % 2 ? 1 : -1); });
    };
  } else if (spec.robot === 'wheel') {
    const red = clay('#D5483A');
    const wheel = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 22), dark, { y: 0.2, rz: Math.PI / 2 });
    body.add(wheel);
    body.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 14), teal, { y: 0.2, rz: Math.PI / 2 }));
    body.add(mesh(new THREE.SphereGeometry(0.34, 22, 16), cream, { y: 0.66, s: [1, 0.85, 0.9] }));
    body.add(mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.1, 22), red, { y: 0.62 }));
    for (let i = 0; i < 3; i++) body.add(mesh(new THREE.SphereGeometry(0.03, 8, 6), cream, { x: -0.12 + i * 0.12, y: 0.62, z: 0.33 }));
    const head = screenHead(body, 0.58, 0.44, 0.42, cream, 1.18);
    for (const s of [-1, 1]) head.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.07, 16), teal, { x: s * 0.32, rz: Math.PI / 2 }));
    head.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), dark, { y: 0.31 }));
    head.add(mesh(new THREE.SphereGeometry(0.05, 10, 8), red, { y: 0.43 }));
    const arm = new THREE.Group(); arm.position.set(-0.36, 0.78, 0); body.add(arm);
    arm.add(mesh(new THREE.CapsuleGeometry(0.04, 0.2, 4, 8), clay('#8A9298'), { y: -0.14 }));
    arm.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 10), red, { y: -0.34, z: 0.05, rx: 0.5 }));
    const claw = new THREE.Group(); claw.position.set(0.36, 0.72, 0); body.add(claw);
    claw.add(mesh(new THREE.CapsuleGeometry(0.04, 0.16, 4, 8), clay('#8A9298'), { y: -0.12 }));
    claw.add(mesh(new THREE.TorusGeometry(0.05, 0.02, 6, 12, Math.PI * 1.3), teal, { y: -0.28, rz: -Math.PI / 2 }));
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 6);
      wheel.rotation.x += dt * walkAmt * 18;
      body.rotation.x = walkAmt * 0.12 + Math.sin(t * 1.5 + phase) * 0.02;
      arm.rotation.x = -1.2 - (1 - walkAmt) * Math.max(0, Math.sin(t * 3)) * 0.4; // 빨간 펜을 들어 표시
      head.rotation.y = Math.sin(t * 0.6 + phase) * 0.3 * (1 - walkAmt);
    };
  } else if (spec.robot === 'printer') {
    const mint = clay('#7DB59A');
    const orange = clay('#EE8A3C');
    for (const s of [-1, 1]) {
      body.add(mesh(new THREE.CapsuleGeometry(0.11, 0.42, 4, 10), dark, { x: s * 0.3, y: 0.13, rx: Math.PI / 2 }));
      for (const z of [-0.2, 0.2]) body.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 14), orange, { x: s * 0.36, y: 0.13, z, rz: Math.PI / 2 }));
    }
    body.add(mesh(new THREE.BoxGeometry(0.64, 0.46, 0.5), mint, { y: 0.5 }));
    body.add(mesh(new THREE.BoxGeometry(0.44, 0.06, 0.04), dark, { y: 0.56, z: 0.26 }));
    for (let i = 0; i < 2; i++) body.add(mesh(new THREE.SphereGeometry(0.03, 8, 6), orange, { x: 0.22, y: 0.62 - i * 0.08, z: 0.26 }));
    const paper = mesh(new THREE.PlaneGeometry(0.36, 0.4), clay('#FBFAF6', { side: THREE.DoubleSide }), { y: 0.42, z: 0.3, rx: 0.4, cast: false });
    body.add(paper);
    const head = screenHead(body, 0.6, 0.44, 0.42, mint, 0.98);
    head.add(mesh(new THREE.BoxGeometry(0.2, 0.06, 0.12), orange, { y: 0.25 }));
    for (const s of [-1, 1]) head.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16), cream, { x: s * 0.33, rz: Math.PI / 2 }));
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 6);
      const k = (t * 0.5 + phase) % 1;
      paper.scale.y = 0.2 + k * 0.8;
      paper.position.y = 0.56 - k * 0.18;
      body.position.y = Math.abs(Math.sin(t * 12)) * 0.01 * walkAmt;
      head.rotation.z = Math.sin(t * 1.3 + phase) * 0.08;
    };
  } else {
    // 지킴이: 짙은 회색 몸, 청록 가슴 방패 패널, 어깨 장갑, 화면 얼굴, 빨간 점멸등, 방패
    const shell = clay('#3E4448');
    const legs = [-1, 1].map((s) => {
      const hip = new THREE.Group(); hip.position.set(s * 0.15, 0.62, 0);
      hip.add(mesh(new THREE.CapsuleGeometry(0.08, 0.34, 4, 10), shell, { y: -0.26 }));
      hip.add(mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.1, 14), cream, { y: -0.56 }));
      body.add(hip); return hip;
    });
    body.add(mesh(new THREE.BoxGeometry(0.52, 0.5, 0.36), shell, { y: 0.92 }));
    body.add(mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.04, 6), teal, { y: 0.94, z: 0.19, rx: Math.PI / 2, ry: Math.PI / 6 }));
    for (const s of [-1, 1]) body.add(mesh(new THREE.SphereGeometry(0.15, 14, 10), cream, { x: s * 0.33, y: 1.12, s: [1, 0.8, 1] }));
    const arms = [-1, 1].map((s) => {
      const sh = new THREE.Group(); sh.position.set(s * 0.36, 1.08, 0);
      sh.add(mesh(new THREE.CapsuleGeometry(0.065, 0.3, 4, 10), shell, { y: -0.22 }));
      body.add(sh); return sh;
    });
    const shield = new THREE.Group(); shield.position.set(0, -0.45, 0.1); arms[0].add(shield);
    shield.add(mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.05, 6), dark, { rx: Math.PI / 2 }));
    shield.add(mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.06, 6), teal, { z: 0.01, rx: Math.PI / 2 }));
    const head = screenHead(body, 0.5, 0.4, 0.4, shell, 1.42);
    for (const s of [-1, 1]) head.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 14), teal, { x: s * 0.28, rz: Math.PI / 2 }));
    const lamp = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 14), clay('#FF4A30', { emissive: 0xFF3B1F, ei: 1.3 }), { y: 0.27, cast: false });
    head.add(lamp);
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 8);
      phase += dt * (6 + 3 * walkAmt) * (walkAmt > 0.05 ? 1 : 0.1);
      const sw = Math.sin(phase) * 0.45 * walkAmt;
      legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
      arms[0].rotation.x = -0.5; arms[1].rotation.x = sw * 0.6;
      body.position.y = Math.abs(Math.cos(phase)) * 0.03 * walkAmt;
      head.rotation.y = Math.sin(t * 0.8) * 0.4 * (1 - walkAmt);
      lamp.material.emissiveIntensity = Math.sin(t * 5) > 0 ? 1.4 : 0.2;
    };
  }
  if (spec.scale) g.scale.setScalar(spec.scale);
  g.scale.multiplyScalar(1.15);
  g.traverse((o) => { if (o.isMesh && o.castShadow !== false) o.castShadow = true; });
  return { group: g, update };
}

// 카드 그림(클레이 피규어)으로 걷는 인물. 받침을 지운 그림(<id>-walk.png)을
// 윗몸 한 장 + 다리 두 장으로 잘라, 다리를 엉덩이 높이에서 번갈아 흔들어 걷게 합니다(종이 인형 방식).
// hip: 다리가 갈라지는 높이(위에서부터 비율), split: 두 다리 사이 가로 위치, legL·legR: 다리 좌우 끝.
const RIG = {
  main:      { hip: 0.729, split: 0.53, legL: 0.27, legR: 0.85, H: 2.15 },
  critic:    { hip: 0.682, split: 0.543, legL: 0.26, legR: 0.87, H: 2.15 },
  writer:    { hip: 0.724, split: 0.532, legL: 0.25, legR: 0.87, H: 2.15 },
  trainer:   { hip: 0.700, split: 0.493, legL: 0.24, legR: 0.79, H: 2.15 },
  brief:     { hip: 0.642, split: 0.55, legL: 0.33, legR: 0.79, H: 2.15 },
  developer: { hip: 0.858, split: 0.514, legL: 0.22, legR: 0.79, H: 1.75 },
  local:     { hip: 0.865, split: 0.52, legL: 0.21, legR: 0.85, H: 2.05 },
  editor:    { roll: true, H: 1.7 },
  minutes:   { roll: true, H: 1.5 },
  researcher:{ fly: true, H: 1.35 },
};

export function makeSpritePerson(THREE, kit, url, id) {
  const rig = RIG[id] || { H: 2.1 };
  const g = new THREE.Group();
  const walkUrl = url.replace(/\.png$/, '-walk.png');
  const base = kit.track(new THREE.TextureLoader().load(walkUrl, () => layout()));
  base.colorSpace = THREE.SRGBColorSpace;
  base.anisotropy = 8;
  const H = rig.H;
  const piece = (u0, u1, v0, v1, cx, cy, order) => {
    const t = kit.track(base.clone());
    t.repeat.set(u1 - u0, v1 - v0); t.offset.set(u0, v0);
    const sp = new THREE.Sprite(kit.track(new THREE.SpriteMaterial({ map: t, alphaTest: 0.5, toneMapped: false })));
    sp.center.set(cx, cy); sp.renderOrder = order;
    sp.userData.u = [u0, u1]; sp.userData.v = [v0, v1];
    g.add(sp);
    return sp;
  };
  // 텍스처 v 는 아래가 0. 그림 위쪽에서 hip 비율만큼 내려온 곳이 엉덩이.
  const legs = [];
  let upper;
  if (rig.hip) {
    const vh = 1 - rig.hip;
    upper = piece(0, 1, vh - 0.03, 1, 0.5, 0, 2);
    legs.push(piece(rig.legL, rig.split, 0, vh, 0.5, 1, 1));
    legs.push(piece(rig.split, rig.legR, 0, vh, 0.5, 1, 1));
  } else {
    upper = piece(0, 1, 0, 1, 0.5, 0, 2);
  }
  let aspect = 0.4;
  function layout() { const img = base.image; if (img && img.width) aspect = img.width / img.height; }
  // 발밑 그림자
  const sh = document.createElement('canvas'); sh.width = sh.height = 64;
  const c = sh.getContext('2d'); const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(40,30,20,.4)'); gr.addColorStop(1, 'rgba(40,30,20,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
  const blob = new THREE.Mesh(kit.track(new THREE.PlaneGeometry(1.1, 0.8)), kit.track(new THREE.MeshBasicMaterial({ map: kit.track(new THREE.CanvasTexture(sh)), transparent: true, depthWrite: false })));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.03;
  g.add(blob);

  let phase = rand0(), walkAmt = 0, flip = 1;
  const last = new THREE.Vector3(), now = new THREE.Vector3(), right = new THREE.Vector3();
  const update = (dt, speed, t, cam) => {
    walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 8);
    phase += dt * (10 * walkAmt + 1.2);
    g.getWorldPosition(now);
    if (cam) right.setFromMatrixColumn(cam.matrixWorld, 0);
    if (cam && walkAmt > 0.2) {
      const side = (now.x - last.x) * right.x + (now.z - last.z) * right.z;
      if (Math.abs(side) > 0.002) flip = side < 0 ? -1 : 1;
    }
    last.copy(now);
    const W = H * aspect; // 그림 전체 폭(월드 단위)
    const swing = Math.sin(phase) * 0.38 * walkAmt;
    const bob = Math.abs(Math.cos(phase)) * 0.06 * walkAmt;
    const lift = rig.fly ? 0.9 + Math.sin(t * 2 + phase) * 0.1 : 0;
    const roll = rig.roll ? Math.sin(phase * 2) * 0.03 * walkAmt : 0;
    const breathe = Math.sin(t * 2 + phase) * 0.01;
    // 화면 기준 가로 오프셋을 월드 좌표로
    const place = (sp, xScreen, y) => sp.position.set(right.x * xScreen * flip, y, right.z * xScreen * flip);
    if (rig.hip) {
      const hipY = (1 - rig.hip) * H + 0.02;
      const uh = upper.userData.v[1] - upper.userData.v[0];
      upper.scale.set(W * flip, H * uh * (1 + breathe), 1);
      place(upper, 0, hipY - 0.03 * H + bob);
      upper.material.rotation = Math.sin(phase) * 0.03 * walkAmt * flip;
      legs.forEach((leg, i) => {
        const [u0, u1] = leg.userData.u;
        leg.scale.set(W * (u1 - u0) * flip, hipY - 0.02, 1);
        place(leg, ((u0 + u1) / 2 - 0.5) * W, hipY + bob * 0.5);
        leg.material.rotation = (i ? -swing : swing);
      });
    } else {
      upper.scale.set(W * flip, H * (1 + breathe), 1);
      place(upper, 0, 0.02 + lift + bob * 0.5);
      upper.material.rotation = roll * flip;
    }
    blob.scale.setScalar(rig.fly ? 0.7 : 1 - bob);
  };
  return { group: g, update };
}
