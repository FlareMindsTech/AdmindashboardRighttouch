import React from "react";
import { Flex, Spinner, Text } from "@chakra-ui/react";

/**
 * Shared loading indicator — Phase 1 extraction.
 * Defaults preserve the Dashboard.js full-page loading block exactly
 * (Flex h 80vh, xl Spinner thickness 4px speed 0.65s gray.200/blue.500,
 * medium gray.500 label). Override via props where a call site differs;
 * no behavior change — purely presentational.
 */
export default function LoadingState(props) {
  const {
    label,
    height,
    spinnerSize,
    spinnerColor,
    thickness,
    speed,
    emptyColor,
    ...rest
  } = props;
  return (
    <Flex h={height || "80vh"} w="100%" justify="center" align="center" {...rest}>
      <Spinner
        size={spinnerSize || "xl"}
        thickness={thickness || "4px"}
        speed={speed || "0.65s"}
        emptyColor={emptyColor || "gray.200"}
        color={spinnerColor || "blue.500"}
      />
      {label !== null && (
        <Text ml={4} fontWeight="medium" color="gray.500">
          {label || "Loading..."}
        </Text>
      )}
    </Flex>
  );
}
