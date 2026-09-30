import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface CerebriumBackgroundProps {
  className?: string;
  showParticles?: boolean;
}

export const CerebriumBackground: React.FC<CerebriumBackgroundProps> = ({
  className = '',
  showParticles = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isDisposed = false;

    // ── 1. Renderer Setup ──
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    // ── 2. Scene & Camera Setup ──
    const scene = new THREE.Scene();
    const clearColor = new THREE.Color(0x0c1020);
    scene.fog = new THREE.Fog(clearColor, 4.0, 38.0);

    // Default fallback camera
    let activeCamera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      11.133,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    activeCamera.position.set(-0.83, 0.17, -3.71);
    let cameraParent: THREE.Object3D | null = null;
    let sceneRoot: THREE.Group | null = null;

    // ── 3. Lights Setup (matching Cerebrium aesthetic) ──
    // Directional light with soft magenta hue
    const dirLight = new THREE.DirectionalLight(new THREE.Color(1, 0.4, 0.9), 5.5);
    dirLight.position.set(-86.96, 30.43, 19.57);
    scene.add(dirLight);

    // Subtle front light
    const frontLight = new THREE.DirectionalLight(new THREE.Color(0.8, 0.3, 0.7), 2.5);
    frontLight.position.set(10, 15, 25);
    scene.add(frontLight);

    // Spot light 1
    const spot1 = new THREE.SpotLight(0xff488b, 14, 45, 0.75, 0.3);
    spot1.position.set(-0.67, -3.43, 39.63);
    spot1.target.position.set(63.28, -69.8, -0.38);
    scene.add(spot1);
    scene.add(spot1.target);

    // Spot light 2
    const spot2 = new THREE.SpotLight(0xe33adb, 8, 20, 1.4);
    spot2.position.set(-0.27, -0.97, 5.63);
    scene.add(spot2);

    // Spot light 3
    const spot3 = new THREE.SpotLight(0xff66cc, 36, 35, 1.0);
    spot3.position.set(0, 0.94, 26.09);
    scene.add(spot3);

    // Ambient light: deep charcoal-violet
    const ambientLight = new THREE.AmbientLight(0x180d28, 1.8);
    scene.add(ambientLight);

    // ── 4. Shaders & Materials ──
    // Exact Cerebrium Velvety Deep Berry Palette
    const ribbonColor = new THREE.Color(0.24, 0.02, 0.15);
    const pathLightColor = new THREE.Color(1.0, 0.4, 0.88);

    // Main Ribbon Material with Procedural Noise Shader Patch
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: ribbonColor,
      metalness: 0.12,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });

    const mainUniforms = {
      uClearColor: { value: clearColor.clone() },
      uColor: { value: ribbonColor.clone() },
      uEmissive: { value: new THREE.Color(0, 0, 0) },
      uNoiseScale: { value: 0.3 },
      uNoiseBalance: { value: -0.4 },
      uNoiseContrast: { value: 0.0 },
      uNoiseAmplitude: { value: 0.4 },
    };

    mainMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, mainUniforms);
      shader.vertexShader = `
        varying vec3 vLocalPosition;
      ` + shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vLocalPosition = position;`
      );

      shader.fragmentShader = `
        varying vec3 vLocalPosition;
        uniform vec3 uClearColor;
        uniform vec3 uColor;
        uniform vec3 uEmissive;
        uniform float uNoiseScale;
        uniform float uNoiseBalance;
        uniform float uNoiseContrast;
        uniform float uNoiseAmplitude;
        float hash31(vec3 p){
          p = fract(p * 0.1031);
          p += dot(p, p.yzx + 33.33);
          return fract((p.x + p.y) * p.z);
        }
      ` + shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `
          vec3 p = vLocalPosition * uNoiseScale;
          float n1 = hash31(p);
          float n2 = hash31(p * 2.7) * 0.4;
          float n = (n1 + n2) / 1.4;
          float spots = smoothstep(uNoiseBalance, uNoiseBalance + (uNoiseContrast + 0.5), n);
          float darken = mix(uNoiseAmplitude, 1.0, spots);
          vec3 mixedColor = mix(uClearColor, uColor, darken);
          vec4 diffuseColor = vec4(mixedColor, opacity);
        `
      ).replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         totalEmissiveRadiance += uEmissive;`
      );
    };

    // Path Light Material with Traveling Neon Pulses Shader
    const pathMaterial = new THREE.MeshBasicMaterial({
      color: pathLightColor,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });

    const pathUniforms = {
      uTime: { value: 0 },
      uPulseSpeed: { value: 0.19 },
      uPulseSize: { value: 0.025 },
      uPulseSmooth: { value: 0.015 },
      uPathLightMinInterval: { value: 0.2 },
      uPathLightMaxInterval: { value: 1.0 },
      uPathLightPulseDuration: { value: 0.8 },
      uPathLightMaxZDistance: { value: 7.5 },
    };

    pathMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, pathUniforms);
      shader.vertexShader = `
        attribute vec4 a_params;
        varying vec2 vUv2;
        varying vec4 vParams;
        varying float vViewDepth;
      ` + shader.vertexShader.replace(
        '#include <uv_vertex>',
        `#include <uv_vertex>
         vUv2 = uv; vParams = a_params;`
      ).replace(
        '#include <project_vertex>',
        `#include <project_vertex>
         vViewDepth = -mvPosition.z;`
      );

      shader.fragmentShader = `
        uniform float uTime;
        uniform float uPulseSpeed;
        uniform float uPulseSize;
        uniform float uPulseSmooth;
        uniform float uPathLightMinInterval;
        uniform float uPathLightMaxInterval;
        uniform float uPathLightPulseDuration;
        uniform float uPathLightMaxZDistance;
        varying vec2 vUv2;
        varying vec4 vParams;
        varying float vViewDepth;
        float hash11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
      ` + shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `
          float offset = vParams.y;
          float intervalRand = vParams.z;
          float speed = vParams.w;
          float interval = mix(uPathLightMinInterval, uPathLightMaxInterval, intervalRand);
          float t = uTime * (uPulseSpeed * speed) + offset * interval;
          float ci = floor(t / interval);
          float hA = hash11(ci + offset * 100.0);
          float trigA = ci * interval + hA * (interval * 0.4);
          float progA = clamp((t - trigA) / uPathLightPulseDuration, 0.0, 1.0);
          float fadeA = smoothstep(0.0, uPulseSize, progA) * smoothstep(0.0, uPulseSize, 1.0 - progA);
          float yA = vUv2.y - progA;
          float pulseA = smoothstep(0.0, uPulseSmooth, yA + uPulseSize) * smoothstep(0.0, uPulseSmooth, uPulseSize - yA) * fadeA;
          float ciPrev = ci - 1.0;
          float hB = hash11(ciPrev + offset * 100.0);
          float trigB = ciPrev * interval + hB * (interval * 0.4);
          float progB = clamp((t - trigB) / uPathLightPulseDuration, 0.0, 1.0);
          float fadeB = smoothstep(0.0, uPulseSize, progB) * smoothstep(0.0, uPulseSize, 1.0 - progB);
          float yB = vUv2.y - progB;
          float pulseB = smoothstep(0.0, uPulseSmooth, yB + uPulseSize) * smoothstep(0.0, uPulseSmooth, uPulseSize - yB) * fadeB;
          float basePulse = max(pulseA, pulseB);
          float visibility = uPathLightMaxZDistance <= 0.0 ? 1.0 : step(vViewDepth, uPathLightMaxZDistance);
          vec4 diffuseColor = vec4(diffuse, opacity * basePulse * visibility);
        `
      );
    };

    // ── 5. Particles Setup ──
    let particlesMesh: THREE.Points | null = null;
    let particlePositions: Float32Array;
    let particleInitialPositions: Float32Array;
    const particleCount = 600;

    if (showParticles) {
      const pGeometry = new THREE.BufferGeometry();
      particlePositions = new Float32Array(particleCount * 3);
      particleInitialPositions = new Float32Array(particleCount * 3);

      const boxX = 6.0;
      const boxY = 3.5;
      const boxZ = 16.0;

      for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * boxX;
        const y = (Math.random() - 0.5) * boxY;
        const z = (Math.random() - 0.5) * boxZ;
        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;
        particleInitialPositions[i * 3] = x;
        particleInitialPositions[i * 3 + 1] = y;
        particleInitialPositions[i * 3 + 2] = z;
      }

      pGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

      // Load particle texture if available, or generate a soft radial glow
      const textureLoader = new THREE.TextureLoader();
      const particleTexture = textureLoader.load(
        '/cerebrium/Particules10.png',
        undefined,
        undefined,
        () => {
          // If texture fails, canvas fallback will still look great
        }
      );

      const pMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(0xff88cc),
        size: 0.08,
        transparent: true,
        opacity: 0.35,
        map: particleTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      particlesMesh = new THREE.Points(pGeometry, pMaterial);
      scene.add(particlesMesh);
    }

    // ── 6. Load GLTF Models & Setup Animation ──
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/gltf/');
    dracoLoader.preload();
    loader.setDRACOLoader(dracoLoader);

    let mixer: THREE.AnimationMixer | null = null;
    const pathLightMeshes: THREE.Mesh[] = [];

    const loadModels = async () => {
      try {
        console.log('[Cerebrium 3D] Starting model loading...');
        const [gltf1, gltf2] = await Promise.all([
          loader.loadAsync('/cerebrium/CEREBRIUM_part1_11_optimization.glb'),
          loader.loadAsync('/cerebrium/CEREBRIUM_part2_4_optimization.glb'),
        ]);
        console.log('[Cerebrium 3D] Models loaded successfully!');

        if (isDisposed) return;

        // Merge scenes
        gltf1.scene.add(gltf2.scene);
        const rootScene = gltf1.scene;
        scene.add(rootScene);
        sceneRoot = rootScene;

        const updateSceneOffset = () => {
          if (!sceneRoot) return;
          if (window.innerWidth >= 1200) {
            sceneRoot.position.set(0.65, -0.15, 0);
          } else if (window.innerWidth >= 768) {
            sceneRoot.position.set(0.35, -0.1, 0);
          } else {
            sceneRoot.position.set(0, 0, 0);
          }
        };
        updateSceneOffset();

        let foundCamera = false;
        // Traverse scene and setup camera, meshes, and lights
        rootScene.traverse((child) => {
          if (!foundCamera && (child as THREE.PerspectiveCamera).isPerspectiveCamera) {
            foundCamera = true;
            activeCamera = child as THREE.PerspectiveCamera;
            activeCamera.fov = 11.133;
            activeCamera.aspect = container.clientWidth / container.clientHeight;
            activeCamera.updateProjectionMatrix();
            console.log('[Cerebrium 3D] Active camera found:', activeCamera.name);
          }

          // Pick the top-level CAM rig parent only
          if (child.name === 'CAM' && !cameraParent) {
            cameraParent = child;
            console.log('[Cerebrium 3D] Root CAM rig selected');
          }

          if (child.name.includes('Cube')) {
            child.visible = false;
          } else if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.name.toLowerCase().includes('light')) {
              // Path Light attribute setup
              const count = mesh.geometry.attributes.position?.count || 0;
              const aParams = new Float32Array(count * 4);
              const randO = 0.5 + Math.random() * 0.5;
              const randL = Math.random();
              const randC = 0.5 + Math.random() * 0.5;

              for (let h = 0; h < count; h++) {
                aParams[h * 4] = randO;
                aParams[h * 4 + 1] = randL;
                aParams[h * 4 + 2] = randC;
                aParams[h * 4 + 3] = 1.0;
              }
              mesh.geometry.setAttribute('a_params', new THREE.BufferAttribute(aParams, 4));
              mesh.material = pathMaterial;
              mesh.renderOrder = 2;
              pathLightMeshes.push(mesh);
            } else {
              mesh.material = mainMaterial;
            }
          }
        });

        rootScene.updateMatrixWorld(true);
        const camPos = new THREE.Vector3();
        const camDir = new THREE.Vector3();
        activeCamera.getWorldPosition(camPos);
        activeCamera.getWorldDirection(camDir);
        console.log('[Cerebrium 3D] Camera World Pos:', camPos.x, camPos.y, camPos.z);
        console.log('[Cerebrium 3D] Camera World Dir:', camDir.x, camDir.y, camDir.z);

        // Setup Animation Clip on root
        if (gltf1.animations && gltf1.animations.length > 0) {
          mixer = new THREE.AnimationMixer(rootScene);
          const action = mixer.clipAction(gltf1.animations[0]);
          action.timeScale = 1.3;
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load Cerebrium 3D models:', err);
      }
    };

    loadModels();

    // ── 7. Mouse Parallax Interaction ──
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetMouse.x = (e.clientX - halfW) / halfW;
      targetMouse.y = (e.clientY - halfH) / halfH;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // ── 8. Render & Animation Loop ──
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (targetMouse.x * 0.035 - mouse.x) * 0.04;
      mouse.y += (targetMouse.y * 0.035 - mouse.y) * 0.04;

      if (cameraParent) {
        cameraParent.rotation.x = mouse.y;
        cameraParent.rotation.y = mouse.x;
      }

      // Update mixer
      if (mixer) {
        mixer.update(delta);
      }

      // Update path light uniforms
      pathUniforms.uTime.value = elapsed;

      // Update floating particles
      if (particlesMesh && particlePositions && particleInitialPositions) {
        const positions = particlesMesh.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          positions[idx + 1] =
            particleInitialPositions[idx + 1] + Math.sin(elapsed * 0.5 + i) * 0.15;
          positions[idx] =
            particleInitialPositions[idx] + Math.cos(elapsed * 0.3 + i * 0.5) * 0.1;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, activeCamera);
    };

    animate();

    // ── 9. Resize Handling ──
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      activeCamera.aspect = width / height;
      activeCamera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (sceneRoot) {
        if (window.innerWidth >= 1200) {
          sceneRoot.position.set(0.65, -0.15, 0);
        } else if (window.innerWidth >= 768) {
          sceneRoot.position.set(0.35, -0.1, 0);
        } else {
          sceneRoot.position.set(0, 0, 0);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // ── 10. Cleanup ──
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }

      dracoLoader.dispose();
      renderer.dispose();
      mainMaterial.dispose();
      pathMaterial.dispose();
      scene.clear();
    };
  }, [showParticles]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Left reading protection mask (matches Cerebrium's dark text contrast area) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(16, 20, 33, 0.88) 0%, rgba(16, 20, 33, 0.65) 28%, rgba(16, 20, 33, 0.1) 52%, transparent 70%)',
        }}
      />
      {/* Radial ambient glow gradients to blend seamlessly with the Cerebrium dark navy background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 65% 40%, rgba(246, 24, 106, 0.08) 0%, rgba(227, 58, 219, 0.04) 40%, transparent 75%)',
        }}
      />
      {/* Subtle edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(16, 20, 33, 0.2) 0%, transparent 40%, rgba(16, 20, 33, 0.95) 90%, #101421 100%)',
        }}
      />
    </div>
  );
};

export default CerebriumBackground;
