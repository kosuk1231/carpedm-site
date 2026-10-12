// 코드로 빚은 CARPEDM 캠퍼스 사람들과 로봇.
// 사람: 기본 도형으로 쌓고 다리·팔을 흔들어 실제로 걷게 합니다. 로봇: 종류마다 움직이는 방식이 다릅니다(다리·바퀴·프로펠러).
// 모든 인물은 몸 앞이 +Z 방향입니다. update(dt, speed, t) 의 speed 는 0~1.

export const PEOPLE = {
  main:       { shirt: '#F4F1EA', jacket: '#3E5A6E', pants: '#2E3436', hair: 'short', item: 'tablet', lanyard: true },
  ceo:        { shirt: '#F5F2EA', pants: '#CDB892', hair: 'short', item: 'coffee', glasses: true },
  critic:     { shirt: '#22282C', pants: '#2E3436', hair: 'bob', item: 'tablet', glasses: true },
  writer:     { shirt: '#E9D7C0', jacket: '#B5654A', pants: '#3C3A44', hair: 'long', item: 'notebook' },
  trainer:    { shirt: '#F4F1EA', jacket: '#43706A', pants: '#D9CDB4', hair: 'bun', item: 'point', lanyard: true },
  brief:      { shirt: '#F2C46D', pants: '#3E4A5A', hair: 'short', item: 'envelope', lanyard: true },
  developer:  { robot: 'builder', body: '#E0995A' },
  researcher: { robot: 'drone', body: '#5E7A94' },
  editor:     { robot: 'wheel', body: '#F4F1EA', accent: '#C8402E' },
  minutes:    { robot: 'printer', body: '#7FB3A8' },
  local:      { robot: 'guard', body: '#3A4448', accent: '#4FD1C5' },
  visitor:    { shirt: '#F5F2EA', pants: '#8A9AA8', hair: 'short', item: 'lanyard', backpack: true },
};

// 이름 없는 캠퍼스 사람들: 직원, 수강생, 배달 라이더, 아이와 함께 온 방문객
export const TOWNSFOLK = [
  { shirt: '#5E7A94', pants: '#2E3436', hair: 'short', item: 'laptop' },
  { shirt: '#E9D7C0', pants: '#4E5A3A', hair: 'long', item: 'coffee' },
  { shirt: '#C8402E', pants: '#2E3436', hair: 'short', helmet: true, item: 'box' },   // 배달 라이더
  { shirt: '#7FA862', pants: '#3C3A44', hair: 'bob', item: 'notebook', scale: 0.72 }, // 아이
  { shirt: '#F4F1EA', jacket: '#2E3436', pants: '#2E3436', hair: 'short', item: 'tablet' },
  { shirt: '#D9A23A', pants: '#5D6E84', hair: 'bun', item: 'coffee' },
  { shirt: '#43706A', pants: '#CDB892', hair: 'short', item: 'none', backpack: true },
  { shirt: '#B5654A', pants: '#2E3436', hair: 'long', item: 'laptop' },
  { robot: 'drone', body: '#C9CDD0', scale: 0.7 },                                   // 배송 드론
  { shirt: '#9AB6C9', pants: '#3E4A5A', hair: 'short', item: 'coffee', glasses: true },
  { shirt: '#E2A3A0', pants: '#4A4E54', hair: 'long', item: 'notebook' },
  { robot: 'wheel', body: '#E6E1D6', accent: '#43706A', scale: 0.8 },                // 안내 로봇
];

const SKIN = '#F0CFA6';
const HAIR = '#1F1A17';

let seedN = 0;
function rand0() { seedN += 1; const s = Math.sin(seedN * 91.7) * 4375.85; return (s - Math.floor(s)) * 6; }

