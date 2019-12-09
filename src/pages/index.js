import dynamic from "next/dynamic";
import { Flex } from "@chakra-ui/core";

const MainOverlay = dynamic(() => import("../components/MainOverlay"), {
  ssr: false
});

export default () => (
  <Flex>
    <MainOverlay />
  </Flex>
);
