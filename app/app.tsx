"use client";

import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  MeshRefractionMaterial,
  useEnvironment,
  Environment,
  Scroll,
  ScrollControls,
  useScroll,
  CubeCamera,
  useTexture,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  N8AO,
  ToneMapping,
} from "@react-three/postprocessing";

const Ring = forwardRef<
  THREE.Group,
  { frame: string; diamonds: string; env: ReturnType<typeof useEnvironment> }
>(({ frame, diamonds, env }, ref) => {
  const { nodes } = useGLTF("/3-stone-transformed.glb");
  const map = useTexture("/metalness.png");

  return (
    <group scale={0.15} ref={ref}>
      <mesh geometry={(nodes.mesh_0 as THREE.Mesh).geometry}>
        <meshStandardMaterial
          color={frame}
          roughness={0.15}
          roughnessMap={map}
          metalness={1}
          envMapIntensity={1.5}
        />
      </mesh>

      <mesh geometry={(nodes.mesh_9 as THREE.Mesh).geometry}>
        <meshStandardMaterial
          color={frame}
          roughness={0.5}
          roughnessMap={map}
          bumpMap={map}
          metalness={0.5}
          metalnessMap={map}
          envMapIntensity={1}
        />
      </mesh>

      <CubeCamera resolution={256} frames={1} envMap={env}>
        {(env) => (
          <instancedMesh
            castShadow
            args={[(nodes.mesh_4 as THREE.Mesh).geometry, undefined, 65]}
            instanceMatrix={
              (nodes.mesh_4 as THREE.InstancedMesh).instanceMatrix
            }
          >
            <MeshRefractionMaterial
              fastChroma
              color={diamonds}
              side={THREE.DoubleSide}
              envMap={env}
              aberrationStrength={0.02}
              toneMapped={false}
            />
          </instancedMesh>
        )}
      </CubeCamera>
    </group>
  );
});

function Wedding({ env }: { env: ReturnType<typeof useEnvironment> }) {
  const ref = useRef<THREE.Group>(null);
  const data = useScroll();
  const { width: w, height: h } = useThree((state) => state.viewport);

  useFrame((state, delta) => {
    if (!ref.current) return;

    const r = data.range(3 / 5, 3 / 5);

    ref.current.rotation.y = THREE.MathUtils.damp(
      ref.current.rotation.y,
      (-Math.PI / 4) * r,
      3,
      delta
    );
    ref.current.rotation.x = THREE.MathUtils.damp(
      ref.current.rotation.x,
      (-Math.PI / 6) * r,
      1,
      delta
    );

    ref.current.position.x = -w / 4;
    ref.current.position.y = h * r - 5;
    ref.current.position.z = 0;
  });

  return <Ring frame="#ffffff" diamonds="#c5c5c5" env={env} ref={ref} />;
}

function Wrapper() {
  const env = useEnvironment({
    files:
      "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr",
  });

  return (
    <>
      <color attach="background" args={["#f0f0f0"]} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />

      <Environment map={env} blur={1} environmentIntensity={0.8} />
      <ScrollControls damping={0.1} pages={5}>
        <Wedding env={env} />
        <EffectComposer>
          <N8AO aoRadius={0.15} intensity={4} distanceFalloff={2} />
          <Bloom luminanceThreshold={2.5} intensity={5} levels={9} mipmapBlur />
          <ToneMapping />
        </EffectComposer>
        <Scroll html style={{ width: "100%" }}>
          <h1 className="absolute text-[50vw] top-[50vh] right-[20vw]">Ты</h1>
          <h1 className="absolute font-extralight text-9xl top-[180vh] right-[10vw]">
            ...
          </h1>
          <h1 className="absolute font-extralight italic text-8xl top-[260vh] right-[10vw]">
            может быть,
          </h1>
          <h1 className="absolute text-7xl top-[350vh] right-[10vw]">
            выйдешь
          </h1>
          <h1 className="absolute font-medium text-7xl top-[450vh] right-[10vw]">
            за
            <br />
            меня?...
          </h1>
        </Scroll>
      </ScrollControls>
    </>
  );
}

export default function App() {
  return (
    <Canvas
      gl={{ antialias: false }}
      camera={{ position: [-5, 5, 14], fov: 20 }}
    >
      <Wrapper />
    </Canvas>
  );
}
