// 코드로 빚은 CARPEDM 캠퍼스 사람들과 로봇. 카드 그림(클레이 피규어)과 같은 인상을 내도록
// 3등신 비율(큰 머리, 작은 몸), 큰 눈과 볼터치, 부드러운 클레이 재질로 만듭니다.
// 모든 인물은 몸 앞이 +Z 방향입니다. update(dt, v, t) 의 v 는 초당 이동 거리(월드 단위).

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

// 관절이 있는 3D 클레이 인물. 뼈대: 골반 → 허벅지 → 무릎 → 정강이 → 발목 → 발, 척추 → 어깨 → 위팔 → 팔꿈치 → 아래팔 → 손, 목 → 머리.
// 걸음은 실제 보행 곡선으로 움직입니다: 엉덩이 굽힘, 흔드는 다리의 무릎 굽힘, 발 디딤(뒤꿈치→발끝),
// 디딘 발이 땅에 붙도록 골반 높이 계산, 골반 비틀림과 반대로 도는 가슴, 다리와 엇갈리는 팔.
// 걸음 수는 실제 이동 속도에 맞춰 계산해 발이 미끄러지지 않습니다. 빠르면 가볍게 뜁니다.
// update(dt, v, t): v 는 초당 이동 거리(월드 단위).
const THIGH = 0.28, SHIN = 0.27, ANKLE = 0.07;
const HIP_H = THIGH + SHIN + ANKLE;
const smooth = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

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
  const joint = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const g = new THREE.Group();
  const pelvis = joint(g, 0, HIP_H, 0);
  const skin = clay('#F6D7BC', { rough: 0.8 });
  const hair = clay(spec.hairColor || '#2A1E18', { rough: 0.6 });
  const shirt = clay(spec.shirt);
  const pants = clay(spec.pants);
  const jacket = spec.jacket ? clay(spec.jacket) : null;
  const shoe = clay('#F1E9DC');
  const sole = clay('#B9AE9C');

  // 골반(바지 윗부분)
  pelvis.add(mesh(new THREE.CapsuleGeometry(0.15, 0.06, 6, 14), pants, { y: 0.03, s: [1.05, 1, 0.8] }));

  // 다리: 허벅지·정강이를 따로 두고 무릎에서 꺾음
  const legs = [-1, 1].map((side) => {
    const hip = joint(pelvis, side * 0.085, 0, 0);
    hip.add(mesh(new THREE.CapsuleGeometry(0.075, THIGH - 0.08, 4, 12), pants, { y: -THIGH / 2 }));
    const knee = joint(hip, 0, -THIGH, 0);
    knee.add(mesh(new THREE.SphereGeometry(0.072, 12, 10), pants, {}));
    knee.add(mesh(new THREE.CapsuleGeometry(0.068, SHIN - 0.08, 4, 12), pants, { y: -SHIN / 2 }));
    const ankle = joint(knee, 0, -SHIN, 0);
    ankle.add(mesh(new THREE.CapsuleGeometry(0.058, 0.1, 4, 10), shoe, { y: -0.035, z: 0.045, rx: Math.PI / 2, s: [1.1, 1, 0.9] }));
    ankle.add(mesh(new THREE.BoxGeometry(0.11, 0.02, 0.2), sole, { y: -0.068, z: 0.045, cast: false }));
    return { hip, knee, ankle };
  });

  // 상체: 척추 관절 위에 몸통·팔·머리
  const spine = joint(pelvis, 0, 0.06, 0);
  const chest = joint(spine, 0, 0, 0);
  chest.add(mesh(new THREE.CapsuleGeometry(0.165, 0.16, 6, 14), shirt, { y: 0.19, s: [1, 1, 0.8] }));
  if (jacket) {
    chest.add(mesh(new THREE.CylinderGeometry(0.18, 0.19, 0.3, 16, 1, true, Math.PI * 0.68, Math.PI * 1.64), clay(spec.jacket, { side: THREE.DoubleSide }), { y: 0.2, s: [1, 1, 0.84] }));
    for (const s of [-1, 1]) chest.add(mesh(new THREE.BoxGeometry(0.05, 0.2, 0.02), jacket, { x: s * 0.07, y: 0.25, z: 0.14, rz: s * 0.35 }));
  }
  chest.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.035, 14), clay('#6B4A32'), { y: 0.0, s: [1, 1, 0.82] }));
  if (spec.lanyard) {
    chest.add(mesh(new THREE.TorusGeometry(0.085, 0.008, 4, 16, Math.PI), clay('#3E8A86'), { y: 0.33, z: 0.07, rx: Math.PI / 2 + 0.7, rz: Math.PI }));
    chest.add(mesh(new THREE.BoxGeometry(0.06, 0.08, 0.01), clay('#FBFAF6'), { y: 0.17, z: 0.14 }));
  }
  if (spec.backpack) chest.add(mesh(new THREE.CapsuleGeometry(0.12, 0.1, 4, 10), clay('#3A3F44'), { y: 0.2, z: -0.17 }));

  // 팔: 어깨 → 위팔 → 팔꿈치 → 아래팔 → 손
  const sleeve = jacket || shirt;
  const arms = [-1, 1].map((side) => {
    const shoulder = joint(chest, side * 0.2, 0.32, 0);
    shoulder.add(mesh(new THREE.SphereGeometry(0.058, 10, 8), sleeve, {}));
    shoulder.add(mesh(new THREE.CapsuleGeometry(0.05, 0.1, 4, 10), sleeve, { y: -0.08 }));
    const elbow = joint(shoulder, 0, -0.17, 0);
    elbow.add(mesh(new THREE.CapsuleGeometry(0.046, 0.09, 4, 10), sleeve, { y: -0.07 }));
    const hand = joint(elbow, 0, -0.17, 0);
    hand.add(mesh(new THREE.SphereGeometry(0.05, 10, 8), skin, { s: [0.9, 1.1, 0.8] }));
    return { shoulder, elbow, hand };
  });

  // 머리: 목 관절 위 둥근 머리(약 3등신)
  const R = 0.27;
  const neck = joint(chest, 0, 0.4, 0);
  neck.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 10), skin, { y: 0.02 }));
  const head = joint(neck, 0, R + 0.03, 0);
  head.add(mesh(new THREE.SphereGeometry(R, 28, 22), skin, { s: [1, 0.96, 0.95] }));
  for (const s of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(R * 0.14, 10, 8), skin, { x: s * R * 0.97, y: -R * 0.05, s: [0.5, 1, 0.8] }));
  addFace(THREE, kit, clay, head, R, spec);
  addHair(THREE, mesh, clay, hair, head, R, spec);

  // 손에 든 것(오른손 = arms[1], 왼손 = arms[0])
  const item = spec.item;
  const rh = arms[1].hand, lh = arms[0].hand;
  if (item === 'tablet') rh.add(mesh(new THREE.BoxGeometry(0.15, 0.2, 0.02), clay('#4A4E54', { rough: 0.3 }), { y: -0.02, z: 0.06, rx: -0.3 }));
  else if (item === 'laptop') lh.add(mesh(new THREE.BoxGeometry(0.24, 0.17, 0.025), clay('#B9BEC4', { rough: 0.3 }), { y: -0.02, z: 0.06 }));
  else if (item === 'coffee') { rh.add(mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.09, 12), clay('#FBFAF6'), { y: 0.03, z: 0.04 })); rh.add(mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.025, 12), clay('#8A6440'), { y: 0.085, z: 0.04 })); }
  else if (item === 'notebook') rh.add(mesh(new THREE.BoxGeometry(0.13, 0.17, 0.03), clay('#3E7A5A'), { z: 0.06, rx: -0.2 }));
  else if (item === 'envelope') rh.add(mesh(new THREE.BoxGeometry(0.16, 0.11, 0.015), clay('#FBF3E2'), { z: 0.07 }));
  else if (item === 'box') rh.add(mesh(new THREE.BoxGeometry(0.22, 0.16, 0.2), clay('#C9A86A'), { z: 0.11 }));
  const holdR = ['tablet', 'coffee', 'notebook', 'envelope', 'box'].includes(item);
  const holdL = item === 'laptop';
  const pointer = item === 'point';

  // 발밑 접지 그림자(그림자 맵 위에 부드러운 어둠을 더해 땅에 붙어 보이게)
  const sh = document.createElement('canvas'); sh.width = sh.height = 64;
  const c2 = sh.getContext('2d'); const gr = c2.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(40,30,20,.35)'); gr.addColorStop(1, 'rgba(40,30,20,0)'); c2.fillStyle = gr; c2.fillRect(0, 0, 64, 64);
  const blob = new THREE.Mesh(kit.track(new THREE.PlaneGeometry(0.75, 0.6)), kit.track(new THREE.MeshBasicMaterial({ map: kit.track(new THREE.CanvasTexture(sh)), transparent: true, depthWrite: false })));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.02; blob.renderOrder = -1;
  g.add(blob);

  const seed = rand0();
  let phase = seed, vs = 0, look = 0, lookT = 0, lookTo = 0;
  const update = (dt, v, t) => {
    const S = g.scale.x;
    vs += ((v || 0) - vs) * Math.min(1, dt * 7);
    const amt = smooth(0.05, 0.55, vs);                 // 걷기 정도
    const run = smooth(2.4, 3.4, vs / S);               // 뛰기 정도
    const A = (0.34 + 0.11 * Math.min(vs / S, 2.0)) * (1 - run) + 0.7 * run; // 엉덩이 흔들림 폭(라디안)
    const legLen = THIGH + SHIN;
    const cycle = 4 * legLen * Math.sin(A) * S * (1 + run * 0.5); // 두 걸음에 나아가는 거리
    if (amt > 0.01) phase += (Math.PI * 2 * vs * dt) / Math.max(0.2, cycle);
    else phase += (Math.round(phase / Math.PI) * Math.PI - phase) * Math.min(1, dt * 4); // 멈추면 두 발을 모음

    // 다리
    let low = 0;
    const ext = [];
    legs.forEach((L, i) => {
      const ph = phase + i * Math.PI;
      const s = Math.sin(ph), c = Math.cos(ph);
      const flex = A * s * amt;                                           // + 면 다리가 앞으로
      const swing = Math.pow(Math.max(0, c), 1.5);                        // 흔드는 다리(뒤에서 앞으로)
      const knee = amt * (0.06 + 0.12 * Math.max(0, s) * Math.max(0, -c) + (0.95 + 0.8 * run) * swing) + run * 0.25;
      L.hip.rotation.x = -flex - run * 0.15;
      L.knee.rotation.x = knee;
      const toeOff = 0.55 * amt * Math.max(0, -s) * Math.max(0, c);        // 발끝으로 차고 나감
      const heel = -0.3 * amt * Math.max(0, s) * Math.max(0, -c);         // 뒤꿈치로 디딤
      L.ankle.rotation.x = -(L.hip.rotation.x + knee) + toeOff + heel;
      const a1 = L.hip.rotation.x, a2 = a1 + knee;
      ext.push(THIGH * Math.cos(a1) + SHIN * Math.cos(a2));
    });
    low = Math.max(ext[0], ext[1]);                                       // 디딘 다리가 땅에 닿게
    const flight = run * 0.07 * Math.max(0, Math.cos(phase * 2));
    pelvis.position.y = ANKLE + low + flight + (1 - amt) * Math.sin(t * 1.7 + seed) * 0.004;
    pelvis.position.x = (1 - amt) * Math.sin(t * 0.35 + seed) * 0.02;    // 서 있을 때 무게 이동
    pelvis.rotation.y = 0.16 * amt * Math.sin(phase) * (1 - run * 0.4);
    pelvis.rotation.z = 0.05 * amt * Math.cos(phase) + (1 - amt) * Math.sin(t * 0.35 + seed) * 0.03;
    // 상체: 골반과 반대로 돌고, 걸을 때 살짝 앞으로 기울임, 서 있으면 숨쉬기
    spine.rotation.y = -pelvis.rotation.y * 1.6;
    spine.rotation.x = 0.05 * amt + 0.22 * run;
    spine.rotation.z = -pelvis.rotation.z * 0.8;
    chest.scale.set(1, 1 + Math.sin(t * 1.6 + seed) * 0.012 * (1 - amt), 1);
    // 팔: 같은 쪽 다리와 엇갈려 흔듦
    arms.forEach((Ar, i) => {
      const ph = phase + i * Math.PI;
      const flexLeg = A * Math.sin(ph) * amt;
      let sw = flexLeg * (0.9 + run * 0.5);                    // 다리가 앞이면 팔은 뒤
      let el = -(0.18 + 0.3 * Math.max(0, -Math.sin(ph)) * amt + run * 1.2);
      const out = (i ? 1 : -1) * (0.1 + run * 0.08);
      if ((i === 1 && holdR) || (i === 0 && holdL)) { sw *= 0.25; el = -1.25; }
      if (i === 1 && pointer) { sw = sw * (1 - (1 - amt)) - (1 - amt) * (0.9 + Math.sin(t * 1.3 + seed) * 0.15); el = -0.3 * (1 - amt) + el * amt; }
      Ar.shoulder.rotation.x = sw + (1 - amt) * Math.sin(t * 1.6 + seed + i) * 0.03;
      Ar.shoulder.rotation.z = out;
      Ar.elbow.rotation.x = el;
    });
    // 머리: 걸을 땐 앞을 보도록 상체 비틀림을 되돌리고, 서 있으면 가끔 두리번거림
    if ((lookT -= dt) <= 0) { lookTo = (Math.random() - 0.5) * 1.1; lookT = 2 + Math.random() * 4; }
    look += (lookTo * (1 - amt) - look) * Math.min(1, dt * 3);
    neck.rotation.y = -spine.rotation.y - pelvis.rotation.y + look;
    neck.rotation.x = -spine.rotation.x * 0.6 + Math.sin(phase * 2) * 0.03 * amt;
    blob.scale.setScalar(1 - flight * 2);
  };
  if (spec.scale) g.scale.setScalar(spec.scale);
  g.scale.multiplyScalar(1.15);
  return { group: g, update };
}

