import React from "react";
import { Box, useColorMode } from "@chakra-ui/react";

/**
 * Shared modern section container for dashboard panels, tables, and charts.
 * Clean, elevated SaaS design with refined borders, rounded corners, and soft ambient shadow.
 */
export default function SectionCard(props) {
  const {
    children,
    cardBg,
    borderColor,
    gridColumn,
    bodyProps,
    isInteractive = false,
    ...rest
  } = props;
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const defaultBg = isDark
    ? "linear-gradient(145deg, #1A2234 0%, #111C44 100%)"
    : "#FFFFFF";
  const defaultBorder = isDark
    ? "1px solid rgba(255, 255, 255, 0.08)"
    : "1px solid rgba(226, 232, 240, 0.85)";
  const defaultShadow = isDark
    ? "0 4px 20px -2px rgba(0, 0, 0, 0.35)"
    : "0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)";

  return (
    <Box
      gridColumn={gridColumn}
      borderRadius="16px"
      position="relative"
      overflow="hidden"
      bg={cardBg || defaultBg}
      border={defaultBorder}
      borderColor={borderColor}
      boxShadow={defaultShadow}
      transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={
        isInteractive
          ? {
              transform: "translateY(-3px)",
              boxShadow: isDark
                ? "0 12px 28px -4px rgba(0, 0, 0, 0.5)"
                : "0 12px 28px -4px rgba(15, 23, 42, 0.08)",
            }
          : undefined
      }
      {...rest}
    >
      <Box p={{ base: 4, md: 5 }} position="relative" zIndex={1} {...bodyProps}>
        {children}
      </Box>
    </Box>
  );
}


