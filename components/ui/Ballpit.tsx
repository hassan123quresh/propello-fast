import React, { useRef, useEffect } from 'react';
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshPhysicalMaterial,
  ShaderChunk,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  SphereGeometry,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane,
  WebGLRendererParameters,
  Euler
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface RenderState {
  elapsed: number;
  delta: number;
}

interface RenderSize {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
  pixelRatio: number;
}

class ThreeRender {
  params: any;
  canvas!: HTMLCanvasElement;
  camera!: PerspectiveCamera;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  cameraFov!: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
  scene!: Scene;
  renderer!: WebGLRenderer;
  postprocessing?: any;
  size: RenderSize = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  
  // Callbacks
  onBeforeRender: (state: RenderState) => void = () => {};
  onAfterRender: (state: RenderState) => void = () => {};
  onAfterResize: (size: RenderSize) => void = () => {};

  private isIntersecting = false;
  private isAnimating = false;
  public isDisposed = false;
  
  private observer?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private resizeTimeout?: ReturnType<typeof setTimeout>;
  
  private clock = new Clock();
  private timeState: RenderState = { elapsed: 0, delta: 0 };
  private animationFrameId?: number;

  constructor(params: any) {
    this.params = { ...params };
    this.initCamera();
    this.initScene();
    this.initRenderer();
    this.resize();
    this.initObservers();
  }

  private initCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }

  private initScene() {
    this.scene = new Scene();
  }

  private initRenderer() {
    if (this.params.canvas) {
      this.canvas = this.params.canvas;
    } else if (this.params.id) {
      const el = document.getElementById(this.params.id);
      if (el instanceof HTMLCanvasElement) {
        this.canvas = el;
      }
    }
    
    if (!this.canvas) {
      console.error('Three: Missing canvas or id parameter');
      return;
    }

    this.canvas.style.display = 'block';
    const rendererParams: WebGLRendererParameters = {
      canvas: this.canvas,
      powerPreference: 'high-performance',
      ...(this.params.rendererOptions ?? {})
    };
    this.renderer = new WebGLRenderer(rendererParams);
    this.renderer.outputColorSpace = SRGBColorSpace;
  }

  private initObservers() {
    if (!(this.params.size instanceof Object)) {
      window.addEventListener('resize', this.onWindowResize.bind(this));
      if (this.params.size === 'parent' && this.canvas.parentNode) {
        this.resizeObserver = new ResizeObserver(this.onWindowResize.bind(this));
        this.resizeObserver.observe(this.canvas.parentNode as Element);
      }
    }
    this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
      root: null,
      rootMargin: '0px',
      threshold: 0
    });
    this.observer.observe(this.canvas);
    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
  }

  private disposeObservers() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.resizeObserver?.disconnect();
    this.observer?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibilityChange.bind(this));
  }

  private onIntersection(entries: IntersectionObserverEntry[]) {
    this.isIntersecting = entries[0].isIntersecting;
    this.isIntersecting ? this.startAnimation() : this.stopAnimation();
  }

  private onVisibilityChange() {
    if (this.isIntersecting) {
      document.hidden ? this.stopAnimation() : this.startAnimation();
    }
  }

  private onWindowResize() {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(this.resize.bind(this), 100);
  }

  public resize() {
    let width, height;
    if (this.params.size instanceof Object) {
      width = this.params.size.width;
      height = this.params.size.height;
    } else if (this.params.size === 'parent' && this.canvas.parentNode) {
      width = (this.canvas.parentNode as HTMLElement).offsetWidth;
      height = (this.canvas.parentNode as HTMLElement).offsetHeight;
    } else {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    this.size.width = width;
    this.size.height = height;
    this.size.ratio = width / height;
    
    this.updateCamera();
    this.updateRenderer();
    this.onAfterResize(this.size);
  }

  private updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.adjustFov(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.adjustFov(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  private adjustFov(aspect: number) {
    const t = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / aspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(t));
  }

  private updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else {
      // Assuming OrthographicCamera for fallback, though strictly typed as PerspectiveCamera above
      // If Orthographic is needed, types should be adjusted.
      // Keeping logic from original file.
      /*
      this.size.wHeight = this.camera.top - this.camera.bottom;
      this.size.wWidth = this.camera.right - this.camera.left;
      */
    }
  }

  private updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.postprocessing?.setSize(this.size.width, this.size.height);
    let pixelRatio = window.devicePixelRatio;
    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
      pixelRatio = this.maxPixelRatio;
    } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
      pixelRatio = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(pixelRatio);
    this.size.pixelRatio = pixelRatio;
  }

  public renderFunc = () => {
      this.renderer.render(this.scene, this.camera);
  }

  private startAnimation() {
    if (this.isAnimating) return;
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.timeState.delta = this.clock.getDelta();
      this.timeState.elapsed += this.timeState.delta;
      this.onBeforeRender(this.timeState);
      this.renderFunc();
      this.onAfterRender(this.timeState);
    };
    this.isAnimating = true;
    this.clock.start();
    animate();
  }

  private stopAnimation() {
    if (this.isAnimating && this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
      this.isAnimating = false;
      this.clock.stop();
    }
  }

  public clear() {
    this.scene.traverse((object: any) => {
      if (object.isMesh && typeof object.material === 'object' && object.material !== null) {
        Object.keys(object.material).forEach(prop => {
          const materialProp = object.material[prop];
          if (materialProp !== null && typeof materialProp === 'object' && typeof materialProp.dispose === 'function') {
            materialProp.dispose();
          }
        });
        object.material.dispose();
        object.geometry.dispose();
      }
    });
    this.scene.clear();
  }

  public dispose() {
    this.disposeObservers();
    this.stopAnimation();
    this.clear();
    this.postprocessing?.dispose();
    this.renderer.dispose();
    this.isDisposed = true;
  }
}