export function makePerson(THREE, kit, spec) {
  if (spec.robot) return makeRobot(THREE, kit, spec);
  const { toon, mesh } = kit;
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const skin = toon(SKIN);
  const hair = toon(HAIR);
  const shirt = toon(spec.shirt);
  const pants = toon(spec.pants);
  const jacket = spec.jacket ? toon(spec.jacket) : null;
  const shoe = toon('#2A2420');

  const legs = [-1, 1].map((side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.1, 0.72, 0);
    hip.add(mesh(new THREE.CapsuleGeometry(0.08, 0.5, 4, 8), pants, { y: -0.33 }));
    hip.add(mesh(new THREE.BoxGeometry(0.14, 0.08, 0.24), toon(side < 0 ? '#F4F1EA' : '#F4F1EA'), { y: -0.68, z: 0.04 })); // 운동화
    hip.add(mesh(new THREE.BoxGeometry(0.145, 0.03, 0.245), shoe, { y: -0.71, z: 0.04 }));
    body.add(hip);
    return hip;
  });

  // 상체: 셔츠(+재킷), 벨트
  body.add(mesh(new THREE.CylinderGeometry(0.2, 0.19, 0.5, 12), shirt, { y: 1.12 }));
  body.add(mesh(new THREE.CylinderGeometry(0.195, 0.195, 0.06, 12), toon('#1F1C1A'), { y: 0.86 }));
  body.add(mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.16, 12), pants, { y: 0.76 }));
  if (jacket) {
    body.add(mesh(new THREE.CylinderGeometry(0.215, 0.205, 0.52, 12, 1, true, Math.PI * 0.62, Math.PI * 1.76), toon(spec.jacket, { side: THREE.DoubleSide }), { y: 1.1 }));
  }
  if (spec.lanyard) {
    body.add(mesh(new THREE.TorusGeometry(0.12, 0.012, 4, 16, Math.PI), toon('#E0995A'), { y: 1.3, z: 0.1, rx: Math.PI / 2 + 0.6, rz: Math.PI }));
    body.add(mesh(new THREE.BoxGeometry(0.09, 0.12, 0.01), toon('#FBFAF6'), { y: 1.1, z: 0.205 }));
  }
  if (spec.backpack) body.add(mesh(new THREE.BoxGeometry(0.3, 0.36, 0.16), toon('#2E3436'), { y: 1.12, z: -0.26 }));

  const arms = [-1, 1].map((side) => {
    const sh = new THREE.Group();
    sh.position.set(side * 0.27, 1.36, 0);
    sh.rotation.z = side * 0.06;
    sh.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.42, 8), jacket || shirt, { y: -0.22 }));
    sh.add(mesh(new THREE.SphereGeometry(0.055, 8, 6), skin, { y: -0.47 }));
    body.add(sh);
    return sh;
  });

  const head = new THREE.Group();
  head.position.y = 1.62;
  body.add(head);
  head.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), skin, { y: -0.04 }));
  head.add(mesh(new THREE.SphereGeometry(0.19, 16, 12), skin, { y: 0.17 }));
  [-1, 1].forEach((s) => head.add(mesh(new THREE.SphereGeometry(0.022, 6, 6), toon('#1A1410'), { x: s * 0.065, y: 0.19, z: 0.172, cast: false })));
  head.add(mesh(new THREE.TorusGeometry(0.04, 0.008, 4, 10, Math.PI), toon('#7A4A3A'), { y: 0.1, z: 0.178, rz: Math.PI, cast: false })); // 미소
  head.add(mesh(new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, { y: 0.19, rx: -0.3 }));
  if (spec.hair === 'long') head.add(mesh(new THREE.CapsuleGeometry(0.16, 0.3, 4, 10), hair, { y: 0.0, z: -0.08 }));
  if (spec.hair === 'bob') head.add(mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.24, 14, 1, true, Math.PI * 0.8, Math.PI * 1.4), toon(HAIR, { side: THREE.DoubleSide }), { y: 0.13 }));
  if (spec.hair === 'bun') head.add(mesh(new THREE.SphereGeometry(0.09, 10, 8), hair, { y: 0.34, z: -0.1 }));
  if (spec.glasses) {
    [-1, 1].forEach((s) => head.add(mesh(new THREE.TorusGeometry(0.045, 0.01, 4, 12), toon('#1F1C1A'), { x: s * 0.068, y: 0.19, z: 0.175, cast: false })));
  }
  if (spec.helmet) head.add(mesh(new THREE.SphereGeometry(0.23, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), toon('#F4F1EA'), { y: 0.18 }));

  // 손에 든 것(오른손 = arms[1])
  const hand = new THREE.Group(); hand.position.y = -0.5; arms[1].add(hand);
  const left = new THREE.Group(); left.position.y = -0.45; arms[0].add(left);
  const item = spec.item;
  if (item === 'tablet') hand.add(mesh(new THREE.BoxGeometry(0.2, 0.28, 0.02), toon('#22282C'), { z: 0.1, rx: -0.3 }));
  else if (item === 'laptop') left.add(mesh(new THREE.BoxGeometry(0.32, 0.22, 0.03), toon('#B9BEC4'), { z: 0.1 }));
  else if (item === 'coffee') hand.add(mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.12, 10), toon('#F4F1EA'), { z: 0.07 }), mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.03, 10), toon('#8A6440'), { y: 0.03, z: 0.07 }));
  else if (item === 'notebook') hand.add(mesh(new THREE.BoxGeometry(0.16, 0.22, 0.04), toon('#43706A'), { z: 0.1, rx: -0.2 }));
  else if (item === 'envelope') hand.add(mesh(new THREE.BoxGeometry(0.2, 0.14, 0.02), toon('#F4EAD2'), { z: 0.1 }));
  else if (item === 'box') hand.add(mesh(new THREE.BoxGeometry(0.3, 0.22, 0.26), toon('#C9A86A'), { z: 0.16 }));
  else if (item === 'point') arms[1].userData.raise = 1.1;

  const hold = ['tablet', 'coffee', 'notebook', 'envelope', 'box'].includes(item);
  let phase = rand0();
  let walkAmt = 0;
  const update = (dt, speed, t) => {
    walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 8);
    phase += dt * (6 + 5 * walkAmt) * (walkAmt > 0.05 ? 1 : 0.15);
    const swing = Math.sin(phase) * 0.6 * walkAmt;
    legs[0].rotation.x = swing;
    legs[1].rotation.x = -swing;
    const raise = arms[1].userData.raise || 0;
    arms[0].rotation.x = item === 'laptop' ? -0.9 : -swing * 0.8;
    arms[1].rotation.x = swing * 0.8 * (raise ? 0.3 : 1) - raise * (1 - walkAmt) - (hold ? 0.7 - walkAmt * 0.3 : 0);
    body.position.y = Math.abs(Math.cos(phase)) * 0.05 * walkAmt + Math.sin(t * 1.6 + phase) * 0.006 * (1 - walkAmt);
    body.rotation.z = Math.sin(phase) * 0.03 * walkAmt;
    head.rotation.y = Math.sin(t * 0.4 + phase * 0.1) * 0.15 * (1 - walkAmt);
  };
  g.traverse((o) => { if (o.isMesh && o.castShadow !== false) o.castShadow = true; });
  return { group: g, update };
}

