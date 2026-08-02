import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uImageAspect;
  uniform float uMotion;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    float viewportAspect = uResolution.x / max(uResolution.y, 1.0);

    if (viewportAspect > uImageAspect) {
      uv.y = (uv.y - 0.5) * (uImageAspect / viewportAspect) + 0.5;
    } else {
      uv.x = (uv.x - 0.5) * (viewportAspect / uImageAspect) + 0.5;
    }

    return uv;
  }

  void main() {
    vec2 baseUv = coverUv(vUv);
    float drift = uTime * 0.22;
    float horizontalWave =
      sin(baseUv.y * 8.0 + drift * 1.7) * 0.010 +
      sin(baseUv.y * 19.0 - drift * 0.8) * 0.0035;
    float verticalWave =
      cos(baseUv.x * 6.0 - drift * 1.35) * 0.008 +
      sin((baseUv.x + baseUv.y) * 13.0 + drift) * 0.003;

    vec2 pointerOffset = (uPointer - 0.5) * vec2(0.018, 0.012);
    vec2 pointerDelta = vUv - uPointer;
    float pointerField = exp(-dot(pointerDelta, pointerDelta) * 6.5);
    vec2 localPull = pointerDelta * pointerField * 0.026;
    vec2 motionOffset = vec2(horizontalWave, verticalWave) + pointerOffset + localPull;
    vec2 liveUv = clamp(baseUv + motionOffset * uMotion, 0.001, 0.999);

    vec2 veilOffset = vec2(
      sin(baseUv.y * 4.0 - drift * 0.7),
      cos(baseUv.x * 4.5 + drift * 0.58)
    ) * 0.018 * uMotion;
    vec4 base = texture2D(uTexture, liveUv);
    vec4 veil = texture2D(uTexture, clamp(liveUv + veilOffset, 0.001, 0.999));
    float breathingMix = 0.12 + 0.08 * (sin(drift * 0.9 + vUv.x * 3.2) * 0.5 + 0.5);
    vec3 color = mix(base.rgb, veil.rgb, breathingMix * uMotion);

    float lightPass = sin(vUv.x * 3.6 - drift * 0.82) * 0.5 + 0.5;
    color += vec3(0.035, 0.045, 0.055) * lightPass * uMotion;
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface LiveDreamBackdropProps {
  className?: string;
  src: string;
}

export default function LiveDreamBackdrop({ className = "", src }: LiveDreamBackdropProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0xb8d0e1, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "live-dream-backdrop-canvas";
    renderer.domElement.style.opacity = "0";
    mount.appendChild(renderer.domElement);

    const uniforms = {
      uTexture: { value: new THREE.Texture() },
      uTime: { value: 0 },
      uImageAspect: { value: 1020 / 550 },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointerTarget = new THREE.Vector2(0.5, 0.5);
    const timer = new THREE.Timer();
    timer.connect(document);
    let animationFrame = 0;
    let disposed = false;
    let texture: THREE.Texture | null = null;

    const renderFrame = (time?: number) => {
      if (disposed || !texture) return;
      if (typeof time === "number") timer.update(time);
      uniforms.uTime.value = timer.getElapsed();
      uniforms.uPointer.value.lerp(pointerTarget, reducedMotion ? 1 : 0.035);
      renderer.render(scene, camera);
    };

    const animate = (time: number) => {
      renderFrame(time);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      const safeWidth = Math.max(1, Math.round(width));
      const safeHeight = Math.max(1, Math.round(height));
      renderer.setSize(safeWidth, safeHeight, false);
      uniforms.uResolution.value.set(safeWidth, safeHeight);
      if (reducedMotion) renderFrame();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
    };

    const onVisibilityChange = () => {
      if (reducedMotion || !texture) return;
      window.cancelAnimationFrame(animationFrame);
      if (!document.hidden) animationFrame = window.requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    resize();

    texture = new THREE.TextureLoader().load(
      src,
      (loadedTexture) => {
        if (disposed) return;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.generateMipmaps = false;
        const image = loadedTexture.image as HTMLImageElement;
        if (image.naturalWidth && image.naturalHeight) {
          uniforms.uImageAspect.value = image.naturalWidth / image.naturalHeight;
        }
        uniforms.uTexture.value = loadedTexture;
        renderer.domElement.style.opacity = "1";
        renderFrame();
        if (!reducedMotion && !document.hidden) animationFrame = window.requestAnimationFrame(animate);
      },
      undefined,
      () => {
        renderer.domElement.style.display = "none";
      },
    );

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      timer.disconnect();
      geometry.dispose();
      material.dispose();
      texture?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [src]);

  return <div ref={mountRef} className={`live-dream-backdrop ${className}`} />;
}
