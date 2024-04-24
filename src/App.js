// https://discourse.threejs.org/t/threejs-gltf-meshes-rendering-position-issue/59997/1
import { forwardRef, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import {
  useGLTF,
  Center,
  MeshRefractionMaterial,
  useEnvironment,
  Environment,
  Scroll,
  ScrollControls,
  useScroll,
  CubeCamera,
  Caustics
} from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, ToneMapping } from '@react-three/postprocessing'

const Ring = forwardRef(({ frame, diamonds, env }, ref) => {
  const { nodes, materials } = useGLTF('/3-stone-transformed.glb')

  return (
    <group scale={0.15} ref={ref}>
      <mesh castShadow geometry={nodes.mesh_0.geometry}>
        <meshStandardMaterial color={frame} roughness={0.15} metalness={1} envMapIntensity={1.5} />
      </mesh>
      <CubeCamera resolution={256} frames={1} envMap={env}>
        {(env) => (
          <Caustics backfaces color={'#ffffff'} position={[0, -0.5, 0]} lightSource={[5, 5, -10]} worldRadius={0.1} ior={1.8} backfaceIor={1.1} intensity={0.1}>
            <mesh castShadow geometry={nodes.mesh_9.geometry} material={materials.WhiteMetal} />
            <instancedMesh castShadow args={[nodes.mesh_4.geometry, null, 65]} instanceMatrix={nodes.mesh_4.instanceMatrix}>
              <MeshRefractionMaterial color={diamonds} side={THREE.DoubleSide} envMap={env} aberrationStrength={0.02} toneMapped={false} />
            </instancedMesh>
          </Caustics>
        )}
      </CubeCamera>
    </group>
  )
})

function Wedding(env) {
  const ref = useRef()
  const data = useScroll()
  const { width: w, height: h } = useThree((state) => state.viewport)

  useFrame((state, delta) => {
    const r = data.range(2 / 3, 2 / 3)

    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, (-Math.PI / 4) * r, 3, delta)
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, (-Math.PI / 6) * r, 1, delta)

    ref.current.position.x = -w / 4
    ref.current.position.y = h * r - 4
    ref.current.position.z = 0
  })

  return (
    <>
      <Ring frame={'white'} diamonds={'white'} env={env} ref={ref} />
      <EffectComposer>
        <N8AO aoRadius={0.15} intensity={4} distanceFalloff={2} />
        <Bloom luminanceThreshold={3.5} intensity={20} levels={9} mipmapBlur />
        <ToneMapping />
      </EffectComposer>
    </>
  )
}

function Wrapper() {
  const env = useEnvironment({ files: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr' })

  return (
    <>
      <color attach="background" args={['#f0f0f0']} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />

      <Environment map={env} blur={1} environmentIntensity={0.8} />
      <ScrollControls damping={0.1} pages={5}>
        <Wedding env={env} />

        <Scroll html style={{ width: '100%' }}>
          <h1 style={{ position: 'absolute', top: `100vh`, right: '20vw', fontSize: '16em', transform: `translate3d(0,-100%,0)` }}>Ты</h1>
          <h1 style={{ position: 'absolute', top: '180vh', left: '10vw' }}>...</h1>
          <h1 style={{ position: 'absolute', top: '260vh', right: '10vw' }}>может быть,</h1>
          <h1 style={{ position: 'absolute', top: '350vh', left: '10vw' }}>выйдешь</h1>
          <h1 style={{ position: 'absolute', top: '450vh', right: '10vw' }}>
            за
            <br />
            меня?...
          </h1>
        </Scroll>
      </ScrollControls>
    </>
  )
}

export default function App() {
  return (
    <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [-5, 5, 14], fov: 20 }}>
      <Wrapper />
    </Canvas>
  )
}