// Mouse Interaction
const mouseMap = new Map();
const mousePosition = new Vector2();
let mouseListenersAdded = false;

interface MouseConfig {
  domElement: HTMLElement;
  position: Vector2;
  nPosition: Vector2;
  hover: boolean;
  touching: boolean;
  onEnter: (e: MouseConfig) => void;
  onMove: (e: MouseConfig) => void;
  onClick: (e: MouseConfig) => void;
  onLeave: (e: MouseConfig) => void;
  dispose?: () => void;
  [key: string]: any;
}

function createMouse(options: Partial<MouseConfig> & { domElement: HTMLElement }) {
  const config: MouseConfig = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter() {},
    onMove() {},
    onClick() {},
    onLeave() {},
    ...options
  } as MouseConfig;

  (function (domElement, conf) {
    if (!mouseMap.has(domElement)) {
      mouseMap.set(domElement, conf);
      if (!mouseListenersAdded) {
        document.body.addEventListener('pointermove', onMouseMove);
        document.body.addEventListener('pointerleave', onMouseLeave);
        document.body.addEventListener('click', onMouseClick);

        document.body.addEventListener('touchstart', onTouchStart, { passive: false });
        document.body.addEventListener('touchmove', onTouchMove, { passive: false });
        document.body.addEventListener('touchend', onTouchEnd, { passive: false });
        document.body.addEventListener('touchcancel', onTouchEnd, { passive: false });

        mouseListenersAdded = true;
      }
    }
  })(options.domElement, config);

  config.dispose = () => {
    const domElement = options.domElement;
    mouseMap.delete(domElement);
    if (mouseMap.size === 0) {
      document.body.removeEventListener('pointermove', onMouseMove);
      document.body.removeEventListener('pointerleave', onMouseLeave);
      document.body.removeEventListener('click', onMouseClick);

      document.body.removeEventListener('touchstart', onTouchStart);
      document.body.removeEventListener('touchmove', onTouchMove);
      document.body.removeEventListener('touchend', onTouchEnd);
      document.body.removeEventListener('touchcancel', onTouchEnd);

      mouseListenersAdded = false;
    }
  };
  return config;
}

function onMouseMove(e: PointerEvent) {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
  processInteraction();
}

function processInteraction() {
  for (const [elem, conf] of mouseMap) {
    const rect = elem.getBoundingClientRect();
    if (isInside(rect)) {
      updatePosition(conf, rect);
      if (!conf.hover) {
        conf.hover = true;
        conf.onEnter(conf);
      }
      conf.onMove(conf);
    } else if (conf.hover && !conf.touching) {
      conf.hover = false;
      conf.onLeave(conf);
    }
  }
}

function onMouseClick(e: MouseEvent) {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
  for (const [elem, conf] of mouseMap) {
    const rect = elem.getBoundingClientRect();
    updatePosition(conf, rect);
    if (isInside(rect)) conf.onClick(conf);
  }
}

function onMouseLeave() {
  for (const conf of mouseMap.values()) {
    if (conf.hover) {
      conf.hover = false;
      conf.onLeave(conf);
    }
  }
}

