import * as THREE from 'three';
import { createMaterials } from './Materials.js';
export class Renderer {
  constructor(canvas) {
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x9bc7df); this.scene.fog = new THREE.Fog(0x9bc7df, 90, 245);
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 320);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = false;
    this.scene.add(new THREE.HemisphereLight(0xd8efff, 0x64584a, 1.35));
    const sun = new THREE.DirectionalLight(0xfff1d2, 2.1); sun.position.set(-80, 140, 55); this.scene.add(sun);
    this.materials = createMaterials(); this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(canvas.parentElement);
  }
  resize() { const w = Math.max(1, this.renderer.domElement.clientWidth), h = Math.max(1, this.renderer.domElement.clientHeight); this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  render() { this.renderer.render(this.scene, this.camera); }
  dispose() { this.resizeObserver.disconnect(); this.renderer.dispose(); for (const material of this.materials) material.dispose(); }
}
