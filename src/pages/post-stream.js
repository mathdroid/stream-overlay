import dynamic from "next/dynamic";
// import { Flex, Heading } from "@chakra-ui/core";

const GlitchScene = dynamic(() => import("../components/GlitchText"), {
  ssr: false
});

export default () => (
  <GlitchScene
    isCountDown={false}
    duration={151}
    text={"Stream has ended."}
    speedFactor={256}
  />
);
