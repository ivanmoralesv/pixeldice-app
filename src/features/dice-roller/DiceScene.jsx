import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const FLOOR_Y = -1.6; // top of the (invisible) floor
const BOUNDS_Y = -1.3; // plane used to fit the walls to the viewport / UI edges
const WALL_T = 0.1;
const DOWN = new THREE.Vector3(0, -1, 0);

// Pixels reserved for the top chips and the bottom buttons + nav bar, so dice never
// settle underneath them.
const TOP_UI_PX = 150;
const BOTTOM_UI_PX = 230;

export default function DiceScene({ roll, isDark }) {
  const dice = roll.dice.slice(0, 24);
  const [revealed, setRevealed] = useState(false);
  // Last physics transform per die, captured each frame while tumbling.
  const restRef = useRef({});

  useEffect(() => {
    setRevealed(false);
    restRef.current = {};
    const timer = window.setTimeout(() => setRevealed(true), 1900);
    return () => window.clearTimeout(timer);
  }, [roll.id]);

  return (
    <div className="pd-dice-scene">
      <Suspense fallback={<div className="pd-dice-scene__fallback">Cargando dados</div>}>
        <Canvas shadows camera={{ position: [0, 9.4, 1.4], fov: 46, near: 0.1, far: 100 }}>
          <color attach="background" args={[isDark ? "#050505" : "#ededed"]} />
          <CameraTarget />
          <ambientLight intensity={0.85} />
          <directionalLight position={[2.4, 9, 3.2]} intensity={2.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <ShadowCatcher />
          <Physics gravity={[0, -9.81, 0]} timeStep="vary">
            <Walls />
            <DiceField dice={dice} restRef={restRef} active={!revealed} />
          </Physics>
          {revealed && dice.map((die) => <SettledDie key={die.id} die={die} rest={restRef.current[die.id]} />)}
        </Canvas>
      </Suspense>
    </div>
  );
}

// Invisible floor + walls. Side walls sit at the viewport edges; top/bottom walls sit at
// the inner edges of the nav UI so dice can't slide under the bars.
function Walls() {
  const bounds = useViewportBounds();
  return (
    <RigidBody type="fixed" restitution={0.55} friction={0.8}>
      <CuboidCollider args={[8, 0.5, 8]} position={[0, FLOOR_Y - 0.5, 0]} />
      {bounds && (
        <>
          <CuboidCollider args={[WALL_T, 1.9, 8]} position={[bounds.minX - WALL_T, 0, 0]} />
          <CuboidCollider args={[WALL_T, 1.9, 8]} position={[bounds.maxX + WALL_T, 0, 0]} />
          <CuboidCollider args={[8, 1.9, WALL_T]} position={[0, 0, bounds.minZ - WALL_T]} />
          <CuboidCollider args={[8, 1.9, WALL_T]} position={[0, 0, bounds.maxZ + WALL_T]} />
        </>
      )}
    </RigidBody>
  );
}

function DiceField({ dice, restRef, active }) {
  const bounds = useViewportBounds();
  const spawns = useMemo(() => (bounds ? layoutSpawns(dice.length, bounds) : null), [bounds, dice.length]);
  if (!spawns || !active) return null;
  return dice.map((die, index) => <TumblingDie key={die.id} die={die} spawn={spawns[index]} restRef={restRef} />);
}

// Physics body: a plain shape tumbling in the tray.
function TumblingDie({ die, spawn, restRef }) {
  const bodyRef = useRef(null);
  const geometry = useMemo(() => getGeometry(die.sides), [die.sides]);
  const color = die.color || "#050505";

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.setLinvel({ x: (Math.random() - 0.5) * 3.4, y: -1 - Math.random(), z: (Math.random() - 0.5) * 3.4 }, true);
    body.setAngvel({ x: 5 + Math.random() * 6, y: 3 + Math.random() * 6, z: 5 + Math.random() * 6 }, true);
  }, []);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;
    const t = body.translation();
    const r = body.rotation();
    restRef.current[die.id] = { pos: [t.x, t.y, t.z], quat: [r.x, r.y, r.z, r.w] };
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={die.sides === 6 ? "cuboid" : "hull"}
      position={spawn.pos}
      rotation={spawn.rot}
      restitution={0.5}
      friction={0.85}
      linearDamping={0.5}
      angularDamping={0.6}
      ccd
    >
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.08} flatShading />
      </mesh>
    </RigidBody>
  );
}

