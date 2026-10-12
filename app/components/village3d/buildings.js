// CARPEDM 캠퍼스 건물 일곱 채. 모두 코드로 짓고, 입구가 +X 쪽을 봅니다(정문만 +Z, 담장 밖을 봄).
// 반환: { group, height(간판 높이), update?(t, dt) }

import { boardCanvas, rand } from './kit';

function signCanvas(text, sub, { bg = '#1E2B2A', fg = '#F4EEDF', accent = '#E0995A' } = {}) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 512, 128);
  g.fillStyle = accent; g.fillRect(0, 0, 12, 128);
  g.fillStyle = fg; g.font = '800 58px Pretendard, sans-serif'; g.textBaseline = 'middle';
  g.fillText(text, 36, sub ? 52 : 64);
  if (sub) { g.font = '500 24px Pretendard, sans-serif'; g.fillStyle = 'rgba(244,238,223,.75)'; g.fillText(sub, 38, 100); }
  return c;
}

function screenCanvas(seed) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 144;
  const g = c.getContext('2d');
  g.fillStyle = '#0F1E24'; g.fillRect(0, 0, 256, 144);
  g.strokeStyle = '#4FD1C5'; g.lineWidth = 3;
  g.beginPath();
  for (let i = 0; i <= 20; i++) { const x = 12 + i * 11.6, y = 100 - Math.sin(i * 0.6 + seed) * 22 - i * 2; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
  g.stroke();
  for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#E0995A' : '#7FB3D5'; g.fillRect(16 + i * 38, 120 - (10 + rand(seed + i) * 40), 22, 10 + rand(seed + i) * 40); }
  g.fillStyle = '#F4EEDF'; g.font = '700 16px Pretendard, sans-serif'; g.fillText('CARPEDM · LIVE', 14, 22);
  return c;
}

