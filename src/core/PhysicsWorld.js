import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.fixedTimeStep = 1 / 60;
    this.maxSubSteps = 3;
    this.bodies = new Map();
    this.materials = {
      default: new CANNON.Material('default'),
      ground: new CANNON.Material('ground')
    };
    this.world.defaultContactMaterial = new CANNON.ContactMaterial(this.materials.default, this.materials.ground, {
      friction: 0.52,
      restitution: 0.36
    });
    this.groundBody = this.createGround();
  }

  createGround() {
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      material: this.materials.ground,
      shape: new CANNON.Plane()
    });
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    body.position.set(0, 0, 0);
    this.world.addBody(body);
    return body;
  }

  addBody(id, shape, transform, physics = {}) {
    this.removeBody(id);
    const body = new CANNON.Body({
      mass: physics.mode === 'static' ? 0 : physics.mass ?? 1,
      material: this.materials.default,
      linearDamping: 0.08,
      angularDamping: 0.08
    });
    body.addShape(shape);
    body.position.set(...(transform.position ?? [0, 1, -1.5]));
    body.quaternion.setFromEuler(...(transform.rotation ?? [0, 0, 0]));
    body.collisionResponse = physics.mode !== 'kinematic';
    body.type = physics.mode === 'kinematic' ? CANNON.Body.KINEMATIC : body.type;
    this.world.addBody(body);
    this.bodies.set(id, body);
    return body;
  }

  removeBody(id) {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(id);
    }
  }

  clearExceptGround() {
    [...this.bodies.keys()].forEach((id) => this.removeBody(id));
  }

  setTransform(id, transform) {
    const body = this.bodies.get(id);
    if (!body) return;
    body.position.set(...transform.position);
    body.quaternion.setFromEuler(...transform.rotation);
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
  }

  setMode(id, mode, mass = 1) {
    const body = this.bodies.get(id);
    if (!body) return;
    body.mass = mode === 'static' ? 0 : mass;
    body.type = mode === 'kinematic' ? CANNON.Body.KINEMATIC : mode === 'static' ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC;
    body.updateMassProperties();
  }

  applyImpulse(id, vector, worldPoint = [0, 0, 0]) {
    const body = this.bodies.get(id);
    if (!body) return;
    body.wakeUp();
    body.applyImpulse(new CANNON.Vec3(...vector), new CANNON.Vec3(...worldPoint));
  }

  applyExplosion(center, strength = 6, radius = 4) {
    const origin = new CANNON.Vec3(...center);
    this.bodies.forEach((body) => {
      const direction = body.position.vsub(origin);
      const distance = Math.max(direction.length(), 0.1);
      if (distance > radius || body.mass === 0) return;
      direction.normalize();
      const impulse = direction.scale((strength * body.mass) / distance);
      body.wakeUp();
      body.applyImpulse(impulse, body.position);
    });
  }

  step(delta) {
    this.world.step(this.fixedTimeStep, delta, this.maxSubSteps);
  }

  syncMesh(id, object3d) {
    const body = this.bodies.get(id);
    if (!body || !object3d) return;
    object3d.position.copy(body.position);
    object3d.quaternion.copy(body.quaternion);
  }
}

export const shapes = {
  box: (size = [1, 1, 1]) => new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2)),
  sphere: (radius = 0.5) => new CANNON.Sphere(radius),
  cylinder: (radiusTop = 0.5, radiusBottom = 0.5, height = 1, segments = 16) =>
    new CANNON.Cylinder(radiusTop, radiusBottom, height, segments),
  plane: () => new CANNON.Box(new CANNON.Vec3(1.5, 0.025, 1.5))
};