function onTouchStart(e: TouchEvent) {
  // Allow default behavior (scrolling)
  if (e.touches.length > 0) {
    mousePosition.x = e.touches[0].clientX;
    mousePosition.y = e.touches[0].clientY;

    for (const [elem, conf] of mouseMap) {
      const rect = elem.getBoundingClientRect();
      if (isInside(rect)) {
        conf.touching = true;
        updatePosition(conf, rect);
        if (!conf.hover) {
          conf.hover = true;
          conf.onEnter(conf);
        }
        conf.onMove(conf);
      }
    }
  }
}

function onTouchMove(e: TouchEvent) {
  // Allow default behavior (scrolling)
  if (e.touches.length > 0) {
    mousePosition.x = e.touches[0].clientX;
    mousePosition.y = e.touches[0].clientY;

    for (const [elem, conf] of mouseMap) {
      const rect = elem.getBoundingClientRect();
      updatePosition(conf, rect);

      if (isInside(rect)) {
        if (!conf.hover) {
          conf.hover = true;
          conf.touching = true;
          conf.onEnter(conf);
        }
        conf.onMove(conf);
      } else if (conf.hover && conf.touching) {
        conf.onMove(conf);
      }
    }
  }
}

function onTouchEnd() {
  for (const [, conf] of mouseMap) {
    if (conf.touching) {
      conf.touching = false;
      if (conf.hover) {
        conf.hover = false;
        conf.onLeave(conf);
      }
    }
  }
}

function updatePosition(conf: MouseConfig, rect: DOMRect) {
  const { position, nPosition } = conf;
  position.x = mousePosition.x - rect.left;
  position.y = mousePosition.y - rect.top;
  nPosition.x = (position.x / rect.width) * 2 - 1;
  nPosition.y = (-position.y / rect.height) * 2 + 1;
}

function isInside(rect: DOMRect) {
  const { x, y } = mousePosition;
  const { left, top, width, height } = rect;
  return x >= left && x <= left + width && y >= top && y <= top + height;
}

const { randFloat, randFloatSpread } = MathUtils;
const tempVec3_0 = new Vector3();
const tempVec3_1 = new Vector3();
const tempVec3_2 = new Vector3();
const tempVec3_3 = new Vector3();
const tempVec3_4 = new Vector3();
const tempVec3_5 = new Vector3();
const tempVec3_6 = new Vector3();
const tempVec3_7 = new Vector3();
const tempVec3_8 = new Vector3();
const tempVec3_9 = new Vector3();

class Physics {
  config: any;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center: Vector3;

