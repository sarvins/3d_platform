import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let _renderer, _camera, _controls;

export function initScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xB8D4E8);
  scene.fog = new THREE.Fog(0xB8D4E8, 70, 130);

  const w = container.clientWidth;
  const h = container.clientHeight;

  _renderer = new THREE.WebGLRenderer({ antialias: true });
  _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  _renderer.setSize(w, h);
  _renderer.shadowMap.enabled = true;
  _renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(_renderer.domElement);

  _camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 200);
  _camera.position.set(14, 8, 14);

  _controls = new OrbitControls(_camera, _renderer.domElement);
  _controls.enableDamping = true;
  _controls.dampingFactor = 0.06;
  _controls.minDistance = 5;
  _controls.maxDistance = 80;
  _controls.maxPolarAngle = Math.PI / 2 - 0.05;
  _controls.target.set(0, 4, 0);
  _controls.update();

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(15, 25, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 45;
  sun.shadow.camera.bottom = -10;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xc8dff0, 0.4);
  fill.position.set(-10, 5, -8);
  scene.add(fill);

  const groundGeo = new THREE.PlaneGeometry(60, 60);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0xD8E8D0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(40, 40, 0xaaccaa, 0xaaccaa);
  grid.material.opacity = 0.25;
  grid.material.transparent = true;
  scene.add(grid);

  new ResizeObserver(() => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    _renderer.setSize(nw, nh);
    _camera.aspect = nw / nh;
    _camera.updateProjectionMatrix();
  }).observe(container);

  (function animate() {
    requestAnimationFrame(animate);
    _controls.update();
    _renderer.render(scene, _camera);
  })();

  return scene;
}

export function setCameraTarget(y) {
  if (!_controls) return;
  _controls.target.set(0, Math.max(2, y), 0);
}
