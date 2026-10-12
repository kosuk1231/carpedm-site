// 융중 마을 3D 장면 전체: 하늘·산·구름 바다·떠 있는 섬·물·나무·깃발·건물·사람.

import {
  N, BUILDINGS, door, PIECES, DECOR, PONDS, STREAMS, STREAM_HALF, PLAZA,
} from '../../data/villageMap';
import {
  createKit, rand, hash3, cloudCanvas, ridgeCanvas, bannerCanvas, radialCanvas, petalCanvas, skyCanvas,
} from './kit';
import { buildBuilding } from './buildings';
import { makePerson, PEOPLE } from './people';

export const HALF = N / 2;
export const toXZ = (x, y) => [x - HALF, y - HALF];
export const BASE_AZ = Math.PI / 4;

function groundCanvas() {
  const S = 2048, k = S / N;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#C9C08E';
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) {
    const x = rand(i + 300) * S, y = rand(i + 400) * S, r = (1 + rand(i + 500) * 2.6) * k;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const green = rand(i + 600) > 0.3;
    grad.addColorStop(0, green ? 'rgba(126,156,90,.6)' : 'rgba(226,207,163,.7)');
    grad.addColorStop(1, green ? 'rgba(126,156,90,0)' : 'rgba(226,207,163,0)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  g.lineCap = 'round';
  for (let i = 0; i < 2600; i++) {
    const x = rand(i + 900) * S, y = rand(i + 4000) * S;
    g.strokeStyle = rand(i + 7000) > 0.5 ? 'rgba(92,120,66,.45)' : 'rgba(116,140,80,.35)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(x, y); g.lineTo(x - 2, y - 7);
    g.moveTo(x + 2, y); g.lineTo(x + 3, y - 8);
    g.moveTo(x + 4, y); g.lineTo(x + 7, y - 6);
    g.stroke();
  }
  const road = (w, color) => {
    g.strokeStyle = color; g.lineWidth = w * k;
    for (const b of BUILDINGS) {
      const d = door(b);
      g.beginPath(); g.moveTo(PLAZA.x * k, PLAZA.y * k); g.lineTo(d.x * k, d.y * k); g.stroke();
    }
  };
  road(1.05, 'rgba(160,136,96,.6)');
  road(0.82, '#E3D3AC');
  // 디딤돌
  for (const b of BUILDINGS) {
    const d = door(b);
    for (let t = 0.1; t < 0.95; t += 0.09) {
      const x = (PLAZA.x + (d.x - PLAZA.x) * t) * k, y = (PLAZA.y + (d.y - PLAZA.y) * t) * k;
      g.fillStyle = 'rgba(170,150,112,.45)';
      g.beginPath(); g.ellipse(x + (rand(t * 99 + b.x) - 0.5) * 14, y + (rand(t * 77 + b.y) - 0.5) * 14, 11, 8, rand(t) * 3, 0, Math.PI * 2); g.fill();
    }
  }
  const oct = (r) => {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i + Math.PI / 8;
      const x = (PLAZA.x + Math.cos(a) * r) * k, y = (PLAZA.y + Math.sin(a) * r) * k;
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.closePath();
  };
  oct(2.6); g.fillStyle = '#E2D3AE'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#8E7651'; g.stroke();
  g.setLineDash([16, 12]); oct(2.15); g.lineWidth = 3; g.strokeStyle = '#A48C62'; g.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    g.beginPath();
    g.moveTo((PLAZA.x + Math.cos(a) * 0.9) * k, (PLAZA.y + Math.sin(a) * 0.9) * k);
    g.lineTo((PLAZA.x + Math.cos(a) * 2.15) * k, (PLAZA.y + Math.sin(a) * 2.15) * k);
    g.stroke();
  }
  g.setLineDash([]);
  oct(0.9); g.fillStyle = '#C5AE84'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#6E5A3A'; g.stroke();
  const cx = PLAZA.x * k, cy = PLAZA.y * k, r = 0.5 * k;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = '#F2E8D2'; g.fill();
  g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2); g.arc(cx, cy + r / 2, r / 2, Math.PI / 2, -Math.PI / 2, true);
  g.arc(cx, cy - r / 2, r / 2, Math.PI / 2, -Math.PI / 2); g.fillStyle = '#3B2F22'; g.fill();
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.lineWidth = 3; g.strokeStyle = '#3B2F22'; g.stroke();
  g.lineWidth = 10; g.strokeStyle = 'rgba(96,128,70,.75)'; g.strokeRect(5, 5, S - 10, S - 10);
  return c;
}

