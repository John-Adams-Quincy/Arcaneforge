import { BLOCK, PLAYER_HEIGHT, PLAYER_RADIUS } from '../core/Constants.js';
export class Collision {
  constructor(world) { this.world = world; }
  intersects(x, y, z) {
    const minX = Math.floor(x - PLAYER_RADIUS + 1e-6), maxX = Math.floor(x + PLAYER_RADIUS - 1e-6);
    const minY = Math.floor(y + 1e-6), maxY = Math.floor(y + PLAYER_HEIGHT - 1e-6);
    const minZ = Math.floor(z - PLAYER_RADIUS + 1e-6), maxZ = Math.floor(z + PLAYER_RADIUS - 1e-6);
    for (let by = minY; by <= maxY; by++) for (let bz = minZ; bz <= maxZ; bz++) for (let bx = minX; bx <= maxX; bx++) if (this.world.getBlock(bx, by, bz) !== BLOCK.AIR) return true;
    return false;
  }
  move(player, dx, dy, dz) {
    let grounded = false;
    if (!this.intersects(player.x + dx, player.y, player.z)) player.x += dx;
    if (!this.intersects(player.x, player.y, player.z + dz)) player.z += dz;
    if (!this.intersects(player.x, player.y + dy, player.z)) player.y += dy;
    else { if (dy < 0) grounded = true; player.velocityY = 0; }
    if (dy === 0 && this.intersects(player.x, player.y - 0.04, player.z)) grounded = true;
    return grounded;
  }
  canOccupyBlock(x, y, z, player) {
    return !(x + 1 > player.x - PLAYER_RADIUS && x < player.x + PLAYER_RADIUS && z + 1 > player.z - PLAYER_RADIUS && z < player.z + PLAYER_RADIUS && y + 1 > player.y && y < player.y + PLAYER_HEIGHT);
  }
}
