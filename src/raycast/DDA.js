import { BLOCK } from '../core/Constants.js';
const DIRECTIONS = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
export function voxelDDA(world, ox, oy, oz, dx, dy, dz, maxDistance) {
  let x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
  const stepX = Math.sign(dx), stepY = Math.sign(dy), stepZ = Math.sign(dz);
  const invX = dx === 0 ? Infinity : Math.abs(1 / dx), invY = dy === 0 ? Infinity : Math.abs(1 / dy), invZ = dz === 0 ? Infinity : Math.abs(1 / dz);
  let tMaxX = dx === 0 ? Infinity : ((stepX > 0 ? x + 1 - ox : ox - x) * invX);
  let tMaxY = dy === 0 ? Infinity : ((stepY > 0 ? y + 1 - oy : oy - y) * invY);
  let tMaxZ = dz === 0 ? Infinity : ((stepZ > 0 ? z + 1 - oz : oz - z) * invZ);
  let distance = 0, nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < 512 && distance <= maxDistance; i++) {
    const type = world.getBlock(x, y, z);
    if (type !== BLOCK.AIR) return { x, y, z, type, normal: { x: nx, y: ny, z: nz } };
    if (tMaxX <= tMaxY && tMaxX <= tMaxZ) { distance = tMaxX; x += stepX; tMaxX += invX; nx = -stepX; ny = 0; nz = 0; }
    else if (tMaxY <= tMaxZ) { distance = tMaxY; y += stepY; tMaxY += invY; nx = 0; ny = -stepY; nz = 0; }
    else { distance = tMaxZ; z += stepZ; tMaxZ += invZ; nx = 0; ny = 0; nz = -stepZ; }
  }
  return null;
}
export function castFromCamera(world, camera, maxDistance) {
  const direction = camera.getWorldDirection(_direction);
  return voxelDDA(world, camera.position.x, camera.position.y, camera.position.z, direction.x, direction.y, direction.z, maxDistance);
}
const _direction = { x: 0, y: 0, z: 0 };