function makeRobot(THREE, kit, spec) {
  const { toon, mesh } = kit;
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const shell = toon(spec.body);
  const dark = toon('#22282C');
  const accent = toon(spec.accent || '#E0995A');
  const glow = toon('#4FD1C5', { emissive: 0x2AA198, emissiveIntensity: 1.0 });
  const eyes = (parent, y, z, w = 0.07) => [-1, 1].forEach((s) => parent.add(mesh(new THREE.SphereGeometry(w * 0.5, 10, 8), glow, { x: s * w * 1.1, y, z, cast: false })));
  let phase = rand0();
  let walkAmt = 0;
  let update;

  if (spec.robot === 'builder') {
    // 뚝딱봇: 짧은 두 다리, 네모난 몸, 화면 얼굴, 한쪽은 렌치 팔·한쪽은 집게 팔
    const legs = [-1, 1].map((s) => {
      const hip = new THREE.Group(); hip.position.set(s * 0.16, 0.5, 0);
      hip.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), dark, { y: -0.2 }));
      hip.add(mesh(new THREE.BoxGeometry(0.18, 0.1, 0.26), shell, { y: -0.44, z: 0.04 }));
      body.add(hip); return hip;
    });
    body.add(mesh(new THREE.BoxGeometry(0.62, 0.6, 0.45), shell, { y: 0.85 }));
    body.add(mesh(new THREE.BoxGeometry(0.4, 0.22, 0.02), dark, { y: 0.9, z: 0.23 }));
    body.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.03), glow, { y: 0.9, z: 0.245, cast: false }));
    const head = new THREE.Group(); head.position.y = 1.35; body.add(head);
    head.add(mesh(new THREE.BoxGeometry(0.42, 0.32, 0.36), toon('#F4F1EA')));
    head.add(mesh(new THREE.BoxGeometry(0.34, 0.2, 0.02), dark, { z: 0.185 }));
    eyes(head, 0.02, 0.2, 0.06);
    head.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6), dark, { y: 0.26 }), mesh(new THREE.SphereGeometry(0.035, 8, 6), accent, { y: 0.37 }));
    const arms = [-1, 1].map((s) => {
      const sh = new THREE.Group(); sh.position.set(s * 0.38, 1.05, 0);
      sh.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8), dark, { y: -0.22 }));
      if (s > 0) { sh.add(mesh(new THREE.BoxGeometry(0.06, 0.22, 0.04), toon('#9AA3A8'), { y: -0.5 }), mesh(new THREE.TorusGeometry(0.06, 0.02, 4, 10, Math.PI * 1.5), toon('#9AA3A8'), { y: -0.64 })); }
      else { sh.add(mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), accent, { x: -0.03, y: -0.5 }), mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), accent, { x: 0.03, y: -0.5 })); }
      body.add(sh); return sh;
    });
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 8);
      phase += dt * (8 + 4 * walkAmt) * (walkAmt > 0.05 ? 1 : 0.1);
      const sw = Math.sin(phase) * 0.5 * walkAmt;
      legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
      arms[0].rotation.x = -sw * 0.6; arms[1].rotation.x = sw * 0.6 - (1 - walkAmt) * (0.4 + Math.sin(t * 4) * 0.25); // 쉬는 동안엔 렌치질
      body.position.y = Math.abs(Math.cos(phase)) * 0.04 * walkAmt;
      head.rotation.y = Math.sin(t * 0.7) * 0.3 * (1 - walkAmt);
    };
  } else if (spec.robot === 'drone') {
    // 서치봇: 떠 있는 둥근 몸, 프로펠러 네 개, 아래로 비추는 렌즈
    const hover = new THREE.Group(); body.add(hover);
    hover.add(mesh(new THREE.SphereGeometry(0.28, 18, 14), shell, { s: [1, 0.7, 1] }));
    hover.add(mesh(new THREE.SphereGeometry(0.12, 12, 10), dark, { z: 0.22, y: -0.04 }));
    hover.add(mesh(new THREE.SphereGeometry(0.06, 10, 8), glow, { z: 0.31, y: -0.04, cast: false }));
    const rotors = [];
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      hover.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 6), dark, { x: x * 0.18, z: z * 0.18, rz: x * 0.9, rx: -z * 0.9, cast: false }));
      const r = new THREE.Group(); r.position.set(x * 0.34, 0.08, z * 0.34); hover.add(r);
      r.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), dark));
      r.add(mesh(new THREE.BoxGeometry(0.34, 0.01, 0.05), toon('#E6E1D6'), { y: 0.03, cast: false }));
      rotors.push(r);
    }
    // 바닥 탐색 빛
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 16, 1, true), kit.track(new THREE.MeshBasicMaterial({ color: '#4FD1C5', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide })));
    cone.position.y = -0.65; hover.add(cone);
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 4);
      hover.position.y = 1.5 + Math.sin(t * 2 + phase) * 0.08;
      hover.rotation.x = walkAmt * 0.25;
      rotors.forEach((r, i) => { r.rotation.y = t * 40 * (i % 2 ? 1 : -1); });
    };
  } else if (spec.robot === 'wheel') {
    // 교정봇(·안내 로봇): 외바퀴 위의 둥근 몸, 화면 얼굴, 빨간 펜
    const wheel = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 18), dark, { y: 0.2, rz: Math.PI / 2 });
    body.add(wheel);
    body.add(mesh(new THREE.CapsuleGeometry(0.28, 0.5, 6, 14), shell, { y: 0.85 }));
    body.add(mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.06, 18), accent, { y: 0.62 }));
    const head = new THREE.Group(); head.position.y = 1.32; body.add(head);
    head.add(mesh(new THREE.SphereGeometry(0.24, 18, 14), shell));
    head.add(mesh(new THREE.SphereGeometry(0.2, 16, 12, -Math.PI * 0.35, Math.PI * 0.7, Math.PI * 0.3, Math.PI * 0.4), dark, { z: 0.06 }));
    eyes(head, 0.02, 0.23, 0.055);
    const arm = new THREE.Group(); arm.position.set(0.3, 0.98, 0); body.add(arm);
    arm.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.36, 8), toon('#B9BEC4'), { y: -0.18 }));
    arm.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 8), accent, { y: -0.4, z: 0.06, rx: 0.6 }));
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 6);
      wheel.rotation.x += dt * walkAmt * 18;
      body.rotation.x = walkAmt * 0.12 + Math.sin(t * 1.5 + phase) * 0.02;
      arm.rotation.x = -0.5 - (1 - walkAmt) * Math.max(0, Math.sin(t * 3)) * 0.4; // 쉬는 동안엔 빨간 펜으로 표시
      head.rotation.y = Math.sin(t * 0.6 + phase) * 0.35 * (1 - walkAmt);
    };
  } else if (spec.robot === 'printer') {
    // 메모봇: 무한궤도 위 프린터 몸, 앞으로 종이가 줄줄 나옴
    const tracks = [-1, 1].map((s) => mesh(new THREE.CapsuleGeometry(0.1, 0.4, 4, 8), dark, { x: s * 0.28, y: 0.12, rx: Math.PI / 2 }));
    tracks.forEach((m) => body.add(m));
    body.add(mesh(new THREE.BoxGeometry(0.62, 0.5, 0.56), shell, { y: 0.5 }));
    body.add(mesh(new THREE.BoxGeometry(0.5, 0.04, 0.1), dark, { y: 0.62, z: 0.28 }));
    const paper = mesh(new THREE.PlaneGeometry(0.4, 0.5), toon('#FBFAF6', { side: THREE.DoubleSide }), { y: 0.4, z: 0.33, rx: 0.3, cast: false });
    body.add(paper);
    const head = new THREE.Group(); head.position.y = 0.95; body.add(head);
    head.add(mesh(new THREE.BoxGeometry(0.36, 0.26, 0.3), toon('#F4F1EA')));
    head.add(mesh(new THREE.BoxGeometry(0.3, 0.16, 0.02), dark, { z: 0.16 }));
    eyes(head, 0.0, 0.175, 0.05);
    [-1, 1].forEach((s) => head.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), dark, { x: s * 0.2, rz: Math.PI / 2 }))); // 헤드폰처럼 듣는 귀
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 6);
      const k = (t * 0.5 + phase) % 1;
      paper.scale.y = 0.2 + k * 0.8;
      paper.position.y = 0.6 - k * 0.22;
      body.position.y = Math.abs(Math.sin(t * 12)) * 0.01 * walkAmt;
      head.rotation.z = Math.sin(t * 1.3 + phase) * 0.08;
    };
  } else {
    // 지킴이: 키 큰 경비 로봇, 어깨 장갑, 가슴 방패 패널, 머리 위 점멸등
    const legs = [-1, 1].map((s) => {
      const hip = new THREE.Group(); hip.position.set(s * 0.14, 0.82, 0);
      hip.add(mesh(new THREE.BoxGeometry(0.14, 0.72, 0.16), shell, { y: -0.38 }));
      hip.add(mesh(new THREE.BoxGeometry(0.18, 0.1, 0.28), dark, { y: -0.78, z: 0.04 }));
      body.add(hip); return hip;
    });
    body.add(mesh(new THREE.BoxGeometry(0.56, 0.72, 0.36), shell, { y: 1.25 }));
    body.add(mesh(new THREE.BoxGeometry(0.34, 0.42, 0.04), accent, { y: 1.28, z: 0.19 }));
    body.add(mesh(new THREE.BoxGeometry(0.22, 0.04, 0.05), toon('#F4F1EA'), { y: 1.32, z: 0.215, cast: false }));
    [-1, 1].forEach((s) => body.add(mesh(new THREE.SphereGeometry(0.15, 12, 8), toon('#55606A'), { x: s * 0.32, y: 1.56, s: [1, 0.7, 1] })));
    const arms = [-1, 1].map((s) => {
      const sh = new THREE.Group(); sh.position.set(s * 0.36, 1.52, 0);
      sh.add(mesh(new THREE.BoxGeometry(0.11, 0.62, 0.12), shell, { y: -0.32 }));
      body.add(sh); return sh;
    });
    const head = new THREE.Group(); head.position.y = 1.86; body.add(head);
    head.add(mesh(new THREE.BoxGeometry(0.36, 0.3, 0.32), toon('#55606A')));
    head.add(mesh(new THREE.BoxGeometry(0.3, 0.07, 0.02), glow, { z: 0.165, cast: false }));
    const lamp = mesh(new THREE.SphereGeometry(0.05, 8, 6), toon('#FF5A3C', { emissive: 0xFF3B1F, emissiveIntensity: 1.2 }), { y: 0.22, cast: false });
    head.add(lamp);
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 8);
      phase += dt * (5 + 3 * walkAmt) * (walkAmt > 0.05 ? 1 : 0.1);
      const sw = Math.sin(phase) * 0.45 * walkAmt;
      legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
      arms[0].rotation.x = -sw * 0.6; arms[1].rotation.x = sw * 0.6;
      body.position.y = Math.abs(Math.cos(phase)) * 0.03 * walkAmt;
      head.rotation.y = Math.sin(t * 0.8) * 0.5 * (1 - walkAmt);
      lamp.visible = Math.sin(t * 4) > 0;
    };
  }
  if (spec.scale) g.scale.setScalar(spec.scale);
  g.traverse((o) => { if (o.isMesh && o.castShadow !== false) o.castShadow = true; });
  return { group: g, update };
}
