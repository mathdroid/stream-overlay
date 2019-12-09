import App from "next/app";
import dynamic from "next/dynamic";
import {
  ThemeProvider,
  ColorModeProvider,
  CSSReset,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button
} from "@chakra-ui/core";
import { useSSE, SSEProvider } from "react-hooks-sse";
import { Global, css } from "@emotion/core";

const SpeechSynthesis = dynamic(
  () => import("react-speech-kit").then(mod => mod.SpeechSynthesis),
  {
    ssr: false
  }
);

// import { useSpeechSynthesis } from "react-speech-kit";

import theme from "../theme.js";
import { useState, useEffect, useMemo, useCallback } from "react";

// const Speech = dynamic(import("../components/speech"), {
//   ssr: false
// });

// https://api.saweria.co/stream?channel=donation.8365fc18-2801-48d2-9796-5d387caaabbb

const SaweriaAlert = ({ title, message, id }) => {
  return (
    <Alert
      status="success"
      variant="subtle"
      flexDirection="column"
      justifyContent="center"
      textAlign="center"
      height="200px"
      mt="2rem"
    >
      <AlertIcon size="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        {id} {title}
      </AlertTitle>
      <AlertDescription maxWidth="sm">{message}</AlertDescription>
    </Alert>
  );
};

const SaweriaToaster = ({ speak }) => {
  const toast = useToast();
  const state = useSSE("donations");

  const title = state
    ? `[Saweria] Rp${state.data.data.amount} from ${state.data.data.donatee}`
    : "";
  const message = state ? state.data.data.message : "";
  const spokenMessage = state
    ? `${state.data.data.donatee} said: ${message}`
    : "";

  useEffect(() => {
    if (state) {
      speak({ text: spokenMessage });
      console.log(state);
      toast({
        position: "top",
        duration: 15000,
        render: () => (
          <SaweriaAlert
            title={title}
            message={message}
            spokenMessage={spokenMessage}
          />
        )
      });
    }
  }, [state]);
  return null;
};

// <Speech text="hello world" />

class EnhancedApp extends App {
  render() {
    const { Component } = this.props;
    return (
      <SSEProvider endpoint=" https://api.saweria.co/stream?channel=donation.8365fc18-2801-48d2-9796-5d387caaabbb">
        <ThemeProvider theme={theme}>
          <CSSReset />
          <ColorModeProvider>
            <Global
              styles={css`
                html,
                body,
                #__next {
                  width: 100%;
                  height: 100%;
                }
              `}
            />
            <Component />
            <SpeechSynthesis>
              {({ speak }) => <SaweriaToaster speak={speak} />}
            </SpeechSynthesis>
          </ColorModeProvider>
        </ThemeProvider>
      </SSEProvider>
    );
  }
}

export default EnhancedApp;
