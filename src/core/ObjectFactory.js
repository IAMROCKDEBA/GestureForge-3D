import * as THREE from 'three';
import { shapes } from './PhysicsWorld.js';
import { createNeonGridTexture } from '../utils/threeUtils.js';

const materialCache = new Map();
const textureCache = new Map();

const canvasTexture = (name, colorA, colorB) => {
  if (textureCache.has(name)) return textureCache.get(name);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = colorA;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = colorB;
  ctx.lineWidth = 8;
  if (name === 'brick') {
    for (let y = 0; y < 256; y += 48) {
      for (let x = y % 96 === 0 ? 0 : -48; x < 256; x += 96) {
        ctx.strokeRect(x, y, 96, 48);
      }
    }
  } else if (name === 'wood') {
    for (let i = 0; i < 14; i += 1) {
      ctx.beginPath();
      ctx.moveTo(0, i * 20);
      ctx.bezierCurveTo(70, i * 20 + 20, 150, i * 20 - 20, 256, i * 20 + 12);
      ctx.stroke();
    }
  } else if (name === 'marble') {
    for (let i = 0; i < 18; i += 1) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, 0);
      ctx.bezierCurveTo(Math.random() * 256, 80, Math.random() * 256, 180, Math.random() * 256, 256);
      ctx.stroke();
    }
  } else {
    for (let i = 0; i < 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(name, texture);
  return texture;
};

export const createMaterial = (materialConfig = {}) => {
  const config = {
    color: '#38BDF8',
    type: 'matte',
    roughness: 0.55,
    metalness: 0.12,
    opacity: 1,
    texture: 'none',
    emissiveIntensity: 0.2,
    wireframe: false,
    ...materialConfig
  };
  const cacheKey = JSON.stringify(config);
  if (materialCache.has(cacheKey)) return materialCache.get(cacheKey).clone();
  const color = new THREE.Color(config.color);
  const params = {
    color,
    roughness: config.roughness,
    metalness: config.metalness,
    transparent: config.opacity < 1 || ['glass', 'holographic'].includes(config.type),
    opacity: config.type === 'glass' ? Math.min(config.opacity, 0.55) : config.opacity,
    wireframe: config.type === 'wireframe' || config.wireframe
  };
  if (config.texture && config.texture !== 'none') {
    const textureColors = {
      brick: ['#52333b', '#d99b80'],
      concrete: ['#6a7280', '#b4c0cc'],
      wood: ['#5a3826', '#d59b63'],
      marble: ['#dce6f1', '#8595a7'],
      metal: ['#596575', '#d6f0ff'],
      fabric: ['#334155', '#94a3b8']
    };
    params.map = canvasTexture(config.texture, ...(textureColors[config.texture] ?? textureColors.concrete));
  }
  let material;
  if (config.type === 'toon') {
    material = new THREE.MeshToonMaterial(params);
  } else {
    material = new THREE.MeshPhysicalMaterial({
      ...params,
      transmission: config.type === 'glass' ? 0.35 : 0,
      thickness: config.type === 'glass' ? 0.45 : 0,
      clearcoat: ['metallic', 'glass', 'holographic'].includes(config.type) ? 0.8 : 0.1,
      emissive: ['emissive', 'holographic'].includes(config.type) ? color : new THREE.Color('#000000'),
      emissiveIntensity: ['emissive', 'holographic'].includes(config.type) ? config.emissiveIntensity + 0.35 : config.emissiveIntensity * 0.15
    });
  }
  material.userData.gestureforgeMaterial = config.type;
  materialCache.set(cacheKey, material);
  return material.clone();
};

const outlineMaterial = new THREE.MeshBasicMaterial({
  color: '#EAF7FF',
  transparent: true,
  opacity: 0.16,
  side: THREE.BackSide
});

export class ObjectFactory {
  static create(object) {
    const material = createMaterial(object.material);
    let mesh;
    switch (object.type) {
      case 'sphere':
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 48, 28), material);
        break;
      case 'cylinder':
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.92, 40), material);
        break;
      case 'cone':
        mesh = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.95, 36), material);
        break;
      case 'torus':
        mesh = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.12, 24, 64), material);
        break;
      case 'plane':
        mesh = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.035, 1.45), material);
        break;
      case 'pyramid':
        mesh = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.95, 4), material);
        break;
      case 'capsule':
        mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.78, 16, 32), material);
        break;
      case 'icosahedron':
        mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), material);
        break;
      case 'wall':
        mesh = ObjectFactory.wall(material);
        break;
      case 'door':
        mesh = ObjectFactory.door(material);
        break;
      case 'window':
        mesh = ObjectFactory.window(material);
        break;
      case 'roof':
        mesh = ObjectFactory.roof(material);
        break;
      case 'staircase':
        mesh = ObjectFactory.staircase(material);
        break;
      case 'pillar':
        mesh = ObjectFactory.pillar(material);
        break;
      case 'tree':
        mesh = ObjectFactory.tree(material, object.material?.color);
        break;
      case 'rock':
        mesh = ObjectFactory.rock(material);
        break;
      case 'mountain':
        mesh = ObjectFactory.mountain(material);
        break;
      case 'ground':
        mesh = ObjectFactory.ground(material);
        break;
      case 'house':
        mesh = ObjectFactory.house(object);
        break;
      case 'table':
        mesh = ObjectFactory.table(object);
        break;
      case 'bridge':
        mesh = ObjectFactory.bridge(object);
        break;
      case 'tower':
        mesh = ObjectFactory.tower(object);
        break;
      case 'curve':
        mesh = ObjectFactory.curve(object);
        break;
      case 'cube':
      default:
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.82, 2, 2, 2), material);
        break;
    }
    mesh.name = object.name;
    mesh.userData.objectId = object.id;
    mesh.userData.objectType = object.type;
    mesh.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.objectId = object.id;
    });
    ObjectFactory.applyTransform(mesh, object);
    ObjectFactory.addSelectionShell(mesh);
    return mesh;
  }

  static applyTransform(mesh, object) {
    mesh.position.set(...object.position);
    mesh.rotation.set(...object.rotation);
    mesh.scale.set(...object.scale);
    mesh.visible = object.visible;
  }

  static updateMaterial(mesh, materialConfig) {
    const material = createMaterial(materialConfig);
    mesh.traverse((child) => {
      if (child.isMesh && !child.userData.selectionShell) child.material = material.clone();
    });
  }

  static addSelectionShell(mesh) {
    const target = mesh.isGroup ? mesh.children.find((child) => child.isMesh) : mesh;
    if (!target?.geometry) return;
    const shell = new THREE.Mesh(target.geometry.clone(), outlineMaterial.clone());
    shell.name = 'Selection Glow';
    shell.scale.multiplyScalar(1.08);
    shell.visible = false;
    shell.userData.selectionShell = true;
    target.add(shell);
  }

  static setSelected(mesh, selected) {
    mesh.traverse((child) => {
      if (child.userData.selectionShell) child.visible = selected;
      if (child.material && !child.userData.selectionShell && child.material.emissive) {
        child.material.emissiveIntensity = selected ? Math.max(child.material.emissiveIntensity, 0.45) : child.material.userData?.baseEmissiveIntensity ?? child.material.emissiveIntensity;
      }
    });
    mesh.userData.selected = selected;
  }

  static getPhysicsShape(object) {
    const scale = object.scale ?? [1, 1, 1];
    switch (object.type) {
      case 'sphere':
      case 'icosahedron':
        return shapes.sphere(0.5 * Math.max(...scale));
      case 'cylinder':
      case 'pillar':
      case 'capsule':
        return shapes.cylinder(0.45 * scale[0], 0.45 * scale[2], 1 * scale[1]);
      case 'plane':
      case 'ground':
        return shapes.plane();
      case 'wall':
        return shapes.box([1.35 * scale[0], 0.75 * scale[1], 0.12 * scale[2]]);
      case 'tower':
      case 'house':
      case 'bridge':
      case 'table':
        return shapes.box([1.3 * scale[0], 1.15 * scale[1], 1.3 * scale[2]]);
      default:
        return shapes.box([0.86 * scale[0], 0.86 * scale[1], 0.86 * scale[2]]);
    }
  }

  static wall(material) {
    const group = new THREE.Group();
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.78, 0.12), material);
    group.add(block);
    return group;
  }

  static door(material) {
    const group = new THREE.Group();
    const sideGeo = new THREE.BoxGeometry(0.1, 1.0, 0.12);
    const topGeo = new THREE.BoxGeometry(0.75, 0.1, 0.12);
    [
      [-0.38, 0, 0],
      [0.38, 0, 0]
    ].forEach((pos) => {
      const post = new THREE.Mesh(sideGeo, material);
      post.position.set(...pos);
      group.add(post);
    });
    const lintel = new THREE.Mesh(topGeo, material);
    lintel.position.y = 0.5;
    group.add(lintel);
    return group;
  }

  static window(material) {
    const group = new THREE.Group();
    const barGeo = new THREE.BoxGeometry(0.78, 0.08, 0.1);
    const sideGeo = new THREE.BoxGeometry(0.08, 0.58, 0.1);
    [-0.32, 0.32].forEach((x) => {
      const bar = new THREE.Mesh(sideGeo, material);
      bar.position.x = x;
      group.add(bar);
    });
    [-0.25, 0.25].forEach((y) => {
      const bar = new THREE.Mesh(barGeo, material);
      bar.position.y = y;
      group.add(bar);
    });
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.42, 0.025),
      createMaterial({ color: '#E0F2FE', type: 'glass', opacity: 0.35, roughness: 0.05 })
    );
    group.add(glass);
    return group;
  }

  static roof(material) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.75, -0.3);
    shape.lineTo(0, 0.48);
    shape.lineTo(0.75, -0.3);
    shape.lineTo(-0.75, -0.3);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.9, bevelEnabled: false });
    geometry.center();
    return new THREE.Mesh(geometry, material);
  }

  static staircase(material) {
    const group = new THREE.Group();
    for (let i = 0; i < 6; i += 1) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.12, 0.2), material);
      step.position.set(0, i * 0.1 - 0.25, i * 0.16 - 0.42);
      group.add(step);
    }
    return group;
  }

  static pillar(material) {
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 1.1, 32), material);
    const capA = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.14, 32), material);
    const capB = capA.clone();
    capA.position.y = 0.6;
    capB.position.y = -0.6;
    group.add(shaft, capA, capB);
    return group;
  }

  static tree(material, color = '#34D399') {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.62, 8), createMaterial({ color: '#8B5E3C', type: 'matte' }));
    trunk.position.y = -0.15;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.95, 8), createMaterial({ color, type: 'toon', roughness: 0.72 }));
    crown.position.y = 0.42;
    group.add(trunk, crown);
    return group;
  }

  static rock(material) {
    return new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 1), material);
  }

  static mountain(material) {
    const group = new THREE.Group();
    [-0.34, 0.2, 0.52].forEach((x, index) => {
      const peak = new THREE.Mesh(new THREE.ConeGeometry(0.46 - index * 0.05, 0.9 + index * 0.18, 5), material);
      peak.position.set(x, index * 0.08, 0);
      group.add(peak);
    });
    return group;
  }

  static ground(material) {
    const grid = createNeonGridTexture();
    const groundMaterial = createMaterial({ ...material.userData?.config, color: '#102436', type: 'holographic', opacity: 0.45 });
    groundMaterial.map = grid;
    groundMaterial.transparent = true;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(3, 0.03, 3), groundMaterial);
    mesh.receiveShadow = true;
    return mesh;
  }

  static house(object) {
    const group = new THREE.Group();
    const wall = createMaterial({ color: object.material?.color ?? '#94A3B8', type: 'matte', texture: 'brick' });
    const roof = createMaterial({ color: '#D97706', type: 'matte', texture: 'wood' });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.82, 1.0), wall);
    const roofMesh = ObjectFactory.roof(roof);
    roofMesh.position.y = 0.6;
    const door = ObjectFactory.door(createMaterial({ color: '#38BDF8', type: 'holographic', opacity: 0.75 }));
    door.position.set(0, -0.18, -0.53);
    door.scale.set(0.55, 0.72, 0.6);
    const windowA = ObjectFactory.window(createMaterial({ color: '#E0F2FE', type: 'glass', opacity: 0.45 }));
    windowA.position.set(-0.36, 0.1, -0.54);
    windowA.scale.set(0.42, 0.42, 0.5);
    const windowB = windowA.clone();
    windowB.position.x = 0.36;
    group.add(body, roofMesh, door, windowA, windowB);
    return group;
  }

  static table(object) {
    const group = new THREE.Group();
    const material = createMaterial({ ...object.material, texture: object.material?.texture === 'none' ? 'wood' : object.material?.texture });
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.12, 0.82), material);
    top.position.y = 0.32;
    group.add(top);
    [-0.48, 0.48].forEach((x) => {
      [-0.3, 0.3].forEach((z) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.65, 12), material);
        leg.position.set(x, -0.02, z);
        group.add(leg);
      });
    });
    return group;
  }

  static bridge(object) {
    const group = new THREE.Group();
    const material = createMaterial(object.material);
    const span = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 0.42), material);
    span.position.y = 0.15;
    group.add(span);
    [-0.62, 0.62].forEach((x) => {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.32), material);
      pylon.position.set(x, -0.22, 0);
      group.add(pylon);
    });
    return group;
  }

  static tower(object) {
    const group = new THREE.Group();
    const material = createMaterial(object.material);
    for (let i = 0; i < 5; i += 1) {
      const size = 0.75 - i * 0.08;
      const block = new THREE.Mesh(new THREE.BoxGeometry(size, 0.22, size), material);
      block.position.y = i * 0.22 - 0.42;
      block.rotation.y = i * 0.18;
      group.add(block);
    }
    return group;
  }

  static curve(object) {
    const points =
      object.geometry?.path?.length > 1
        ? object.geometry.path.map((point) => new THREE.Vector3(...point))
        : [
            new THREE.Vector3(-0.5, 0, 0),
            new THREE.Vector3(-0.2, 0.24, -0.18),
            new THREE.Vector3(0.18, -0.12, 0.12),
            new THREE.Vector3(0.52, 0.18, 0)
          ];
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.035, 12, false), createMaterial(object.material));
  }
}
