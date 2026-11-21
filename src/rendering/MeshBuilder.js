import * as THREE from 'three';
import { BLOCK, CHUNK_SIZE, WORLD_HEIGHT } from '../core/Constants.js';
const FACE_DEFS = [
  { n: [1, 0, 0], light: 0.82, v: [[1,0,0],[1,1,0],[1,1,1],[1,0,1]] },
  { n: [-1,0,0], light: 0.82, v: [[0,0,1],[0,1,1],[0,1,0],[0,0,0]] },
  { n: [0,1,0], light: 1.0, v: [[0,1,1],[1,1,1],[1,1,0],[0,1,0]] },
  { n: [0,-1,0], light: 0.55, v: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]] },
  { n: [0,0,1], light: 0.72, v: [[1,0,1],[1,1,1],[0,1,1],[0,0,1]] },
  { n: [0,0,-1], light: 0.72, v: [[0,0,0],[0,1,0],[1,1,0],[1,0,0]] }
];
export class MeshBuilder {
  static build(chunk, manager) { const mesh = new THREE.Mesh(new THREE.BufferGeometry(), manager.materials); mesh.position.set(chunk.cx * CHUNK_SIZE, 0, chunk.cz * CHUNK_SIZE); mesh.frustumCulled = true; mesh.name = `chunk-${chunk.cx}-${chunk.cz}`; MeshBuilder.rebuild(chunk, manager, mesh); return mesh; }
  static rebuild(chunk, manager, mesh = chunk.mesh) {
    const positions = [], colors = [], indices = [], groups = [];
    let vertexCount = 0;
    // Collect by block type to retain per-block base colors with one draw group each.
    for (let type = BLOCK.GRASS; type <= BLOCK.LEAVES; type++) {
      const start = indices.length;
      for (let y = 0; y < WORLD_HEIGHT; y++) for (let z = 0; z < CHUNK_SIZE; z++) for (let x = 0; x < CHUNK_SIZE; x++) {
        if (chunk.get(x, y, z) !== type) continue;
        const wx = chunk.cx * CHUNK_SIZE + x, wz = chunk.cz * CHUNK_SIZE + z;
        for (const face of FACE_DEFS) {
          if (manager.getBlock(wx + face.n[0], y + face.n[1], wz + face.n[2]) !== BLOCK.AIR) continue;
          const base = vertexCount;
          for (const corner of face.v) {
            positions.push(x + corner[0], y + corner[1], z + corner[2]);
            colors.push(face.light, face.light, face.light);
            vertexCount++;
          }
          indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
        }
      }
      if (indices.length > start) groups.push({ start, count: indices.length - start, materialIndex: type });
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    for (const group of groups) geometry.addGroup(group.start, group.count, group.materialIndex);
    geometry.computeBoundingSphere();
    const old = mesh.geometry; mesh.geometry = geometry; old?.dispose(); chunk.dirty = false;
    return mesh;
  }
}