// Static die once settled: a face flat on the base, value centred on top.
function SettledDie({ die, rest }) {
  const groupRef = useRef(null);
  const spriteRef = useRef(null);
  const geometry = useMemo(() => getGeometry(die.sides), [die.sides]);
  const faces = useMemo(() => getFaceSpec(die.sides), [die.sides]);
  const color = die.color || "#050505";
  const labelTexture = useMemo(() => getLabelTexture(die.value, color), [die.value, color]);

  const startPos = rest?.pos ?? [0, FLOOR_Y + 0.5, 0];
  const flat = useMemo(() => {
    const start = new THREE.Quaternion().fromArray(rest?.quat ?? [0, 0, 0, 1]);
    return computeFlat(faces, start);
  }, [faces, rest]);

  const currentQuat = useRef(new THREE.Quaternion().fromArray(rest?.quat ?? [0, 0, 0, 1]));
  const currentY = useRef(startPos[1]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    currentQuat.current.slerp(flat.quat, 1 - Math.pow(0.0009, delta));
    group.quaternion.copy(currentQuat.current);
    currentY.current = THREE.MathUtils.damp(currentY.current, flat.restY, 12, delta);
    group.position.set(startPos[0], currentY.current, startPos[2]);
    const material = spriteRef.current?.material;
    if (material) material.opacity = THREE.MathUtils.damp(material.opacity, 1, 14, delta);
  });

  return (
    <group ref={groupRef} position={startPos}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.08} flatShading />
      </mesh>
      <sprite ref={spriteRef} position={[0, 0, 0]} scale={[0.55, 0.55, 1]} renderOrder={10}>
        <spriteMaterial map={labelTexture} transparent opacity={0} depthTest={false} depthWrite={false} />
      </sprite>
    </group>
  );
}

// Rotate minimally so the nearest face lands flat on the floor; keep the yaw the die had.
function computeFlat(faces, startQuat) {
  const worldNormal = new THREE.Vector3();
  let best = faces[0];
  let bestDot = -Infinity;
  for (const face of faces) {
    worldNormal.copy(face.normal).applyQuaternion(startQuat);
    const dot = worldNormal.dot(DOWN);
    if (dot > bestDot) {
      bestDot = dot;
      best = face;
    }
  }
  worldNormal.copy(best.normal).applyQuaternion(startQuat);
  const delta = new THREE.Quaternion().setFromUnitVectors(worldNormal, DOWN);
  const quat = delta.multiply(startQuat);
  return { quat, restY: FLOOR_Y + best.dist };
}

// Transparent plane that shows only the dice shadows over the canvas background.
function ShadowCatcher() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <shadowMaterial transparent opacity={0.16} />
    </mesh>
  );
}

function CameraTarget() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, -1.6, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, [camera]);
  return null;
}

// Rectangle on the floor plane bounded by the viewport sides and the nav-bar edges.
function useViewportBounds() {
  const { camera, size } = useThree();
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    camera.lookAt(0, -1.6, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BOUNDS_Y);
    const ray = new THREE.Raycaster();
    const cast = (nx, ny) => {
      ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const point = new THREE.Vector3();
      return ray.ray.intersectPlane(plane, point) ? point.clone() : null;
    };

    const e = 0.95;
    const corners = [[-e, -e], [e, -e], [e, e], [-e, e]].map(([nx, ny]) => cast(nx, ny)).filter(Boolean);
    if (corners.length < 4) return;
    const rightX = Math.min(...corners.filter((c) => c.x > 0).map((c) => c.x));
    const leftX = Math.max(...corners.filter((c) => c.x < 0).map((c) => c.x));

    const ndcTop = 1 - 2 * (TOP_UI_PX / size.height);
    const ndcBottom = -1 + 2 * (BOTTOM_UI_PX / size.height);
    const top = cast(0, ndcTop);
    const bottom = cast(0, ndcBottom);
    if (!top || !bottom) return;

    setBounds({
      minX: leftX,
      maxX: rightX,
      minZ: Math.min(top.z, bottom.z),
      maxZ: Math.max(top.z, bottom.z),
    });
  }, [camera, size.width, size.height]);

  return bounds;
}