  constructor(config: any) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3();
    this.initPositions();
    this.setSizes();
  }

  private initPositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const s = 3 * i;
      positionData[s] = randFloatSpread(2 * config.maxX);
      positionData[s + 1] = randFloatSpread(2 * config.maxY);
      positionData[s + 2] = randFloatSpread(2 * config.maxZ);
    }
  }

  private setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = randFloat(config.minSize, config.maxSize);
    }
  }

  public update(timeState: RenderState) {
    const { config, center, positionData, sizeData, velocityData } = this;
    let startIndex = 0;
    if (config.controlSphere0) {
      startIndex = 1;
      tempVec3_0.fromArray(positionData, 0);
      tempVec3_0.lerp(center, 0.1).toArray(positionData, 0);
      tempVec3_3.set(0, 0, 0).toArray(velocityData, 0);
    }
    
    // Update velocity and position
    for (let idx = startIndex; idx < config.count; idx++) {
      const base = 3 * idx;
      tempVec3_1.fromArray(positionData, base);
      tempVec3_4.fromArray(velocityData, base);
      tempVec3_4.y -= timeState.delta * config.gravity * sizeData[idx];
      tempVec3_4.multiplyScalar(config.friction);
      tempVec3_4.clampLength(0, config.maxVelocity);
      tempVec3_1.add(tempVec3_4);
      tempVec3_1.toArray(positionData, base);
      tempVec3_4.toArray(velocityData, base);
    }

    // Collisions
    for (let idx = startIndex; idx < config.count; idx++) {
      const base = 3 * idx;
      tempVec3_1.fromArray(positionData, base);
      tempVec3_4.fromArray(velocityData, base);
      const radius = sizeData[idx];
      
      // Sphere-Sphere Collision
      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx;
        tempVec3_2.fromArray(positionData, otherBase);
        tempVec3_5.fromArray(velocityData, otherBase);
        const otherRadius = sizeData[jdx];
        tempVec3_6.copy(tempVec3_2).sub(tempVec3_1);
        const dist = tempVec3_6.length();
        const sumRadius = radius + otherRadius;
        
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          tempVec3_7.copy(tempVec3_6)
            .normalize()
            .multiplyScalar(0.5 * overlap);
          tempVec3_8.copy(tempVec3_7).multiplyScalar(Math.max(tempVec3_4.length(), 1));
          tempVec3_9.copy(tempVec3_7).multiplyScalar(Math.max(tempVec3_5.length(), 1));
          
          tempVec3_1.sub(tempVec3_7);
          tempVec3_4.sub(tempVec3_8);
          tempVec3_1.toArray(positionData, base);
          tempVec3_4.toArray(velocityData, base);
          
          tempVec3_2.add(tempVec3_7);
          tempVec3_5.add(tempVec3_9);
          tempVec3_2.toArray(positionData, otherBase);
          tempVec3_5.toArray(velocityData, otherBase);
        }
      }

      // Cursor Sphere Collision
      if (config.controlSphere0) {
        tempVec3_6.copy(tempVec3_0).sub(tempVec3_1);
        const dist = tempVec3_6.length();
        const sumRadius0 = radius + sizeData[0];
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          tempVec3_7.copy(tempVec3_6.normalize()).multiplyScalar(diff);
          
          // Boosted bounce by 100% (2x)
          tempVec3_8.copy(tempVec3_7).multiplyScalar(Math.max(tempVec3_4.length(), 2) * 2);

          tempVec3_1.sub(tempVec3_7);
          tempVec3_4.sub(tempVec3_8);
        }
      }

      // Boundary Collision
      if (Math.abs(tempVec3_1.x) + radius > config.maxX) {
        tempVec3_1.x = Math.sign(tempVec3_1.x) * (config.maxX - radius);
        tempVec3_4.x = -tempVec3_4.x * config.wallBounce;
      }
      if (config.gravity === 0) {
        if (Math.abs(tempVec3_1.y) + radius > config.maxY) {
          tempVec3_1.y = Math.sign(tempVec3_1.y) * (config.maxY - radius);
          tempVec3_4.y = -tempVec3_4.y * config.wallBounce;
        }
      } else if (tempVec3_1.y - radius < -config.maxY) {
        tempVec3_1.y = -config.maxY + radius;
        tempVec3_4.y = -tempVec3_4.y * config.wallBounce;
      }
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(tempVec3_1.z) + radius > maxBoundary) {
        tempVec3_1.z = Math.sign(tempVec3_1.z) * (config.maxZ - radius);
        tempVec3_4.z = -tempVec3_4.z * config.wallBounce;
      }
      
      tempVec3_1.toArray(positionData, base);
      tempVec3_4.toArray(velocityData, base);
    }
  }
}

class CustomMaterial extends MeshPhysicalMaterial {
  uniforms: { [key: string]: { value: any } };
  onBeforeCompile2?: (shader: any) => void;
  defines: { [key: string]: any } = { 'USE_UV': '' };

  constructor(parameters: any) {
    super(parameters);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 }
    };
  }

  onBeforeCompile(shader: any) {
    Object.assign(shader.uniforms, this.uniforms);
    shader.fragmentShader =
      '\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      ' +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      '\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      '
    );
    const lightFragment = ShaderChunk.lights_fragment_begin.replace(
      'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
      '\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        '
    );
    shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightFragment);
    if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
  }
}

const defaultConfig = {
  count: 200,
  colors: [0, 0, 0],
  ambientColor: 16777215,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true
};

const dummyObj = new Object3D();

// Extending as any to bypass TS type mismatch issues where it thinks properties like 'count', 'add', etc. are missing
class Spheres extends (InstancedMesh as any) {
  config: any;
  physics: Physics;
  ambientLight!: AmbientLight;
  light!: PointLight;

  constructor(renderer: WebGLRenderer, config: any = {}) {
    const mergedConfig = { ...defaultConfig, ...config };
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnvironment = new RoomEnvironment();
    const envMap = pmremGenerator.fromScene(roomEnvironment).texture;
    roomEnvironment.dispose(); // clean up
    pmremGenerator.dispose();

    const geometry = new SphereGeometry();
    const material = new CustomMaterial({ envMap, ...mergedConfig.materialParams });
    // @ts-ignore: envMapRotation might not be in definition depending on version
    if (material.envMapRotation) material.envMapRotation.x = -Math.PI / 2;
    
    super(geometry, material, mergedConfig.count);
    
    this.config = mergedConfig;
    this.physics = new Physics(mergedConfig);
    this.initLights();
    this.setColors(mergedConfig.colors);
  }

  private initLights() {
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }

