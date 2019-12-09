import * as THREE from "three/src/Three";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo
} from "react";
// A THREE.js React renderer, see: https://github.com/drcmda/react-three-fiber
import { extend, Canvas, useRender, useThree } from "react-three-fiber";
// A React animation lib, see: https://github.com/react-spring/react-spring
import {
  apply as applySpring,
  useSpring,
  a,
  interpolate
} from "react-spring/three";

import useInterval from "@use-it/interval";

// Import and register postprocessing classes as three-native-elements for both react-three-fiber & react-spring
// They'll be available as native elements <effectComposer /> from then on ...
import { EffectComposer } from "./postprocessing/EffectComposer";
import { RenderPass } from "./postprocessing/RenderPass";
import { GlitchPass } from "./postprocessing/GlitchPass";
applySpring({ EffectComposer, RenderPass, GlitchPass });
extend({ EffectComposer, RenderPass, GlitchPass });

/** This renders text via canvas and projects it as a sprite */
function Text({
  children,
  position,
  opacity,
  color = "white",
  fontSize = 410
}) {
  const {
    size: { width, height },
    viewport: { width: viewportWidth, height: viewportHeight }
  } = useThree();
  const scale = viewportWidth > viewportHeight ? viewportWidth : viewportHeight;
  const canvas = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2048;
    const context = canvas.getContext("2d");
    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(children, 1024, 1024 - 410 / 2);
    return canvas;
  }, [children, width, height]);
  return (
    <a.sprite scale={[scale, scale, 1]} position={position}>
      <a.spriteMaterial attach="material" transparent opacity={opacity}>
        <canvasTexture
          attach="map"
          image={canvas}
          premultiplyAlpha
          onUpdate={s => (s.needsUpdate = true)}
        />
      </a.spriteMaterial>
    </a.sprite>
  );
}

/** This component creates a fullscreen colored plane */
function Background({ color }) {
  const { viewport } = useThree();
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry attach="geometry" args={[1, 1]} />
      <a.meshBasicMaterial attach="material" color={color} depthTest={false} />
    </mesh>
  );
}

/** This component rotates a bunch of stars */
function Stars({ position }) {
  let group = useRef();
  let theta = 0;
  useRender(() => {
    const r = 5 * Math.sin(THREE.Math.degToRad((theta += 0.01)));
    const s = Math.cos(THREE.Math.degToRad(theta * 2));
    group.current.rotation.set(r, r, r);
    group.current.scale.set(s, s, s);
  });
  const [geo, mat, coords] = useMemo(() => {
    const geo = new THREE.SphereBufferGeometry(1, 10, 10);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("peachpuff"),
      transparent: true
    });
    const coords = new Array(1000)
      .fill()
      .map(i => [
        Math.random() * 800 - 400,
        Math.random() * 800 - 400,
        Math.random() * 800 - 400
      ]);
    return [geo, mat, coords];
  }, []);
  return (
    <a.group ref={group} position={position}>
      {coords.map(([p1, p2, p3], i) => (
        <mesh key={i} geometry={geo} material={mat} position={[p1, p2, p3]} />
      ))}
    </a.group>
  );
}

/** This component creates a glitch effect */
const Effects = React.memo(({ factor }) => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef();
  useEffect(() => void composer.current.setSize(size.width, size.height), [
    size
  ]);
  // This takes over as the main render-loop (when 2nd arg is set to true)
  useRender(() => composer.current.render(), true);
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" args={[scene, camera]} />
      <a.glitchPass attachArray="passes" renderToScreen factor={factor} />
    </effectComposer>
  );
});

/** This component maintains the scene */
function Scene({ second, duration, text }) {
  return (
    <>
      <a.spotLight intensity={1.2} color="white" position={[1, -1, 6.5]} />
      <Effects factor={second.interpolate([0, duration], [0, 1.5])} />
      <Background color={"#16161D"} />
      <Stars position={[0, -1, 0]} />
      <Text opacity={1} position={[0, -1, 0]} fontSize={150}>
        {text}
      </Text>
      <Text
        opacity={1}
        position={[0, -2, 0]}
        fontSize={75}
        children={`${((duration - second.value) * 100) / duration} %`}
      />
    </>
  );
}

/** Main component */
export default function Main(
  { isCountDown, duration, text, speedFactor } = {
    isCountDown: true,
    duration: 300,
    text: "",
    speedFactor: 1
  }
) {
  const [value, setValue] = useState(isCountDown ? duration : 0);
  // This tiny spring right here controlls all(!) the animations, one for scroll, the other for mouse movement ...
  const [{ second }, set] = useSpring(() => ({
    second: isCountDown ? duration : 0
  }));

  const onTick = useCallback(
    e => {
      const s = Math.floor(
        Math.max(0, Math.min(duration, second.value + (isCountDown ? -1 : 1)))
      );
      set({
        second: s
      });
      setValue(s);
    },
    [second]
  );

  useInterval(onTick, 1000 / speedFactor);

  return (
    <>
      <Canvas className="canvas">
        <Scene second={second} duration={duration} text={text} value={value} />
      </Canvas>
    </>
  );
}
