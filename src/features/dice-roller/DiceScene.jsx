import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const traySize = {
  x: 3.6,
  z: 3.4,
};

export default function DiceScene({ roll, isDark }) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(false);
    const timer = window.setTimeout(() => setSettled(true), 1900);
    return () => window.clearTimeout(timer);
  }, [roll.id]);

  return (
    <div className="pd-dice-scene" data-settled={settled ? "true" : "false"}>
      <Suspense fallback={<div className="pd-dice-scene__fallback">Cargando dados</div>}>
        <Canvas shadows camera={{ position: [0, 6.8, 9.6], fov: 34, near: 0.1, far: 100 }}>
          <color attach="background" args={[isDark ? "#050505" : "#ededed"]} />
          <CameraTarget />
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 7, 4]} intensity={2.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          {!settled && (
            <Physics gravity={[0, -9.81, 0]} timeStep="vary">
              <TrayBounds isDark={isDark} />
              {roll.dice.slice(0, 24).map((die, index) => (
                <RigidDie key={die.id} die={die} index={index} />
              ))}
            </Physics>
          )}
        </Canvas>
      </Suspense>
      {settled && <SettledDiceOverlay dice={roll.dice.slice(0, 12)} />}
    </div>
  );
}

function TrayBounds({ isDark }) {
  return (
    <>
      <RigidBody type="fixed" restitution={0.7} friction={0.82}>
        <CuboidCollider args={[traySize.x, 0.22, traySize.z]} position={[0, -1.7, 0]} />
        <mesh position={[0, -1.58, 0]} receiveShadow>
          <boxGeometry args={[traySize.x * 2, 0.12, traySize.z * 2]} />
          <meshStandardMaterial color={isDark ? "#101010" : "#f6f6f6"} roughness={0.72} metalness={0.02} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" restitution={0.82} friction={0.72}>
        <CuboidCollider args={[0.08, 1.2, traySize.z]} position={[-traySize.x, -0.52, 0]} />
        <CuboidCollider args={[0.08, 1.2, traySize.z]} position={[traySize.x, -0.52, 0]} />
        <CuboidCollider args={[traySize.x, 1.2, 0.08]} position={[0, -0.52, -traySize.z]} />
        <CuboidCollider args={[traySize.x, 1.2, 0.08]} position={[0, -0.52, traySize.z]} />
      </RigidBody>
    </>
  );
}

function RigidDie({ die, index }) {
  const bodyRef = useRef(null);
  const color = die.color || "#050505";
  const geometry = useMemo(() => createGeometry(die.sides), [die.sides]);
  const cubeMaterials = useMemo(() => (die.sides === 6 ? createCubeMaterials(color) : null), [die.sides, color]);
  const labelTexture = useMemo(() => makeTextTexture(String(die.value), color, true), [die.value, color]);
  const x = ((index % 5) - 2) * 0.46;
  const z = (Math.floor(index / 5) - 1.2) * 0.46;

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.setLinvel({ x: (Math.random() - 0.5) * 3.6, y: -1.2 - Math.random() * 1.2, z: (Math.random() - 0.5) * 3.6 }, true);
    body.setAngvel({ x: 7 + Math.random() * 7, y: 4 + Math.random() * 8, z: 6 + Math.random() * 8 }, true);
  }, []);

  return (
    <RigidBody
      ref={bodyRef}
      colliders={die.sides === 6 ? "cuboid" : "hull"}
      position={[x, 1.45 + index * 0.07, z]}
      rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
      restitution={0.64}
      friction={0.78}
      linearDamping={0.44}
      angularDamping={0.36}
      ccd
    >
      <mesh castShadow receiveShadow geometry={geometry}>
        {cubeMaterials ? (
          cubeMaterials.map((material, materialIndex) => (
            <primitive key={materialIndex} object={material} attach={`material-${materialIndex}`} />
          ))
        ) : (
          <meshStandardMaterial color={color} roughness={0.42} metalness={0.08} flatShading />
        )}
      </mesh>
      {die.sides !== 6 && (
        <sprite position={[0, 0.5, 0]} scale={[0.62, 0.28, 1]}>
          <spriteMaterial map={labelTexture} transparent depthTest={false} />
        </sprite>
      )}
    </RigidBody>
  );
}

function SettledDiceOverlay({ dice }) {
  const positions = [
    [5, 18, -18],
    [35, 10, 10],
    [64, 18, -8],
    [18, 48, 16],
    [48, 52, -14],
    [73, 46, 9],
    [7, 76, -7],
    [34, 78, 18],
    [62, 76, -12],
  ];

  return (
    <div className="pd-settled-dice" aria-hidden="true">
      {dice.map((die, index) => {
        const [left, top, rotation] = positions[index % positions.length];
        return (
          <div
            key={`${die.id}_overlay`}
            className={`pd-settled-die pd-settled-die--d${die.sides}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              "--die-color": die.color || "#050505",
              "--die-ink": isBright(die.color || "#050505") ? "#050505" : "#ffffff",
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {die.value}
          </div>
        );
      })}
    </div>
  );
}

function CameraTarget() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, -0.85, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, [camera]);
  return null;
}

function createGeometry(sides) {
  if (sides === 4) return new THREE.TetrahedronGeometry(0.58);
  if (sides === 6) return new THREE.BoxGeometry(0.7, 0.7, 0.7);
  if (sides === 8) return new THREE.OctahedronGeometry(0.62);
  if (sides === 12) return new THREE.DodecahedronGeometry(0.62);
  if (sides === 20) return new THREE.IcosahedronGeometry(0.66);
  return new THREE.CylinderGeometry(0.5, 0.5, 0.76, 10, 1);
}

function createCubeMaterials(color) {
  return [1, 6, 2, 5, 3, 4].map((value) => {
    const texture = makeTextTexture(String(value), color, false);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.38,
      metalness: 0.08,
    });
  });
}

function makeTextTexture(text, color, transparent) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const ink = isBright(color) ? "#050505" : "#ffffff";

  if (transparent) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = isBright(color) ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.14)";
    context.lineWidth = 10;
    context.strokeRect(5, 5, 246, 246);
  }

  context.fillStyle = ink;
  context.font = "800 104px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 132);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function isBright(hex) {
  const cleaned = hex.replace("#", "");
  const full = cleaned.length === 3 ? cleaned.split("").map((char) => char + char).join("") : cleaned;
  const value = parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

export function SceneMotionProbe() {
  const ref = useRef(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime;
  });
  return null;
}
