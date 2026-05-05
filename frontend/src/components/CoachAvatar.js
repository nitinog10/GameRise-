import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Torus, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Glowing core sphere
function CoachCore({ isSpeaking, isThinking }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    if (glowRef.current) {
      const scale = isSpeaking
        ? 1.2 + Math.sin(state.clock.elapsedTime * 8) * 0.15
        : isThinking
        ? 1.1 + Math.sin(state.clock.elapsedTime * 3) * 0.05
        : 1.0 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const coreColor = isSpeaking ? '#00ff88' : isThinking ? '#ffaa00' : '#8b5cf6';
  const glowColor = isSpeaking ? '#00ff88' : isThinking ? '#ffaa00' : '#a78bfa';

  return (
    <group>
      {/* Inner core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere ref={meshRef} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={isSpeaking ? 0.8 : 0.4}
            roughness={0.1}
            metalness={0.8}
            distort={isSpeaking ? 0.4 : 0.2}
            speed={isSpeaking ? 5 : 2}
            transparent
            opacity={0.9}
          />
        </Sphere>
      </Float>

      {/* Outer glow */}
      <Sphere ref={glowRef} args={[1.3, 32, 32]}>
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={isSpeaking ? 0.15 : 0.08}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}

// Orbiting rings
function OrbitRing({ radius, speed, color, tilt }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });

  return (
    <Torus ref={ref} args={[radius, 0.02, 16, 100]} rotation={tilt}>
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </Torus>
  );
}

// Floating particles around the coach
function CoachParticles({ count = 40 }) {
  const mesh = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.8 + Math.random() * 1.2;
      temp.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 2,
          Math.sin(angle) * radius
        ],
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={mesh}>
      {particles.map((p, i) => (
        <Float key={i} speed={p.speed} floatIntensity={0.3} rotationIntensity={0}>
          <mesh position={p.position}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.6} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Data streams (vertical lines of light)
function DataStreams() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const streams = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      radius: 2.2,
      height: 3 + Math.random() * 2
    }));
  }, []);

  return (
    <group ref={ref}>
      {streams.map((s, i) => (
        <mesh
          key={i}
          position={[Math.cos(s.angle) * s.radius, 0, Math.sin(s.angle) * s.radius]}
        >
          <cylinderGeometry args={[0.005, 0.005, s.height, 4]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// Main 3D Coach Avatar
export default function CoachAvatar({ isSpeaking = false, isThinking = false, size = 300 }) {
  return (
    <div style={{ width: size, height: size }} className="coach-avatar-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#8b5cf6" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#00ff88" />
        <pointLight position={[0, 5, -5]} intensity={0.3} color="#3b82f6" />

        <CoachCore isSpeaking={isSpeaking} isThinking={isThinking} />

        <OrbitRing radius={1.8} speed={0.5} color="#8b5cf6" tilt={[Math.PI / 3, 0, 0]} />
        <OrbitRing radius={2.1} speed={-0.3} color="#00ff88" tilt={[Math.PI / 6, Math.PI / 4, 0]} />
        <OrbitRing radius={2.4} speed={0.2} color="#3b82f6" tilt={[-Math.PI / 4, Math.PI / 3, 0]} />

        <CoachParticles count={30} />
        <DataStreams />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
}