  public setColors(colors: any) {
    if (Array.isArray(colors) && colors.length > 1) {
      const gradient = (function (colors) {
        let cols: Color[] = [];
        
        function setColors(newColors: any) {
          cols = [];
          newColors.forEach((col: any) => {
            cols.push(new Color(col));
          });
        }
        setColors(colors);

        return {
          setColors,
          getColorAt: function (ratio: number, out = new Color()) {
            const scaled = Math.max(0, Math.min(1, ratio)) * (cols.length - 1);
            const idx = Math.floor(scaled);
            const start = cols[idx];
            if (idx >= cols.length - 1) return start.clone();
            const alpha = scaled - idx;
            const end = cols[idx + 1];
            out.r = start.r + alpha * (end.r - start.r);
            out.g = start.g + alpha * (end.g - start.g);
            out.b = start.b + alpha * (end.b - start.b);
            return out;
          }
        };
      })(colors);

      for (let idx = 0; idx < this.count; idx++) {
        this.setColorAt(idx, gradient.getColorAt(idx / this.count));
        if (idx === 0) {
          this.light.color.copy(gradient.getColorAt(idx / this.count));
        }
      }
      if (this.instanceColor) this.instanceColor.needsUpdate = true;
    }
  }

  public update(timeState: RenderState) {
    this.physics.update(timeState);
    for (let idx = 0; idx < this.count; idx++) {
      dummyObj.position.fromArray(this.physics.positionData, 3 * idx);
      if (idx === 0 && this.config.followCursor === false) {
        dummyObj.scale.setScalar(0);
      } else {
        dummyObj.scale.setScalar(this.physics.sizeData[idx]);
      }
      dummyObj.updateMatrix();
      this.setMatrixAt(idx, dummyObj.matrix);
      if (idx === 0) this.light.position.copy(dummyObj.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createBallpit(canvas: HTMLCanvasElement, config: any = {}) {
  const render = new ThreeRender({
    canvas,
    size: 'parent',
    rendererOptions: { antialias: true, alpha: true }
  });
  
  let spheres: Spheres | undefined;
  render.renderer.toneMapping = ACESFilmicToneMapping;
  render.camera.position.set(0, 0, 20);
  render.camera.lookAt(0, 0, 0);
  render.cameraMaxAspect = 1.5;
  render.resize();

  // FIX: Update config dimensions before initialization so balls are spread correctly
  if (render.size.wWidth > 0 && render.size.wHeight > 0) {
    config.maxX = render.size.wWidth / 2;
    config.maxY = render.size.wHeight / 2;
  }
  
  initialize(config);

  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const intersectPoint = new Vector3();
  let paused = false;

  canvas.style.touchAction = 'pan-y'; // ALLOW SCROLLING
  canvas.style.userSelect = 'none';
  canvas.style.webkitUserSelect = 'none';

  const mouse = createMouse({
    domElement: canvas,
    onMove(e) {
      if (spheres) {
        raycaster.setFromCamera(e.nPosition, render.camera);
        // plane.normal is Vector3, render.camera is Camera
        render.camera.getWorldDirection(plane.normal);
        raycaster.ray.intersectPlane(plane, intersectPoint);
        spheres.physics.center.copy(intersectPoint);
        spheres.config.controlSphere0 = true;
      }
    },
    onLeave() {
      if (spheres) spheres.config.controlSphere0 = false;
    }
  });

  function initialize(newConfig: any) {
    if (spheres) {
      render.clear();
      render.scene.remove(spheres as unknown as Object3D);
    }
    spheres = new Spheres(render.renderer, newConfig);
    render.scene.add(spheres as unknown as Object3D);
  }

  render.onBeforeRender = (state) => {
    if (!paused && spheres) spheres.update(state);
  };

  render.onAfterResize = (size) => {
    if (spheres) {
      spheres.config.maxX = size.wWidth / 2;
      spheres.config.maxY = size.wHeight / 2;
    }
  };

  return {
    three: render,
    get spheres() {
      return spheres;
    },
    setCount(count: number) {
        if (spheres)
            initialize({ ...spheres.config, count });
    },
    togglePause() {
      paused = !paused;
    },
    dispose() {
      mouse.dispose?.();
      render.dispose();
    }
  };
}

const Ballpit = ({ className = '', followCursor = true, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spheresInstanceRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    spheresInstanceRef.current = createBallpit(canvas, { followCursor, ...props });

    return () => {
      if (spheresInstanceRef.current) {
        spheresInstanceRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Re-initializing if props change is handled by parent key prop in Hero.tsx

  return <canvas className={className} ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default Ballpit;