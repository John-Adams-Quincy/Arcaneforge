import * as THREE from 'three';
import { BlockRegistry } from '../world/BlockRegistry.js';
export function createMaterials() {
  return Object.keys(BlockRegistry).map((id) => new THREE.MeshLambertMaterial({ color: BlockRegistry[id].color, vertexColors: true, flatShading: true }));
}
