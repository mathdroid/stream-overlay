import { Flex, Text } from "@chakra-ui/core";
import { useTime } from "react-timer-hook";

const Main = () => {
  const { seconds, minutes, hours } = useTime({ format: "24-hour" });

  return (
    <Flex direction="column" width="100%" minHeight="100vh">
      <Flex bg="#00ff00" flexGrow={1}></Flex>
      <Flex
        direction="row"
        justifyContent="space-between"
        height="3rem"
        bg="gray.900"
      >
        <Text fontSize="lg" color="gray.50" my="auto" mx="2rem">
          @mathdroid's stream
        </Text>
        <Text fontSize="lg" color="gray.50" my="auto" mx="2rem">
          {hours.toString().padStart(2, "0")}:
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Main;
