import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import type { Group, Mesh, LineSegments as ThreeLineSegments } from 'three'
import * as THREE from 'three'

// Representative Indian infrastructure hubs with relative coordinates mapped to normalized 3D space
// [x: West-East, z: North-South inverted (North is -z), name, riskLevel (0: low, 1: mod, 2: high, 3: crit), activeProjects]
const HUBS = [
  { name: 'New Delhi', coords: [0.0, -1.35] as [number, number], risk: 1, projects: 184 },
  { name: 'Mumbai', coords: [-1.3, 0.2] as [number, number], risk: 2, projects: 215 },
  { name: 'Bengaluru', coords: [-0.4, 1.7] as [number, number], risk: 0, projects: 142 },
  { name: 'Chennai', coords: [0.35, 1.65] as [number, number], risk: 1, projects: 128 },
  { name: 'Kolkata', coords: [1.8, -0.3] as [number, number], risk: 3, projects: 167 },
  { name: 'Hyderabad', coords: [-0.05, 0.85] as [number, number], risk: 0, projects: 130 },
  { name: 'Ahmedabad', coords: [-1.45, -0.45] as [number, number], risk: 0, projects: 110 },
  { name: 'Guwahati', coords: [2.65, -0.95] as [number, number], risk: 2, projects: 76 },
  { name: 'Varanasi', coords: [0.95, -0.7] as [number, number], risk: 1, projects: 94 },
  { name: 'Kochi', coords: [-0.65, 2.3] as [number, number], risk: 0, projects: 82 },
  { name: 'Nagpur', coords: [0.05, 0.15] as [number, number], risk: 1, projects: 104 },
  { name: 'Jaipur', coords: [-0.6, -1.05] as [number, number], risk: 0, projects: 89 },
  { name: 'Srinagar', coords: [-0.25, -2.4] as [number, number], risk: 2, projects: 58 },
  { name: 'Bhubaneswar', coords: [1.35, 0.45] as [number, number], risk: 1, projects: 92 },
]

// Corridors connecting major economic corridors (e.g. Golden Quadrilateral & Freight Corridors)
const CORRIDORS: [number, number][] = [
  [0, 11], // Delhi - Jaipur
  [11, 6], // Jaipur - Ahmedabad
  [6, 1],  // Ahmedabad - Mumbai
  [1, 10], // Mumbai - Nagpur
  [10, 8], // Nagpur - Varanasi
  [8, 0],  // Varanasi - Delhi
  [8, 4],  // Varanasi - Kolkata
  [4, 7],  // Kolkata - Guwahati
  [4, 13], // Kolkata - Bhubaneswar
  [13, 3], // Bhubaneswar - Chennai
  [3, 2],  // Chennai - Bengaluru
  [2, 9],  // Bengaluru - Kochi
  [1, 2],  // Mumbai - Bengaluru
  [10, 5], // Nagpur - Hyderabad
  [5, 2],  // Hyderabad - Bengaluru
  [5, 3],  // Hyderabad - Chennai
  [0, 12], // Delhi - Srinagar
]

// Stylized polygonal boundary points mapping India's geographic contour
const BOUNDARY_POINTS: [number, number][] = [
  [-0.3, -2.6], // Northern tip (Kashmir)
  [0.4, -2.1],  // Ladakh east
  [0.8, -1.4],  // Uttarakhand / Nepal border
  [1.7, -1.2],  // Sikkim
  [2.1, -1.3],  // Arunachal west
  [3.1, -1.1],  // Arunachal east
  [3.0, -0.6],  // Nagaland / Manipur
  [2.5, -0.4],  // Mizoram / Tripura
  [2.1, -0.4],  // Bengal border
  [1.9, 0.1],   // Sunderbans
  [1.4, 0.8],   // Odisha coast
  [0.6, 1.8],   // Andhra coast
  [0.2, 2.3],   // Tamil Nadu coast
  [-0.5, 2.7],  // Kanyakumari southern tip
  [-0.8, 2.1],  // Kerala coast
  [-1.1, 1.1],  // Goa / Karnataka coast
  [-1.6, 0.3],  // Maharashtra coast
  [-1.9, -0.3], // Gujarat Saurashtra
  [-2.1, -0.6], // Kutch western tip
  [-1.6, -1.2], // Rajasthan desert border
  [-0.9, -1.8], // Punjab border
  [-0.3, -2.6], // Back to north
]

const COLOR_MAP = [
  '#059669', // Low risk: Emerald Green
  '#d97706', // Moderate risk: Amber
  '#ea580c', // High risk: Saffron Orange
  '#dc2626', // Critical risk: Crimson Red
]

