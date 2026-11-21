import * as THREE from 'three';
export class OutlineRenderer {
  constructor(scene) {
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1.014, 1.014, 1.014), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, depthTest: false, transparent: true, opacity: 0.9 }));
    this.mesh.renderOrder = 999; this.mesh.visible = false; scene.add(this.mesh);
  }
  show(hit) { this.mesh.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5); this.mesh.visible = true; }
  hide() { this.mesh.visible = false; }
  dispose() { this.mesh.geometry.dispose(); this.mesh.material.dispose(); this.mesh.parent?.remove(this.mesh); }
}
