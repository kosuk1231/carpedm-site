// 코드로 빚은 사람들: 장수 10명과 방문자.
// 몸은 기본 도형(원기둥·캡슐·구)으로 쌓고, 다리·팔·도포 자락을 움직여 실제로 걷는 것처럼 보이게 합니다.
// 모든 인물은 몸 앞이 +Z 방향입니다.

export const PEOPLE = {
  main:       { robe: '#F1ECE0', trim: '#7FA6C9', hat: 'jin', hatColor: '#2E3440', beard: 'goatee', item: 'fan' },
  developer:  { robe: '#E6DFD0', trim: '#6E747A', hat: 'topknot', armor: '#B4BAC2', item: 'hammer' },
  critic:     { robe: '#29313F', trim: '#4E6A90', hat: 'guan', hatColor: '#1E222A', beard: 'goatee', item: 'scroll' },
  researcher: { robe: '#C8C0A2', trim: '#6E8A4E', hat: 'straw', item: 'map', pack: true },
  writer:     { robe: '#B23A2E', trim: '#F1E4C8', hat: 'topknot', ribbon: '#C8402E', item: 'brush' },
  editor:     { robe: '#2F6B4A', trim: '#C9A24A', hat: 'jin', hatColor: '#2A5A3E', beard: 'long', skin: '#D99C80', item: 'book' },
  trainer:    { robe: '#D6B26A', trim: '#5A4630', hat: 'guan', hatColor: '#3A2E22', beard: 'goatee', item: 'point' },
  minutes:    { robe: '#B89A6E', trim: '#5C4630', hat: 'topknot', item: 'slips', messy: true },
  brief:      { robe: '#E8DFCB', trim: '#3E8A86', hat: 'guan', hatColor: '#2A3A38', item: 'envelope' },
  local:      { robe: '#3A3A42', trim: '#B48A3A', hat: 'helmet', armor: '#55565E', beard: 'full', item: 'shield' },
  visitor:    { modern: true, shirt: '#F5F2EA', pants: '#CDB892', item: 'notebook' },
};

const SKIN = '#F0CFA6';
const HAIR = '#1F1A17';