function IndiaTerritory() {
  // Build boundary line geometry
  const boundaryLine = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i < BOUNDARY_POINTS.length; i++) {
      const [x, z] = BOUNDARY_POINTS[i]
      points.push(new THREE.Vector3(x, 0.02, z))
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [])

  // Build corridor network lines
  const corridorSegments = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (const [fromIdx, toIdx] of CORRIDORS) {
      const from = HUBS[fromIdx]
      const to = HUBS[toIdx]
      if (from && to) {
        // Curve slightly upwards in the middle for a 3D arc effect
        const midX = (from.coords[0] + to.coords[0]) / 2
        const midZ = (from.coords[1] + to.coords[1]) / 2
        const dist = Math.hypot(to.coords[0] - from.coords[0], to.coords[1] - from.coords[1])
        const arcHeight = Math.min(0.35, dist * 0.15)

        points.push(new THREE.Vector3(from.coords[0], 0.04, from.coords[1]))
        points.push(new THREE.Vector3(midX, 0.04 + arcHeight, midZ))
        points.push(new THREE.Vector3(midX, 0.04 + arcHeight, midZ))
        points.push(new THREE.Vector3(to.coords[0], 0.04, to.coords[1]))
      }
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points)
    return geom
  }, [])

  return (
    <group>
      {/* India Contour Outline */}
      <lineSegments>
        <bufferGeometry attach="geometry" {...boundaryLine} />
        <lineBasicMaterial attach="material" color="#1d4ed8" transparent opacity={0.5} linewidth={2} />
      </lineSegments>

      {/* Corridors (Highways / Freight Corridors) */}
      <lineSegments>
        <bufferGeometry attach="geometry" {...corridorSegments} />
        <lineBasicMaterial attach="material" color="#2563eb" transparent opacity={0.65} linewidth={1.5} />
      </lineSegments>
    </group>
  )
}

function InfrastructureNodes() {
  const ringsRef = useRef<Group>(null)

  useFrame((state) => {
    if (ringsRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.15
      ringsRef.current.children.forEach((child) => {
        child.scale.set(pulse, 1, pulse)
      })
    }
  })

  return (
    <group>
      <group ref={ringsRef}>
        {HUBS.map((hub, i) => (
          <mesh
            key={`ring-${i}`}
            position={[hub.coords[0], 0.03, hub.coords[1]]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.07, 0.11, 24]} />
            <meshBasicMaterial
              color={COLOR_MAP[hub.risk]}
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {HUBS.map((hub, i) => {
        const pillarHeight = 0.25 + (hub.projects / 220) * 0.65
        const color = COLOR_MAP[hub.risk]
        return (
          <group key={`hub-${i}`} position={[hub.coords[0], 0, hub.coords[1]]}>
            {/* Core Node Beacon */}
            <mesh position={[0, pillarHeight / 2, 0]}>
              <cylinderGeometry args={[0.035, 0.045, pillarHeight, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.6}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Glowing Summit Orb */}
            <mesh position={[0, pillarHeight + 0.04, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function FloatingParticles() {
  const pointsRef = useRef<ThreeLineSegments>(null)

  const { positions, colors } = useMemo(() => {
    const count = 160
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c1 = new THREE.Color('#1d4ed8')
    const c2 = new THREE.Color('#ea580c')
    const c3 = new THREE.Color('#059669')

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7.5
      pos[i * 3 + 1] = 0.2 + Math.random() * 2.2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7.5

      const r = Math.random()
      const color = r < 0.5 ? c1 : r < 0.8 ? c2 : c3
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return { positions: pos, colors: col }
  }, [])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04
    }
  })

  return (
    <points ref={pointsRef as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

function RadarScanRing() {
  const radar = useRef<Mesh>(null)

  useFrame((state) => {
    if (radar.current) {
      radar.current.rotation.z = state.clock.elapsedTime * 0.5
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.05
      radar.current.scale.set(s, s, 1)
    }
  })

  return (
    <mesh ref={radar} rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.01, 0.2]}>
      <ringGeometry args={[3.2, 3.28, 64]} />
      <meshBasicMaterial color="#1d4ed8" transparent opacity={0.35} side={THREE.DoubleSide} />
    </mesh>
  )
}

function CommandPlatform() {
  return (
    <group>
      {/* Crisp Circular Base Podium */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[4.4, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Subtle outer guide ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[4.38, 4.42, 64]} />
        <meshBasicMaterial color="#cbd5e1" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Concentric telemetry guide ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[2.18, 2.21, 64]} />
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#f8fafc']} />
      <fog attach="fog" args={['#f8fafc', 8, 22]} />

      {/* Soft daylight studio illumination */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 10, 6]} intensity={1.2} color="#ffffff" castShadow />
      <directionalLight position={[-6, 6, -5]} intensity={0.4} color="#eff6ff" />
      <pointLight position={[0, 3.5, 0]} intensity={1.8} color="#1d4ed8" distance={9} />

      <Float speed={0.8} rotationIntensity={0.06} floatIntensity={0.12}>
        <group position={[0, 0.1, 0]}>
          <CommandPlatform />
          <IndiaTerritory />
          <InfrastructureNodes />
          <RadarScanRing />
          <FloatingParticles />
        </group>
      </Float>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.65}
        minPolarAngle={0.6}
        maxPolarAngle={1.2}
      />
    </>
  )
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [5.8, 5.2, 5.8], fov: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  )
}