export function buildBuilding(THREE, kit, key) {
  const { toon, mesh, canvasTex, track } = kit;
  const g = new THREE.Group();
  const add = (...ms) => ms.forEach((m) => g.add(m));
  const box = (w, h, d, mat, o = {}) => mesh(new THREE.BoxGeometry(w, h, d), mat, o);
  const cyl = (rt, rb, h, mat, o = {}, seg = 12) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, o);
  const concrete = toon('#E6E1D6');
  const darkFrame = toon('#2E3436');
  const wood = toon('#B98A5A');
  const deck = toon('#9C7650');
  const glass = track(new THREE.MeshStandardMaterial({ color: '#9FC6CF', roughness: 0.3, transparent: true, opacity: 0.55, emissive: '#2A4A52', emissiveIntensity: 0.25 }));
  const warm = toon('#FFE2A8', { emissive: 0xFFB45A, emissiveIntensity: 0.9 });
  const accent = toon('#E0995A');
  const teal = toon('#43706A');
  const leaf = toon('#6E9A55');
  let update = null;
  let height = 3;

  // 공통 조각
  const base = (w, d) => add(box(w, 0.16, d, toon('#CFC8BA'), { y: 0.08 }));
  const glassWall = (w, h, x, y, z, ry = 0) => {
    const grp = new THREE.Group();
    grp.position.set(x, y, z); grp.rotation.y = ry;
    grp.add(mesh(new THREE.BoxGeometry(0.06, h, w), glass, { cast: false }));
    const n = Math.max(2, Math.round(w / 0.9));
    for (let i = 0; i <= n; i++) grp.add(mesh(new THREE.BoxGeometry(0.08, h, 0.06), darkFrame, { z: -w / 2 + (w / n) * i }));
    grp.add(mesh(new THREE.BoxGeometry(0.08, 0.06, w), darkFrame, { y: h / 2 }));
    grp.add(mesh(new THREE.BoxGeometry(0.08, 0.06, w), darkFrame, { y: -h / 2 }));
    return grp;
  };
  const slats = (w, h, x, y, z, ry = 0, step = 0.18) => {
    const grp = new THREE.Group();
    grp.position.set(x, y, z); grp.rotation.y = ry;
    for (let i = 0; i < Math.floor(w / step); i++) grp.add(mesh(new THREE.BoxGeometry(0.06, h, 0.08), wood, { z: -w / 2 + i * step + step / 2 }));
    return grp;
  };
  const solar = (w, d, y, tilt = 0.25) => {
    const grp = new THREE.Group();
    grp.position.y = y;
    const panel = toon('#2B4A6B', { emissive: 0x1A3350, emissiveIntensity: 0.3 });
    const cols = Math.floor(w / 0.8), rows = Math.floor(d / 0.7);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) grp.add(mesh(new THREE.BoxGeometry(0.72, 0.04, 0.6), panel, { x: -w / 2 + 0.4 + i * 0.8, y: 0.15, z: -d / 2 + 0.35 + j * 0.7, rz: tilt }));
    return grp;
  };
  const planter = (x, y, z, r = 0.3) => {
    add(cyl(r, r * 0.85, 0.3, toon('#8A8378'), { x, y: y + 0.15, z }));
    add(mesh(new THREE.IcosahedronGeometry(r * 1.1, 1), leaf, { x, y: y + 0.45, z }));
  };
  const sign = (text, sub, w, x, y, z, ry = Math.PI / 2) => add(mesh(new THREE.PlaneGeometry(w, w / 4), toon('#ffffff', { map: canvasTex(signCanvas(text, sub)) }), { x, y, z, ry, cast: false }));
  const door = (x, y, w = 0.9, h = 1.3) => {
    add(box(0.07, h, w, glass, { x, y }));
    add(box(0.1, 0.08, w + 0.1, darkFrame, { x, y: y + h / 2 }));
    add(box(0.5, 0.06, w + 0.4, darkFrame, { x: x + 0.25, y: y + h / 2 + 0.12 })); // 차양
  };

  if (key === 'gate') {
    // 웰컴 게이트: 담장 남쪽 가운데. 두 기둥 위에 떠 있는 캐노피, CARPEDM 간판, 개찰구, 방문증 키오스크.
    const H = 3.6;
    [-1, 1].forEach((s) => {
      add(box(1.2, H, 1.6, concrete, { x: s * 2.0, y: H / 2 }));
      add(slats(1.5, H - 0.6, s * 2.0 + s * 0.62, H / 2, 0, 0, 0.2));
    });
    add(box(6.4, 0.32, 2.6, toon('#F2EEE6'), { y: H + 0.16 }));
    add(box(6.5, 0.06, 2.7, darkFrame, { y: H }));
    add(mesh(new THREE.PlaneGeometry(3.6, 0.9), toon('#ffffff', { map: canvasTex(signCanvas('CARPEDM', 'SEIZE THE DAY · 오늘을 붙잡는 팀')) }), { y: H + 0.85, z: 1.15, cast: false }));
    add(box(3.8, 1.1, 0.12, darkFrame, { y: H + 0.85, z: 1.08 }));
    // 개찰구
    for (const x of [-1.05, 1.05]) add(box(0.14, 0.9, 1.0, toon('#C9CDD0'), { x, y: 0.45 }), box(0.15, 0.05, 1.0, teal, { x, y: 0.93 }));
    // 방문증 키오스크
    add(box(0.5, 1.3, 0.35, toon('#F2EEE6'), { x: 2.0, y: 0.65, z: 1.25 }));
    add(mesh(new THREE.PlaneGeometry(0.38, 0.5), toon('#ffffff', { map: canvasTex(screenCanvas(3)) }), { x: 2.0, y: 1.0, z: 1.43, cast: false }));
    // 바닥 조명
    for (const s of [-1, 1]) add(box(0.08, 0.05, 2.4, warm, { x: s * 1.3, y: 0.03, cast: false }));
    height = H + 2.0;
  }

  if (key === 'academy') {
    // 아카데미: 계단식 강의실이 들여다보이는 유리 박스 + 목재 루버, 옥상 정원.
    base(4.4, 3.8);
    add(box(4.0, 0.2, 3.4, concrete, { y: 2.6 }));
    add(box(1.0, 2.4, 3.4, concrete, { x: -1.5, y: 1.36 }));
    add(glassWall(3.4, 2.3, 2.0, 1.3, 0));
    add(slats(3.0, 2.3, 0.5, 1.3, -1.72, Math.PI / 2, 0.22));
    add(glassWall(2.4, 2.3, 0.6, 1.3, 1.72, Math.PI / 2));
    // 안쪽 계단식 좌석과 화면
    for (let i = 0; i < 4; i++) add(box(0.6, 0.2 + i * 0.2, 2.6, toon(['#C26A4A', '#D9A23A', '#7A9A6A', '#5E7A94'][i]), { x: 1.4 - i * 0.55, y: 0.26 + i * 0.1 }));
    add(mesh(new THREE.PlaneGeometry(2.2, 1.2), toon('#ffffff', { map: canvasTex(boardCanvas(['AI와 일하기', '1. 작게 쪼개기', '2. 함께 만들기'])) }), { x: -0.98, y: 1.5, ry: Math.PI / 2, cast: false }));
    door(2.04, 0.82);
    // 옥상 정원
    for (let i = 0; i < 6; i++) planter(-1.4 + (i % 3) * 1.3, 2.7, -0.9 + Math.floor(i / 3) * 1.8, 0.28);
    add(box(4.0, 0.3, 0.06, darkFrame, { y: 2.9, z: 1.7 }));
    sign('아카데미', 'ACADEMY', 1.8, 2.06, 2.15, -0.6);
    height = 4.1;
  }

  if (key === 'consult') {
    // 컨설팅룸: 원형 유리 회의실 + 화이트보드 + 원탁
    base(3.6, 3.6);
    add(cyl(1.55, 1.55, 0.18, concrete, { y: 2.45 }, 28));
    add(mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.2, 28, 1, true), glass, { y: 1.33, cast: false }));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; add(box(0.07, 2.2, 0.07, darkFrame, { x: Math.cos(a) * 1.5, y: 1.33, z: Math.sin(a) * 1.5 })); }
    add(cyl(0.7, 0.7, 0.06, wood, { y: 0.92 }, 24), cyl(0.08, 0.12, 0.75, darkFrame, { y: 0.52 }));
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.3; add(box(0.32, 0.45, 0.32, toon(['#E0995A', '#43706A', '#5E7A94', '#C26A4A', '#D9A23A'][i]), { x: Math.cos(a) * 1.0, y: 0.4, z: Math.sin(a) * 1.0 })); }
    add(box(0.06, 1.0, 1.6, toon('#FBFAF6'), { x: -1.25, y: 1.4, ry: 0 }));
    add(mesh(new THREE.PlaneGeometry(1.4, 0.8), toon('#ffffff', { map: canvasTex(boardCanvas(['진단 3단계', '입문 → 심화', '→ 구축·운영'])) }), { x: -1.2, y: 1.4, ry: Math.PI / 2, cast: false }));
    add(cyl(1.0, 1.2, 0.12, leaf, { y: 2.6 }, 20));
    door(1.52, 0.82, 0.8, 1.2);
    sign('컨설팅룸', 'CONSULTING', 1.6, 1.6, 2.1, 0);
    height = 3.6;
  }

  if (key === 'lab') {
    // 빌드랩: 톱니 지붕(채광창) 공장형 메이커스페이스, 3D 프린터, 작업대, 돌아가는 로봇 팔.
    base(4.8, 3.6);
    add(box(4.4, 2.0, 3.2, toon('#D7DADB'), { y: 1.16 }));
    for (let i = 0; i < 4; i++) {
      add(mesh(new THREE.BoxGeometry(1.1, 0.05, 3.3), toon('#5E6E78'), { x: -1.65 + i * 1.1, y: 2.45, rz: 0.55 }));
      add(box(0.05, 0.62, 3.3, glass, { x: -1.15 + i * 1.1, y: 2.45, cast: false }));
    }
    add(glassWall(2.6, 1.6, 2.22, 1.0, -0.2));
    door(2.22, 0.82, 0.9, 1.3);
    // 바깥 작업대와 3D 프린터
    add(box(0.8, 0.08, 1.6, wood, { x: 3.0, y: 0.85, z: 1.0 }));
    for (const z of [0.3, 1.7]) add(box(0.06, 0.8, 0.06, darkFrame, { x: 3.0, y: 0.43, z }));
    add(box(0.4, 0.5, 0.4, darkFrame, { x: 3.0, y: 1.14, z: 0.6 }));
    add(box(0.32, 0.04, 0.32, toon('#4FD1C5', { emissive: 0x2AA198, emissiveIntensity: 0.8 }), { x: 3.0, y: 1.0, z: 0.6, cast: false }));
    // 로봇 팔
    const arm = new THREE.Group();
    arm.position.set(3.0, 0.9, 1.45);
    arm.add(cyl(0.1, 0.12, 0.12, accent));
    const seg1 = new THREE.Group(); seg1.position.y = 0.06; arm.add(seg1);
    seg1.add(box(0.08, 0.5, 0.08, accent, { y: 0.25 }));
    const seg2 = new THREE.Group(); seg2.position.y = 0.5; seg1.add(seg2);
    seg2.add(box(0.07, 0.4, 0.07, toon('#F2EEE6'), { y: 0.2 }));
    seg2.add(mesh(new THREE.SphereGeometry(0.06, 8, 6), darkFrame, { y: 0.42 }));
    g.add(arm);
    // 옥상 태양광
    add(solar(3.2, 2.0, 2.4, 0.3));
    add(box(0.6, 1.8, 0.6, toon('#9C948A'), { x: -1.7, y: 3.0, z: -1.2 })); // 환기탑
    update = (t) => {
      seg1.rotation.z = Math.sin(t * 1.3) * 0.6;
      seg2.rotation.z = Math.sin(t * 1.7 + 1) * 0.9;
      arm.rotation.y = t * 0.6;
    };
    sign('빌드랩', 'BUILD LAB', 1.6, 2.24, 2.1, 1.0);
    height = 4.2;
  }

  if (key === 'archive') {
    // 아카이브: 두 층 북카페. 아래층 통유리 너머 서가, 위층은 목재 루버, 테라스 파라솔.
    base(4.4, 3.6);
    add(box(3.8, 0.18, 3.2, concrete, { y: 1.95 }));
    add(glassWall(3.0, 1.75, 1.9, 1.04, 0));
    add(box(0.9, 1.75, 3.2, concrete, { x: -1.45, y: 1.04 }));
    // 서가
    for (let k = 0; k < 3; k++) {
      add(box(0.3, 1.5, 0.9, wood, { x: 0.2 - k * 0.6, y: 0.95, z: -0.9 }));
      for (let r = 0; r < 4; r++) add(box(0.24, 0.26, 0.8, toon(['#7A2E22', '#3E5A7A', '#C9A24A', '#5E8A55'][(k + r) % 4]), { x: 0.22 - k * 0.6, y: 0.4 + r * 0.33, z: -0.9 }));
    }
    add(box(3.2, 1.5, 2.8, toon('#EADCC0'), { x: -0.25, y: 2.8 }));
    add(slats(2.8, 1.5, 1.37, 2.8, 0, 0, 0.16));
    add(box(3.6, 0.14, 3.2, darkFrame, { x: -0.25, y: 3.62 }));
    door(1.94, 0.82, 0.9, 1.3);
    // 테라스 파라솔
    for (const [px, z] of [[3.0, -1.5], [2.6, -2.7]]) { // 입구 앞길을 비켜 남쪽 테라스에
      add(cyl(0.03, 0.03, 1.8, darkFrame, { x: px, y: 0.9, z }, 6));
      add(mesh(new THREE.ConeGeometry(0.8, 0.35, 10), toon(z > -2 ? '#E0995A' : '#43706A', { side: THREE.DoubleSide }), { x: px, y: 1.9, z }));
      add(cyl(0.35, 0.35, 0.05, wood, { x: px, y: 0.7, z }, 12));
    }
    sign('아카이브', 'ARCHIVE · 실무 노트', 1.8, 1.42, 2.8, -0.8);
    height = 4.6;
  }

  if (key === 'mission') {
    // 미션컨트롤: 노출 콘크리트 2층, 2층 전면 유리 너머 대형 화면들, 옥상 안테나.
    base(4.6, 4.0);
    add(box(4.2, 1.6, 3.6, concrete, { y: 0.96 }));
    add(glassWall(2.0, 1.2, 2.12, 0.85, 0.6));
    door(2.12, 0.82, 0.9, 1.3);
    add(box(4.6, 1.8, 3.8, toon('#3A4244'), { y: 2.66 }));
    add(glassWall(3.6, 1.5, 2.32, 2.66, 0));
    // 안쪽 화면 벽(빛남)
    const screens = [];
    for (let i = 0; i < 3; i++) {
      const tex = canvasTex(screenCanvas(i * 7));
      const m = mesh(new THREE.PlaneGeometry(1.0, 0.56), toon('#ffffff', { map: tex, emissive: 0xffffff, emissiveIntensity: 0.55 }), { x: 0.6, y: 2.7, z: -1.15 + i * 1.15, ry: Math.PI / 2, cast: false });
      add(m); screens.push(m);
    }
    // 옥상 안테나와 점멸등
    add(cyl(0.04, 0.06, 2.0, darkFrame, { x: -1.2, y: 4.55, z: -1.0 }, 6));
    const beaconLamp = mesh(new THREE.SphereGeometry(0.1, 10, 8), toon('#FF5A3C', { emissive: 0xFF3B1F, emissiveIntensity: 1.2 }), { x: -1.2, y: 5.6, z: -1.0, cast: false });
    add(beaconLamp);
    add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 20), toon('#E6E1D6'), { x: 0.9, y: 3.95, z: 0.9, rx: -0.6 }));
    add(solar(2.0, 1.4, 3.56, 0.25));
    update = (t) => { beaconLamp.visible = Math.sin(t * 3) > -0.3; };
    sign('미션컨트롤', 'MISSION CONTROL', 1.3, 2.13, 1.25, -1.2);
    height = 5.4;
  }

  if (key === 'lounge') {
    // 컨택 라운지: 루프탑 카페. 1층 카페, 옥상 테라스와 전구 줄, 큰 우체통 모양 문의함.
    base(4.0, 3.6);
    add(box(3.4, 1.8, 3.0, toon('#F2E3C6'), { y: 1.06 }));
    add(glassWall(2.4, 1.4, 1.72, 0.86, -0.1));
    door(1.72, 0.82, 0.8, 1.2);
    add(box(3.6, 0.14, 3.2, darkFrame, { y: 2.03 }));
    // 옥상 난간·테이블
    for (const z of [-1.55, 1.55]) add(box(3.6, 0.5, 0.05, glass, { y: 2.35, z, cast: false }));
    for (let i = 0; i < 3; i++) {
      add(cyl(0.3, 0.3, 0.05, wood, { x: -1.0 + i * 1.0, y: 2.55, z: 0 }, 12), cyl(0.04, 0.04, 0.45, darkFrame, { x: -1.0 + i * 1.0, y: 2.32, z: 0 }, 6));
    }
    // 전구 줄
    const bulbs = [];
    for (const z of [-1.4, 1.4]) {
      add(cyl(0.03, 0.03, 1.6, darkFrame, { x: -1.6, y: 2.9, z }, 6), cyl(0.03, 0.03, 1.6, darkFrame, { x: 1.6, y: 2.9, z }, 6));
      for (let i = 0; i < 9; i++) {
        const x = -1.6 + i * 0.4, y = 3.6 - Math.sin((i / 8) * Math.PI) * 0.3;
        const b = mesh(new THREE.SphereGeometry(0.06, 8, 6), warm, { x, y, z, cast: false });
        add(b); bulbs.push(b);
      }
    }
    // 문의함(우체통)
    add(cyl(0.3, 0.3, 0.9, toon('#C8402E'), { x: 2.4, y: 0.6, z: 1.2 }, 16));
    add(mesh(new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#C8402E'), { x: 2.4, y: 1.05, z: 1.2 }));
    add(box(0.05, 0.06, 0.3, darkFrame, { x: 2.7, y: 0.85, z: 1.2 }));
    update = (t) => bulbs.forEach((b, i) => { b.scale.setScalar(0.85 + Math.sin(t * 2 + i) * 0.15); });
    sign('컨택 라운지', 'CONTACT', 1.8, 1.74, 1.7, 0.8);
    height = 4.2;
  }

  return { group: g, height, update };
}