export function makePerson(THREE, kit, spec) {
  const { toon, mesh } = kit;
  const g = new THREE.Group();
  const body = new THREE.Group();       // 걸을 때 위아래로 들썩이는 몸통
  g.add(body);
  const skin = toon(spec.skin || SKIN);
  const hair = toon(HAIR);
  const robe = toon(spec.modern ? spec.shirt : spec.robe);
  const trim = toon(spec.trim || '#3B2F22');
  const shoe = toon('#2A2420');
  const lower = toon(spec.modern ? spec.pants : spec.robe);

  // 다리(엉덩이에서 흔들림)
  const legs = [-1, 1].map((side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.1, 0.72, 0);
    hip.add(mesh(new THREE.CapsuleGeometry(0.075, 0.5, 4, 8), spec.modern ? lower : toon('#4A4038'), { y: -0.33 }));
    hip.add(mesh(new THREE.BoxGeometry(0.13, 0.08, 0.22), shoe, { y: -0.68, z: 0.04 }));
    body.add(hip);
    return hip;
  });

  if (spec.modern) {
    // 현대 옷차림: 셔츠, 벨트, 바지
    body.add(mesh(new THREE.CylinderGeometry(0.2, 0.19, 0.5, 12), robe, { y: 1.12 }));
    body.add(mesh(new THREE.CylinderGeometry(0.195, 0.195, 0.07, 12), toon('#1F1C1A'), { y: 0.86 }));
    body.add(mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.16, 12), lower, { y: 0.76 }));
    body.add(mesh(new THREE.BoxGeometry(0.16, 0.12, 0.04), robe, { y: 1.33, z: 0.18, rx: 0.3 }));
  } else {
    // 도포: 아래로 퍼지는 치마폭 + 윗옷 + 띠
    const skirt = mesh(new THREE.CylinderGeometry(0.22, 0.38, 0.62, 14, 1, true), robe, { y: 0.62 });
    skirt.material = toon(spec.robe, { side: THREE.DoubleSide });
    body.add(skirt);
    body.add(mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.06, 14, 1, true), toon(spec.trim, { side: THREE.DoubleSide }), { y: 0.33 }));
    body.add(mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.5, 12), robe, { y: 1.15 }));
    body.add(mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.08, 12), trim, { y: 0.92 }));
    // 깃(가슴의 V자 여밈)
    body.add(mesh(new THREE.BoxGeometry(0.05, 0.36, 0.02), trim, { x: -0.05, y: 1.22, z: 0.205, rz: 0.45 }));
    body.add(mesh(new THREE.BoxGeometry(0.05, 0.36, 0.02), trim, { x: 0.05, y: 1.22, z: 0.205, rz: -0.45 }));
    body.userData.skirt = skirt;
  }
  if (spec.armor) {
    const a = toon(spec.armor);
    body.add(mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.42, 10), a, { y: 1.13 }));
    [-1, 1].forEach((s) => body.add(mesh(new THREE.SphereGeometry(0.12, 10, 8), a, { x: s * 0.26, y: 1.38, s: [1, 0.7, 1] })));
    body.add(mesh(new THREE.CylinderGeometry(0.33, 0.4, 0.3, 10, 1, true), toon(spec.armor, { side: THREE.DoubleSide }), { y: 0.78 }));
  }

  // 팔(어깨에서 흔들림), 소매는 넓게
  const arms = [-1, 1].map((side) => {
    const sh = new THREE.Group();
    sh.position.set(side * 0.27, 1.36, 0);
    sh.rotation.z = side * 0.06;
    const sleeve = spec.modern ? new THREE.CylinderGeometry(0.06, 0.07, 0.42, 8) : new THREE.CylinderGeometry(0.07, 0.12, 0.44, 8);
    sh.add(mesh(sleeve, robe, { y: -0.22 }));
    sh.add(mesh(new THREE.SphereGeometry(0.055, 8, 6), skin, { y: -0.47 }));
    body.add(sh);
    return sh;
  });

  // 머리
  const head = new THREE.Group();
  head.position.y = 1.62;
  body.add(head);
  head.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), skin, { y: -0.04 }));
  head.add(mesh(new THREE.SphereGeometry(0.19, 16, 12), skin, { y: 0.17 }));
  [-1, 1].forEach((s) => head.add(mesh(new THREE.SphereGeometry(0.022, 6, 6), toon('#1A1410'), { x: s * 0.065, y: 0.19, z: 0.172, cast: false })));
  head.add(mesh(new THREE.SphereGeometry(0.195, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, { y: 0.19, rx: -0.35 }));
  if (!spec.modern && spec.hat !== 'helmet' && spec.hat !== 'straw') {
    // 뒤로 늘어뜨린 머리
    head.add(mesh(new THREE.CapsuleGeometry(0.11, 0.22, 4, 8), hair, { y: 0.02, z: -0.12, rx: 0.2 }));
  }
  if (spec.modern) head.add(mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), hair, { y: 0.21, z: 0.02, rx: -0.15 }));

  // 관모
  const hatColor = toon(spec.hatColor || '#2A2420');
  if (spec.hat === 'jin') {
    head.add(mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.2, 10), hatColor, { y: 0.4, rx: -0.12 }));
    head.add(mesh(new THREE.BoxGeometry(0.03, 0.26, 0.015), toon(spec.trim), { x: 0.09, y: 0.24, z: -0.17, rx: 0.4 }));
    head.add(mesh(new THREE.BoxGeometry(0.03, 0.26, 0.015), toon(spec.trim), { x: -0.09, y: 0.24, z: -0.17, rx: 0.4 }));
  } else if (spec.hat === 'guan') {
    head.add(mesh(new THREE.BoxGeometry(0.14, 0.16, 0.2), hatColor, { y: 0.4 }));
    head.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), toon('#C9A24A'), { y: 0.41, rx: Math.PI / 2 }));
  } else if (spec.hat === 'topknot') {
    head.add(mesh(new THREE.SphereGeometry(spec.messy ? 0.1 : 0.08, 10, 8), hair, { y: 0.4, z: -0.02 }));
    if (spec.ribbon) head.add(mesh(new THREE.BoxGeometry(0.04, 0.22, 0.01), toon(spec.ribbon), { y: 0.3, z: -0.12, rx: 0.5 }));
  } else if (spec.hat === 'straw') {
    head.add(mesh(new THREE.ConeGeometry(0.42, 0.2, 18), toon('#D9B96A'), { y: 0.38 }));
  } else if (spec.hat === 'helmet') {
    head.add(mesh(new THREE.SphereGeometry(0.21, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), toon(spec.armor), { y: 0.19 }));
    head.add(mesh(new THREE.ConeGeometry(0.035, 0.22, 6), toon('#B23A2E'), { y: 0.48 }));
  }
  // 수염
  if (spec.beard === 'goatee') head.add(mesh(new THREE.ConeGeometry(0.045, 0.14, 6), hair, { y: 0.02, z: 0.15, rx: Math.PI }));
  if (spec.beard === 'long') head.add(mesh(new THREE.ConeGeometry(0.1, 0.42, 8), hair, { y: -0.12, z: 0.13, rx: Math.PI - 0.15 }));
  if (spec.beard === 'full') head.add(mesh(new THREE.ConeGeometry(0.11, 0.2, 8), hair, { y: 0.02, z: 0.12, rx: Math.PI - 0.2 }));

  // 손에 든 것(오른손 = arms[1]의 손끝)
  const hand = new THREE.Group();
  hand.position.y = -0.5;
  arms[1].add(hand);
  const left = new THREE.Group();
  left.position.y = -0.45;
  arms[0].add(left);
  const item = spec.item;
  if (item === 'fan') {
    hand.add(mesh(new THREE.CircleGeometry(0.2, 12, 0, Math.PI), toon('#F7F4EC', { side: THREE.DoubleSide }), { y: 0.05, z: 0.1, rx: -0.2, rz: Math.PI / 2 }));
    hand.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), toon('#6B4A2E'), { z: 0.08 }));
  } else if (item === 'hammer') {
    hand.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 6), toon('#6B4A2E'), { y: -0.05, z: 0.04 }));
    hand.add(mesh(new THREE.BoxGeometry(0.16, 0.08, 0.08), toon('#5A5E64'), { y: -0.25, z: 0.04 }));
  } else if (item === 'scroll' || item === 'map') {
    hand.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), toon('#EFE4C6'), { z: 0.12, rz: Math.PI / 2 }));
  } else if (item === 'brush') {
    hand.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), toon('#5A3A22'), { y: 0.08, z: 0.06 }));
    hand.add(mesh(new THREE.ConeGeometry(0.02, 0.06, 6), toon('#111111'), { y: -0.09, z: 0.06, rx: Math.PI }));
  } else if (item === 'book') {
    left.add(mesh(new THREE.BoxGeometry(0.2, 0.26, 0.05), toon('#7A2E22'), { z: 0.12, rx: -0.3 }));
    hand.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 6), toon('#B23A2E'), { z: 0.08, rx: 0.4 }));
  } else if (item === 'point') {
    arms[1].userData.raise = 1.1; // 설명하는 손짓
  } else if (item === 'slips') {
    left.add(mesh(new THREE.BoxGeometry(0.26, 0.2, 0.04), toon('#C9A86A'), { z: 0.12, rx: -0.4 }));
    hand.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 6), toon('#5A3A22'), { z: 0.08, rx: 0.5 }));
  } else if (item === 'envelope') {
    hand.add(mesh(new THREE.BoxGeometry(0.18, 0.12, 0.02), toon('#F4EAD2'), { z: 0.1 }));
    hand.add(mesh(new THREE.CircleGeometry(0.025, 8), toon('#B23A2E'), { z: 0.112 }));
  } else if (item === 'shield') {
    left.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 16), toon('#4A3A2A'), { x: -0.08, z: 0.06, rz: Math.PI / 2, ry: 0.3 }));
    left.add(mesh(new THREE.TorusGeometry(0.18, 0.025, 6, 16), toon('#B48A3A'), { x: -0.11, z: 0.06, ry: Math.PI / 2 + 0.3 }));
    hand.add(mesh(new THREE.TorusGeometry(0.05, 0.015, 6, 12), toon('#C9A24A'), { z: 0.05 }));
  } else if (item === 'notebook') {
    hand.add(mesh(new THREE.BoxGeometry(0.16, 0.22, 0.04), toon('#8A6440'), { z: 0.1, rx: -0.2 }));
  }
  if (spec.pack) body.add(mesh(new THREE.BoxGeometry(0.3, 0.34, 0.16), toon('#8A7450'), { y: 1.12, z: -0.26 }));

  // 발밑 그림자 대신 실제 그림자를 드리웁니다(바닥이 그림자를 받음).
  let phase = rand0();
  let walkAmt = 0;
  const update = (dt, speed, t) => {
    walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 8);
    phase += dt * (6 + 5 * walkAmt) * (walkAmt > 0.05 ? 1 : 0.15);
    const swing = Math.sin(phase) * 0.6 * walkAmt;
    legs[0].rotation.x = swing;
    legs[1].rotation.x = -swing;
    const raise = arms[1].userData.raise || 0;
    arms[0].rotation.x = -swing * 0.8;
    arms[1].rotation.x = swing * 0.8 * (1 - (raise ? 0.7 : 0)) - raise * (1 - walkAmt) - (1 - walkAmt) * (item === 'fan' || item === 'scroll' || item === 'envelope' || item === 'notebook' ? 0.6 : 0);
    if (item === 'book' || item === 'slips' || item === 'shield') arms[0].rotation.x = -swing * 0.5 - (1 - walkAmt) * 0.7;
    body.position.y = Math.abs(Math.cos(phase)) * 0.05 * walkAmt + Math.sin(t * 1.6 + phase) * 0.006 * (1 - walkAmt);
    body.rotation.z = Math.sin(phase) * 0.03 * walkAmt;
    if (body.userData.skirt) body.userData.skirt.rotation.x = swing * 0.12;
    head.rotation.y = Math.sin(t * 0.4 + phase * 0.1) * 0.15 * (1 - walkAmt);
  };
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, update };
}

let seedN = 0;
function rand0() { seedN += 1; const s = Math.sin(seedN * 91.7) * 4375.85; return (s - Math.floor(s)) * 6; }