// Spread the dice evenly inside the play area on spawn so none start overlapping.
function layoutSpawns(count, bounds) {
  const margin = 0.5;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const width = Math.max(0.1, (bounds.maxX - bounds.minX - margin * 2) * 0.82);
  const depth = Math.max(0.1, (bounds.maxZ - bounds.minZ - margin * 2) * 0.82);
  const sx0 = cx - width / 2;
  const sz0 = cz - depth / 2;

  const cols = Math.max(1, Math.min(count, Math.round(Math.sqrt(count * (width / depth)))));
  const rows = Math.ceil(count / cols);

  return Array.from({ length: count }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = cols > 1 ? sx0 + (col / (cols - 1)) * width : cx;
    const z = rows > 1 ? sz0 + (row / (rows - 1)) * depth : cz;
    return {
      pos: [x + (Math.random() - 0.5) * 0.18, 1.4 + Math.random() * 0.3, z + (Math.random() - 0.5) * 0.18],
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    };
  });
}

// ---- Geometry + face normals (for flattening), cached by side count ----

const geometryCache = new Map();
const faceSpecCache = new Map();

function getGeometry(sides) {
  if (geometryCache.has(sides)) return geometryCache.get(sides);
  const geometry = createGeometry(sides);
  geometryCache.set(sides, geometry);
  return geometry;
}

function createGeometry(sides) {
  if (sides === 4) return new THREE.TetrahedronGeometry(0.58);
  if (sides === 6) return new THREE.BoxGeometry(0.7, 0.7, 0.7);
  if (sides === 8) return new THREE.OctahedronGeometry(0.62);
  if (sides === 12) return new THREE.DodecahedronGeometry(0.62);
  if (sides === 20) return new THREE.IcosahedronGeometry(0.66);
  return new THREE.CylinderGeometry(0.5, 0.5, 0.76, 10, 1);
}

// Each face: outward normal + distance from centre to that face (rest height when face-down).
function getFaceSpec(sides) {
  if (faceSpecCache.has(sides)) return faceSpecCache.get(sides);

  let faces;
  if (sides === 6) {
    faces = [
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
    ].map((n) => ({ normal: new THREE.Vector3(...n), dist: 0.35 }));
  } else if (sides === 4 || sides === 8 || sides === 12 || sides === 20) {
    faces = computeFaces(getGeometry(sides));
  } else {
    // Cylinder fake (d10/d100): two caps + 10 side facets.
    const half = 0.38;
    const apothem = 0.5 * Math.cos(Math.PI / 10);
    faces = [
      { normal: new THREE.Vector3(0, 1, 0), dist: half },
      { normal: new THREE.Vector3(0, -1, 0), dist: half },
    ];
    for (let k = 0; k < 10; k++) {
      const a = (k + 0.5) * ((2 * Math.PI) / 10);
      faces.push({ normal: new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), dist: apothem });
    }
  }

  faceSpecCache.set(sides, faces);
  return faces;
}

// Group a polyhedron's triangles into faces; return each face normal + plane distance.
function computeFaces(geometry) {
  const position = geometry.attributes.position;
  const groups = [];

  for (let i = 0; i < position.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(position, i);
    const b = new THREE.Vector3().fromBufferAttribute(position, i + 1);
    const c = new THREE.Vector3().fromBufferAttribute(position, i + 2);
    const centroid = a.add(b).add(c).divideScalar(3);
    const dir = centroid.clone().normalize();
    let group = groups.find((g) => g.normal.dot(dir) > 0.97);
    if (!group) {
      group = { normal: dir.clone(), centroids: [] };
      groups.push(group);
    }
    group.centroids.push(centroid);
  }

  return groups.map((group) => {
    const center = group.centroids
      .reduce((acc, c) => acc.add(c), new THREE.Vector3())
      .divideScalar(group.centroids.length);
    const normal = center.clone().normalize();
    return { normal, dist: center.dot(normal) };
  });
}

// ---- Number texture (digit only, centred on the die) ----

const labelTextureCache = new Map();

function getLabelTexture(value, color) {
  const key = `${value}|${color}`;
  if (labelTextureCache.has(key)) return labelTextureCache.get(key);
  const texture = makeLabelTexture(String(value), color);
  labelTextureCache.set(key, texture);
  return texture;
}

function makeLabelTexture(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const ink = isBright(color) ? "#050505" : "#ffffff";

  context.clearRect(0, 0, canvas.width, canvas.height);
  const fontSize = text.length > 2 ? 64 : 88;
  context.fillStyle = ink;
  context.font = `800 ${fontSize}px Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 64, 68);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
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
