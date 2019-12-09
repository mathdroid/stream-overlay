import dynamic from "next/dynamic";

const GlitchText = dynamic(() => import("../components/GlitchText"), {
  ssr: false
});

export default () => (
  <GlitchText
    isCountDown={true}
    duration={151}
    text={"Preparing stream"}
    speedFactor={256}
  />
);