// 머리카락: 뒤통수·윗머리를 덮는 캡 + 앞머리 + 스타일별 덩어리
function addHair(THREE, mesh, clay, hair, head, R, spec) {
  head.add(mesh(new THREE.SphereGeometry(R * 1.06, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, { y: R * 0.05, rx: -0.42 }));
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
  face.emissiveMap = face.map; face.emissiveIntensity = 0.8; // 화면만 빛나고 어두운 바탕은 그대로
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
      phase += dt * (speed || 0) * 5.2; // 이동 거리에 맞춘 걸음
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
    // 지킴이(환영 로봇): 크림색 둥근 몸, 살구색 관절, 하트 안테나, 웃는 화면 얼굴, 가슴의 청록 하트, 방문증을 든 손
    const shell = clay('#EFE3CC', { rough: 0.45 });
    const peach = clay('#F2A77E', { rough: 0.5 });
    const legs = [-1, 1].map((s) => {
      const hip = new THREE.Group(); hip.position.set(s * 0.13, 0.5, 0);
      hip.add(mesh(new THREE.SphereGeometry(0.08, 12, 10), peach, {}));
      hip.add(mesh(new THREE.CapsuleGeometry(0.075, 0.2, 4, 10), shell, { y: -0.2 }));
      hip.add(mesh(new THREE.CapsuleGeometry(0.1, 0.1, 4, 12), peach, { y: -0.44, z: 0.05, rx: Math.PI / 2, s: [1, 1, 0.8] }));
      body.add(hip); return hip;
    });
    body.add(mesh(new THREE.SphereGeometry(0.3, 24, 18), shell, { y: 0.78, s: [1, 1.05, 0.85] }));
    const heart = (sz, mat) => {
      const sh = new THREE.Shape();
      sh.moveTo(0, -sz); sh.bezierCurveTo(sz * 1.6, sz * 0.2, sz * 0.6, sz * 1.3, 0, sz * 0.45); sh.bezierCurveTo(-sz * 0.6, sz * 1.3, -sz * 1.6, sz * 0.2, 0, -sz);
      return new THREE.Mesh(kit.track(new THREE.ExtrudeGeometry(sh, { depth: sz * 0.5, bevelEnabled: true, bevelSize: sz * 0.15, bevelThickness: sz * 0.15, bevelSegments: 3 })), mat);
    };
    const chestHeart = heart(0.07, clay('#5FD3C2', { emissive: 0x2AA198, ei: 0.5 }));
    chestHeart.position.set(0, 0.8, 0.24); body.add(chestHeart);
    const arms = [-1, 1].map((s) => {
      const sh = new THREE.Group(); sh.position.set(s * 0.3, 0.92, 0);
      sh.add(mesh(new THREE.SphereGeometry(0.075, 12, 10), peach, {}));
      sh.add(mesh(new THREE.CapsuleGeometry(0.06, 0.2, 4, 10), shell, { y: -0.17 }));
      sh.add(mesh(new THREE.SphereGeometry(0.07, 12, 10), shell, { y: -0.34 }));
      body.add(sh); return sh;
    });
    const badge = new THREE.Group(); badge.position.set(0, -0.4, 0.06); arms[1].add(badge);
    badge.add(mesh(new THREE.BoxGeometry(0.16, 0.2, 0.02), clay('#FBFAF6'), { y: -0.06 }));
    badge.add(mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 14), clay('#3E9A8C'), { y: 0.07 }));
    // 머리: 둥근 헬멧 + 어두운 화면 얼굴 + 살구색 귀 + 하트 안테나
    const head = new THREE.Group(); head.position.y = 1.36; body.add(head);
    head.add(mesh(new THREE.SphereGeometry(0.34, 28, 22), shell, { s: [1.08, 0.92, 0.92] }));
    head.add(mesh(new THREE.SphereGeometry(0.348, 28, 22, Math.PI * 0.2, Math.PI * 0.6, Math.PI * 0.28, Math.PI * 0.44), face, { s: [1.08, 0.92, 0.92], cast: false }));
    for (const s of [-1, 1]) head.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 18), peach, { x: s * 0.36, rz: Math.PI / 2 }));
    head.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.14, 6), peach, { y: 0.36 }));
    const top = heart(0.06, peach); top.position.set(0, 0.46, -0.015); head.add(top);
    update = (dt, speed, t) => {
      walkAmt += (Math.min(1, speed) - walkAmt) * Math.min(1, dt * 8);
      phase += dt * (speed || 0) * 5.2; // 이동 거리에 맞춘 걸음
      const sw = Math.sin(phase) * 0.45 * walkAmt;
      legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
      // 서 있으면 왼손을 들어 손 흔들기
      arms[0].rotation.x = sw * 0.7 * walkAmt - (1 - walkAmt) * 2.5;
      arms[0].rotation.z = -(1 - walkAmt) * (0.35 + Math.sin(t * 6) * 0.3);
      arms[1].rotation.x = -sw * 0.5 - 0.5;
      body.position.y = Math.abs(Math.cos(phase)) * 0.04 * walkAmt;
      body.rotation.z = Math.sin(phase) * 0.05 * walkAmt;
      head.rotation.z = Math.sin(t * 1.4) * 0.08 * (1 - walkAmt);
      top.rotation.y = Math.sin(t * 2) * 0.5;
    };
  }
  if (spec.scale) g.scale.setScalar(spec.scale);
  g.scale.multiplyScalar(1.15);
  g.traverse((o) => { if (o.isMesh && o.castShadow !== false) o.castShadow = true; });
  return { group: g, update };
}
