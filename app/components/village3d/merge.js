// 움직이지 않는 부품 합치기: 나무·가로등·벤치·건물 벽, 사람의 팔·다리 마디 안 부품처럼
// 서로 붙어 함께 움직이는 메시를 재질별로 한 덩어리로 묶어, 한 장면을 그릴 때 GPU에 보내는 그리기 명령 수를 줄입니다.
// (윈도우 크롬은 그리기 명령 하나하나가 비싸서, 명령이 수천 개면 그래픽 화질과 상관없이 끊김)
// 어느 것이 움직이는지는 world.update 와 사람 update 를 여러 번 돌려 보고 달라진 것으로 판단합니다.

export function mergeStatic(THREE, mergeGeometries, world, { cell = 24 } = {}) {
  const { scene } = world;
  const persons = [world.visitor, ...Object.values(world.people), ...world.folk];

  const objs = [];
  scene.traverse((o) => objs.push(o));
  const versions = (g) => (g ? Object.values(g.attributes).map((a) => a.version).join(',') : '');
  scene.updateMatrixWorld(true);
  const snap = new Map(objs.map((o) => [o, { m: o.matrix.clone(), vis: o.visible, ver: versions(o.geometry) }]));

  // 여러 순간·여러 걷기 속도로 돌려 보며 스스로 움직이는(제 자리 기준으로 바뀌는) 물체를 찾음
  const animated = new Set(), deforming = new Set();
  for (let k = 0; k < 24; k++) {
    const t = 0.13 + k * 0.29;
    world.update(t, 0.05);
    for (const p of persons) p.update(0.1, [0, 1.6, 3.6][k % 3], t);
    scene.updateMatrixWorld(true);
    for (const o of objs) {
      const s = snap.get(o);
      if (!o.matrix.equals(s.m) || o.visible !== s.vis) animated.add(o);
      if (o.geometry && versions(o.geometry) !== s.ver) deforming.add(o);
    }
  }

  // 묶음 기준(앵커): 스스로 움직이는 부모, 사람 몸 전체(코드가 옮김), 건물(누르기·가림 판정 단위). 없으면 장면을 칸으로 나눔.
  const anchors = new Set([...animated, ...persons.map((p) => p.group), ...world.buildings.map((b) => b.group)]);
  const buckets = new Map();
  const tmp = new THREE.Vector3();
  for (const m of objs) {
    if (!m.isMesh || m.isInstancedMesh || m.isSkinnedMesh || Array.isArray(m.material) || m.material.transparent) continue;
    if (animated.has(m) || deforming.has(m) || !m.geometry?.attributes.position) continue;
    if (m.matrixWorld.determinant() < 0) continue; // 거울처럼 뒤집힌 물체는 합치면 면이 뒤집혀 보임
    let owner = null, hidden = !m.visible;
    for (let o = m.parent; o && o !== scene; o = o.parent) {
      if (!o.visible && !animated.has(o)) hidden = true;
      if (anchors.has(o)) { owner = o; break; }
    }
    if (hidden) continue;
    let area;
    if (owner) area = owner.uuid;
    else { m.getWorldPosition(tmp); area = `${Math.floor(tmp.x / cell)},${Math.floor(tmp.z / cell)}`; }
    const attrs = Object.keys(m.geometry.attributes).sort().join('|');
    const key = `${area}|${m.material.uuid}|${m.castShadow}|${m.receiveShadow}|${m.renderOrder}|${attrs}`;
    if (!buckets.has(key)) buckets.set(key, { owner, mat: m.material, cast: m.castShadow, receive: m.receiveShadow, order: m.renderOrder, items: [] });
    buckets.get(key).items.push(m);
  }

  let removed = 0, added = 0;
  const inv = new THREE.Matrix4(), rel = new THREE.Matrix4();
  for (const bk of buckets.values()) {
    if (bk.items.length < 2) continue;
    // 앵커 기준 좌표로 굳힘(앵커가 움직이면 함께 움직임)
    if (bk.owner) inv.copy(bk.owner.matrixWorld).invert(); else inv.identity();
    const geos = bk.items.map((m) => {
      let g = m.geometry.clone();
      if (g.index) g = g.toNonIndexed();
      g.morphAttributes = {};
      g.clearGroups();
      g.applyMatrix4(rel.multiplyMatrices(inv, m.matrixWorld));
      return g;
    });
    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!merged) continue;
    const mm = new THREE.Mesh(merged, bk.mat);
    mm.castShadow = bk.cast; mm.receiveShadow = bk.receive; mm.renderOrder = bk.order;
    const pick = bk.items[0].userData.pick;
    if (pick) mm.userData.pick = pick;
    (bk.owner || scene).add(mm);
    for (const m of bk.items) m.parent.remove(m);
    removed += bk.items.length; added++;
  }
  return { removed, added, animated: animated.size };
}
