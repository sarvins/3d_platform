import * as THREE from 'three';
import { setCameraTarget, updateOrthoCamera } from './scene.js';

export function getPileDepthM(floors) {
  return Math.round(Math.max(0.8, floors * 0.12) * 7);
}

const FLOOR_HEIGHT = 0.5;
const SLAB_H       = 0.38;
const BUILDING_W   = 5.0;
const BUILDING_D   = 5.0;
const MAX_FLOORS   = 80;

const CORE_SIZES = {
  A: [1.2, 2.0], B: [1.6, 2.0], C: [2.0, 2.0], D: [2.4, 2.4], E: [2.8, 2.8],
};

const MAT = {
  floor:       new THREE.MeshLambertMaterial({ color: 0xC8B49A }),
  core:        new THREE.MeshLambertMaterial({ color: 0x8A7262 }),
  foundation:  new THREE.MeshLambertMaterial({ color: 0xA09080 }),
  pile:        new THREE.MeshLambertMaterial({ color: 0x4A4A5A }),
  elevator:    new THREE.MeshLambertMaterial({ color: 0xD0E4F0 }),
};

export class Tower {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);

    this._floors = -1;
    this._coreVariant = null;
    this._elevatorCount = -1;
    this._dummy = new THREE.Object3D();

    this._buildFloors();
    this._buildFoundation();
    this._buildCore();
    this._buildPiles();
    this._buildElevators();
  }

  _buildFloors() {
    const geo = new THREE.BoxGeometry(BUILDING_W, SLAB_H, BUILDING_D);
    this._floorMesh = new THREE.InstancedMesh(geo, MAT.floor, MAX_FLOORS);
    this._floorMesh.castShadow = true;
    this._floorMesh.receiveShadow = true;
    this._floorMesh.count = 0;
    this.group.add(this._floorMesh);
  }

  _buildFoundation() {
    const geo = new THREE.BoxGeometry(BUILDING_W + 0.4, 0.25, BUILDING_D + 0.4);
    this._foundation = new THREE.Mesh(geo, MAT.foundation);
    this._foundation.position.y = -0.125;
    this._foundation.receiveShadow = true;
    this.group.add(this._foundation);
  }

  _buildCore() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    this._coreMesh = new THREE.Mesh(geo, MAT.core);
    this._coreMesh.castShadow = true;
    this.group.add(this._coreMesh);
  }

  _buildPiles() {
    this._pileGroup = new THREE.Group();
    this.group.add(this._pileGroup);
  }

  _buildElevators() {
    this._elevatorGroup = new THREE.Group();
    this.group.add(this._elevatorGroup);
    this._elevatorMeshes = [];
    const xPositions = [-0.6, -0.3, 0, 0.3, 0.6];
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BoxGeometry(0.22, 1, 0.22);
      const mesh = new THREE.Mesh(geo, MAT.elevator);
      mesh.position.x = xPositions[i];
      mesh.visible = false;
      this._elevatorGroup.add(mesh);
      this._elevatorMeshes.push(mesh);
    }
  }

  _updatePiles(floors) {
    while (this._pileGroup.children.length) {
      this._pileGroup.remove(this._pileGroup.children[0]);
    }
    const depth = Math.max(0.8, floors * 0.12);
    let positions;
    if (floors < 9) {
      positions = [[-1.5,-1.5],[-1.5,1.5],[1.5,-1.5],[1.5,1.5],[0,0]];
    } else if (floors < 28) {
      positions = [];
      for (const x of [-1.8,-0.6,0.6,1.8])
        for (const z of [-1.8,-0.6,0.6,1.8])
          positions.push([x, z]);
    } else {
      positions = [];
      for (const x of [-2,-1,0,1,2])
        for (const z of [-2,-1,0,1,2])
          positions.push([x, z]);
    }
    const geo = new THREE.CylinderGeometry(0.06, 0.072, depth, 8);
    for (const [x, z] of positions) {
      const mesh = new THREE.Mesh(geo, MAT.pile);
      mesh.position.set(x, -depth / 2 - 0.25, z);
      mesh.castShadow = true;
      this._pileGroup.add(mesh);
    }
  }

  update(floors, impact) {
    const towerH = floors * FLOOR_HEIGHT;

    // Floors
    if (floors !== this._floors) {
      this._floorMesh.count = floors;
      for (let i = 0; i < floors; i++) {
        this._dummy.position.set(0, i * FLOOR_HEIGHT + SLAB_H / 2, 0);
        this._dummy.updateMatrix();
        this._floorMesh.setMatrixAt(i, this._dummy.matrix);
      }
      this._floorMesh.instanceMatrix.needsUpdate = true;
      this._updatePiles(floors);
      setCameraTarget(towerH * 0.45);
      const pileDepthScene = Math.max(0.8, floors * 0.12);
      updateOrthoCamera(towerH, pileDepthScene);
    }

    // Core — update on every call since height always changes with floors
    const variant = impact.structural.core_variant;
    const [cw, cd] = CORE_SIZES[variant];
    this._coreMesh.scale.set(cw, towerH, cd);
    this._coreMesh.position.y = towerH / 2;
    this._coreVariant = variant;

    // Elevators
    const elevCount = impact.structural.elevator_count;
    if (elevCount !== this._elevatorCount) {
      this._elevatorMeshes.forEach((m, i) => { m.visible = i < elevCount; });
      this._elevatorCount = elevCount;
    }
    this._elevatorMeshes.forEach(m => {
      if (m.visible) {
        m.scale.y = towerH;
        m.position.y = towerH / 2;
      }
    });

    this._floors = floors;
  }
}
