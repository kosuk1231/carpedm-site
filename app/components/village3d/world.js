// CARPEDM 캠퍼스 3D 장면 전체: 하늘·먼 산·골짜기 지형·강·담장·캠퍼스 건물·사람과 로봇.

import {
  NX, NY, GATE_X, BUILDINGS, PIECES, DECOR, PONDS, STREAMS, STREAM_HALF, PLAZA, CAMPUS, PROMENADE, PROM_HALF, BRANCHES, QUAD,
} from '../../data/villageMap';
import {
  createKit, rand, hash3, cloudCanvas, ridgeCanvas, bannerCanvas, radialCanvas, petalCanvas, skyCanvas,
} from './kit';
import { buildBuilding } from './buildings';
import { buildTerrain, heightAt, groundY } from './terrain';

export { heightAt, groundY };
import { makePerson, PEOPLE, TOWNSFOLK } from './people';
import { AGENTS } from '../../data/agents';


export const HX = NX / 2, HY = NY / 2;
export const toXZ = (x, y) => [x - HX, y - HY];
export const BASE_AZ = Math.PI / 4;

function groundCanvas() {
  // 캠퍼스 바닥 그림(NX×NY 칸): 잔디 결, 가로수 산책로, 건물로 가는 샛길, 쉼터 광장, 잔디 쿼드
  const k = 40, SW = NX * k, SH = NY * k;
  const c = document.createElement('canvas');
  c.width = SW; c.height = SH;
  const g = c.getContext('2d');
  g.fillStyle = '#B8C48C';
  g.fillRect(0, 0, SW, SH);
  for (let i = 0; i < 320; i++) {
    const x = rand(i + 300) * SW, y = rand(i + 400) * SH, r = (1 + rand(i + 500) * 2.6) * k;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const green = rand(i + 600) > 0.3;
    grad.addColorStop(0, green ? 'rgba(126,156,90,.55)' : 'rgba(214,204,160,.6)');
    grad.addColorStop(1, green ? 'rgba(126,156,90,0)' : 'rgba(214,204,160,0)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  g.lineCap = 'round';
  for (let i = 0; i < 12000; i++) {
    const x = rand(i + 900) * SW, y = rand(i + 4000) * SH;
    g.strokeStyle = rand(i + 7000) > 0.5 ? 'rgba(92,120,66,.42)' : 'rgba(116,140,80,.32)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(x, y); g.lineTo(x - 2, y - 6);
    g.moveTo(x + 2, y); g.lineTo(x + 3, y - 7);
    g.stroke();
  }
  // 잔디 쿼드: 더 푸른 타원 마당과 가로지르는 오솔길
  g.save(); g.translate(QUAD.x * k, QUAD.y * k);
  g.beginPath(); g.ellipse(0, 0, QUAD.rx * k, QUAD.ry * k, 0, 0, Math.PI * 2); g.fillStyle = '#93B26A'; g.fill();
  g.lineWidth = 0.7 * k; g.strokeStyle = '#DCD6C6';
  g.beginPath(); g.moveTo(-QUAD.rx * k, 0); g.lineTo(QUAD.rx * k, 0); g.moveTo(-QUAD.rx * 0.7 * k, -QUAD.ry * 0.7 * k); g.lineTo(QUAD.rx * 0.7 * k, QUAD.ry * 0.7 * k); g.stroke();
  g.restore();
  const line = (pts, w, color) => { g.strokeStyle = color; g.lineWidth = w * k; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x * k, p.y * k) : g.moveTo(p.x * k, p.y * k))); g.stroke(); };
  // 샛길(건물 입구 → 산책로)과 쿼드로 드는 길
  for (const br of BRANCHES) { line(br, 1.3, 'rgba(150,146,136,.55)'); line(br, 1.05, '#E3DED2'); }
  const quadLink = [{ x: PLAZA.x + 2, y: PLAZA.y - 1.5 }, { x: QUAD.x - QUAD.rx, y: QUAD.y + 0.5 }];
  line(quadLink, 1.0, 'rgba(150,146,136,.5)'); line(quadLink, 0.8, '#E3DED2');
  // 가로수 산책로: 테두리 + 밝은 포장 + 가운데 판석 줄눈
  line(PROMENADE, PROM_HALF * 2 + 0.35, 'rgba(140,134,120,.7)');
  line(PROMENADE, PROM_HALF * 2, '#EAE5DA');
  g.setLineDash([0.5 * k, 0.5 * k]); line(PROMENADE, 0.06, 'rgba(160,152,138,.6)'); g.setLineDash([]);
  // 쉼터 광장: 둥근 포장 마당, 가운데 둥근 잔디와 CARPEDM 글자
  const cx = PLAZA.x * k, cy = PLAZA.y * k;
  g.beginPath(); g.arc(cx, cy, 3.3 * k, 0, Math.PI * 2); g.fillStyle = '#E4DFD3'; g.fill();
  g.lineWidth = 6; g.strokeStyle = '#B9B2A3'; g.stroke();
  g.beginPath(); g.arc(cx, cy, 2.2 * k, 0, Math.PI * 2); g.fillStyle = '#93B26A'; g.fill();
  g.setLineDash([18, 14]); g.beginPath(); g.arc(cx, cy, 2.6 * k, 0, Math.PI * 2); g.lineWidth = 4; g.strokeStyle = '#E0995A'; g.stroke(); g.setLineDash([]);
  g.save(); g.translate(cx, cy + 0.2 * k); g.fillStyle = 'rgba(244,241,234,.95)'; g.font = `800 ${Math.round(0.55 * k)}px Pretendard, sans-serif`; g.textAlign = 'center'; g.fillText('CARPEDM', 0, 0); g.restore();
  return c;
}