export function buildWorld(THREE, renderer) {
  const kit = createKit(THREE, renderer);
  const { track, toon, mesh, canvasTex } = kit;
  const scene = new THREE.Scene();
  scene.background = canvasTex(skyCanvas());
  scene.fog = new THREE.Fog(0xEEE5CF, 36, 105);

  // 빛
  scene.add(new THREE.HemisphereLight(0xFFF6E5, 0x7A6E52, 1.5));
  const sun = new THREE.DirectionalLight(0xFFE6C0, 2.4);
  sun.position.set(-12, 30, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 80 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);

  // 땅
  const groundGeo = track(new THREE.PlaneGeometry(N, N));
  groundGeo.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeo, toon('#ffffff', { map: canvasTex(groundCanvas()) }));
  ground.receiveShadow = true;
  scene.add(ground);

  // 섬의 흙벽과 바위 뿌리
  const soil = toon('#7A5A38');
  const wall = (w, rotY, px, pz) => {
    const geo = new THREE.PlaneGeometry(w, 2.4, 24, 3);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) < 1.1) p.setZ(i, (hash3(p.getX(i), p.getY(i), rotY) - 0.5) * 0.35);
    geo.computeVertexNormals();
    const m = mesh(geo, soil, { x: px, y: -1.2, z: pz, ry: rotY, cast: false });
    scene.add(m);
  };
  wall(N, 0, 0, HALF); wall(N, Math.PI / 2, HALF, 0); wall(N, Math.PI, 0, -HALF); wall(N, -Math.PI / 2, -HALF, 0);
  const rootGeo = new THREE.ConeGeometry(HALF * 0.98, 12, 8, 6);
  rootGeo.rotateX(Math.PI); rootGeo.rotateY(Math.PI / 8);
  {
    const p = rootGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x0 = p.getX(i), y0 = p.getY(i), z0 = p.getZ(i);
      if (y0 < 5.9) { const j = 0.85 + hash3(x0, y0, z0) * 0.3; p.setX(i, x0 * j); p.setZ(i, z0 * j); }
    }
    rootGeo.computeVertexNormals();
  }
  scene.add(mesh(rootGeo, toon('#5E4630'), { y: -8.4, cast: false }));

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

  // 수묵 능선 세 겹
  [
    { dist: 46, color: [52, 64, 57], alpha: 0.9, count: 7, h: 0.5 },
    { dist: 66, color: [96, 108, 98], alpha: 0.75, count: 8, h: 0.62 },
    { dist: 92, color: [146, 154, 143], alpha: 0.6, count: 9, h: 0.75 },
  ].forEach((L, li) => {
    for (let i = 0; i < L.count; i++) {
      const m = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: canvasTex(ridgeCanvas(li * 40 + i, L.color, L.alpha, L.h)), transparent: true, depthWrite: false, fog: false, toneMapped: false })));
      const a = BASE_AZ + Math.PI + ((i + 0.5) / L.count - 0.5) * 2.7;
      const w = L.dist * 0.95;
      m.scale.set(w, w * 0.5, 1);
      m.center.set(0.5, 0);
      m.position.set(Math.cos(a) * L.dist, -9, Math.sin(a) * L.dist);
      m.renderOrder = -40 - li;
      scene.add(m);
    }
  });

  // 붉은 해
  const sunSprite = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: canvasTex(radialCanvas('rgba(214,96,70,.9)', 'rgba(214,96,70,0)')), fog: false, depthWrite: false, toneMapped: false })));
  sunSprite.scale.set(26, 26, 1);
  sunSprite.position.set(Math.cos(BASE_AZ + Math.PI + 0.45) * 110, 34, Math.sin(BASE_AZ + Math.PI + 0.45) * 110);
  sunSprite.renderOrder = -50;
  scene.add(sunSprite);

  // 구름 바다와 흘러가는 구름
  const cloudTex = [0, 1, 2].map((s) => canvasTex(cloudCanvas(s * 50)));
  const seaMats = cloudTex.map((t) => track(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false })));
  const seaClouds = [];
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * Math.PI * 2 + rand(i) * 0.3;
    const rr = HALF * (0.9 + rand(i + 5) * 0.75) * 1.3;
    const s = new THREE.Sprite(seaMats[i % 3]);
    const w = 7 + rand(i + 9) * 6;
    s.scale.set(w, w / 2, 1);
    s.position.set(Math.cos(a) * rr, -4 - rand(i + 13) * 3, Math.sin(a) * rr);
    s.userData.base = s.position.y;
    s.userData.ph = rand(i + 17) * 6;
    scene.add(s); seaClouds.push(s);
  }
  const driftMats = cloudTex.map((t) => track(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0.38, depthWrite: false, toneMapped: false })));
  const drift = [];
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(driftMats[i % 3]);
    const w = 10 + rand(i + 70) * 8;
    s.scale.set(w, w / 2, 1);
    s.position.set(-40 + rand(i + 71) * 80, 17 + rand(i + 72) * 8, -30 + rand(i + 73) * 30);
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
  const bannerTex = canvasTex(bannerCanvas());
  const tierGeo = track(new THREE.SphereGeometry(1, 10, 7));
  const trunkGeo = track(new THREE.CylinderGeometry(0.09, 0.15, 1.6, 6));
  const stalkGeo = track(new THREE.CylinderGeometry(0.045, 0.05, 1, 6));
  const leafGeo = track(new THREE.PlaneGeometry(0.5, 0.075));
  leafGeo.translate(0.25, 0, 0);
  const sway = [], flags = [];
  DECOR.forEach(([type, x, y], i) => {
    const [X, Z] = toXZ(x, y);
    const g = new THREE.Group();
    g.position.set(X, 0, Z);
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
    } else if (type === 'flag') {
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.6, 6), poleMat, { y: 1.8 }));
      const geo = track(new THREE.PlaneGeometry(1, 1.55, 10, 4));
      geo.translate(0.5, 0, 0);
      const banner = new THREE.Mesh(geo, track(new THREE.MeshToonMaterial({ map: bannerTex, side: THREE.DoubleSide, transparent: true, alphaTest: 0.4, gradientMap: kit.ramp })));
      banner.position.set(0.05, 2.7, 0); banner.castShadow = true;
      g.add(banner);
      g.rotation.y = BASE_AZ;
      g.scale.setScalar(0.72);
      flags.push({ geo, base: Float32Array.from(geo.attributes.position.array), phase: i });
    }
    scene.add(g);
  });

  // 건물
  const buildings = BUILDINGS.map((b) => {
    const built = buildBuilding(THREE, kit, b.key);
    const [X, Z] = toXZ(b.x, b.y);
    built.group.position.set(X, 0, Z);
    built.group.traverse((o) => { o.userData.pick = { kind: 'place', id: b.key }; });
    scene.add(built.group);
    return { ...built, key: b.key, X, Z };
  });

  // 봉화대 불빛과 불티
  const beacon = buildings.find((b) => b.key === 'beacon');
  const fire = new THREE.PointLight(0xFF8A3D, 8, 12, 1.5);
  fire.position.set(beacon.X, 4.2, beacon.Z);
  scene.add(fire);
  const emberCount = 40;
  const emberGeo = track(new THREE.BufferGeometry());
  const emberPos = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) { emberPos[i * 3] = beacon.X; emberPos[i * 3 + 1] = 4 + rand(i) * 3; emberPos[i * 3 + 2] = beacon.Z; }
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  scene.add(new THREE.Points(emberGeo, track(new THREE.PointsMaterial({ color: 0xFFB45A, size: 0.12, transparent: true, opacity: 0.9, depthWrite: false }))));

  // 복숭아꽃 잎
  const petalCount = 170;
  const petalGeo = track(new THREE.BufferGeometry());
  const petalPos = new Float32Array(petalCount * 3);
  for (let i = 0; i < petalCount; i++) {
    petalPos[i * 3] = (rand(i + 1) - 0.5) * N * 1.2;
    petalPos[i * 3 + 1] = rand(i + 2) * 12;
    petalPos[i * 3 + 2] = (rand(i + 3) - 0.5) * N * 1.2;
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

  const update = (t, dt) => {
    waterUniforms.uTime.value = t;
    for (const s of drift) { s.position.x += s.userData.speed * dt; if (s.position.x > 45) s.position.x = -45; }
    for (const s of seaClouds) s.position.y = s.userData.base + Math.sin(t * 0.4 + s.userData.ph) * 0.25;
    for (let i = 0; i < sway.length; i++) sway[i].rotation.z = Math.sin(t * 0.9 + i) * 0.035;
    for (const f of flags) {
      const p = f.geo.attributes.position;
      for (let v = 0; v < p.count; v++) p.setZ(v, Math.sin(f.base[v * 3] * 3.2 - t * 3.4 + f.phase) * 0.14 * f.base[v * 3]);
      p.needsUpdate = true;
    }
    for (const b of buildings) b.update?.(t, dt);
    fire.intensity = 7 + Math.sin(t * 13) * 1.2 + Math.sin(t * 7.3) * 0.8;
    const ep = emberGeo.attributes.position;
    for (let i = 0; i < emberCount; i++) {
      let y = ep.getY(i) + dt * (0.8 + rand(i) * 0.9);
      let x = ep.getX(i) + Math.sin(t * 2 + i) * dt * 0.25;
      let z = ep.getZ(i) + Math.cos(t * 1.7 + i) * dt * 0.25;
      if (y > 8) { y = 4; x = beacon.X + (rand(i + t) - 0.5) * 0.5; z = beacon.Z + (rand(i + t + 1) - 0.5) * 0.5; }
      ep.setXYZ(i, x, y, z);
    }
    ep.needsUpdate = true;
    const pp = petalGeo.attributes.position;
    for (let i = 0; i < petalCount; i++) {
      let y = pp.getY(i) - dt * (0.35 + rand(i + 9) * 0.35);
      let x = pp.getX(i) + dt * (0.45 + Math.sin(t * 0.7 + i) * 0.35);
      const z = pp.getZ(i) + Math.cos(t * 0.5 + i * 1.3) * dt * 0.3;
      if (y < 0.05) { y = 10 + rand(i + t) * 3; x = (rand(i + t * 3) - 0.5) * N * 1.2 - 4; }
      pp.setXYZ(i, x, y, z);
    }
    pp.needsUpdate = true;
  };

  const pickables = [...buildings.map((b) => b.group), ...Object.values(people).map((p) => p.group)];
  const dispose = () => {
    kit.dispose();
    scene.traverse((o) => { o.geometry?.dispose?.(); });
  };

  return { scene, buildings, people, visitor, pickables, update, dispose };
}
