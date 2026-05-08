import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import { PhysicsWorld } from './PhysicsWorld.js';
import { ObjectFactory } from './ObjectFactory.js';
import { disposeObject } from '../utils/threeUtils.js';
import { screenToNdc } from '../utils/math.js';

export class ThreeScene {
  constructor(canvas, { onSelect, onMetrics } = {}) {
    this.canvas = canvas;
    this.onSelect = onSelect;
    this.onMetrics = onMetrics;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.05, 100);
    this.camera.position.set(0, 1.25, 4.2);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.clock = new THREE.Clock();
    this.physics = new PhysicsWorld();
    this.meshes = new Map();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.metrics = { fps: 0, renderMs: 0, objectCount: 0 };
    this.frameCount = 0;
    this.lastMetricsAt = performance.now();
    this.visualFx = {};
    this.initLights();
    this.initGroundShadow();
    this.initComposer();
    this.bindEvents();
    this.resize();
    this.animate = this.animate.bind(this);
    this.raf = requestAnimationFrame(this.animate);
  }

  initLights() {
    this.ambient = new THREE.AmbientLight('#E0F2FE', 0.72);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight('#FEF3C7', 1.1);
    this.sun.position.set(2.5, 4, 2.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -5;
    this.sun.shadow.camera.right = 5;
    this.sun.shadow.camera.top = 5;
    this.sun.shadow.camera.bottom = -5;
    this.scene.add(this.sun);
    this.accentLight = new THREE.PointLight('#A78BFA', 1.4, 7);
    this.accentLight.position.set(-2.4, 2.4, 1.4);
    this.scene.add(this.accentLight);
  }

  initGroundShadow() {
    const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.28 });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), shadowMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.position.y = -0.02;
    plane.name = 'Invisible AR Ground';
    this.scene.add(plane);
    this.grid = new THREE.GridHelper(10, 40, '#38BDF8', '#1E3A5F');
    this.grid.position.y = 0.004;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.16;
    this.scene.add(this.grid);
  }

  initComposer() {
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.55, 0.82);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);
  }

  bindEvents() {
    this.onPointerDown = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const ndc = screenToNdc(event.clientX, event.clientY, rect);
      this.pointer.set(ndc.x, ndc.y);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const candidates = [...this.meshes.values()].flatMap((mesh) => {
        const list = [];
        mesh.traverse((child) => {
          if (child.isMesh && !child.userData.selectionShell) list.push(child);
        });
        return list;
      });
      const hit = this.raycaster.intersectObjects(candidates, false)[0];
      this.onSelect?.(hit?.object?.userData?.objectId ?? null, event.shiftKey);
    };
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect() ?? this.canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.bloomPass.setSize(width, height);
  }

  sync({ objects, selectedIds, physicsEnabled, gridEnabled, visualFx, lighting }) {
    const nextIds = new Set(objects.map((object) => object.id));
    [...this.meshes.keys()].forEach((id) => {
      if (!nextIds.has(id)) {
        const mesh = this.meshes.get(id);
        this.scene.remove(mesh);
        disposeObject(mesh);
        this.meshes.delete(id);
        this.physics.removeBody(id);
      }
    });
    objects.forEach((object) => {
      const existing = this.meshes.get(object.id);
      if (!existing || existing.userData.objectType !== object.type) {
        if (existing) {
          this.scene.remove(existing);
          disposeObject(existing);
          this.physics.removeBody(object.id);
        }
        const mesh = ObjectFactory.create(object);
        mesh.userData.objectType = object.type;
        this.scene.add(mesh);
        this.meshes.set(object.id, mesh);
        const shape = ObjectFactory.getPhysicsShape(object);
        this.physics.addBody(object.id, shape, object, object.physics);
        this.spawnAnimation(mesh);
      } else {
        ObjectFactory.applyTransform(existing, object);
        ObjectFactory.updateMaterial(existing, object.material);
        this.physics.setMode(object.id, object.physics.mode, object.physics.mass);
        if (!physicsEnabled || object.physics.mode !== 'dynamic') this.physics.setTransform(object.id, object);
      }
      ObjectFactory.setSelected(this.meshes.get(object.id), selectedIds.includes(object.id));
    });
    this.physicsEnabled = physicsEnabled;
    this.grid.visible = gridEnabled;
    this.visualFx = visualFx ?? this.visualFx;
    this.applyLighting(lighting);
    this.metrics.objectCount = objects.length;
  }

  applyLighting(lighting = {}) {
    this.ambient.intensity = lighting.ambient ?? 0.72;
    this.sun.intensity = lighting.sun ?? 1;
    const t = lighting.timeOfDay ?? 0.38;
    const angle = t * Math.PI;
    this.sun.position.set(Math.cos(angle) * 4, Math.sin(angle) * 3.6 + 0.5, 2.4);
  }

  spawnAnimation(mesh) {
    mesh.scale.multiplyScalar(0.001);
    gsap.to(mesh.scale, {
      x: mesh.scale.x * 1000,
      y: mesh.scale.y * 1000,
      z: mesh.scale.z * 1000,
      duration: 0.55,
      ease: 'elastic.out(1, 0.65)'
    });
  }

  applyImpulse(id, vector) {
    this.physics.applyImpulse(id, vector);
  }

  applyExplosion(center, strength) {
    this.physics.applyExplosion(center, strength);
  }

  worldPointFromScreen(x, y, z = -1.6) {
    const vector = new THREE.Vector3((x - 0.5) * 2, -(y - 0.5) * 2, 0.4);
    vector.unproject(this.camera);
    const direction = vector.sub(this.camera.position).normalize();
    const distance = (z - this.camera.position.z) / direction.z;
    return this.camera.position.clone().add(direction.multiplyScalar(distance));
  }

  animate() {
    const start = performance.now();
    const delta = Math.min(this.clock.getDelta(), 0.05);
    if (this.physicsEnabled) {
      this.physics.step(delta);
      this.meshes.forEach((mesh, id) => {
        if (!mesh.userData.selected) this.physics.syncMesh(id, mesh);
      });
    }
    const elapsed = this.clock.elapsedTime;
    this.meshes.forEach((mesh) => {
      if (mesh.userData.selected) {
        mesh.position.y += Math.sin(elapsed * 2.2) * 0.0009;
      }
    });
    if (this.visualFx?.bloom) {
      this.bloomPass.enabled = true;
      this.composer.render();
    } else {
      this.bloomPass.enabled = false;
      this.renderer.render(this.scene, this.camera);
    }
    this.frameCount += 1;
    const now = performance.now();
    if (now - this.lastMetricsAt > 500) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastMetricsAt));
      this.metrics.renderMs = Number((now - start).toFixed(2));
      this.onMetrics?.(this.metrics);
      this.frameCount = 0;
      this.lastMetricsAt = now;
    }
    this.raf = requestAnimationFrame(this.animate);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.meshes.forEach((mesh) => {
      this.scene.remove(mesh);
      disposeObject(mesh);
    });
    this.meshes.clear();
    this.renderer.dispose();
  }
}