export function buildWorld(THREE, renderer, { low = false } = {}) {
  const kit = createKit(THREE, renderer);
  const { track, toon, mesh, canvasTex } = kit;
  const scene = new THREE.Scene();
  scene.background = canvasTex(skyCanvas());
  scene.fog = new THREE.Fog(0xE4EEF2, 70, 260);

  // 빛
  scene.add(new THREE.HemisphereLight(0xFFF8EC, 0x9A9080, 1.7));
  scene.add(new THREE.AmbientLight(0xFFF4E0, 0.25));
  const sun = new THREE.DirectionalLight(0xFFE6C0, 2.4);
  sun.position.set(-18, 40, 22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(low ? 2048 : 4096, low ? 2048 : 4096);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 46, bottom: -34, near: 1, far: 140 });
  sun.target.position.set(0, 0, 6);
  scene.add(sun.target);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);

  // 땅
  // 캠퍼스 땅: 굽은 부지 모양 그대로(격자 좌표 x→X, y→Z), 바닥 그림은 NX×NY 칸에 맞춰 붙임
  const shape = new THREE.Shape(CAMPUS.map((p) => new THREE.Vector2(p.x - HX, -(p.y - HY))));
  const groundGeo = track(new THREE.ShapeGeometry(shape, 1));
  groundGeo.rotateX(-Math.PI / 2);
  { const p = groundGeo.attributes.position, uv = groundGeo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + HX) / NX, 1 - (p.getZ(i) + HY) / NY); }
  const groundMat = toon('#ffffff', { map: canvasTex(groundCanvas()) }).clone();
  groundMat.polygonOffset = true; groundMat.polygonOffsetFactor = -1; groundMat.polygonOffsetUnits = -1;
  track(groundMat);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = 0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  // 성 밖 지형·강·다리·숲·풀·성벽
  const terrain = buildTerrain(THREE, kit, scene);

  // 물
  const waterUniforms = { uTime: { value: 0 } };
  const waterMat = track(new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uTime; varying vec3 vW;
      void main(){
        vec3 deep = vec3(0.40,0.60,0.58); vec3 light = vec3(0.88,0.95,0.92);
        float w = sin(vW.x*3.1 + uTime*1.3) * sin(vW.z*2.7 - uTime*1.1);
        float line = smoothstep(0.78, 0.95, w);
        gl_FragColor = vec4(mix(deep, light, line*0.85), 1.0);
      }`,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  }));
  const bankMat = track(new THREE.MeshBasicMaterial({ color: 0x5F7D61, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  const flat = (geo, mat, X, y, Z, ry = 0) => {
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(track(geo), mat);
    m.position.set(X, y, Z); m.rotation.y = ry;
    m.receiveShadow = true;
    scene.add(m);
  };
  for (const [[cx, cy], r] of PONDS) {
    const [X, Z] = toXZ(cx, cy);
    flat(new THREE.CircleGeometry(r + 0.22, 48), bankMat, X, 0.01, Z);
    flat(new THREE.CircleGeometry(r, 48), waterMat, X, 0.02, Z);
  }
  for (const s of STREAMS) {
    for (let i = 0; i < s.length - 1; i++) {
      const [ax, az] = toXZ(...s[i]), [bx, bz] = toXZ(...s[i + 1]);
      const len = Math.hypot(bx - ax, bz - az);
      const ry = -Math.atan2(bz - az, bx - ax);
      for (const [hw, mat, y] of [[STREAM_HALF + 0.22, bankMat, 0.01], [STREAM_HALF, waterMat, 0.02]]) {
        flat(new THREE.PlaneGeometry(len, hw * 2), mat, (ax + bx) / 2, y, (az + bz) / 2, ry);
        flat(new THREE.CircleGeometry(hw, 24), mat, bx, y, bz);
      }
    }
  }
  // 연못의 연잎
  const lily = toon('#5E8A55');
  PONDS.forEach(([[cx, cy], r], pi) => {
    for (let i = 0; i < 5; i++) {
      const a = rand(pi * 10 + i) * Math.PI * 2, d = r * (0.3 + rand(pi * 10 + i + 5) * 0.55);
      const [X, Z] = toXZ(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
      scene.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 10, 1, false, 0.3, Math.PI * 1.8), lily, { x: X, y: 0.04, z: Z, ry: a, cast: false }));
    }
  });

  // 은은한 해
  const sunSprite = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: canvasTex(radialCanvas('rgba(255,236,190,.95)', 'rgba(255,236,190,0)')), fog: false, depthWrite: false, toneMapped: false })));
  sunSprite.scale.set(60, 60, 1);
  sunSprite.position.set(-140, 90, -200);
  sunSprite.renderOrder = -50;
  scene.add(sunSprite);

  // 구름 바다와 흘러가는 구름
  const cloudTex = [0, 1, 2].map((s) => canvasTex(cloudCanvas(s * 50)));
  const driftMats = cloudTex.map((t) => track(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false })));
  const drift = [];
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Sprite(driftMats[i % 3]);
    const w = 22 + rand(i + 70) * 20;
    s.scale.set(w, w / 2, 1);
    s.position.set(-150 + rand(i + 71) * 300, 34 + rand(i + 72) * 18, -150 + rand(i + 73) * 260);
    s.userData.speed = 0.5 + rand(i + 74) * 0.6;
    scene.add(s); drift.push(s);
  }

  // 소나무·대나무·괴석·깃발
  const pineTrunk = toon('#5A3F26');
  const pineLeaf = ['#46664E', '#56755A', '#3C5946'].map((c) => toon(c));
  const bambooMat = toon('#77985A');
  const bambooLeaf = toon('#4E7240', { side: THREE.DoubleSide });
  const rockMat = toon('#A7A393');
  const poleMat = toon('#4A3524');
  const bannerTex = canvasTex((() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 300;
    const b = c.getContext('2d');
    b.fillStyle = '#43706A'; b.fillRect(0, 0, 128, 300);
    b.fillStyle = '#E0995A'; b.fillRect(0, 0, 128, 18); b.fillRect(0, 282, 128, 18);
    b.save(); b.translate(64, 150); b.rotate(-Math.PI / 2);
    b.fillStyle = '#F4F1EA'; b.font = '800 44px Pretendard, sans-serif'; b.textAlign = 'center'; b.textBaseline = 'middle';
    b.fillText('CARPEDM', 0, 0); b.restore();
    return c;
  })());
  const tierGeo = track(new THREE.SphereGeometry(1, 10, 7));
  const trunkGeo = track(new THREE.CylinderGeometry(0.09, 0.15, 1.6, 6));
  const stalkGeo = track(new THREE.CylinderGeometry(0.045, 0.05, 1, 6));
  const leafGeo = track(new THREE.PlaneGeometry(0.5, 0.075));
  leafGeo.translate(0.25, 0, 0);
  const leafMats = ['#6E9A55', '#5E8A4B', '#7FA862', '#8AAE5E'].map((c) => toon(c));
  const podGlass = track(new THREE.MeshStandardMaterial({ color: '#9FC6CF', roughness: 0.3, transparent: true, opacity: 0.6, emissive: '#2A4A52', emissiveIntensity: 0.25 }));
  const solarMat = toon('#2B4A6B', { emissive: 0x1A3350, emissiveIntensity: 0.3 });
  const warmLamp = toon('#FFE2A8', { emissive: 0xFFB45A, emissiveIntensity: 0.9 });
  const sway = [], flags = [];
  const occluders = [];
  DECOR.forEach(([type, x, y], i) => {
    const [X, Z] = toXZ(x, y);
    const g = new THREE.Group();
    g.position.set(X, 0, Z);
    if (type === 'pine' || type === 'tree') occluders.push(g);
    if (type === 'pine') {
      const trunk = new THREE.Mesh(trunkGeo, pineTrunk);
      trunk.position.y = 0.8; trunk.rotation.z = (rand(i) - 0.5) * 0.25; trunk.castShadow = true;
      g.add(trunk);
      for (let t = 0; t < 4; t++) {
        const m = new THREE.Mesh(tierGeo, pineLeaf[(t + i) % 3]);
        const s = 0.95 - t * 0.17 + rand(i * 7 + t) * 0.15;
        m.scale.set(s, 0.22, s * (0.8 + rand(i + t) * 0.3));
        m.position.set((rand(i * 3 + t) - 0.5) * 0.5, 1.15 + t * 0.42, (rand(i * 5 + t) - 0.5) * 0.5);
        m.castShadow = true; m.receiveShadow = true;
        g.add(m);
      }
      g.scale.setScalar(0.75 + rand(i + 2) * 0.22);
    } else if (type === 'bamboo') {
      for (let k = 0; k < 6; k++) {
        const h = 2.4 + rand(i * 9 + k) * 1.4;
        const st = new THREE.Mesh(stalkGeo, bambooMat);
        st.scale.y = h; st.position.set((rand(i + k) - 0.5) * 0.7, h / 2, (rand(i + k + 30) - 0.5) * 0.7);
        st.castShadow = true;
        g.add(st);
        for (let l = 0; l < 7; l++) {
          const lf = new THREE.Mesh(leafGeo, bambooLeaf);
          lf.position.set(st.position.x, h - 0.15 - Math.floor(l / 2) * 0.38, st.position.z);
          lf.rotation.order = 'YZX';
          lf.rotation.set((rand(k * 5 + l) - 0.5) * 0.8, rand(i * 3 + l + k) * Math.PI * 2, -0.75 - rand(l + k) * 0.45);
          g.add(lf);
        }
      }
      sway.push(g);
    } else if (type === 'rock') {
      const geo = new THREE.DodecahedronGeometry(0.5, 1);
      const p = geo.attributes.position;
      for (let v = 0; v < p.count; v++) {
        const x0 = p.getX(v), y0 = p.getY(v), z0 = p.getZ(v);
        const j = 0.8 + hash3(x0 + i, y0, z0) * 0.4;
        p.setXYZ(v, x0 * j, y0 * (0.9 + hash3(y0, z0 + i, x0) * 0.2), z0 * j);
      }
      geo.computeVertexNormals();
      g.add(mesh(geo, rockMat, { y: 0.78, ry: rand(i) * 3, s: [0.8, 1.7, 0.7] }));
    } else if (type === 'tree') {
      // 활엽수(느티나무 느낌): 굵은 줄기 + 뭉게뭉게 잎
      g.add(mesh(new THREE.CylinderGeometry(0.14, 0.24, 1.5, 7), pineTrunk, { y: 0.75 }));
      for (let k = 0; k < 5; k++) {
        const r = 0.7 + rand(i * 5 + k) * 0.35;
        g.add(mesh(new THREE.IcosahedronGeometry(r, 1), leafMats[(i + k) % leafMats.length], {
          x: (rand(i + k * 3) - 0.5) * 1.1, y: 1.9 + rand(i * 2 + k) * 0.7, z: (rand(i + k * 7) - 0.5) * 1.1,
        }));
      }
      g.scale.setScalar(0.85 + rand(i + 1) * 0.3);
    } else if (type === 'pod') {
      occluders.push(g);
      // 작은 사무 동: 목재 외벽 + 통유리 한 면 + 평지붕 태양광(또는 옥상 텃밭)
      const w = 1.9 + rand(i + 1) * 0.5, d = 1.5 + rand(i + 2) * 0.3, h = 1.4 + rand(i + 3) * 0.4;
      const wall = toon(['#C9A27A', '#E6E1D6', '#8FA3A8', '#D9C6A6'][i % 4]);
      g.add(mesh(new THREE.BoxGeometry(w * 1.1, 0.14, d * 1.15), toon('#CFC8BA'), { y: 0.07 }));
      g.add(mesh(new THREE.BoxGeometry(w, h, d), wall, { y: 0.14 + h / 2 }));
      g.add(mesh(new THREE.BoxGeometry(0.06, h * 0.75, d * 0.8), podGlass, { x: w / 2 + 0.01, y: 0.14 + h * 0.45, cast: false }));
      g.add(mesh(new THREE.BoxGeometry(w * 1.12, 0.1, d * 1.12), toon('#2E3436'), { y: 0.19 + h }));
      if (rand(i + 4) > 0.45) {
        for (let k = 0; k < 3; k++) g.add(mesh(new THREE.BoxGeometry(w * 0.28, 0.04, d * 0.7), solarMat, { x: -w * 0.33 + k * w * 0.33, y: 0.38 + h, rz: 0.25 }));
      } else {
        for (let k = 0; k < 3; k++) g.add(mesh(new THREE.IcosahedronGeometry(0.22, 1), leafMats[(i + k) % 4], { x: -w * 0.3 + k * w * 0.3, y: 0.42 + h }));
      }
      g.add(mesh(new THREE.BoxGeometry(0.07, 0.04, 0.5), warmLamp, { x: w / 2 + 0.05, y: h * 0.9, cast: false }));
      g.rotation.y = Math.round(rand(i + 7) * 3) * (Math.PI / 2);
    } else if (type === 'kiosk') {
      // 큰길 키오스크: 커피·굿즈 카트와 파라솔
      const col = ['#E0995A', '#43706A', '#5E7A94', '#C8402E'][i % 4];
      g.add(mesh(new THREE.BoxGeometry(1.3, 0.85, 0.7), toon('#F4F1EA'), { y: 0.5 }));
      g.add(mesh(new THREE.BoxGeometry(1.32, 0.18, 0.72), toon(col), { y: 0.84 }));
      for (const a of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 12), toon('#2E3436'), { x: a * 0.45, y: 0.1, z: 0.36, rx: Math.PI / 2 }));
      g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), toon('#2E3436'), { x: 0.2, y: 1.4 }));
      g.add(mesh(new THREE.ConeGeometry(0.9, 0.3, 10), toon(col, { side: THREE.DoubleSide }), { x: 0.2, y: 2.1 }));
      for (let k = 0; k < 3; k++) g.add(mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.14, 10), toon('#FBFAF6'), { x: -0.35 + k * 0.2, y: 1.0 }));
      g.rotation.y = x < GATE_X ? Math.PI / 2 : -Math.PI / 2; // 앞이 큰길을 봄
    } else if (type === 'bench') {
      g.add(mesh(new THREE.BoxGeometry(1.2, 0.07, 0.4), toon('#B98A5A'), { y: 0.42 }));
      g.add(mesh(new THREE.BoxGeometry(1.2, 0.3, 0.06), toon('#B98A5A'), { y: 0.62, z: -0.18, rx: -0.15 }));
      for (const a of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.06, 0.42, 0.4), toon('#2E3436'), { x: a * 0.5, y: 0.21 }));
      g.rotation.y = rand(i) * Math.PI * 2;
    } else if (type === 'lamp') {
      g.add(mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.6, 8), toon('#2E3436'), { y: 1.3 }));
      g.add(mesh(new THREE.BoxGeometry(0.5, 0.06, 0.16), toon('#2E3436'), { x: (x < GATE_X ? 0.2 : -0.2), y: 2.6 }));
      g.add(mesh(new THREE.BoxGeometry(0.36, 0.04, 0.12), warmLamp, { x: (x < GATE_X ? 0.25 : -0.25), y: 2.56, cast: false }));
    } else if (type === 'banner') {
      // 세로 현수막: CARPEDM
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.6, 6), toon('#2E3436'), { y: 1.8 }));
      const geo = track(new THREE.PlaneGeometry(0.8, 1.9, 6, 8));
      geo.translate(0.42, 0, 0);
      const flag = new THREE.Mesh(geo, track(new THREE.MeshStandardMaterial({ map: bannerTex, side: THREE.DoubleSide, roughness: 0.85 })));
      flag.position.set(0.02, 2.5, 0); flag.castShadow = true;
      g.add(flag);
      g.rotation.y = BASE_AZ;
      g.scale.setScalar(0.8);
      flags.push({ geo, base: Float32Array.from(geo.attributes.position.array), phase: i });
    }
    scene.add(g);
  });

  // 건물
  const buildings = BUILDINGS.map((b) => {
    const built = buildBuilding(THREE, kit, b.key);
    const [X, Z] = toXZ(b.x, b.y);
    built.group.position.set(X, 0, Z);
    if (b.face === -1) built.group.rotation.y = Math.PI; // 입구가 서쪽(산책로 쪽)
    built.group.traverse((o) => { o.userData.pick = { kind: 'place', id: b.key }; });
    scene.add(built.group);
    if (b.key !== 'gate') occluders.push(built.group);
    return { ...built, key: b.key, X, Z };
  });

  // 흩날리는 벚꽃잎
  const petalCount = 170;
  const petalGeo = track(new THREE.BufferGeometry());
  const petalPos = new Float32Array(petalCount * 3);
  for (let i = 0; i < petalCount; i++) {
    petalPos[i * 3] = (rand(i + 1) - 0.5) * NX * 1.2;
    petalPos[i * 3 + 1] = rand(i + 2) * 12;
    petalPos[i * 3 + 2] = (rand(i + 3) - 0.5) * NY * 1.1;
  }
  petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
  scene.add(new THREE.Points(petalGeo, track(new THREE.PointsMaterial({ map: canvasTex(petalCanvas()), size: 0.32, transparent: true, depthWrite: false, alphaTest: 0.2 }))));

  // 사람들
  const people = {};
  for (const p of PIECES) {
    const person = makePerson(THREE, kit, PEOPLE[p.id]);
    const [X, Z] = toXZ(p.x, p.y);
    person.group.position.set(X, 0, Z);
    person.group.rotation.y = BASE_AZ;
    person.group.traverse((o) => { o.userData.pick = { kind: 'agent', id: p.id }; });
    scene.add(person.group);
    people[p.id] = person;
  }
  const visitor = makePerson(THREE, kit, PEOPLE.visitor);
  scene.add(visitor.group);
  // 캠퍼스 사람들(이름 없는 직원·수강생·방문객·로봇)
  const folk = TOWNSFOLK.map((spec) => {
    const f = makePerson(THREE, kit, spec);
    f.flying = spec.robot === 'drone';
    scene.add(f.group);
    return f;
  });

  const update = (t, dt) => {
    waterUniforms.uTime.value = t;
    for (const s of drift) { s.position.x += s.userData.speed * dt; if (s.position.x > 160) s.position.x = -160; }
    terrain.update(t);
    for (let i = 0; i < sway.length; i++) sway[i].rotation.z = Math.sin(t * 0.9 + i) * 0.035;
    for (const f of flags) {
      const p = f.geo.attributes.position;
      for (let v = 0; v < p.count; v++) p.setZ(v, Math.sin(f.base[v * 3] * 3.2 - t * 3.4 + f.phase) * 0.14 * f.base[v * 3]);
      p.needsUpdate = true;
    }
    for (const b of buildings) b.update?.(t, dt);
    const pp = petalGeo.attributes.position;
    for (let i = 0; i < petalCount; i++) {
      let y = pp.getY(i) - dt * (0.35 + rand(i + 9) * 0.35);
      let x = pp.getX(i) + dt * (0.45 + Math.sin(t * 0.7 + i) * 0.35);
      const z = pp.getZ(i) + Math.cos(t * 0.5 + i * 1.3) * dt * 0.3;
      if (y < 0.05) { y = 10 + rand(i + t) * 3; x = (rand(i + t * 3) - 0.5) * NX * 1.2 - 4; }
      pp.setXYZ(i, x, y, z);
    }
    pp.needsUpdate = true;
  };

  const pickables = [...buildings.map((b) => b.group), ...Object.values(people).map((p) => p.group)];
  const dispose = () => {
    kit.dispose();
    scene.traverse((o) => { o.geometry?.dispose?.(); });
  };

  // 그림자 범위가 걷는 곳을 따라오게(캠퍼스가 길어서 한 번에 다 덮지 않음). 4칸 단위로 옮겨 그림자 떨림을 줄임
  const focus = (X, Z) => {
    const fx = Math.round(X / 4) * 4, fz = Math.round(Z / 4) * 4;
    sun.target.position.set(fx, 0, fz);
    sun.position.set(fx - 18, 40, fz + 22);
  };

  return { scene, buildings, people, visitor, folk, pickables, occluders, update, dispose, focus };
}
