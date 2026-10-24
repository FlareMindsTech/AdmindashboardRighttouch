import React from "react";
import { Box } from "@chakra-ui/react";

/**
 * Shared view-level icon tile with modern skeuomorphic styling
 *
 * Simulates a raised physical button/gem with top-lit specular gloss and deep shadow.
 */
function IconBox({ children, variant = "claymorphic", ...rest }) {
  const isClaymorphic = variant === "claymorphic" || variant === "skeuomorphic";

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="6px"
      position="relative"
      overflow="hidden"
      boxShadow={
        isClaymorphic
          ? "0 8px 18px -3px rgba(0, 0, 0, 0.28), 0 3px 6px -1px rgba(0, 0, 0, 0.15), inset 2.5px 2.5px 5px 0 rgba(255, 255, 255, 0.6), inset -3px -3px 6px 0 rgba(0, 0, 0, 0.28)"
          : undefined
      }
      _after={
        isClaymorphic
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.15) 100%)",
              borderRadius: "inherit",
              pointerEvents: "none",
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </Box>
  );
}

export default IconBox;

