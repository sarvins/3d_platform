import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let _renderer, _camera, _controls;
let _orthoCamera, _activeCamera;
let _ground, _grid, _scene;
let _midY = 4;

export function initScene(container) {
  const scene = new THREE.Scene();
  _scene = scene;
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

  _orthoCamera = new THREE.OrthographicCamera(-7, 7, 10, -5, 0.1, 200);
  _orthoCamera.position.set(0, _midY, 30);
  _orthoCamera.lookAt(0, _midY, 0);
  _activeCamera = _camera;

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
  _ground = new THREE.Mesh(groundGeo, groundMat);
  _ground.rotation.x = -Math.PI / 2;
  _ground.receiveShadow = true;
  scene.add(_ground);

  _grid = new THREE.GridHelper(40, 40, 0xaaccaa, 0xaaccaa);
  _grid.material.opacity = 0.25;
  _grid.material.transparent = true;
  scene.add(_grid);

  new ResizeObserver(() => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    _renderer.setSize(nw, nh);
    _camera.aspect = nw / nh;
    _camera.updateProjectionMatrix();
    _orthoCamera.updateProjectionMatrix();
  }).observe(container);

  (function animate() {
    requestAnimationFrame(animate);
    _controls.update();
    _renderer.render(scene, _activeCamera);
  })();

  return scene;
}

export function setCameraTarget(y) {
  if (!_controls) return;
  _controls.target.set(0, Math.max(2, y), 0);
}

export function setViewMode(mode) {
  if (mode === 'perspective') {
    _activeCamera = _camera;
    _controls.enabled = true;
    _ground.visible = true;
    _grid.visible = true;
    _scene.background.set(0xB8D4E8);
    _scene.fog.near = 70; _scene.fog.far = 130;
  } else {
    _activeCamera = _orthoCamera;
    _controls.enabled = false;
    _ground.visible = false;
    _grid.visible = false;
    const pos = mode === 'front_sectie'
      ? [0, _midY, 30]
      : [30, _midY, 0];
    _scene.background.set(0xF5F5F5);
    _scene.fog.near = 500; _scene.fog.far = 600;
    _orthoCamera.position.set(...pos);
    _orthoCamera.lookAt(0, _midY, 0);
    _orthoCamera.updateProjectionMatrix();
  }
}

export function updateOrthoCamera(towerH, pileDepthScene) {
  _midY = (towerH - pileDepthScene) / 2;
  _orthoCamera.top    =  towerH + 2;
  _orthoCamera.bottom = -(pileDepthScene + 1.5);
  _orthoCamera.left   = -7;
  _orthoCamera.right  =  7;
  _orthoCamera.updateProjectionMatrix();
  if (_activeCamera === _orthoCamera) {
    _orthoCamera.position.y = _midY;
    _orthoCamera.lookAt(0, _midY, 0);
  }
}
