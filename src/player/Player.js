import { BLOCK, PLAYER_EYE_HEIGHT, MOVE_SPEED, JUMP_VELOCITY, GRAVITY } from '../core/Constants.js';
import { Collision } from './Collision.js';

export class Player {
  constructor(world, camera, position = null) {
    this.world = world;
    this.camera = camera;
    this.x = position?.x ?? 0.5;
    this.y = position?.y ?? 52;
    this.z = position?.z ?? 0.5;
    this.yaw = position?.yaw ?? 0;
    this.pitch = position?.pitch ?? 0;
    this.velocityY = 0;
    this.grounded = false;
    this.collision = new Collision(world);
    this.syncCamera();
  }
  update(dt, input) {
    const look = input.consumeMouseDelta();
    this.yaw -= look.dx * 0.0022;
    this.pitch = Math.max(-1.54, Math.min(1.54, this.pitch - look.dy * 0.0022));
    let forward = (input.isDown('KeyW') ? 1 : 0) - (input.isDown('KeyS') ? 1 : 0);
    let strafe = (input.isDown('KeyD') ? 1 : 0) - (input.isDown('KeyA') ? 1 : 0);
    const length = Math.hypot(forward, strafe) || 1;
    forward /= length;
    strafe /= length;
    const dx = (-Math.sin(this.yaw) * forward + Math.cos(this.yaw) * strafe) * MOVE_SPEED * dt;
    const dz = (-Math.cos(this.yaw) * forward - Math.sin(this.yaw) * strafe) * MOVE_SPEED * dt;
    if (input.isDown('Space') && this.grounded) {
      this.velocityY = JUMP_VELOCITY;
      this.grounded = false;
    }
    this.velocityY -= GRAVITY * dt;
    this.grounded = this.collision.move(this, dx, this.velocityY * dt, dz);
    if (this.grounded && this.velocityY < 0) this.velocityY = 0;
    if (this.y < -10) {
      this.x = 0.5;
      this.y = 70;
      this.z = 0.5;
      this.velocityY = 0;
    }
    this.syncCamera();
  }
  syncCamera() {
    this.camera.position.set(this.x, this.y + PLAYER_EYE_HEIGHT, this.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;
  }
  eyePosition(out) { return out.set(this.x, this.y + PLAYER_EYE_HEIGHT, this.z); }
  saveData() { return { x: this.x, y: this.y, z: this.z, yaw: this.yaw, pitch: this.pitch }; }
}
