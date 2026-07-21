import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Adapted from the supplied "Starry Sky" transition shader.
const fragmentShader = /* glsl */ `
  uniform float iTime;
  uniform vec2 iResolution;
  varying vec2 vUv;

  #define PASS_COUNT 1

  float fBrightness = 2.5;
  float fSteps = 121.0;
  float fParticleSize = 0.015;
  float fParticleLength = 0.5 / 60.0;
  float fMinDist = 0.8;
  float fMaxDist = 5.0;
  float fRepeatMin = 1.0;
  float fRepeatMax = 2.0;
  float fDepthFade = 0.8;

  float randomValue(float x) {
    return fract(
      sin(x * 123.456) * 23.4567 +
      sin(x * 345.678) * 45.6789 +
      sin(x * 456.789) * 56.789
    );
  }

  vec3 getParticleColour(
    const in vec3 particlePosition,
    const in float particleSize,
    const in vec3 rayDirection
  ) {
    vec2 normalDirection = normalize(rayDirection.xy);
    float distance2d = dot(particlePosition.xy, normalDirection.xy) / length(rayDirection.xy);
    vec3 closest2d = rayDirection * distance2d;
    vec3 clampedPosition = particlePosition;

    clampedPosition.z = clamp(
      closest2d.z,
      particlePosition.z - fParticleLength,
      particlePosition.z + fParticleLength
    );

    float distanceAlongRay = dot(clampedPosition, rayDirection);
    vec3 closestPosition = rayDirection * distanceAlongRay;
    float closestDistance = length(clampedPosition - closestPosition) / particleSize;
    float shade = clamp(1.0 - closestDistance, 0.0, 1.0);

    shade *= exp2(-distanceAlongRay * fDepthFade) * fBrightness;
    return vec3(shade);
  }

  vec3 getParticlePosition(
    const in vec3 rayDirection,
    const in float zPosition,
    const in float seed
  ) {
    float angle = atan(rayDirection.x, rayDirection.y);
    float angleFraction = fract(angle / (3.14159265 * 2.0));
    float segment = floor(angleFraction * fSteps + seed) + 0.5 - seed;
    float particleAngle = segment / fSteps * (3.14159265 * 2.0);
    float segmentPosition = segment / fSteps;
    float radius = fMinDist + randomValue(segmentPosition + seed) * (fMaxDist - fMinDist);
    float tunnelZ = rayDirection.z / length(rayDirection.xy / radius);

    tunnelZ += zPosition;

    float repeatDistance = fRepeatMin +
      randomValue(segmentPosition + 0.1 + seed) * (fRepeatMax - fRepeatMin);
    float particleZ = (ceil(tunnelZ / repeatDistance) - 0.5) * repeatDistance - zPosition;

    return vec3(
      sin(particleAngle) * radius,
      cos(particleAngle) * radius,
      particleZ
    );
  }

  vec3 starfield(
    const in vec3 rayDirection,
    const in float zPosition,
    const in float seed
  ) {
    vec3 particlePosition = getParticlePosition(rayDirection, zPosition, seed);
    return getParticleColour(particlePosition, fParticleSize, rayDirection);
  }

  vec3 rotateX(const in vec3 position, const in float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return vec3(
      position.x,
      cosine * position.y + sine * position.z,
      -sine * position.y + cosine * position.z
    );
  }

  vec3 rotateY(const in vec3 position, const in float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return vec3(
      cosine * position.x + sine * position.z,
      position.y,
      -sine * position.x + cosine * position.z
    );
  }

  vec3 rotateZ(const in vec3 position, const in float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return vec3(
      cosine * position.x + sine * position.y,
      -sine * position.x + cosine * position.y,
      position.z
    );
  }

  void main() {
    vec2 screenUv = (vUv - 0.5) * 10.0;
    vec2 screenPosition = screenUv * 2.0 - 1.0;
    screenPosition.x *= iResolution.x / iResolution.y;

    vec3 rayDirection = normalize(vec3(screenPosition, 1.0));
    vec3 euler = vec3(
      0.5 + sin(iTime * 0.2) * 0.125,
      0.5 + sin(iTime * 0.1) * 0.125,
      iTime * 0.1 + sin(iTime * 0.3) * 0.5
    );

    rayDirection = rotateX(rayDirection, euler.x);
    rayDirection = rotateY(rayDirection, euler.y);
    rayDirection = rotateZ(rayDirection, euler.z);

    float acceleration = 0.2;
    float pulse = 10.0;
    float baseSpeed = 1.0;
    float zPosition = 5.0 + iTime * baseSpeed + sin(iTime * acceleration) * pulse;
    float speed = baseSpeed + acceleration * pulse * cos(acceleration * iTime);

    fParticleLength = 0.25 * speed / 60.0;

    float seed = 0.0;
    vec3 result = mix(
      vec3(0.004, 0.005, 0.018),
      vec3(0.03, 0.02, 0.055),
      rayDirection.y * 0.5 + 0.5
    );

    for (int i = 0; i < PASS_COUNT; i++) {
      result += starfield(rayDirection, zPosition, seed);
      seed += 1.234;
    }

    vec3 silver = sqrt(result) * vec3(0.84, 0.9, 1.0);
    gl_FragColor = vec4(silver, 1.0);
  }
`;

export function StarryTunnelTransition() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
    };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    const plane = new THREE.Mesh(geometry, material);
    const clock = new THREE.Clock();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;

    renderer.setClearColor(0x090d1d, 1);
    renderer.domElement.className = "starry-tunnel-canvas";
    mount.appendChild(renderer.domElement);
    scene.add(plane);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      uniforms.iResolution.value.set(
        Math.max(1, width * pixelRatio),
        Math.max(1, height * pixelRatio),
      );
    };

    const render = () => {
      uniforms.iTime.value += clock.getDelta() * (reduceMotion ? 0.12 : 1.25);
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="starry-tunnel-transition" aria-hidden="true" />;
}
