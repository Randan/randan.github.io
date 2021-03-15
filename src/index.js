import './index.scss';
import {
  AmbientLight,
  BackSide,
  Color,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TextureLoader,
  WebGLRenderer,
} from 'three';

class Globe {
  constructor(container) {
    this.container = document.querySelector(container);
    this.canvas = null;

    this.width = null;
    this.height = null;

    this.radius = 0.5;
    this.segments = 32;
    this.rotation = 0;

    this.scene = null;
    this.camerascene = null;
    this.rendererscene = null;
    this.lightscene = null;

    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;

    this.render = this.render.bind(this);
    this.resizeListenerCB = this.resizeListenerCB.bind(this);
    this.rotateScene = this.rotateScene.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.sphereColor = 0x682CE8;
    this.landPic = '../assets/images/land.png';
    this.bgPic = '../assets/images/bg.png';
  }

  initVars() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, this.width / this.height, 0.01, 1000);
    this.renderer = new WebGLRenderer();
    this.light = new DirectionalLight(0xffffff, 0.50);
  }

  clearVars() {
    this.container.innerHTML = '';

    this.width = null;
    this.height = null;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.light = null;
    this.canvas = null;
  }

  init() {
    this.initVars();

    this.camera.position.z = 1;
    this.camera.position.y = 0.8;
    this.camera.position.x = -0.2;
    this.camera.rotation.x = (-15 * Math.PI) / 180;

    this.renderer.setSize(this.width, this.height);

    this.sphere = this.createSphere(this.radius, this.segments);

    this.land = this.createLand(this.radius, this.segments);
    this.land.rotation.y = this.rotation;

    this.bg = this.createBackground(90, 64);

    this.scene.add(new AmbientLight(0x333333));
    this.scene.add(this.light);
    this.scene.add(this.sphere);
    this.scene.add(this.land);
    this.scene.add(this.bg);

    this.container.appendChild(this.renderer.domElement);
    this.render();

    this.canvas = document.querySelector('canvas');
    this.addMouseHandler(this.canvas);
    this.resizeListener();
  }

  createSphere(sphereRadius, sphereSegments) {
    return new Mesh(
      new SphereGeometry(sphereRadius, sphereSegments, sphereSegments),
      new MeshPhongMaterial({
        color: new Color(this.sphereColor),
      }),
    );
  }

  createLand(landRadius, landSegments) {
    return new Mesh(
      new SphereGeometry(landRadius + 0.006, landSegments, landSegments),
      new MeshPhongMaterial({
        map: new TextureLoader().load(this.landPic),
        transparent: true,
      }),
    );
  }

  createBackground(bgRadius, bgSegments) {
    return new Mesh(
      new SphereGeometry(bgRadius, bgSegments, bgSegments),
      new MeshBasicMaterial({
        map: new TextureLoader().load(this.bgPic),
        side: BackSide,
      }),
    );
  }

  render() {
    this.land.rotation.y += 0.0005;
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  }

  rotateScene(deltaX, deltaY) {
    this.land.rotation.y += deltaX / 1500;
    this.land.rotation.x += deltaY / 1500;
  }

  onMouseMove(evt) {
    if (!this.mouseDown) return;

    evt.preventDefault();

    const deltaX = evt.clientX - this.mouseX;
    const deltaY = evt.clientY - this.mouseY;

    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;

    this.rotateScene(deltaX, deltaY);
  }

  onMouseDown(evt) {
    evt.preventDefault();

    this.mouseDown = true;
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
  }

  onMouseUp(evt) {
    evt.preventDefault();

    this.mouseDown = false;
    this.land.rotation.x = 0;
  }

  addMouseHandler(canvas) {
    canvas.addEventListener('mousemove', this.onMouseMove, false);
    canvas.addEventListener('mousedown', this.onMouseDown, false);
    canvas.addEventListener('mouseup', this.onMouseUp, false);
  }

  removeMouseHandler(canvas) {
    canvas.removeEventListener('mousemove', this.onMouseMove, false);
    canvas.removeEventListener('mousedown', this.onMouseDown, false);
    canvas.removeEventListener('mouseup', this.onMouseUp, false);
  }

  resizeListenerCB() {
    let timer;

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      window.removeEventListener('resize', this.resizeListenerCB, false);
      this.removeMouseHandler(this.canvas);
      this.clearVars();

      if (this.container.innerHTML === '') this.init();
    }, 1000);
  }

  resizeListener() {
    window.addEventListener('resize', this.resizeListenerCB, false);
  }
}

function initGlobe(selector) {
  try {
    if (!document.querySelector(selector)) return;

    const globe = new Globe(selector);
    globe.init();
  } catch (_) {
    throw new Error('Use valid selector!');
  }
}

initGlobe('#globe');
