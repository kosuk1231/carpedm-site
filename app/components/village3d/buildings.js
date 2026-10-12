// 코드로 짓는 융중 마을 건물 여섯 채. 모두 입구가 +X 쪽을 봅니다.
// 반환: { group, height(간판 높이), update?(t, dt) }

import { boardCanvas, rand } from './kit';

export function buildBuilding(THREE, kit, key) {
  const { toon, mesh, curvedRoof, tileTex, canvasTex } = kit;
  const g = new THREE.Group();
  const wood = toon('#6B4A2E');
  const darkWood = toon('#4A3220');
  const stone = toon('#B9AE96');
  const plaster = toon('#EADCC0');
  const red = toon('#A8392A');
  const add = (...ms) => ms.forEach((m) => g.add(m));
  const box = (w, h, d, mat, o = {}) => mesh(new THREE.BoxGeometry(w, h, d), mat, o);
  const cyl = (rt, rb, h, mat, o = {}, seg = 10) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, o);
  const roofMat = (base, line) => toon('#ffffff', { map: tileTex(base, line), side: THREE.DoubleSide });
  let update = null;
  let height = 3;

  // 공통: 돌 기단과 앞 계단
  const platform = (w, d, h = 0.28) => {
    add(box(w, h, d, stone, { y: h / 2 }));
    for (let i = 0; i < 2; i++) add(box(0.3, h * (1 - i * 0.5), 1.0, stone, { x: w / 2 + 0.15 + i * 0.3, y: (h * (1 - i * 0.5)) / 2 }));
  };
  const door = (x, y, w = 0.6, h = 0.95, mat = darkWood) => {
    add(box(0.06, h, w, mat, { x, y }));
    add(box(0.07, 0.08, w + 0.16, wood, { x, y: y + h / 2 + 0.04 }));
  };
  const lantern = (x, y, z) => {
    add(cyl(0.012, 0.012, 0.25, wood, { x, y: y + 0.2, z }, 4));
    add(mesh(new THREE.SphereGeometry(0.12, 10, 8), toon('#D9442E', { emissive: 0xB0301A, emissiveIntensity: 0.6 }), { x, y, z, s: [1, 1.25, 1] }));
  };

  if (key === 'chorye') {
    // 융중 초려: 초가지붕 오두막, 대나무 울타리, 서책 평상
    platform(2.6, 2.4, 0.2);
    add(box(1.9, 1.15, 1.7, plaster, { y: 0.2 + 0.575 }));
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => add(cyl(0.06, 0.06, 1.2, wood, { x: sx * 0.95, y: 0.8, z: sz * 0.85 }, 6)));
    door(0.96, 0.72, 0.55, 0.95);
    add(box(0.05, 0.4, 0.5, toon('#C9B48A'), { x: 0.96, y: 0.95, z: -0.55 }));
    const thatch = curvedRoof(1.35, 1.2, 0.95, 0.35, 0.05, roofMat('#8A6A3E', '#6E522E'));
    thatch.position.y = 1.35;
    add(thatch);
    add(box(0.8, 0.12, 0.14, toon('#6E522E'), { y: 2.3 }));
    // 울타리(앞은 열어 둠)
    const fence = toon('#9A8A55');
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.45) continue;
      add(cyl(0.035, 0.035, 0.55 + rand(i) * 0.15, fence, { x: Math.cos(a) * 1.7, y: 0.3, z: Math.sin(a) * 1.55 }, 5));
    }
    // 평상과 책
    add(box(0.7, 0.08, 0.45, wood, { x: 0.3, y: 0.42, z: 1.15 }));
    ['#3E5A7A', '#7A2E22', '#C9A24A'].forEach((c, i) => add(box(0.22, 0.06, 0.16, toon(c), { x: 0.15 + i * 0.12, y: 0.5 + i * 0.06, z: 1.15, ry: i * 0.3 })));
    height = 2.9;
  }

  if (key === 'lecture') {
    // 강의 진영: 붉은 기둥의 트인 강당, 칠판, 방석
    platform(3.2, 2.8, 0.34);
    for (let i = 0; i < 4; i++) for (const sz of [-1, 1]) add(cyl(0.08, 0.09, 1.5, red, { x: -1.3 + i * 0.86, y: 0.34 + 0.75, z: sz * 1.15 }, 10));
    [-1.3, 1.3].forEach((x) => add(cyl(0.08, 0.09, 1.5, red, { x, y: 1.09, z: 0 }, 10)));
    add(box(3.0, 0.14, 2.5, wood, { y: 1.9 }));
    const roof = curvedRoof(2.1, 1.75, 1.15, 0.55, 0.38, roofMat('#D9A23A', '#B07E22'));
    roof.position.y = 1.96;
    add(roof);
    add(box(1.15, 0.14, 0.16, toon('#8A5A1E'), { y: 3.12 }));
    [-1, 1].forEach((s) => add(mesh(new THREE.ConeGeometry(0.07, 0.3, 6), toon('#8A5A1E'), { x: s * 0.6, y: 3.24, rz: -s * 0.6 })));
    // 칠판(뒤쪽 벽)
    const board = toon('#ffffff', { map: canvasTex(boardCanvas(['AI와 일하기', '1. 작게 쪼개기', '2. 함께 만들기'])) });
    add(box(0.06, 0.8, 1.3, wood, { x: -1.32, y: 1.15 }));
    add(mesh(new THREE.PlaneGeometry(1.2, 0.72), board, { x: -1.28, y: 1.15, ry: Math.PI / 2, cast: false }));
    // 방석과 낮은 책상
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      add(cyl(0.16, 0.18, 0.06, toon(j ? '#7A9A6A' : '#C26A4A'), { x: -0.4 + i * 0.5, y: 0.37, z: -0.45 + j * 0.9 }, 12));
    }
    add(box(0.5, 0.25, 0.8, wood, { x: -0.85, y: 0.47 }));
    lantern(1.6, 1.62, 1.3); lantern(1.6, 1.62, -1.3);
    height = 3.3;
  }

  if (key === 'workshop') {
    // 공방: 목조 작업장, 굴뚝 연기, 모루, 돌아가는 물레바퀴
    platform(2.8, 2.4, 0.2);
    add(box(2.3, 1.45, 1.9, toon('#D8C7A2'), { y: 0.2 + 0.725 }));
    [-1.15, -0.4, 0.4, 1.15].forEach((x) => add(box(0.08, 1.45, 0.08, wood, { x, y: 0.93, z: 0.96 }), box(0.08, 1.45, 0.08, wood, { x, y: 0.93, z: -0.96 })));
    add(box(2.36, 0.08, 1.96, wood, { y: 1.62 }));
    door(1.16, 0.75, 0.8, 1.05);
    const roof = curvedRoof(1.55, 1.25, 1.0, 1.15, 0.2, roofMat('#5E6E78', '#46545C'));
    roof.position.y = 1.66;
    add(roof);
    // 굴뚝
    add(box(0.4, 1.6, 0.4, toon('#9C948A'), { x: -0.7, y: 2.3, z: -0.6 }));
    // 모루와 작업대
    add(box(0.32, 0.18, 0.16, toon('#4E5257'), { x: 1.65, y: 0.5, z: 0.7 }));
    add(cyl(0.12, 0.15, 0.3, darkWood, { x: 1.65, y: 0.25, z: 0.7 }));
    add(box(0.5, 0.06, 0.9, wood, { x: 1.55, y: 0.55, z: -0.6 }));
    // 물레바퀴(옆면)
    const wheel = new THREE.Group();
    wheel.position.set(0.3, 0.9, 1.25);
    wheel.add(mesh(new THREE.TorusGeometry(0.62, 0.05, 6, 20), wood));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      wheel.add(mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05), wood, { rz: a }));
      wheel.add(mesh(new THREE.BoxGeometry(0.22, 0.16, 0.08), wood, { x: Math.cos(a) * 0.66, y: Math.sin(a) * 0.66, rz: a }));
    }
    g.add(wheel);
    // 연기
    const puffs = [];
    const smokeMat = toon('#E9E4DA');
    for (let i = 0; i < 6; i++) {
      const p = mesh(new THREE.SphereGeometry(0.18, 8, 6), smokeMat, { x: -0.7, y: 3.2, z: -0.6, cast: false });
      p.userData.o = i / 6;
      g.add(p); puffs.push(p);
    }
    update = (t) => {
      wheel.rotation.z = -t * 0.8;
      puffs.forEach((p) => {
        const k = (t * 0.25 + p.userData.o) % 1;
        p.position.set(-0.7 + k * 0.5, 3.15 + k * 1.6, -0.6 + Math.sin(k * 6 + p.userData.o * 9) * 0.15);
        p.scale.setScalar(0.5 + k * 1.4);
        p.visible = k < 0.95;
      });
    };
    height = 3.6;
  }

  if (key === 'library') {
    // 서고: 두 층 누각, 겹지붕, 난간, 서가
    platform(2.8, 2.5, 0.3);
    add(box(2.2, 1.2, 1.9, plaster, { y: 0.3 + 0.6 }));
    for (let i = 0; i < 4; i++) for (const sz of [-1, 1]) add(cyl(0.07, 0.07, 1.2, red, { x: -1.05 + i * 0.7, y: 0.9, z: sz * 0.97 }, 8));
    door(1.12, 0.82, 0.7, 1.0, toon('#5A2A1E'));
    // 창 너머 서가
    [-0.5, 0.5].forEach((z) => {
      add(box(0.05, 0.5, 0.45, darkWood, { x: 1.12, y: 1.05, z: z * 1.4 }));
      for (let k = 0; k < 3; k++) add(cyl(0.04, 0.04, 0.38, toon(['#EFE4C6', '#C9A24A', '#EFE4C6'][k]), { x: 1.15, y: 0.9 + k * 0.12, z: z * 1.4, rx: Math.PI / 2 }, 6));
    });
    const lowRoof = curvedRoof(1.6, 1.35, 0.55, 1.0, 0.28, roofMat('#3F6B52', '#2E5240'));
    lowRoof.position.y = 1.5;
    add(lowRoof);
    add(box(1.6, 0.9, 1.35, plaster, { y: 1.95 + 0.45 }));
    // 난간
    for (let i = 0; i < 9; i++) add(cyl(0.025, 0.025, 0.28, red, { x: 0.95, y: 2.1, z: -0.8 + i * 0.2 }, 5));
    add(box(0.05, 0.05, 1.7, red, { x: 0.95, y: 2.25 }));
    const topRoof = curvedRoof(1.25, 1.05, 0.95, 0.4, 0.34, roofMat('#3F6B52', '#2E5240'));
    topRoof.position.y = 2.82;
    add(topRoof);
    add(box(0.45, 0.12, 0.14, toon('#2E5240'), { y: 3.8 }));
    lantern(1.55, 1.25, 1.1); lantern(1.55, 1.25, -1.1);
    height = 4.3;
  }

  if (key === 'gate') {
    // 성문: 여장(성가퀴)을 두른 성벽, 문루, 금빛 못을 박은 붉은 문
    const wall = toon('#C8B28E');
    [-1, 1].forEach((s) => {
      add(box(1.0, 1.6, 1.3, wall, { y: 0.8, z: s * 1.15 }));
      for (let i = 0; i < 3; i++) add(box(0.26, 0.24, 0.26, wall, { x: 0.37, y: 1.72, z: s * (0.65 + i * 0.4) }));
    });
    add(box(1.0, 0.5, 1.0, wall, { y: 1.35 }));
    // 문짝
    const doorMat = toon('#7A2A1E');
    [-0.24, 0.24].forEach((z) => {
      add(box(0.08, 1.1, 0.46, doorMat, { x: 0.46, y: 0.55, z }));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) add(mesh(new THREE.SphereGeometry(0.025, 6, 4), toon('#D9B04A'), { x: 0.51, y: 0.25 + r * 0.3, z: z - 0.1 + c * 0.2, cast: false }));
    });
    add(box(0.1, 0.18, 0.18, toon('#D9B04A'), { x: 0.52, y: 0.6 }));
    // 문루
    add(box(0.9, 0.9, 1.3, toon('#E2D2B0'), { y: 1.6 + 0.45 }));
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) add(cyl(0.06, 0.06, 0.9, red, { x: sx * 0.42, y: 2.05, z: sz * 0.62 }, 6));
    const roof = curvedRoof(0.85, 1.05, 0.8, 0.35, 0.3, roofMat('#3C3F44', '#2A2C30'));
    roof.position.y = 2.5;
    add(roof);
    add(box(0.75, 0.1, 0.12, toon('#2A2C30'), { y: 3.32 }));
    height = 3.8;
  }

  if (key === 'beacon') {
    // 봉화대: 위로 좁아지는 돌탑, 성가퀴, 꼭대기의 불
    const prof = [[1.05, 0], [1.0, 0.3], [0.85, 2.6], [0.95, 2.7], [0.95, 3.0]].map(([r, y]) => new THREE.Vector2(r, y));
    add(mesh(new THREE.LatheGeometry(prof, 16), toon('#BDB3A0')));
    add(mesh(new THREE.CircleGeometry(0.95, 16), toon('#8C826F'), { y: 3.0, rx: -Math.PI / 2 }));
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      add(box(0.22, 0.26, 0.2, toon('#BDB3A0'), { x: Math.cos(a) * 0.88, y: 3.13, z: Math.sin(a) * 0.88, ry: -a }));
    }
    // 돌 줄눈
    for (let k = 0; k < 4; k++) add(mesh(new THREE.TorusGeometry(1.0 - k * 0.04, 0.015, 4, 24), toon('#968C78'), { y: 0.5 + k * 0.55, rx: Math.PI / 2, cast: false }));
    door(1.0, 0.5, 0.45, 0.8);
    // 바깥 계단
    for (let i = 0; i < 5; i++) add(box(0.35, 0.12, 0.6, stone, { x: 1.25 + i * 0.0, y: 0.06 + i * 0.12, z: 0.9 - i * 0.22 }));
    // 깃발
    add(cyl(0.025, 0.025, 1.2, darkWood, { x: -0.5, y: 3.6, z: -0.5 }, 5));
    add(box(0.02, 0.32, 0.5, toon('#B23A2E', { side: THREE.DoubleSide }), { x: -0.5, y: 3.98, z: -0.25 }));
    // 불꽃
    const flames = [];
    [['#F0A23A', 0.42, 0.9], ['#E8582A', 0.3, 1.2], ['#FFE08A', 0.18, 0.7]].forEach(([c, r, h], i) => {
      const f = mesh(new THREE.ConeGeometry(r, h, 8), toon(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.9 }), { y: 3.0 + h / 2, cast: false });
      f.userData.h = h; f.userData.i = i;
      g.add(f); flames.push(f);
    });
    update = (t) => {
      flames.forEach((f) => {
        const k = 1 + Math.sin(t * (9 + f.userData.i * 3)) * 0.12 + Math.sin(t * 5.3 + f.userData.i) * 0.08;
        f.scale.set(1 + Math.sin(t * 7 + f.userData.i) * 0.06, k, 1);
        f.rotation.y = t * (0.5 + f.userData.i * 0.3);
      });
    };
    height = 4.6;
  }

  g.traverse((o) => { if (o.isMesh && o.castShadow === undefined) o.castShadow = true; });
  return { group: g, height, update };
}
